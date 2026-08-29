#!/usr/bin/env node
import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  PRODUCT,
  PLATFORM_CONFIG,
  assertDistinctRoots,
  assertNarrowRoot,
  assertWorkspaceRoot,
  atomicJson,
  booleanFlag,
  parseCli,
  processAlive,
  pathWithin,
  readJson,
  redactSecrets,
  requireAbsolute,
  requiredFlag,
  renameWithRetry,
  uniqueName,
} from "./platform-common.mjs";

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function portAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => {
      try {
        server.close();
      } catch {}
      resolve(false);
    });
    server.listen(port, "127.0.0.1", () => server.close(() => resolve(true)));
  });
}

async function selectPorts(config) {
  const preferredCompat = Number(config.compatPort ?? 19737);
  const preferredWeb = Number(config.webPort ?? 19738);
  for (let offset = 0; offset <= 100; offset += 1) {
    const compatPort = preferredCompat + offset * 2;
    const webPort = preferredWeb + offset * 2;
    if (compatPort > 65535 || webPort > 65535 || compatPort === webPort)
      continue;
    const [compatReady, webReady] = await Promise.all([
      portAvailable(compatPort),
      portAvailable(webPort),
    ]);
    if (compatReady && webReady) return { compatPort, webPort };
  }
  throw Error("NO_AVAILABLE_PORT_PAIR");
}

function validateConfig(config, configPath) {
  if (
    config.schemaVersion !== 1 ||
    config.product !== PRODUCT ||
    !config.instanceId
  )
    throw Error("PLATFORM_CONFIG_INVALID");
  if (!config.compatRuntime && config["legacyRuntime"])
    config.compatRuntime = config["legacyRuntime"];
  if (config.compatPort === undefined && config["legacyPort"] !== undefined)
    config.compatPort = config["legacyPort"];
  if (!config.controlDatabasePath)
    config.controlDatabasePath = path.join(config.dataRoot, "control.sqlite");
  const fields = [
    "installRoot",
    "dataRoot",
    "workspaceRoot",
    "databasePath",
    "controlDatabasePath",
    "statePath",
    "compatRuntime",
    "p10Server",
  ];
  for (const field of fields)
    config[field] = requireAbsolute(config[field], field);
  config.configPath = requireAbsolute(configPath, "configPath");
  const installRoot = assertNarrowRoot(config.installRoot, "installRoot");
  const dataRoot = assertNarrowRoot(config.dataRoot, "dataRoot");
  const workspaceRoot = assertWorkspaceRoot(config.workspaceRoot);
  assertDistinctRoots(
    config.development
      ? [
          ["dataRoot", dataRoot],
          ["workspaceRoot", workspaceRoot],
        ]
      : [
          ["installRoot", installRoot],
          ["dataRoot", dataRoot],
          ["workspaceRoot", workspaceRoot],
        ],
  );
  if (!pathWithin(config.compatRuntime, config.installRoot))
    throw Error("COMPAT_RUNTIME_OUTSIDE_INSTALL_ROOT");
  if (!pathWithin(config.p10Server, config.installRoot))
    throw Error("P10_SERVER_OUTSIDE_INSTALL_ROOT");
  if (!pathWithin(config.databasePath, config.dataRoot))
    throw Error("DATABASE_OUTSIDE_DATA_ROOT");
  if (!pathWithin(config.controlDatabasePath, config.dataRoot))
    throw Error("CONTROL_DATABASE_OUTSIDE_DATA_ROOT");
  if (!pathWithin(config.statePath, config.dataRoot))
    throw Error("STATE_OUTSIDE_DATA_ROOT");
  if (
    (process.platform === "win32"
      ? config.databasePath.toLowerCase()
      : config.databasePath) ===
    (process.platform === "win32"
      ? config.controlDatabasePath.toLowerCase()
      : config.controlDatabasePath)
  )
    throw Error("CONTROL_DB_MUST_BE_SEPARATE");
  config.compatPort = Number(config.compatPort ?? 19737);
  config.webPort = Number(config.webPort ?? 19738);
  if (
    ![config.compatPort, config.webPort].every(
      (port) => Number.isInteger(port) && port >= 1 && port <= 65535,
    )
  )
    throw Error("PLATFORM_PORT_INVALID");
  if (config.compatPort === config.webPort)
    throw Error("PLATFORM_PORT_CONFLICT");
  config.codexCommand = String(config.codexCommand || "codex");
  config.allowWebSearch = config.allowWebSearch !== false;
  config.autoApproveHighRisk = config.autoApproveHighRisk === true;
  config.requestToken = String(config.requestToken || "");
  if (config.requestToken.length > 256 || /[\r\n\0]/.test(config.requestToken))
    throw Error("REQUEST_TOKEN_INVALID");
  config.runtimeFile = path.join(config.dataRoot, "runtime", "instance.json");
  return config;
}

