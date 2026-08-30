import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  pathWithinRoot,
  safeDirectoryName,
  safetyPath,
  sensitiveDirectory,
} from "../server/path-security.mjs";

test("path containment handles Windows and POSIX paths", () => {
  assert.equal(
    pathWithinRoot("C:\\work\\project\\src", "C:\\work\\project", "win32"),
    true,
  );
  assert.equal(
    pathWithinRoot("C:\\work\\project-old", "C:\\work\\project", "win32"),
    false,
  );
  assert.equal(
    pathWithinRoot("/work/project/src", "/work/project", "linux"),
    true,
  );
  assert.equal(
    pathWithinRoot("/work/project-old", "/work/project", "linux"),
    false,
  );
});

test("path safety resolves existing prefixes and blocks sensitive home data", async (t) => {
  const home = await mkdtemp(path.join(os.tmpdir(), "cwp-path-home-"));
  t.after(() => rm(home, { recursive: true, force: true }));
  const candidate = path.join(home, "workspace", "future");
  const resolved = safetyPath(candidate);
  assert.equal(pathWithinRoot(resolved, safetyPath(home)), true);
  assert.equal(resolved.endsWith(path.join("workspace", "future")), true);
  assert.equal(
    sensitiveDirectory(path.join(home, ".codex", "auth.json"), { home }),
    true,
  );
  assert.equal(sensitiveDirectory(candidate, { home }), false);
});

test("project directory names are portable and bounded", () => {
  assert.equal(safeDirectoryName('  Demo: "Project"  '), "Demo- -Project-");
  assert.equal(safeDirectoryName("name. "), "name");
  assert.equal(safeDirectoryName("x".repeat(100)).length, 80);
  assert.throws(
    () => safeDirectoryName(".."),
    /PROJECT_DIRECTORY_NAME_INVALID/,
  );
});
