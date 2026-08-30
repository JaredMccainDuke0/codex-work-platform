#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { runSupervisor } from "../installer/workbench-supervisor.mjs";
import { findAvailablePortPair } from "../installer/platform-manager.mjs";
import {
  atomicJson,
  processAlive,
  readJson,
} from "../installer/platform-common.mjs";
import { PRODUCT_ID, PRODUCT_VERSION } from "../version.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(root, ".local", "data");
const workspaceRoot = path.join(root, ".local", "workspace");
const releaseRoot = root;
const configPath = path.join(root, ".local", "dev-platform-config.json");
const runtimePath = path.join(dataRoot, "runtime", "instance.json");
const instanceId =
  "dev-" + crypto.createHash("sha256").update(root).digest("hex").slice(0, 16);
if (fs.existsSync(runtimePath)) {
  let runtime = null;
  try {
    runtime = readJson(runtimePath);
  } catch {}
  if (runtime && processAlive(Number(runtime.supervisorPid))) {
    if (runtime.instanceId === instanceId) {
      process.stdout.write(
        `${JSON.stringify({ ok: true, alreadyRunning: true, webUrl: runtime.webUrl, compatUrl: runtime.compatUrl, instanceId: runtime.instanceId })}\n`,
      );
      process.exit(0);
    }
    throw Error("DEV_RUNTIME_OWNED_BY_ANOTHER_INSTANCE");
  }
  try {
    fs.unlinkSync(runtimePath);
  } catch (error) {
    throw Error(`DEV_STALE_RUNTIME_CLEANUP_FAILED:${error.message}`);
  }
}
const runtimeDirectory = path.dirname(runtimePath);
if (fs.existsSync(runtimeDirectory)) {
  for (const entry of fs.readdirSync(runtimeDirectory))
    if (/^stale-instance-.*\.json$/.test(entry))
      fs.rmSync(path.join(runtimeDirectory, entry), { force: true });
}
const ports = await findAvailablePortPair({
  compatPort: Number(process.env.CWP_COMPAT_PORT || 19737),
  webPort: Number(process.env.CWP_WEB_PORT || 19738),
});
const config = {
  schemaVersion: 1,
  product: PRODUCT_ID,
  version: PRODUCT_VERSION,
  development: true,
  instanceId,
  installRoot: root,
  dataRoot,
  workspaceRoot,
  databasePath: path.join(dataRoot, "platform.sqlite"),
  controlDatabasePath: path.join(dataRoot, "control.sqlite"),
  statePath: path.join(dataRoot, "platform.sqlite.p10.json"),
  requestToken: crypto.randomBytes(32).toString("hex"),
  compatRuntime: path.join(
    releaseRoot,
    "release",
    "compat-runtime",
    "plugins",
    "codex-work-platform",
    "runtime",
    "codex-work-platform.mjs",
  ),
  p10Server: path.join(root, "p10-control-server.mjs"),
  codexCommand: process.env.CWP_CODEX_COMMAND || "codex",
  allowWebSearch: process.env.CWP_ALLOW_WEB_SEARCH !== "false",
  compatPort: ports.compatPort,
  webPort: ports.webPort,
  updatedAt: new Date().toISOString(),
};
fs.mkdirSync(path.dirname(configPath), { recursive: true });
atomicJson(configPath, config, { mode: 0o600 });
const open = !process.argv.includes("--no-open");
process.exitCode = await runSupervisor({ configPath, openBrowser: open });
