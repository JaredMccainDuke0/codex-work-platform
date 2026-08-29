#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { runSupervisor } from "../installer/workbench-supervisor.mjs";
import { findAvailablePortPair } from "../installer/platform-manager.mjs";
import { processAlive, readJson } from "../installer/platform-common.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(root, ".local", "data");
const workspaceRoot = path.join(root, ".local", "workspace");
const releaseRoot = root;
const configPath = path.join(root, ".local", "dev-platform-config.json");
const runtimePath = path.join(dataRoot, "runtime", "instance.json");
const instanceId =
  "dev-" + crypto.createHash("sha256").update(root).digest("hex").slice(0, 16);
if (fs.existsSync(runtimePath)) {
  try {
    const runtime = readJson(runtimePath);
    if (
      runtime.instanceId === instanceId &&
      processAlive(Number(runtime.supervisorPid))
    ) {
      process.stdout.write(
        `${JSON.stringify({ ok: true, alreadyRunning: true, webUrl: runtime.webUrl, compatUrl: runtime.compatUrl, instanceId: runtime.instanceId })}\n`,
      );
      process.exit(0);
    }
  } catch {}
}
const ports = await findAvailablePortPair({
  compatPort: Number(process.env.CWP_COMPAT_PORT || 19737),
  webPort: Number(process.env.CWP_WEB_PORT || 19738),
});
const config = {
  schemaVersion: 1,
  product: "codex-work-platform",
  version: "1.0.0",
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
fs.writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, {
  encoding: "utf8",
  mode: 0o600,
});
const open = !process.argv.includes("--no-open");
await runSupervisor({ configPath, openBrowser: open });