function appendLog(filePath, label, text) {
  const clean = redactSecrets(text);
  if (!clean) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  try {
    if (
      fs.existsSync(filePath) &&
      fs.statSync(filePath).size > 5 * 1024 * 1024
    ) {
      const rotated = `${filePath}.1`;
      if (fs.existsSync(rotated)) fs.unlinkSync(rotated);
      renameWithRetry(filePath, rotated);
    }
  } catch {}
  fs.appendFileSync(
    filePath,
    `${new Date().toISOString()} [${label}] ${clean.replace(/\s+$/, "")}\n`,
    { mode: 0o600 },
  );
}

function attachOutput(child, label, logFile) {
  for (const [name, stream] of [
    ["stdout", child.stdout],
    ["stderr", child.stderr],
  ]) {
    let buffered = "";
    stream?.on("data", (chunk) => {
      buffered += chunk.toString();
      const lines = buffered.split(/\r?\n/);
      buffered = lines.pop() ?? "";
      for (const line of lines) appendLog(logFile, `${label}:${name}`, line);
    });
    stream?.on("end", () => {
      if (buffered) appendLog(logFile, `${label}:${name}`, buffered);
      buffered = "";
    });
  }
}

function spawnService(label, script, args, options) {
  const child = spawn(
    process.execPath,
    ["--experimental-sqlite", script, ...args],
    {
      cwd: options.cwd,
      env: options.env,
      windowsHide: true,
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  attachOutput(child, label, options.logFile);
  return child;
}

async function waitForHealth(url, predicate, child, timeoutMs = 20_000) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw Error(`SERVICE_EXITED_BEFORE_READY:${child.exitCode}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) {
        const value = await response.json();
        if (predicate(value)) return value;
      }
    } catch (error) {
      lastError = error;
    }
    await sleep(150);
  }
  throw Error(
    `SERVICE_HEALTH_TIMEOUT:${redactSecrets(lastError?.message ?? url)}`,
  );
}

async function terminateProcessTree(child, signal = "SIGTERM") {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill.exe",
        ["/pid", String(child.pid), "/t", "/f"],
        { windowsHide: true, stdio: "ignore" },
      );
      killer.once("error", resolve);
      killer.once("close", resolve);
    });
    return;
  }
  try {
    process.kill(-child.pid, signal);
  } catch {
    try {
      child.kill(signal);
    } catch {}
  }
}

function openBrowser(url) {
  let command;
  let args;
  if (process.platform === "win32") {
    command = "explorer.exe";
    args = [url];
  } else if (process.platform === "darwin") {
    command = "open";
    args = [url];
  } else {
    command = "xdg-open";
    args = [url];
  }
  const child = spawn(command, args, {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  });
  child.unref();
}

export async function runSupervisor(input = {}) {
  const configPath = requireAbsolute(input.configPath, "configPath");
  const config = validateConfig(readJson(configPath), configPath);
  for (const filePath of [config.compatRuntime, config.p10Server]) {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile())
      throw Error(`RUNTIME_FILE_MISSING:${path.basename(filePath)}`);
  }
  fs.mkdirSync(config.workspaceRoot, { recursive: true });
  fs.mkdirSync(path.join(config.dataRoot, "logs"), { recursive: true });
  fs.mkdirSync(path.dirname(config.runtimeFile), { recursive: true });

  if (fs.existsSync(config.runtimeFile)) {
    const prior = readJson(config.runtimeFile);
    if (
      prior.instanceId === config.instanceId &&
      processAlive(Number(prior.supervisorPid))
    )
      throw Error("WORKBENCH_ALREADY_RUNNING");
    renameWithRetry(
      config.runtimeFile,
      path.join(
        path.dirname(config.runtimeFile),
        `${uniqueName("stale-instance")}.json`,
      ),
    );
  }

  const selectedPorts = await selectPorts(config);
  if (
    selectedPorts.compatPort !== config.compatPort ||
    selectedPorts.webPort !== config.webPort
  ) {
    const previousPorts = {
      compatPort: config.compatPort,
      webPort: config.webPort,
    };
    Object.assign(config, selectedPorts, {
      updatedAt: new Date().toISOString(),
      previousPorts,
    });
    atomicJson(configPath, config);
  }

  const logFile = path.join(
    config.dataRoot,
    "logs",
    `workbench-${new Date().toISOString().slice(0, 10)}.log`,
  );
  const compatUrl = `http://127.0.0.1:${config.compatPort}`;
  const webUrl = `http://127.0.0.1:${config.webPort}`;
  const runtime = {
    schemaVersion: 1,
    product: PRODUCT,
    instanceId: config.instanceId,
    state: "STARTING",
    supervisorPid: process.pid,
    startedAt: new Date().toISOString(),
    compatUrl,
    webUrl,
    compatPid: null,
    webPid: null,
  };
  atomicJson(config.runtimeFile, runtime);

  let compat = null;
  let web = null;
  let shuttingDown = false;
  let terminatingWeb = false;
  let restartInFlight = null;
  let consecutiveRestarts = 0;
  const restartHistory = [];
  const maxRestartsPerWindow = 12;
  const restartWindowMs = 5 * 60_000;
  let resolveExit;
  const exited = new Promise((resolve) => {
    resolveExit = resolve;
  });

  const cleanupRuntimeFile = () => {
    try {
      if (!fs.existsSync(config.runtimeFile)) return;
      const current = readJson(config.runtimeFile);
      if (
        current.instanceId === config.instanceId &&
        current.supervisorPid === process.pid
      )
        fs.unlinkSync(config.runtimeFile);
    } catch {}
  };

  const shutdown = async (reason, exitCode = 0) => {
    if (shuttingDown) return;
    shuttingDown = true;
    appendLog(logFile, "supervisor", `shutdown:${reason}`);
    if (web && web.exitCode === null && config.requestToken) {
      try {
        await fetch(`${webUrl}/__internal/shutdown`, {
          method: "POST",
          headers: { "x-cwp-request-token": config.requestToken },
          signal: AbortSignal.timeout(1500),
        });
        await Promise.race([
          new Promise((resolve) => web.once("exit", resolve)),
          sleep(3000),
        ]);
      } catch {}
    }
    terminatingWeb = true;
    try {
      await terminateProcessTree(web);
    } finally {
      terminatingWeb = false;
    }
    await terminateProcessTree(compat);
    cleanupRuntimeFile();
    resolveExit(exitCode);
  };

  const updateRuntime = (changes = {}) => {
    Object.assign(runtime, changes);
    try {
      atomicJson(config.runtimeFile, runtime);
    } catch (error) {
      appendLog(
        logFile,
        "supervisor",
        `runtime-state-write-failed:${error.message}`,
      );
    }
  };
  const compatOptions = {
    cwd: path.dirname(config.compatRuntime),
    env: { ...process.env, CODEX_WORK_PLATFORM_DB: config.databasePath },
    logFile,
  };
  const webOptions = {
    cwd: path.dirname(config.p10Server),
    env: {
      ...process.env,
      CODEX_WORK_PLATFORM_DB: config.databasePath,
      CODEX_WORK_PLATFORM_DATA_DIR: config.dataRoot,
    },
    logFile,
  };
  const startCompat = async () => {
    compat = spawnService(
      "compat",
      config.compatRuntime,
      [
        "serve",
        "--db",
        config.databasePath,
        "--port",
        String(config.compatPort),
      ],
      compatOptions,
    );
    updateRuntime({ compatPid: compat.pid, state: "STARTING" });
    compat.once("exit", (code, signal) => {
      if (!shuttingDown)
        void recover("compat", `${code ?? signal ?? "unknown"}`);
    });
    await waitForHealth(
      `${compatUrl}/healthz`,
      (value) => value?.ok === true,
      compat,
    );
  };
  const startWeb = async () => {
    if (web && web.exitCode === null) {
      terminatingWeb = true;
      try {
        await terminateProcessTree(web);
      } finally {
        terminatingWeb = false;
      }
    }
    web = spawnService(
      "p10",
      config.p10Server,
      [
        "--db",
        config.databasePath,
        "--control-db",
        config.controlDatabasePath,
        "--port",
        String(config.webPort),
        "--compat-base",
        compatUrl,
        "--workspace-root",
        config.workspaceRoot,
        "--codex-command",
        config.codexCommand,
        ...(config.requestToken
          ? ["--request-token", config.requestToken]
          : []),
        ...(config.autoApproveHighRisk
          ? ["--auto-approve-high-risk", "true"]
          : []),
        "--allow-web-search",
        String(config.allowWebSearch),
        "--instance-id",
        config.instanceId,
      ],
      webOptions,
    );
    updateRuntime({ webPid: web.pid, state: "STARTING" });
    web.once("exit", (code, signal) => {
      if (!shuttingDown && !terminatingWeb) {
        if (code === 0) void shutdown("web-requested-stop", 0);
        else void recover("web", `${code ?? signal ?? "unknown"}`);
      }
    });
    await waitForHealth(`${webUrl}/readyz`, (value) => value?.ok === true, web);
  };
  async function recover(kind, detail) {
    if (shuttingDown || restartInFlight) return;
    restartInFlight = (async () => {
      while (!shuttingDown) {
        const nowMs = Date.now();
        while (
          restartHistory.length &&
          nowMs - restartHistory[0] > restartWindowMs
        )
          restartHistory.shift();
        if (restartHistory.length >= maxRestartsPerWindow) {
          updateRuntime({
            state: "DEGRADED",
            lastError: `${kind}-restart-rate-limit`,
            restartCount: restartHistory.length,
            nextRestartAt: null,
          });
          appendLog(
            logFile,
            "supervisor",
            `restart-rate-limit:${kind}:${maxRestartsPerWindow}/${restartWindowMs}ms`,
          );
          return;
        }
        restartHistory.push(nowMs);
        consecutiveRestarts += 1;
        const delay = Math.min(
          60_000,
          250 * 2 ** Math.min(consecutiveRestarts - 1, 8),
        );
        updateRuntime({
          state: "DEGRADED",
          lastError: `${kind}-exit:${detail}`,
          restartCount: consecutiveRestarts,
          nextRestartAt: new Date(Date.now() + delay).toISOString(),
        });
        appendLog(
          logFile,
          "supervisor",
          `restart-scheduled:${kind}:${delay}ms`,
        );
        await sleep(delay);
        if (shuttingDown) return;
        try {
          if (kind === "compat") {
            terminatingWeb = true;
            try {
              await terminateProcessTree(web);
            } finally {
              terminatingWeb = false;
            }
            web = null;
            await startCompat();
          }
          await startWeb();
          consecutiveRestarts = 0;
          updateRuntime({
            state: "RUNNING",
            readyAt: new Date().toISOString(),
            lastError: null,
            nextRestartAt: null,
            restartCount: 0,
          });
          appendLog(logFile, "supervisor", `restarted:${kind}`);
          return;
        } catch (error) {
          detail = error instanceof Error ? error.message : String(error);
          appendLog(logFile, "supervisor", `restart-failed:${kind}:${detail}`);
        }
      }
    })().finally(() => {
      restartInFlight = null;
    });
    await restartInFlight;
  }

  const onSignal = (signal) => {
    void shutdown(signal, 0);
  };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);

  try {
    await startCompat();
    await startWeb();

    runtime.state = "RUNNING";
    runtime.readyAt = new Date().toISOString();
    atomicJson(config.runtimeFile, runtime);
    appendLog(logFile, "supervisor", `ready:${webUrl}`);
    process.stdout.write(
      `${JSON.stringify({ ok: true, product: PRODUCT, instanceId: config.instanceId, state: "RUNNING", webUrl, compatUrl, runtimeFile: config.runtimeFile })}\n`,
    );
    if (input.openBrowser) openBrowser(webUrl);
    const exitCode = await exited;
    return exitCode;
  } catch (error) {
    appendLog(
      logFile,
      "supervisor",
      `startup-failed:${error instanceof Error ? error.message : String(error)}`,
    );
    await shutdown("startup-failed", 1);
    throw error;
  } finally {
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  }
}

async function cli(argv) {
  const { command, flags } = parseCli(argv);
  if (!command || command === "help" || command === "--help") {
    process.stdout.write(
      `${JSON.stringify({ ok: Boolean(command), usage: "start --config <absolute path> [--open true|false]" })}\n`,
    );
    return command ? 0 : 2;
  }
  if (command !== "start") throw Error(`COMMAND_UNKNOWN:${command}`);
  return runSupervisor({
    configPath: requiredFlag(flags, "--config"),
    openBrowser: booleanFlag(flags, "--open", false),
  });
}

const invoked = process.argv[1]
  ? fs.realpathSync.native(path.resolve(process.argv[1]))
  : "";
const modulePath = fs.realpathSync.native(fileURLToPath(import.meta.url));
if (invoked === modulePath) {
  cli(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      process.stderr.write(
        `${JSON.stringify({ ok: false, code: error instanceof Error ? error.message : String(error) })}\n`,
      );
      process.exitCode = 1;
    });
}
