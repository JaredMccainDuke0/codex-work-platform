import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import http from "node:http";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { PRODUCT_VERSION } from "../version.mjs";

const root = path.resolve(import.meta.dirname, "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function freePort() {
  const server = http.createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

async function waitFor(predicate, timeout = 20_000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await predicate();
    if (value) return value;
    await sleep(100);
  }
  throw Error("SUPERVISOR_TEST_TIMEOUT");
}

test(
  "supervisor restarts a crashed web child and shuts down cleanly",
  { timeout: 45_000 },
  async (t) => {
    const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-supervisor-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    const dataRoot = path.join(dir, "data");
    const workspaceRoot = path.join(dir, "workspace");
    const compatPort = await freePort();
    const webPort = await freePort();
    const requestToken = crypto.randomBytes(16).toString("hex");
    const configPath = path.join(dir, "config.json");
    const runtimeDirectory = path.join(dataRoot, "runtime");
    await mkdir(runtimeDirectory, { recursive: true });
    for (let index = 0; index < 6; index += 1)
      await writeFile(
        path.join(
          runtimeDirectory,
          `stale-instance-2026-01-0${index + 1}T00-00-00-000Z-test.json`,
        ),
        "{}",
      );
    await writeFile(
      configPath,
      JSON.stringify({
        schemaVersion: 1,
        product: "codex-work-platform",
        version: PRODUCT_VERSION,
        instanceId: crypto.randomUUID(),
        installRoot: root,
        dataRoot,
        workspaceRoot,
        databasePath: path.join(dataRoot, "platform.sqlite"),
        controlDatabasePath: path.join(dataRoot, "control.sqlite"),
        statePath: path.join(dataRoot, "platform.sqlite.p10.json"),
        compatRuntime: path.join(
          root,
          "release",
          "compat-runtime",
          "plugins",
          "codex-work-platform",
          "runtime",
          "codex-work-platform.mjs",
        ),
        p10Server: path.join(root, "p10-control-server.mjs"),
        codexCommand: "codex",
        allowWebSearch: true,
        autoApproveHighRisk: false,
        requestToken,
        compatPort,
        webPort,
      }),
    );
    const child = spawn(
      process.execPath,
      [
        path.join(root, "installer", "workbench-supervisor.mjs"),
        "start",
        "--config",
        configPath,
      ],
      { cwd: root, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] },
    );
    let output = "";
    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    t.after(async () => {
      if (child.exitCode === null) {
        if (process.platform === "win32") {
          const killer = spawn(
            "taskkill.exe",
            ["/pid", String(child.pid), "/t", "/f"],
            { windowsHide: true, stdio: "ignore" },
          );
          await new Promise((resolve) => {
            killer.once("error", resolve);
            killer.once("close", resolve);
          });
        } else child.kill();
      }
    });
    const runtimePath = path.join(dataRoot, "runtime", "instance.json");
    const initial = await waitFor(async () => {
      try {
        const record = JSON.parse(await readFile(runtimePath, "utf8"));
        return record.state === "RUNNING" ? record : null;
      } catch {
        return null;
      }
    });
    const initialWebPid = initial.webPid;
    assert.equal(
      (await readdir(runtimeDirectory)).filter((name) =>
        name.startsWith("stale-instance-"),
      ).length,
      3,
    );
    process.kill(initialWebPid, "SIGTERM");
    const recovered = await waitFor(async () => {
      try {
        const record = JSON.parse(await readFile(runtimePath, "utf8"));
        return record.state === "RUNNING" && record.webPid !== initialWebPid
          ? record
          : null;
      } catch {
        return null;
      }
    });
    assert.notEqual(recovered.webPid, initialWebPid);
    const health = await fetch(`http://127.0.0.1:${webPort}/readyz`).then(
      (response) => response.json(),
    );
    assert.equal(health.ok, true);
    const initialCompatPid = recovered.compatPid;
    process.kill(initialCompatPid, "SIGTERM");
    const recoveredCompat = await waitFor(async () => {
      try {
        const record = JSON.parse(await readFile(runtimePath, "utf8"));
        return record.state === "RUNNING" &&
          record.compatPid !== initialCompatPid
          ? record
          : null;
      } catch {
        return null;
      }
    });
    assert.notEqual(recoveredCompat.compatPid, initialCompatPid);
    const stop = await fetch(
      `http://127.0.0.1:${webPort}/__internal/shutdown`,
      { method: "POST", headers: { "x-cwp-request-token": requestToken } },
    );
    assert.equal(stop.status, 202);
    await waitFor(() => child.exitCode !== null);
    assert.equal(child.exitCode, 0, output);
    await assert.rejects(access(runtimePath));
  },
);
