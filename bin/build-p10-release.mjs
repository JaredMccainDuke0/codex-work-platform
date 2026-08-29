#!/usr/bin/env node
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  P10_VERSION,
  PRODUCT,
  RELEASE_MANIFEST,
  assertNarrowRoot,
  atomicJson,
  recordsSha256,
  renameWithRetry,
  sha256File,
  walkFiles,
} from "../installer/platform-common.mjs";

const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const defaultOutputRoot = path.join(
  sourceRoot,
  "output",
  `codex-work-platform-${P10_VERSION}-portable`,
);

const mapping = [
  ["p10-control-server.mjs", "app/p10-control-server.mjs"],
  ["codex-adapter.mjs", "app/codex-adapter.mjs"],
  ["codex-app-server.mjs", "app/codex-app-server.mjs"],
  ["codex-app-server-adapter.mjs", "app/codex-app-server-adapter.mjs"],
  ["workflow-core.mjs", "app/workflow-core.mjs"],
  ["p10-state.mjs", "app/p10-state.mjs"],
  ["state-store.mjs", "app/state-store.mjs"],
  ["validation.mjs", "app/validation.mjs"],
  ["web/index.html", "app/web/index.html"],
  ["web/app.js", "app/web/app.js"],
  ["web/styles.css", "app/web/styles.css"],
  ["state-store.mjs", "state-store.mjs"],
  ["p10-state.mjs", "p10-state.mjs"],
  ["codex-adapter.mjs", "codex-adapter.mjs"],
  ["package.json", "app/package.json"],
  [
    "release/compat-runtime/plugins/codex-work-platform/.codex-plugin/plugin.json",
    "compat-runtime/plugin/.codex-plugin/plugin.json",
  ],
  [
    "release/compat-runtime/plugins/codex-work-platform/.mcp.json",
    "compat-runtime/plugin/.mcp.json",
  ],
  [
    "release/compat-runtime/plugins/codex-work-platform/runtime/build-manifest.json",
    "compat-runtime/plugin/runtime/build-manifest.json",
  ],
  [
    "release/compat-runtime/plugins/codex-work-platform/runtime/codex-work-platform.mjs",
    "compat-runtime/plugin/runtime/codex-work-platform.mjs",
  ],
  [
    "release/compat-runtime/plugins/codex-work-platform/runtime/mcp-server.mjs",
    "compat-runtime/plugin/runtime/mcp-server.mjs",
  ],
  [
    "release/compat-runtime/plugins/codex-work-platform/runtime/sql-wasm.wasm",
    "compat-runtime/plugin/runtime/sql-wasm.wasm",
  ],
  [
    "release/compat-runtime/plugins/codex-work-platform/skills/codex-work-platform/SKILL.md",
    "compat-runtime/plugin/skills/codex-work-platform/SKILL.md",
  ],
  ["installer/platform-common.mjs", "bin/platform-common.mjs"],
  ["installer/platform-manager.mjs", "bin/platform-manager.mjs"],
  ["installer/workbench-supervisor.mjs", "bin/workbench-supervisor.mjs"],
  ["installer/install-windows.ps1", "install-windows.ps1"],
  ["installer/install-macos.command", "install-macos.command"],
  ["README.md", "README.md"],
  ["README.zh-CN.md", "README.zh-CN.md"],
  ["LICENSE", "LICENSE"],
  ["NOTICE", "NOTICE"],
  ["THIRD_PARTY_NOTICES.md", "THIRD_PARTY_NOTICES.md"],
  ["SECURITY.md", "SECURITY.md"],
  ["CONTRIBUTING.md", "CONTRIBUTING.md"],
  ["CHANGELOG.md", "CHANGELOG.md"],
  ["CODE_OF_CONDUCT.md", "CODE_OF_CONDUCT.md"],
  ["docs/architecture.md", "docs/architecture.md"],
  ["docs/api.md", "docs/api.md"],
  ["docs/migrations.md", "docs/migrations.md"],
  ["docs/release.md", "docs/release.md"],
  ["vendor/compat-runtime/SOURCES.json", "vendor/compat-runtime/SOURCES.json"],
  [
    "vendor/compat-runtime/THIRD_PARTY_NOTICES.md",
    "vendor/compat-runtime/THIRD_PARTY_NOTICES.md",
  ],
];

const executable = new Set([
  "app/p10-control-server.mjs",
  "compat-runtime/plugin/runtime/codex-work-platform.mjs",
  "compat-runtime/plugin/runtime/mcp-server.mjs",
  "compat-runtime/plugin/runtime/sql-wasm.wasm",
  "bin/platform-manager.mjs",
  "bin/workbench-supervisor.mjs",
  "install-macos.command",
]);
const textExtensions = new Set([
  ".mjs",
  ".js",
  ".json",
  ".md",
  ".html",
  ".css",
  ".ps1",
  ".command",
  ".cmd",
  ".yml",
  ".yaml",
  ".txt",
]);
function canonicalSourceBytes(source, relativePath) {
  const bytes = fs.readFileSync(source);
  if (!textExtensions.has(path.extname(relativePath).toLowerCase()))
    return bytes;
  return Buffer.from(bytes.toString("utf8").replace(/\r\n?/g, "\n"), "utf8");
}

