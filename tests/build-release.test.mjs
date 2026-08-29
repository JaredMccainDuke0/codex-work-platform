import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildPortableRelease } from "../bin/build-p10-release.mjs";
import { verifyPortableRelease } from "../installer/platform-manager.mjs";

const root = path.resolve(import.meta.dirname, "..");

test("portable build honors an explicit output path and is independently verifiable", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-build-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "release");
  const child = spawn(
    process.execPath,
    [path.join(root, "bin", "build-p10-release.mjs"), "--output", output],
    { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  const code = await new Promise((resolve) => child.once("close", resolve));
  assert.equal(code, 0, stderr || stdout);
  const result = JSON.parse(stdout.trim());
  assert.equal(result.outputRoot, output);
  const verified = verifyPortableRelease(output);
  assert.equal(verified.manifest.version, "1.0.0");
  assert.equal(verified.treeSha256, result.treeSha256);
});

test("build function preserves an existing output as a recoverable sibling", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-build-swap-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "release");
  const first = buildPortableRelease(output);
  const second = buildPortableRelease(output);
  assert.notEqual(first.manifestSha256, "");
  assert.equal(second.fileCount, first.fileCount);
  const items = await (await import("node:fs/promises")).readdir(dir);
  assert.ok(items.some((item) => item.startsWith("release.previous-")));
});

test("build CLI rejects a mismatched version and source-tree overwrite", async () => {
  const wrongVersion = spawn(
    process.execPath,
    [
      "--experimental-sqlite",
      path.join(root, "bin", "build-p10-release.mjs"),
      "--version",
      "9.9.9",
      "--output",
      path.join(root, "output", "should-not-build"),
    ],
    { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
  );
  const code = await new Promise((resolve) =>
    wrongVersion.once("close", resolve),
  );
  assert.notEqual(code, 0);
  assert.throws(
    () => buildPortableRelease(root),
    /BUILD_OUTPUT_SOURCE_OVERLAP/,
  );
});
