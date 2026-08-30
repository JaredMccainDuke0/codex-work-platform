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
  verifyRecords,
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
  ["version.mjs", "version.mjs"],
  ["version.mjs", "app/version.mjs"],
  ["server/compat-client.mjs", "app/server/compat-client.mjs"],
  ["server/config.mjs", "app/server/config.mjs"],
  ["server/directory-picker.mjs", "app/server/directory-picker.mjs"],
  ["server/errors.mjs", "app/server/errors.mjs"],
  ["server/http.mjs", "app/server/http.mjs"],
  ["server/idempotency.mjs", "app/server/idempotency.mjs"],
  ["server/path-security.mjs", "app/server/path-security.mjs"],
  ["server/redaction.mjs", "app/server/redaction.mjs"],
  ["server/static-assets.mjs", "app/server/static-assets.mjs"],
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
  ["vendor/compat-runtime/CONTRACT.md", "vendor/compat-runtime/CONTRACT.md"],
  [
    "vendor/compat-runtime/CONTRACT.json",
    "vendor/compat-runtime/CONTRACT.json",
  ],
  ["vendor/compat-runtime/RECOVERY.md", "vendor/compat-runtime/RECOVERY.md"],
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

function prunePreviousOutputs(outputRoot, keep) {
  const parent = path.dirname(outputRoot);
  const prefix = `${path.basename(outputRoot)}.previous-`;
  if (!fs.existsSync(parent)) return [];
  const candidates = fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((entry) => entry.name.startsWith(prefix))
    .map((entry) => {
      const absolute = path.join(parent, entry.name);
      if (entry.isSymbolicLink() || !entry.isDirectory())
        throw Error(`BUILD_PREVIOUS_INVALID:${entry.name}`);
      return {
        absolute,
        name: entry.name,
        modified: fs.statSync(absolute).mtimeMs,
      };
    })
    .sort(
      (left, right) =>
        right.name.localeCompare(left.name) || right.modified - left.modified,
    );
  const removed = [];
  for (const candidate of candidates.slice(keep)) {
    if (path.dirname(candidate.absolute) !== parent)
      throw Error(`BUILD_PREVIOUS_ESCAPE:${candidate.name}`);
    fs.rmSync(candidate.absolute, {
      recursive: true,
      force: false,
      maxRetries: 4,
      retryDelay: 100,
    });
    removed.push(candidate.name);
  }
  return removed;
}

export function buildPortableRelease(
  outputRootInput = defaultOutputRoot,
  options = {},
) {
  const outputRoot = assertNarrowRoot(
    path.resolve(outputRootInput),
    "outputRoot",
  );
  const previousLimit = Number(options.previousLimit ?? 1);
  if (
    !Number.isSafeInteger(previousLimit) ||
    previousLimit < 0 ||
    previousLimit > 20
  )
    throw Error("BUILD_PREVIOUS_LIMIT_INVALID");
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
  let previousRoot = null;
  let activated = false;
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
    const staged = verifyRecords(stageRoot, files, {
      exclude: [RELEASE_MANIFEST],
      label: "staged-release",
    });
    if (staged.treeSha256 !== manifest.treeSha256)
      throw Error("BUILD_STAGE_TREE_MISMATCH");
    if (fs.existsSync(outputRoot)) {
      const outputStat = fs.lstatSync(outputRoot);
      if (outputStat.isSymbolicLink() || !outputStat.isDirectory())
        throw Error("BUILD_OUTPUT_INVALID");
      previousRoot = `${outputRoot}.previous-${Date.now()}-${process.pid}-${crypto.randomBytes(3).toString("hex")}`;
      renameWithRetry(outputRoot, previousRoot);
    }
    try {
      renameWithRetry(stageRoot, outputRoot);
      activated = true;
    } catch (error) {
      if (
        previousRoot &&
        fs.existsSync(previousRoot) &&
        !fs.existsSync(outputRoot)
      )
        renameWithRetry(previousRoot, outputRoot);
      throw error;
    }
    const prunedPrevious = prunePreviousOutputs(outputRoot, previousLimit);
    return {
      ok: true,
      outputRoot,
      manifestPath: path.join(outputRoot, RELEASE_MANIFEST),
      manifestSha256: sha256File(path.join(outputRoot, RELEASE_MANIFEST)),
      treeSha256: manifest.treeSha256,
      fileCount: files.length,
      bytes: files.reduce((sum, record) => sum + record.bytes, 0),
      previousLimit,
      previousOutput:
        previousRoot && fs.existsSync(previousRoot) ? previousRoot : null,
      prunedPrevious,
    };
  } catch (error) {
    if (fs.existsSync(stageRoot)) {
      const failedRoot = `${stageRoot}.failed`;
      try {
        renameWithRetry(stageRoot, failedRoot);
      } catch {}
    }
    if (
      !activated &&
      previousRoot &&
      fs.existsSync(previousRoot) &&
      !fs.existsSync(outputRoot)
    ) {
      try {
        renameWithRetry(previousRoot, outputRoot);
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
    const flagValue = (flag, index) => {
      const value = process.argv[index + 1];
      if (value === undefined || value.startsWith("--"))
        throw Error(`BUILD_ARGUMENT_REQUIRED:${flag}`);
      return value;
    };
    for (let index = 2; index < process.argv.length; index += 1) {
      const flag = process.argv[index];
      // npm 10/11 may forward an extra argument separator when a script is
      // invoked as `npm run build -- -- --output <dir>`; tolerate it so the
      // direct Node CLI and npm script behave identically.
      if (flag === "--") continue;
      if (flag === "--verify") {
        if (flags.has(flag)) throw Error(`BUILD_ARGUMENT_DUPLICATE:${flag}`);
        flags.set("--verify", true);
        continue;
      }
      if (flag === "--version") {
        if (flags.has(flag)) throw Error(`BUILD_ARGUMENT_DUPLICATE:${flag}`);
        const requested = flagValue(flag, index);
        index += 1;
        if (requested !== P10_VERSION)
          throw Error(`BUILD_VERSION_MISMATCH:${requested}`);
        flags.set("--version", requested);
        continue;
      }
      if (flag === "--output") {
        if (flags.has(flag)) throw Error(`BUILD_ARGUMENT_DUPLICATE:${flag}`);
        flags.set("--output", flagValue(flag, index));
        index += 1;
        continue;
      }
      if (flag === "--previous-limit") {
        if (flags.has(flag)) throw Error(`BUILD_ARGUMENT_DUPLICATE:${flag}`);
        const value = Number(flagValue(flag, index));
        index += 1;
        if (!Number.isSafeInteger(value) || value < 0 || value > 20)
          throw Error("BUILD_PREVIOUS_LIMIT_INVALID");
        flags.set("--previous-limit", value);
        continue;
      }
      throw Error(`BUILD_ARGUMENT_UNKNOWN:${flag}`);
    }
    const output = flags.get("--output")
      ? path.resolve(flags.get("--output"))
      : defaultOutputRoot;
    if (flags.get("--verify")) {
      if (flags.has("--previous-limit"))
        throw Error("BUILD_ARGUMENT_CONFLICT:--verify:--previous-limit");
      const { verifyPortableRelease } =
        await import("../installer/platform-manager.mjs");
      process.stdout.write(
        `${JSON.stringify(verifyPortableRelease(output))}\n`,
      );
    } else {
      process.stdout.write(
        `${JSON.stringify(buildPortableRelease(output, { previousLimit: flags.get("--previous-limit") ?? 1 }))}\n`,
      );
    }
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ ok: false, code: error instanceof Error ? error.message : String(error) })}\n`,
    );
    process.exitCode = 1;
  }
}
