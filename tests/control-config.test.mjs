import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadControlConfig } from "../server/config.mjs";

test("control configuration applies safe local defaults", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cwp-config-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const config = loadControlConfig([], { cwd: root, env: {}, home: root });
  assert.equal(config.host, "127.0.0.1");
  assert.equal(config.port, 19738);
  assert.equal(config.compatEndpoint.hostname, "127.0.0.1");
  assert.equal(config.workspaceRoot, root);
  assert.notEqual(config.controlDatabasePath, config.db);
  assert.equal(config.allowWebSearch, true);
  assert.equal(config.autoApproveHighRisk, false);
});

test("control configuration validates explicit arguments", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cwp-config-explicit-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const config = loadControlConfig(
    [
      "--port",
      "20138",
      "--compat-base",
      "http://localhost:20137",
      "--db",
      "formal.sqlite",
      "--control-db",
      "control.sqlite",
      "--allow-web-search",
      "false",
      "--auto-approve-high-risk",
      "true",
      "--tick-ms",
      "50",
      "--request-token",
      "local-token",
    ],
    { cwd: root, env: {}, home: root },
  );
  assert.equal(config.port, 20138);
  assert.equal(config.compatBase, "http://localhost:20137");
  assert.equal(config.db, path.join(root, "formal.sqlite"));
  assert.equal(config.controlDatabasePath, path.join(root, "control.sqlite"));
  assert.equal(config.allowWebSearch, false);
  assert.equal(config.autoApproveHighRisk, true);
  assert.equal(config.tickMs, 50);
  assert.equal(config.shutdownToken, "local-token");
});

test("control configuration rejects malformed and unsafe arguments", () => {
  const options = { cwd: process.cwd(), env: {}, home: os.homedir() };
  for (const [args, code] of [
    [["--unknown", "value"], /ARGUMENT_UNKNOWN/],
    [["--port", "19738", "--port", "19739"], /ARGUMENT_DUPLICATE/],
    [["--allow-web-search", "sometimes"], /ARGUMENT_BOOLEAN_INVALID/],
    [["--compat-base", "https://example.com"], /COMPAT_BASE_NOT_LOOPBACK/],
    [["--request-token", "bad\nvalue"], /REQUEST_TOKEN_INVALID/],
    [
      ["--db", "same.sqlite", "--control-db", "same.sqlite"],
      /CONTROL_DB_MUST_BE_SEPARATE/,
    ],
  ])
    assert.throws(() => loadControlConfig(args, options), code);
});