export function buildPortableRelease(outputRootInput = defaultOutputRoot) {
  const outputRoot = assertNarrowRoot(
    path.resolve(outputRootInput),
    "outputRoot",
  );
  const relativeToSource = path.relative(sourceRoot, outputRoot);
  const isInsideSource =
    relativeToSource === "" ||
    (!relativeToSource.startsWith("..") && !path.isAbsolute(relativeToSource));
  const isInsideOutput =
    relativeToSource === "output" ||
    relativeToSource.toLowerCase().startsWith(`output${path.sep}`);
  if (isInsideSource && !isInsideOutput)
    throw Error("BUILD_OUTPUT_SOURCE_OVERLAP");
  const stageRoot = `${outputRoot}.building-${process.pid}-${Date.now()}`;
  if (fs.existsSync(stageRoot))
    throw Error(`BUILD_STAGE_CONFLICT:${stageRoot}`);
  fs.mkdirSync(stageRoot, { recursive: true });
  try {
    for (const [sourceRelative, targetRelative] of mapping) {
      const source = path.join(sourceRoot, ...sourceRelative.split("/"));
      const target = path.join(stageRoot, ...targetRelative.split("/"));
      if (!fs.existsSync(source) || !fs.statSync(source).isFile())
        throw Error(`BUILD_SOURCE_MISSING:${sourceRelative}`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, canonicalSourceBytes(source, sourceRelative), {
        flag: "wx",
      });
      if (process.platform !== "win32")
        fs.chmodSync(target, executable.has(targetRelative) ? 0o755 : 0o644);
    }
    const files = walkFiles(stageRoot, { executable: [...executable] });
    const manifest = {
      schemaVersion: 1,
      manifestType: "CODEX_WORK_PLATFORM_PORTABLE_RELEASE",
      product: PRODUCT,
      version: P10_VERSION,
      manifestSelf: "EXCLUDED_SELF_REFERENCE",
      portabilityRule:
        "Text sources are normalized to LF; file bytes and SHA-256 are authoritative across Windows and macOS; executable is applied on POSIX installation.",
      treeSha256: recordsSha256(files),
      files,
    };
    atomicJson(path.join(stageRoot, RELEASE_MANIFEST), manifest);
    if (process.platform !== "win32")
      fs.chmodSync(path.join(stageRoot, RELEASE_MANIFEST), 0o644);
    if (fs.existsSync(outputRoot)) {
      const previousRoot = `${outputRoot}.previous-${Date.now()}-${process.pid}-${crypto.randomBytes(3).toString("hex")}`;
      renameWithRetry(outputRoot, previousRoot);
    }
    renameWithRetry(stageRoot, outputRoot);
    return {
      ok: true,
      outputRoot,
      manifestPath: path.join(outputRoot, RELEASE_MANIFEST),
      manifestSha256: sha256File(path.join(outputRoot, RELEASE_MANIFEST)),
      treeSha256: manifest.treeSha256,
      fileCount: files.length,
      bytes: files.reduce((sum, record) => sum + record.bytes, 0),
    };
  } catch (error) {
    if (fs.existsSync(stageRoot)) {
      const failedRoot = `${stageRoot}.failed`;
      try {
        renameWithRetry(stageRoot, failedRoot);
      } catch {}
    }
    throw error;
  }
}

const invokedPath = process.argv[1]
  ? fs.realpathSync.native(path.resolve(process.argv[1]))
  : "";
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invokedPath === modulePath) {
  try {
    const flags = new Map();
    for (let index = 2; index < process.argv.length; index += 1) {
      const flag = process.argv[index];
      if (flag === "--verify") {
        flags.set("--verify", true);
        continue;
      }
      if (flag === "--version") {
        const requested = process.argv[++index];
        if (requested !== P10_VERSION)
          throw Error(`BUILD_VERSION_MISMATCH:${requested}`);
        flags.set("--version", requested);
        continue;
      }
      if (flag === "--output") {
        flags.set("--output", process.argv[++index]);
        continue;
      }
      throw Error(`BUILD_ARGUMENT_UNKNOWN:${flag}`);
    }
    const output = flags.get("--output")
      ? path.resolve(flags.get("--output"))
      : defaultOutputRoot;
    if (flags.get("--verify")) {
      const { verifyPortableRelease } =
        await import("../installer/platform-manager.mjs");
      process.stdout.write(
        `${JSON.stringify(verifyPortableRelease(output))}\n`,
      );
    } else {
      process.stdout.write(`${JSON.stringify(buildPortableRelease(output))}\n`);
    }
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ ok: false, code: error instanceof Error ? error.message : String(error) })}\n`,
    );
    process.exitCode = 1;
  }
}
