import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { PRODUCT_VERSION } from "../version.mjs";

const root = path.resolve(import.meta.dirname, "..");

function runVersionCheck(args = []) {
  const child = spawn(
    process.execPath,
    [path.join(root, "scripts", "check-version.mjs"), ...args],
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
  return new Promise((resolve) =>
    child.once("close", (code) => resolve({ code, stdout, stderr })),
  );
}

test("version metadata and the release tag stay aligned", async () => {
  const valid = await runVersionCheck(["--tag", `v${PRODUCT_VERSION}`]);
  assert.equal(valid.code, 0, valid.stderr || valid.stdout);
  assert.equal(JSON.parse(valid.stdout).version, PRODUCT_VERSION);

  const invalid = await runVersionCheck(["--tag", "v9.9.9"]);
  assert.notEqual(invalid.code, 0);
});
