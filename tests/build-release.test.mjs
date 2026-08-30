import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { buildPortableRelease } from "../bin/build-p10-release.mjs";
import { verifyPortableRelease } from "../installer/platform-manager.mjs";
import { PRODUCT_VERSION } from "../version.mjs";

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
  assert.equal(verified.manifest.version, PRODUCT_VERSION);
  assert.equal(verified.treeSha256, result.treeSha256);
});

test("build CLI accepts npm's forwarded argument separator", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-build-npm-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "release");
  const child = spawn(
    process.execPath,
    [path.join(root, "bin", "build-p10-release.mjs"), "--", "--output", output],
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
  assert.equal(JSON.parse(stdout.trim()).outputRoot, output);
});

test("build function bounds recoverable previous outputs", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-build-swap-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = path.join(dir, "release");
  const first = buildPortableRelease(output);
  const second = buildPortableRelease(output);
  const third = buildPortableRelease(output);
  assert.notEqual(first.manifestSha256, "");
  assert.equal(second.fileCount, first.fileCount);
  assert.equal(third.fileCount, first.fileCount);
  const items = await (await import("node:fs/promises")).readdir(dir);
  assert.equal(
    items.filter((item) => item.startsWith("release.previous-")).length,
    1,
  );
  const clean = buildPortableRelease(output, { previousLimit: 0 });
  assert.equal(clean.previousOutput, null);
  const cleanedItems = await (await import("node:fs/promises")).readdir(dir);
  assert.equal(
    cleanedItems.filter((item) => item.startsWith("release.previous-")).length,
    0,
  );
});

test("build CLI rejects missing, duplicate, and conflicting arguments", async () => {
  for (const args of [
    ["--output"],
    ["--output", "one", "--output", "two"],
    ["--verify", "--previous-limit", "0"],
  ]) {
    const child = spawn(
      process.execPath,
      [path.join(root, "bin", "build-p10-release.mjs"), ...args],
      { cwd: root, windowsHide: true, stdio: "ignore" },
    );
    const code = await new Promise((resolve) => child.once("close", resolve));
    assert.notEqual(code, 0, args.join(" "));
  }
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
