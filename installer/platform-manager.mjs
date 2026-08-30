#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  INSTALLATION_RECORD,
  P10_VERSION,
  PLATFORM_CONFIG,
  PRODUCT,
  PRODUCT_LABEL,
  RELEASE_MANIFEST,
  assertDistinctRoots,
  assertEmptyOrMissing,
  assertNarrowRoot,
  assertNoSymlinkComponents,
  assertWorkspaceRoot,
  atomicJson,
  atomicText,
  booleanFlag,
  copyRecords,
  defaultRoots,
  integerFlag,
  parseCli,
  pathWithin,
  processAlive,
  readJson,
  recordsSha256,
  redactSecrets,
  requireAbsolute,
  requiredFlag,
  renameWithRetry,
  sha256File,
  uniqueName,
  validateRecords,
  verifyRecords,
  walkFiles,
} from "./platform-common.mjs";
import { runSupervisor } from "./workbench-supervisor.mjs";
import { StateStore } from "../state-store.mjs";

const modulePath = fileURLToPath(import.meta.url);
const moduleDirectory = path.dirname(modulePath);
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

function nearestExistingParent(target) {
  let current = path.resolve(target);
  while (!fs.existsSync(current)) {
    const parent = path.dirname(current);
    if (parent === current) throw Error(`NO_EXISTING_PARENT:${target}`);
    current = parent;
  }
  return current;
}

function diskAvailable(target) {
  const parent = nearestExistingParent(target);
  fs.accessSync(parent, fs.constants.W_OK);
  const stats = fs.statfsSync(parent);
  const bytes = Number(stats.bavail) * Number(stats.bsize);
  if (!Number.isSafeInteger(bytes)) throw Error("DISK_CAPACITY_UNAVAILABLE");
  return bytes;
}

function releaseRootFrom(value) {
  return requireAbsolute(value ?? path.dirname(moduleDirectory), "releaseRoot");
}

export function compareP10Versions(left, right) {
  const parse = (value) => {
    const match = String(value).match(
      /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/,
    );
    if (!match) throw Error(`VERSION_INVALID:${value}`);
    return {
      core: match.slice(1, 4).map(Number),
      prerelease: match[4]?.split(".") ?? null,
    };
  };
  const a = parse(left);
  const b = parse(right);
  for (let index = 0; index < 3; index += 1) {
    if (a.core[index] !== b.core[index])
      return a.core[index] < b.core[index] ? -1 : 1;
  }
  if (a.prerelease === null || b.prerelease === null)
    return a.prerelease === b.prerelease ? 0 : a.prerelease === null ? 1 : -1;
  const length = Math.max(a.prerelease.length, b.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = a.prerelease[index];
    const rightPart = b.prerelease[index];
    if (leftPart === rightPart) continue;
    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    const leftNumeric = /^\d+$/.test(leftPart);
    const rightNumeric = /^\d+$/.test(rightPart);
    if (leftNumeric && rightNumeric)
      return Number(leftPart) < Number(rightPart) ? -1 : 1;
    if (leftNumeric !== rightNumeric) return leftNumeric ? -1 : 1;
    return leftPart < rightPart ? -1 : 1;
  }
  return 0;
}

export function verifyPortableRelease(releaseRootInput) {
  const releaseRoot = assertNoSymlinkComponents(
    releaseRootFrom(releaseRootInput),
  );
  const manifestPath = path.join(releaseRoot, RELEASE_MANIFEST);
  if (
    !fs.existsSync(manifestPath) ||
    fs.lstatSync(manifestPath).isSymbolicLink()
  )
    throw Error("P10_RELEASE_MANIFEST_MISSING");
  const manifest = readJson(manifestPath);
  if (
    manifest.schemaVersion !== 1 ||
    manifest.manifestType !== "CODEX_WORK_PLATFORM_PORTABLE_RELEASE"
  )
    throw Error("P10_RELEASE_MANIFEST_INVALID");
  if (
    manifest.product !== PRODUCT ||
    typeof manifest.version !== "string" ||
    !/^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(
      manifest.version,
    ) ||
    manifest.manifestSelf !== "EXCLUDED_SELF_REFERENCE"
  )
    throw Error("P10_RELEASE_IDENTITY_MISMATCH");
  validateRecords(manifest.files);
  if (recordsSha256(manifest.files) !== manifest.treeSha256)
    throw Error("P10_RELEASE_TREE_HASH_INVALID");
  const verified = verifyRecords(releaseRoot, manifest.files, {
    exclude: [RELEASE_MANIFEST],
    label: "release",
  });
  return {
    releaseRoot,
    manifestPath,
    manifestSha256: sha256File(manifestPath),
    manifest,
    ...verified,
  };
}

async function probeCodex(releaseRoot, command, workspaceRoot, options = {}) {
  const adapterPath = path.join(releaseRoot, "app", "codex-adapter.mjs");
  const imported = await import(
    `${pathToFileURL(adapterPath).href}?probe=${Date.now()}`
  );
  const verifyExecution = options.verifyExecution === true;
  const executionRoot = verifyExecution
    ? fs.mkdtempSync(path.join(os.tmpdir(), "cwp-codex-probe-"))
    : workspaceRoot;
  const codexHome = path.resolve(
    options.codexHome ??
      process.env.CODEX_HOME ??
      path.join(os.homedir(), ".codex"),
  );
  const providerConfig = imported.loadOfficialChatGptConfig(
    path.join(codexHome, "config.toml"),
  );
  try {
    const adapter = new imported.LocalCodexCliAdapter({
      command,
      commandPrefix: providerConfig.args,
      provider: providerConfig.provider,
      configurationError: providerConfig.error,
      requireChatGptAuth: true,
      env: { ...process.env, CODEX_HOME: codexHome },
      allowedRoots: [executionRoot],
    });
    return await adapter.probe({ refresh: true, verifyExecution });
  } finally {
    if (verifyExecution)
      fs.rmSync(executionRoot, { recursive: true, force: true });
  }
}

function normalizeRoots(input = {}) {
  const defaults = defaultRoots(
    input.platform ?? process.platform,
    input.env ?? process.env,
    input.home ?? os.homedir(),
  );
  const installRoot = assertNarrowRoot(
    input.installRoot ?? defaults.installRoot,
    "installRoot",
  );
  const dataRoot = assertNarrowRoot(
    input.dataRoot ?? defaults.dataRoot,
    "dataRoot",
  );
  const workspaceRoot = assertWorkspaceRoot(
    input.workspaceRoot ?? defaults.workspaceRoot,
  );
  assertDistinctRoots([
    ["installRoot", installRoot],
    ["dataRoot", dataRoot],
    ["workspaceRoot", workspaceRoot],
  ]);
  return { installRoot, dataRoot, workspaceRoot, defaults };
}

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

export async function findAvailablePortPair(input = {}) {
  const preferredCompat = Number(input.compatPort ?? 19737);
  const preferredWeb = Number(input.webPort ?? preferredCompat + 1);
  const maxOffset = Math.max(0, Math.min(1000, Number(input.maxOffset ?? 100)));
  if (
    ![preferredCompat, preferredWeb].every(
      (port) => Number.isInteger(port) && port >= 1 && port <= 65535,
    ) ||
    preferredCompat === preferredWeb
  )
    throw Error("PLATFORM_PORT_INVALID");
  for (let offset = 0; offset <= maxOffset; offset += 1) {
    const compatPort = preferredCompat + offset * 2;
    const webPort = preferredWeb + offset * 2;
    if (compatPort > 65535 || webPort > 65535 || compatPort === webPort)
      continue;
    const [compatPortAvailable, webPortAvailable] = await Promise.all([
      portAvailable(compatPort),
      portAvailable(webPort),
    ]);
    if (compatPortAvailable && webPortAvailable) return { compatPort, webPort };
  }
  throw Error("NO_AVAILABLE_PORT_PAIR");
}

export async function preflightPlatform(input = {}) {
  const release = verifyPortableRelease(releaseRootFrom(input.releaseRoot));
  const roots = normalizeRoots(input);
  const nodeMajor = Number(process.versions.node.split(".")[0]);
  const nodeReady =
    Number.isInteger(nodeMajor) &&
    nodeMajor >= 22 &&
    (nodeMajor > 22 || Number(process.versions.node.split(".")[1]) >= 5);
  const platformReady =
    (process.platform === "win32" && ["x64", "arm64"].includes(process.arch)) ||
    (process.platform === "darwin" && process.arch === "arm64") ||
    (process.platform === "linux" && ["x64", "arm64"].includes(process.arch));
  const installAvailable = diskAvailable(roots.installRoot);
  const dataAvailable = diskAvailable(roots.dataRoot);
  const minimumBytes = 150 * 1024 * 1024;
  const diskReady =
    installAvailable >= minimumBytes && dataAvailable >= minimumBytes;
  const codexCommand = String(input.codexCommand || "codex");
  const codex = await probeCodex(
    release.releaseRoot,
    codexCommand,
    roots.workspaceRoot,
    { verifyExecution: true },
  );
  const compatPort = Number(input.compatPort ?? input["legacyPort"] ?? 19737);
  const webPort = Number(input.webPort ?? 19738);
  if (
    ![compatPort, webPort].every(
      (port) => Number.isInteger(port) && port >= 1 && port <= 65535,
    ) ||
    compatPort === webPort
  )
    throw Error("PLATFORM_PORT_INVALID");
  const [compatPortAvailable, webPortAvailable] = await Promise.all([
    portAvailable(compatPort),
    portAvailable(webPort),
  ]);
  const portsReady = compatPortAvailable && webPortAvailable;
  const targetsReady =
    (!fs.existsSync(roots.installRoot) ||
      fs.readdirSync(roots.installRoot).length === 0) &&
    (!fs.existsSync(roots.dataRoot) ||
      fs.readdirSync(roots.dataRoot).length === 0);
  const ready =
    platformReady &&
    nodeReady &&
    diskReady &&
    codex.available === true &&
    codex.authenticated === true &&
    portsReady &&
    targetsReady;
  return {
    status: ready ? "PASS" : "FAIL",
    ready,
    product: PRODUCT,
    version: release.manifest.version,
    platform: process.platform,
    architecture: process.arch,
    platformReady,
    node: { version: process.version, ready: nodeReady, minimum: "22.5.0" },
    codex,
    ports: {
      ready: portsReady,
      compatPort,
      compatPortAvailable,
      webPort,
      webPortAvailable,
      host: "127.0.0.1",
    },
    disk: { ready: diskReady, minimumBytes, installAvailable, dataAvailable },
    targets: {
      ready: targetsReady,
      installRoot: roots.installRoot,
      dataRoot: roots.dataRoot,
      workspaceRoot: roots.workspaceRoot,
    },
    release: {
      fileCount: release.fileCount,
      bytes: release.bytes,
      treeSha256: release.treeSha256,
      manifestSha256: release.manifestSha256,
    },
  };
}

function runCompat(runtimePath, command, databasePath) {
  const result = spawnSync(
    process.execPath,
    [runtimePath, command, "--db", databasePath],
    {
      cwd: path.dirname(runtimePath),
      env: { ...process.env, CODEX_WORK_PLATFORM_DB: databasePath },
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  if (result.error)
    throw Error(`COMPAT_RUNTIME_START_FAILED:${result.error.message}`);
  if (result.status !== 0)
    throw Error(
      `COMPAT_RUNTIME_FAILED:${redactSecrets(result.stderr || result.stdout)}`,
    );
  try {
    const parsed = JSON.parse(result.stdout.trim());
    if (parsed.ok !== true) throw Error("COMPAT_RUNTIME_NOT_OK");
    return parsed;
  } catch (error) {
    if (error instanceof SyntaxError) throw Error("COMPAT_RUNTIME_NON_JSON");
    throw error;
  }
}

function copyPortableRelease(release, targetReleaseRoot) {
  fs.mkdirSync(targetReleaseRoot, { recursive: true });
  copyRecords(release.releaseRoot, targetReleaseRoot, release.manifest.files);
  fs.copyFileSync(
    release.manifestPath,
    path.join(targetReleaseRoot, RELEASE_MANIFEST),
    fs.constants.COPYFILE_EXCL,
  );
  if (process.platform !== "win32")
    fs.chmodSync(path.join(targetReleaseRoot, RELEASE_MANIFEST), 0o644);
  return verifyPortableRelease(targetReleaseRoot);
}

function initialP10State() {
  return {
    runs: [],
    approvals: [],
    events: [],
    artifacts: [],
    executionLogs: [],
    operatorActions: [],
    workflows: [],
    workflowNodes: [],
    workflowEdges: [],
    idempotency: {},
  };
}

function buildConfig(input) {
  const releaseRoot = path.join(input.installRoot, "release");
  const compatPort = Number(input.compatPort ?? input["legacyPort"] ?? 19737);
  const webPort = Number(input.webPort ?? 19738);
  if (
    ![compatPort, webPort].every(
      (port) => Number.isInteger(port) && port >= 1 && port <= 65535,
    ) ||
    compatPort === webPort
  )
    throw Error("PLATFORM_PORT_INVALID");
  return {
    schemaVersion: 1,
    product: PRODUCT,
    version: input.version,
    instanceId: input.instanceId,
    installRoot: input.installRoot,
    dataRoot: input.dataRoot,
    workspaceRoot: input.workspaceRoot,
    databasePath: path.join(input.dataRoot, "platform.sqlite"),
    controlDatabasePath: path.join(input.dataRoot, "control.sqlite"),
    statePath: path.join(input.dataRoot, "platform.sqlite.p10.json"),
    compatRuntime: path.join(
      releaseRoot,
      "compat-runtime",
      "plugin",
      "runtime",
      "codex-work-platform.mjs",
    ),
    compatMcpServer: path.join(
      releaseRoot,
      "compat-runtime",
      "plugin",
      "runtime",
      "mcp-server.mjs",
    ),
    p10Server: path.join(releaseRoot, "app", "p10-control-server.mjs"),
    codexCommand: String(input.codexCommand || "codex"),
    allowWebSearch: input.allowWebSearch !== false,
    autoApproveHighRisk: input.autoApproveHighRisk === true,
    requestToken: String(
      input.requestToken || crypto.randomBytes(32).toString("hex"),
    ),
    compatPort,
    webPort,
    updatedAt: new Date().toISOString(),
  };
}

function buildInstallation(config, release, extra = {}) {
  return {
    schemaVersion: 1,
    recordType: "CODEX_WORK_PLATFORM_P10_INSTALLATION",
    product: PRODUCT,
    version: release.manifest.version,
    instanceId: config.instanceId,
    installedAt: extra.installedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    installRoot: config.installRoot,
    dataRoot: config.dataRoot,
    workspaceRoot: config.workspaceRoot,
    configPath: path.join(config.dataRoot, PLATFORM_CONFIG),
    releaseRoot: path.join(config.installRoot, "release"),
    releaseManifestSha256: release.manifestSha256,
    releaseTreeSha256: release.treeSha256,
    databasePath: config.databasePath,
    controlDatabasePath: config.controlDatabasePath,
    statePath: config.statePath,
    restoredFrom: extra.restoredFrom ?? null,
    upgradedFrom: extra.upgradedFrom ?? null,
  };
}

function writeLaunchers(installRoot) {
  const cmd = [
    "@echo off",
    "setlocal",
    'node --experimental-sqlite "%~dp0release\\bin\\platform-manager.mjs" start --install-root "%~dp0." --open true',
    "if errorlevel 1 pause",
    "",
  ].join("\r\n");
  const shell = [
    "#!/bin/sh",
    "set -eu",
    'SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"',
    'exec node --experimental-sqlite "$SCRIPT_DIR/release/bin/platform-manager.mjs" start --install-root "$SCRIPT_DIR" --open true',
    "",
  ].join("\n");
  atomicText(path.join(installRoot, "start-workbench.cmd"), cmd, {
    mode: 0o644,
  });
  atomicText(path.join(installRoot, "start-workbench.command"), shell, {
    mode: 0o755,
  });
  if (process.platform !== "win32")
    fs.chmodSync(path.join(installRoot, "start-workbench.command"), 0o755);
}

function writeMcpConfig(config, outputDataRoot = config.dataRoot) {
  atomicJson(path.join(outputDataRoot, "mcp-config.json"), {
    mcpServers: {
      "codex-work-platform": {
        command: "node",
        args: [config.compatMcpServer ?? config["mcpServer"]],
        env: {
          CODEX_WORK_PLATFORM_DB: config.databasePath,
          CODEX_WORK_PLATFORM_DATA_DIR: config.dataRoot,
        },
      },
    },
  });
}

function initializeStagedData(config, release, extra = {}) {
  fs.mkdirSync(config.dataRoot, { recursive: true });
  fs.mkdirSync(config.workspaceRoot, { recursive: true });
  const compat = runCompat(config.compatRuntime, "init", config.databasePath);
  const control = new StateStore({
    databasePath: config.controlDatabasePath,
    legacyStatePath: config.statePath,
  }).open();
  control.save(initialP10State());
  control.close();
  atomicJson(config.statePath, initialP10State());
  atomicJson(path.join(config.dataRoot, "data-meta.json"), {
    schemaVersion: 1,
    product: PRODUCT,
    version: config.version,
    instanceId: config.instanceId,
    createdAt: new Date().toISOString(),
    restoredFrom: extra.restoredFrom ?? null,
  });
  atomicJson(path.join(config.dataRoot, PLATFORM_CONFIG), config);
  writeMcpConfig(config);
  return compat;
}

function idempotentInstallation(installRoot, release) {
  const recordPath = path.join(installRoot, INSTALLATION_RECORD);
  if (!fs.existsSync(recordPath)) return null;
  const record = readJson(recordPath);
  if (
    record.recordType !== "CODEX_WORK_PLATFORM_P10_INSTALLATION" ||
    record.product !== PRODUCT
  )
    throw Error("INSTALL_TARGET_OWNERSHIP_UNKNOWN");
  if (
    record.version !== release.manifest.version ||
    record.releaseManifestSha256 !== release.manifestSha256
  )
    throw Error("INSTALL_TARGET_VERSION_CONFLICT");
  const installed = verifyPortableRelease(path.join(installRoot, "release"));
  if (installed.manifestSha256 !== release.manifestSha256)
    throw Error("INSTALL_TARGET_BYTES_CONFLICT");
  return record;
}

export async function installPlatform(input = {}) {
  const release = verifyPortableRelease(releaseRootFrom(input.releaseRoot));
  const roots = normalizeRoots(input);
  const selectedPorts = await findAvailablePortPair({
    compatPort: input.compatPort,
    webPort: input.webPort,
  });
  const effectiveInput = { ...input, ...roots, ...selectedPorts };
  if (
    fs.existsSync(roots.installRoot) &&
    fs.readdirSync(roots.installRoot).length
  ) {
    const record = idempotentInstallation(roots.installRoot, release);
    return { status: "IDEMPOTENT_NOOP", installation: record };
  }
  assertEmptyOrMissing(roots.installRoot, "installRoot");
  assertEmptyOrMissing(roots.dataRoot, "dataRoot");
  const preflight = await preflightPlatform({
    ...effectiveInput,
    releaseRoot: release.releaseRoot,
  });
  if (!preflight.ready)
    throw Error(
      `PREFLIGHT_FAILED:${JSON.stringify({ platform: preflight.platformReady, node: preflight.node.ready, codexAvailable: preflight.codex.available, codexAuthenticated: preflight.codex.authenticated, ports: preflight.ports.ready, disk: preflight.disk.ready, targets: preflight.targets.ready })}`,
    );

  const stageId = uniqueName("installing");
  const installStage = `${roots.installRoot}.${stageId}`;
  const dataStage = `${roots.dataRoot}.${stageId}`;
  assertEmptyOrMissing(installStage, "installStage");
  assertEmptyOrMissing(dataStage, "dataStage");
  fs.mkdirSync(installStage, { recursive: true });
  fs.mkdirSync(dataStage, { recursive: true });
  let dataPromoted = false;
  let installPromoted = false;
  try {
    const stagedRelease = copyPortableRelease(
      release,
      path.join(installStage, "release"),
    );
    const instanceId = crypto.randomUUID();
    const requestToken = crypto.randomBytes(32).toString("hex");
    const stagedConfig = buildConfig({
      ...effectiveInput,
      version: release.manifest.version,
      instanceId,
      requestToken,
      installRoot: installStage,
      dataRoot: dataStage,
      workspaceRoot: roots.workspaceRoot,
    });
    initializeStagedData(stagedConfig, stagedRelease);

    const finalConfig = buildConfig({
      ...effectiveInput,
      version: release.manifest.version,
      instanceId,
      requestToken,
      installRoot: roots.installRoot,
      dataRoot: roots.dataRoot,
      workspaceRoot: roots.workspaceRoot,
    });
    atomicJson(path.join(dataStage, PLATFORM_CONFIG), finalConfig);
    writeMcpConfig(finalConfig, dataStage);
    const installation = buildInstallation(finalConfig, release);
    atomicJson(path.join(installStage, INSTALLATION_RECORD), installation);
    writeLaunchers(installStage);

    if (fs.existsSync(roots.dataRoot)) fs.rmdirSync(roots.dataRoot);
    renameWithRetry(dataStage, roots.dataRoot);
    dataPromoted = true;
    if (fs.existsSync(roots.installRoot)) fs.rmdirSync(roots.installRoot);
    renameWithRetry(installStage, roots.installRoot);
    installPromoted = true;

    const doctor = await diagnosePlatform({
      installRoot: roots.installRoot,
      skipCodexProbe: false,
    });
    if (doctor.status !== "PASS")
      throw Error(
        `POST_INSTALL_DIAGNOSE_FAILED:${doctor.failedChecks.join(",")}`,
      );
    return { status: "INSTALLED", installation, doctor };
  } catch (error) {
    if (
      installPromoted &&
      fs.existsSync(roots.installRoot) &&
      !fs.existsSync(installStage)
    )
      renameWithRetry(roots.installRoot, installStage);
    if (
      dataPromoted &&
      fs.existsSync(roots.dataRoot) &&
      !fs.existsSync(dataStage)
    )
      renameWithRetry(roots.dataRoot, dataStage);
    throw error;
  }
}

function loadInstallation(installRootInput) {
  const installRoot = assertNarrowRoot(installRootInput, "installRoot");
  const recordPath = path.join(installRoot, INSTALLATION_RECORD);
  if (!fs.existsSync(recordPath)) throw Error("INSTALLATION_RECORD_MISSING");
  const record = readJson(recordPath);
  if (
    record.schemaVersion !== 1 ||
    record.recordType !== "CODEX_WORK_PLATFORM_P10_INSTALLATION" ||
    record.product !== PRODUCT
  )
    throw Error("INSTALLATION_RECORD_INVALID");
  if (path.resolve(record.installRoot) !== path.resolve(installRoot))
    throw Error("INSTALLATION_ROOT_BINDING_INVALID");
  const recordDataRoot = assertNarrowRoot(record.dataRoot, "dataRoot");
  const recordWorkspaceRoot = assertWorkspaceRoot(record.workspaceRoot);
  const configPath = requireAbsolute(record.configPath, "configPath");
  if (!pathWithin(configPath, recordDataRoot))
    throw Error("PLATFORM_CONFIG_OUTSIDE_DATA_ROOT");
  if (!fs.existsSync(configPath)) throw Error("PLATFORM_CONFIG_MISSING");
  const config = readJson(configPath);
  // Read older installation records once; all new records use neutral names.
  let normalizedConfig = false;
  if (!config.compatRuntime && config["legacyRuntime"]) {
    config.compatRuntime = config["legacyRuntime"];
    normalizedConfig = true;
  }
  if (!config.compatMcpServer && config["mcpServer"]) {
    config.compatMcpServer = config["mcpServer"];
    normalizedConfig = true;
  }
  if (config.compatPort === undefined && config["legacyPort"] !== undefined) {
    config.compatPort = config["legacyPort"];
    normalizedConfig = true;
  }
  if (
    config.schemaVersion !== 1 ||
    config.product !== PRODUCT ||
    config.instanceId !== record.instanceId
  )
    throw Error("PLATFORM_CONFIG_INVALID");
  if (!config.controlDatabasePath && record.controlDatabasePath) {
    config.controlDatabasePath = record.controlDatabasePath;
    normalizedConfig = true;
  }
  if (!config.controlDatabasePath) {
    config.controlDatabasePath = path.join(config.dataRoot, "control.sqlite");
    normalizedConfig = true;
  }
  if (!config.databasePath) {
    config.databasePath = path.join(config.dataRoot, "platform.sqlite");
    normalizedConfig = true;
  }
  if (!config.statePath) {
    config.statePath = path.join(config.dataRoot, "platform.sqlite.p10.json");
    normalizedConfig = true;
  }
  if (!config.requestToken) {
    config.requestToken = crypto.randomBytes(32).toString("hex");
    normalizedConfig = true;
  }
  if (config.compatPort === undefined) {
    config.compatPort = 19737;
    normalizedConfig = true;
  }
  if (config.webPort === undefined) {
    config.webPort = 19738;
    normalizedConfig = true;
  }
  if (config.allowWebSearch === undefined) {
    config.allowWebSearch = true;
    normalizedConfig = true;
  }
  if (config.autoApproveHighRisk === undefined) {
    config.autoApproveHighRisk = false;
    normalizedConfig = true;
  }
  for (const [field, expected] of [
    ["installRoot", installRoot],
    ["dataRoot", recordDataRoot],
    ["workspaceRoot", recordWorkspaceRoot],
    [
      "databasePath",
      record.databasePath ?? path.join(config.dataRoot, "platform.sqlite"),
    ],
    [
      "controlDatabasePath",
      record.controlDatabasePath ??
        path.join(config.dataRoot, "control.sqlite"),
    ],
    [
      "statePath",
      record.statePath ??
        path.join(config.dataRoot, "platform.sqlite.p10.json"),
    ],
  ]) {
    if (path.resolve(config[field]) !== path.resolve(expected))
      throw Error(`PLATFORM_CONFIG_BINDING_INVALID:${field}`);
  }
  if (normalizedConfig) atomicJson(configPath, config);
  return { installRoot, recordPath, record, configPath, config };
}

async function healthIdentity(config) {
  try {
    const response = await fetch(`http://127.0.0.1:${config.webPort}/healthz`, {
      signal: AbortSignal.timeout(1500),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

async function ensureStopped(installation) {
  const runtimeFile = path.join(
    installation.config.dataRoot,
    "runtime",
    "instance.json",
  );
  if (!fs.existsSync(runtimeFile)) return { stopped: true, runtimeFile };
  const runtime = readJson(runtimeFile);
  if (runtime.instanceId !== installation.config.instanceId)
    throw Error("RUNTIME_LOCK_INSTANCE_MISMATCH");
  if (processAlive(Number(runtime.supervisorPid))) {
    const health = await healthIdentity(installation.config);
    if (health?.instanceId === installation.config.instanceId)
      throw Error("WORKBENCH_RUNNING_STOP_REQUIRED");
    throw Error("RUNTIME_PID_IDENTITY_UNVERIFIED");
  }
  const stale = path.join(
    path.dirname(runtimeFile),
    `${uniqueName("stale-instance")}.json`,
  );
  renameWithRetry(runtimeFile, stale);
  return { stopped: true, runtimeFile, staleRuntimeFile: stale };
}

function addCheck(checks, id, action) {
  try {
    const detail = action();
    checks.push({ id, status: "PASS", detail: detail ?? null });
  } catch (error) {
    checks.push({
      id,
      status: "FAIL",
      detail: redactSecrets(
        error instanceof Error ? error.message : String(error),
      ),
    });
  }
}

function readControlState(config, options = {}) {
  const store = new StateStore({
    databasePath: config.controlDatabasePath,
    legacyStatePath: config.statePath,
    readOnly: options.readOnly === true,
  }).open();
  try {
    return store.load();
  } finally {
    store.close();
  }
}

export async function diagnosePlatform(input = {}) {
  const installation = loadInstallation(input.installRoot);
  const runtimeFile = path.join(
    installation.config.dataRoot,
    "runtime",
    "instance.json",
  );
  const liveRuntime = fs.existsSync(runtimeFile) ? readJson(runtimeFile) : null;
  const controlReadOnly = Boolean(
    liveRuntime && processAlive(Number(liveRuntime.supervisorPid)),
  );
  const checks = [];
  let installedRelease = null;
  addCheck(checks, "loopback_binding", () => {
    if (installation.config.webPort === installation.config.compatPort)
      throw Error("PORT_CONFLICT");
    return {
      host: "127.0.0.1",
      webPort: installation.config.webPort,
      compatPort: installation.config.compatPort,
    };
  });
  addCheck(checks, "release_bytes", () => {
    installedRelease = verifyPortableRelease(
      path.join(installation.installRoot, "release"),
    );
    if (
      installedRelease.manifestSha256 !==
      installation.record.releaseManifestSha256
    )
      throw Error("INSTALLED_RELEASE_MANIFEST_MISMATCH");
    return {
      fileCount: installedRelease.fileCount,
      treeSha256: installedRelease.treeSha256,
    };
  });
  addCheck(checks, "p10_state", () => {
    const state = readControlState(installation.config, {
      readOnly: controlReadOnly,
    });
    for (const key of [
      "runs",
      "approvals",
      "events",
      "artifacts",
      "executionLogs",
      "operatorActions",
      "workflows",
      "workflowExecutions",
      "workflowNodes",
      "workflowEdges",
    ]) {
      if (!Array.isArray(state[key]))
        throw Error(`P10_STATE_ARRAY_MISSING:${key}`);
    }
    if (!state.idempotency || typeof state.idempotency !== "object")
      throw Error("P10_STATE_IDEMPOTENCY_MISSING");
    return {
      runs: state.runs.length,
      workflows: state.workflows.length,
      events: state.events.length,
      controlDatabasePath: installation.config.controlDatabasePath,
    };
  });
  addCheck(checks, "compat_database", () =>
    runCompat(
      installation.config.compatRuntime,
      "status",
      installation.config.databasePath,
    ),
  );
  addCheck(checks, "workspace_root", () => {
    assertWorkspaceRoot(installation.config.workspaceRoot);
    fs.accessSync(
      installation.config.workspaceRoot,
      fs.constants.R_OK | fs.constants.W_OK,
    );
    return { writable: true };
  });
  if (!input.skipCodexProbe) {
    try {
      const codex = await probeCodex(
        path.join(installation.installRoot, "release"),
        installation.config.codexCommand,
        installation.config.workspaceRoot,
      );
      checks.push({
        id: "codex_cli",
        status: codex.available && codex.authenticated ? "PASS" : "FAIL",
        detail: codex,
      });
    } catch (error) {
      checks.push({
        id: "codex_cli",
        status: "FAIL",
        detail: redactSecrets(
          error instanceof Error ? error.message : String(error),
        ),
      });
    }
  }
  const runtime = liveRuntime;
  const failedChecks = checks
    .filter((check) => check.status !== "PASS")
    .map((check) => check.id);
  return {
    status: failedChecks.length ? "FAIL" : "PASS",
    product: PRODUCT,
    version: installation.record.version,
    instanceId: installation.record.instanceId,
    checks,
    failedChecks,
    runtime: runtime
      ? {
          state: runtime.state,
          supervisorPid: runtime.supervisorPid,
          processAlive: processAlive(Number(runtime.supervisorPid)),
          webUrl: runtime.webUrl,
        }
      : { state: "STOPPED" },
  };
}

export async function exportControlState(input = {}) {
  const installation = loadInstallation(input.installRoot);
  await ensureStopped(installation);
  const state = readControlState(installation.config);
  const target = requireAbsolute(input.targetPath, "targetPath");
  const store = new StateStore({
    databasePath: installation.config.controlDatabasePath,
    legacyStatePath: installation.config.statePath,
  }).open();
  try {
    return {
      status: "EXPORTED",
      targetPath: store.exportLegacy(state, target),
      records: {
        runs: state.runs.length,
        events: state.events.length,
        workflows: state.workflows.length,
      },
    };
  } finally {
    store.close();
  }
}

export async function startPlatform(input = {}) {
  const installation = loadInstallation(input.installRoot);
  return runSupervisor({
    configPath: installation.configPath,
    openBrowser: input.openBrowser === true,
  });
}

function autostartDescriptor(installRootInput) {
  const installRoot = assertNarrowRoot(installRootInput, "installRoot");
  if (process.platform === "win32") {
    const startup = path.join(
      process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
      "Microsoft",
      "Windows",
      "Start Menu",
      "Programs",
      "Startup",
    );
    return {
      platform: "win32",
      path: path.join(startup, "Codex Work Platform.cmd"),
      content: [
        "@echo off",
        `call "${path.join(installRoot, "start-workbench.cmd")}"`,
        "",
      ].join("\r\n"),
    };
  }
  if (process.platform === "darwin") {
    const plistPath = path.join(
      os.homedir(),
      "Library",
      "LaunchAgents",
      "com.codexworkplatform.workbench.plist",
    );
    const manager = path.join(
      installRoot,
      "release",
      "bin",
      "platform-manager.mjs",
    );
    const xml = (value) =>
      String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    return {
      platform: "darwin",
      path: plistPath,
      content: `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>Label</key><string>com.codexworkplatform.workbench</string><key>ProgramArguments</key><array><string>node</string><string>--experimental-sqlite</string><string>${xml(manager)}</string><string>start</string><string>--install-root</string><string>${xml(installRoot)}</string><string>--open</string><string>false</string></array><key>RunAtLoad</key><true/><key>KeepAlive</key><true/></dict></plist>\n`,
    };
  }
  const servicePath = path.join(
    os.homedir(),
    ".config",
    "systemd",
    "user",
    "codex-work-platform.service",
  );
  return {
    platform: "linux",
    path: servicePath,
    content: `[Unit]\nDescription=Codex Work Platform\nAfter=default.target\n[Service]\nType=simple\nExecStart=node --experimental-sqlite ${path.join(installRoot, "release", "bin", "platform-manager.mjs")} start --install-root ${installRoot} --open false\nRestart=always\nRestartSec=2\n[Install]\nWantedBy=default.target\n`,
  };
}

export function enableAutostart(input = {}) {
  const descriptor = autostartDescriptor(input.installRoot);
  atomicText(descriptor.path, descriptor.content, { mode: 0o644 });
  return {
    status: "AUTOSTART_ENABLED",
    platform: descriptor.platform,
    path: descriptor.path,
    nextStep:
      descriptor.platform === "darwin"
        ? "launchctl load the generated LaunchAgent"
        : descriptor.platform === "linux"
          ? "run systemctl --user enable --now codex-work-platform.service"
          : "the current-user Startup folder will launch the command at sign-in",
  };
}

export function disableAutostart(input = {}) {
  const descriptor = autostartDescriptor(input.installRoot);
  if (fs.existsSync(descriptor.path)) fs.unlinkSync(descriptor.path);
  return {
    status: "AUTOSTART_DISABLED",
    platform: descriptor.platform,
    path: descriptor.path,
  };
}

async function killSupervisor(pid) {
  if (process.platform === "win32") {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await new Promise((resolve) => {
        const child = spawn("taskkill.exe", ["/pid", String(pid), "/t", "/f"], {
          windowsHide: true,
          stdio: "ignore",
        });
        child.once("error", resolve);
        child.once("close", resolve);
      });
      await sleep(100);
      if (!processAlive(pid)) return;
    }
  } else {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }
}

async function requestGracefulStop(config) {
  if (!config.requestToken) return false;
  try {
    const response = await fetch(
      `http://127.0.0.1:${config.webPort}/__internal/shutdown`,
      {
        method: "POST",
        headers: { "x-cwp-request-token": config.requestToken },
        signal: AbortSignal.timeout(2_000),
      },
    );
    return response.status === 202;
  } catch {
    return false;
  }
}

export async function stopPlatform(input = {}) {
  const installation = loadInstallation(input.installRoot);
  const runtimeFile = path.join(
    installation.config.dataRoot,
    "runtime",
    "instance.json",
  );
  if (!fs.existsSync(runtimeFile)) return { status: "ALREADY_STOPPED" };
  const runtime = readJson(runtimeFile);
  if (runtime.instanceId !== installation.config.instanceId)
    throw Error("RUNTIME_LOCK_INSTANCE_MISMATCH");
  if (!processAlive(Number(runtime.supervisorPid))) {
    const stale = path.join(
      path.dirname(runtimeFile),
      `${uniqueName("stale-instance")}.json`,
    );
    renameWithRetry(runtimeFile, stale);
    return { status: "STALE_LOCK_ARCHIVED", staleRuntimeFile: stale };
  }
  const health = await healthIdentity(installation.config);
  if (health?.instanceId !== installation.config.instanceId)
    throw Error("RUNTIME_PID_IDENTITY_UNVERIFIED");
  const supervisorPid = Number(runtime.supervisorPid);
  const graceful = await requestGracefulStop(installation.config);
  const deadline = Date.now() + (graceful ? 15_000 : 3_000);
  while (Date.now() < deadline && processAlive(Number(runtime.supervisorPid)))
    await sleep(150);
  if (processAlive(supervisorPid)) {
    await killSupervisor(supervisorPid);
    const forceDeadline = Date.now() + 12_000;
    while (Date.now() < forceDeadline && processAlive(supervisorPid))
      await sleep(150);
  }
  if (processAlive(supervisorPid)) throw Error("WORKBENCH_STOP_TIMEOUT");
  if (fs.existsSync(runtimeFile)) {
    const stopped = path.join(
      path.dirname(runtimeFile),
      `${uniqueName("stopped-instance")}.json`,
    );
    renameWithRetry(runtimeFile, stopped);
  }
  return { status: "STOPPED", stoppedAt: new Date().toISOString() };
}

function backupManifestPath(backupDirectory) {
  return path.join(backupDirectory, "backup-manifest.json");
}

export function assertNoBackupSecrets(rootInput, records) {
  const root = requireAbsolute(rootInput, "backupScanRoot");
  const patterns = [
    /\bsk-[A-Za-z0-9_-]{20,}\b/,
    /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/,
    /\b(?:Bearer|Basic)\s+[A-Za-z0-9._~+\/-]{24,}={0,2}/i,
    /["']?(?:api[_-]?key|access[_-]?token|refresh[_-]?token)["']?\s*[:=]\s*["']?[A-Za-z0-9._~+\/-]{20,}/i,
  ];
  for (const record of records) {
    const filePath = path.join(root, ...record.path.split("/"));
    const text = fs.readFileSync(filePath).toString("utf8");
    if (patterns.some((pattern) => pattern.test(text)))
      throw Error(`BACKUP_SECRET_DETECTED:${record.path}`);
  }
  return true;
}

export function verifyPlatformBackup(manifestPathInput) {
  const manifestPath = requireAbsolute(manifestPathInput, "manifestPath");
  assertNoSymlinkComponents(manifestPath);
  if (
    !fs.existsSync(manifestPath) ||
    fs.lstatSync(manifestPath).isSymbolicLink()
  )
    throw Error("BACKUP_MANIFEST_MISSING");
  const manifest = readJson(manifestPath);
  if (
    manifest.schemaVersion !== 1 ||
    manifest.backupType !== "CODEX_WORK_PLATFORM_P10_FULL_BACKUP" ||
    manifest.product !== PRODUCT
  )
    throw Error("BACKUP_MANIFEST_INVALID");
  validateRecords(manifest.releaseRecords);
  validateRecords(manifest.dataRecords);
  if (recordsSha256(manifest.releaseRecords) !== manifest.releaseTreeSha256)
    throw Error("BACKUP_RELEASE_TREE_HASH_INVALID");
  if (recordsSha256(manifest.dataRecords) !== manifest.dataTreeSha256)
    throw Error("BACKUP_DATA_TREE_HASH_INVALID");
  const root = path.dirname(manifestPath);
  const releaseRoot = path.join(root, "payload", "release");
  const dataRoot = path.join(root, "payload", "data");
  const release = verifyRecords(releaseRoot, manifest.releaseRecords, {
    label: "backup-release",
  });
  const data = verifyRecords(dataRoot, manifest.dataRecords, {
    label: "backup-data",
  });
  const portable = verifyPortableRelease(releaseRoot);
  if (portable.manifestSha256 !== manifest.releaseManifestSha256)
    throw Error("BACKUP_RELEASE_MANIFEST_MISMATCH");
  return {
    status: "PASS",
    manifestPath,
    manifest,
    release,
    data,
    payload: { releaseRoot, dataRoot },
  };
}

export async function backupPlatform(input = {}) {
  const installation = loadInstallation(input.installRoot);
  await ensureStopped(installation);
  const installedRelease = verifyPortableRelease(
    path.join(installation.installRoot, "release"),
  );
  if (
    installedRelease.manifestSha256 !==
    installation.record.releaseManifestSha256
  )
    throw Error("INSTALLED_RELEASE_MANIFEST_MISMATCH");
  runCompat(
    installation.config.compatRuntime,
    "status",
    installation.config.databasePath,
  );
  try {
    readControlState(installation.config);
  } catch (error) {
    if (/^CONTROL_DB_IN_USE:/.test(String(error?.message || error)))
      throw Error("WORKBENCH_RUNNING_STOP_REQUIRED");
    throw error;
  }

  const defaults = defaultRoots();
  const backupRoot = assertNarrowRoot(
    input.backupRoot ?? defaults.backupRoot,
    "backupRoot",
  );
  assertDistinctRoots([
    ["backupRoot", backupRoot],
    ["installRoot", installation.installRoot],
    ["dataRoot", installation.config.dataRoot],
  ]);
  assertNoSymlinkComponents(backupRoot);
  fs.mkdirSync(backupRoot, { recursive: true });

  const name = uniqueName("backup");
  const stage = path.join(backupRoot, `.${name}.staging`);
  const target = path.join(backupRoot, name);
  if (fs.existsSync(stage) || fs.existsSync(target))
    throw Error("BACKUP_TARGET_CONFLICT");
  fs.mkdirSync(stage, { recursive: false });
  try {
    const releaseRecords = walkFiles(
      path.join(installation.installRoot, "release"),
      {
        executable: installedRelease.manifest.files
          .filter((record) => record.executable)
          .map((record) => record.path),
      },
    );
    const dataRecords = walkFiles(installation.config.dataRoot).filter(
      (record) =>
        !record.path.startsWith("runtime/") &&
        !record.path.includes(".p10.json.legacy-") &&
        !record.path.includes(".lock") &&
        !record.path.endsWith("-wal") &&
        !record.path.endsWith("-shm"),
    );
    validateRecords(releaseRecords);
    validateRecords(dataRecords);
    assertNoBackupSecrets(installation.config.dataRoot, dataRecords);
    copyRecords(
      path.join(installation.installRoot, "release"),
      path.join(stage, "payload", "release"),
      releaseRecords,
    );
    copyRecords(
      installation.config.dataRoot,
      path.join(stage, "payload", "data"),
      dataRecords,
    );
    const manifest = {
      schemaVersion: 1,
      backupType: "CODEX_WORK_PLATFORM_P10_FULL_BACKUP",
      product: PRODUCT,
      version: installation.record.version,
      sourceInstanceId: installation.record.instanceId,
      createdAt: new Date().toISOString(),
      releaseManifestSha256: installedRelease.manifestSha256,
      releaseTreeSha256: recordsSha256(releaseRecords),
      dataTreeSha256: recordsSha256(dataRecords),
      releaseRecords,
      dataRecords,
      settings: {
        compatPort: installation.config.compatPort,
        webPort: installation.config.webPort,
        allowWebSearch: installation.config.allowWebSearch,
        autoApproveHighRisk: installation.config.autoApproveHighRisk === true,
        codexCommand: installation.config.codexCommand,
        originalWorkspaceRoot: installation.config.workspaceRoot,
      },
    };
    atomicJson(backupManifestPath(stage), manifest);
    renameWithRetry(stage, target);
    const verified = verifyPlatformBackup(backupManifestPath(target));
    return {
      status: "BACKED_UP",
      manifestPath: verified.manifestPath,
      fileCount: verified.release.fileCount + verified.data.fileCount,
      bytes: verified.release.bytes + verified.data.bytes,
      releaseTreeSha256: manifest.releaseTreeSha256,
      dataTreeSha256: manifest.dataTreeSha256,
    };
  } catch (error) {
    if (fs.existsSync(stage))
      renameWithRetry(stage, path.join(backupRoot, `${name}.failed`));
    throw error;
  }
}

export async function restorePlatform(input = {}) {
  const verified = verifyPlatformBackup(input.manifestPath);
  const roots = normalizeRoots(input);
  const selectedPorts = await findAvailablePortPair({
    compatPort: input.compatPort ?? verified.manifest.settings?.compatPort,
    webPort: input.webPort ?? verified.manifest.settings?.webPort,
  });
  assertEmptyOrMissing(roots.installRoot, "installRoot");
  assertEmptyOrMissing(roots.dataRoot, "dataRoot");
  const releaseInBackup = verified.payload.releaseRoot;
  const codexCommand = String(
    input.codexCommand || verified.manifest.settings?.codexCommand || "codex",
  );
  const codex = await probeCodex(
    releaseInBackup,
    codexCommand,
    roots.workspaceRoot,
  );
  if (!codex.available || !codex.authenticated)
    throw Error(
      `CODEX_NOT_READY_FOR_RESTORE:${codex.available}:${codex.authenticated}`,
    );

  const stageId = uniqueName("restoring");
  const installStage = `${roots.installRoot}.${stageId}`;
  const dataStage = `${roots.dataRoot}.${stageId}`;
  assertEmptyOrMissing(installStage, "installStage");
  assertEmptyOrMissing(dataStage, "dataStage");
  fs.mkdirSync(installStage, { recursive: true });
  fs.mkdirSync(dataStage, { recursive: true });
  let dataPromoted = false;
  let installPromoted = false;
  try {
    copyRecords(
      verified.payload.releaseRoot,
      path.join(installStage, "release"),
      verified.manifest.releaseRecords,
    );
    copyRecords(
      verified.payload.dataRoot,
      dataStage,
      verified.manifest.dataRecords,
    );
    const stagedRelease = verifyPortableRelease(
      path.join(installStage, "release"),
    );
    const instanceId = crypto.randomUUID();
    const requestToken = crypto.randomBytes(32).toString("hex");
    const stagedConfig = buildConfig({
      version: verified.manifest.version,
      instanceId,
      requestToken,
      installRoot: installStage,
      dataRoot: dataStage,
      workspaceRoot: roots.workspaceRoot,
      codexCommand,
      compatPort: selectedPorts.compatPort,
      webPort: selectedPorts.webPort,
      allowWebSearch:
        input.allowWebSearch ?? verified.manifest.settings?.allowWebSearch,
      autoApproveHighRisk:
        input.autoApproveHighRisk ??
        verified.manifest.settings?.autoApproveHighRisk,
    });
    runCompat(stagedConfig.compatRuntime, "status", stagedConfig.databasePath);
    readControlState(stagedConfig);

    const finalConfig = buildConfig({
      version: verified.manifest.version,
      instanceId,
      requestToken,
      installRoot: roots.installRoot,
      dataRoot: roots.dataRoot,
      workspaceRoot: roots.workspaceRoot,
      codexCommand,
      compatPort: selectedPorts.compatPort,
      webPort: selectedPorts.webPort,
      allowWebSearch:
        input.allowWebSearch ?? verified.manifest.settings?.allowWebSearch,
      autoApproveHighRisk:
        input.autoApproveHighRisk ??
        verified.manifest.settings?.autoApproveHighRisk,
    });
    const priorMetaPath = path.join(dataStage, "data-meta.json");
    const priorMeta = fs.existsSync(priorMetaPath)
      ? readJson(priorMetaPath)
      : {};
    atomicJson(priorMetaPath, {
      ...priorMeta,
      schemaVersion: 1,
      product: PRODUCT,
      version: verified.manifest.version,
      instanceId,
      restoredAt: new Date().toISOString(),
      restoredFromInstanceId: verified.manifest.sourceInstanceId,
      restoredFromManifestSha256: sha256File(verified.manifestPath),
    });
    atomicJson(path.join(dataStage, PLATFORM_CONFIG), finalConfig);
    writeMcpConfig(finalConfig, dataStage);
    const installation = buildInstallation(finalConfig, stagedRelease, {
      restoredFrom: verified.manifestPath,
    });
    atomicJson(path.join(installStage, INSTALLATION_RECORD), installation);
    writeLaunchers(installStage);
    fs.mkdirSync(roots.workspaceRoot, { recursive: true });

    if (fs.existsSync(roots.dataRoot)) fs.rmdirSync(roots.dataRoot);
    renameWithRetry(dataStage, roots.dataRoot);
    dataPromoted = true;
    if (fs.existsSync(roots.installRoot)) fs.rmdirSync(roots.installRoot);
    renameWithRetry(installStage, roots.installRoot);
    installPromoted = true;
    const doctor = await diagnosePlatform({ installRoot: roots.installRoot });
    if (doctor.status !== "PASS")
      throw Error(
        `POST_RESTORE_DIAGNOSE_FAILED:${doctor.failedChecks.join(",")}`,
      );
    return {
      status: "RESTORED",
      installation,
      doctor,
      sourceInstanceId: verified.manifest.sourceInstanceId,
    };
  } catch (error) {
    if (
      installPromoted &&
      fs.existsSync(roots.installRoot) &&
      !fs.existsSync(installStage)
    )
      renameWithRetry(roots.installRoot, installStage);
    if (
      dataPromoted &&
      fs.existsSync(roots.dataRoot) &&
      !fs.existsSync(dataStage)
    )
      renameWithRetry(roots.dataRoot, dataStage);
    throw error;
  }
}

export async function upgradePlatform(input = {}) {
  const installation = loadInstallation(input.installRoot);
  await ensureStopped(installation);
  const nextRelease = verifyPortableRelease(releaseRootFrom(input.releaseRoot));
  const currentRelease = verifyPortableRelease(
    path.join(installation.installRoot, "release"),
  );
  if (nextRelease.manifestSha256 === currentRelease.manifestSha256) {
    return { status: "IDEMPOTENT_NOOP", version: installation.record.version };
  }
  if (nextRelease.manifest.version === currentRelease.manifest.version)
    throw Error("SAME_VERSION_RELEASE_BYTES_CONFLICT");
  if (
    compareP10Versions(
      nextRelease.manifest.version,
      currentRelease.manifest.version,
    ) <= 0
  )
    throw Error("UPGRADE_VERSION_NOT_NEWER");
  const backup = await backupPlatform({
    installRoot: installation.installRoot,
    backupRoot: input.backupRoot,
  });
  const suffix = uniqueName("upgrade");
  const nextPath = path.join(
    installation.installRoot,
    `release.next-${suffix}`,
  );
  const previousPath = path.join(
    installation.installRoot,
    `release.previous-${suffix}`,
  );
  const activePath = path.join(installation.installRoot, "release");
  copyPortableRelease(nextRelease, nextPath);
  const oldRecord = structuredClone(installation.record);
  const oldConfig = structuredClone(installation.config);
  let swapped = false;
  try {
    renameWithRetry(activePath, previousPath);
    renameWithRetry(nextPath, activePath);
    swapped = true;
    const config = {
      ...installation.config,
      version: nextRelease.manifest.version,
      updatedAt: new Date().toISOString(),
    };
    const record = buildInstallation(config, nextRelease, {
      installedAt: installation.record.installedAt,
      restoredFrom: installation.record.restoredFrom,
      upgradedFrom: {
        version: installation.record.version,
        backupManifest: backup.manifestPath,
      },
    });
    atomicJson(installation.configPath, config);
    writeMcpConfig(config);
    atomicJson(installation.recordPath, record);
    writeLaunchers(installation.installRoot);
    const doctor = await diagnosePlatform({
      installRoot: installation.installRoot,
    });
    if (doctor.status !== "PASS")
      throw Error(
        `POST_UPGRADE_DIAGNOSE_FAILED:${doctor.failedChecks.join(",")}`,
      );
    const archivePath = path.join(
      path.dirname(backup.manifestPath),
      "previous-release",
    );
    if (!fs.existsSync(archivePath)) renameWithRetry(previousPath, archivePath);
    return {
      status: "UPGRADED",
      from: oldRecord.version,
      to: record.version,
      backupManifest: backup.manifestPath,
      doctor,
    };
  } catch (error) {
    if (swapped && fs.existsSync(activePath))
      renameWithRetry(
        activePath,
        path.join(installation.installRoot, `release.failed-${suffix}`),
      );
    if (fs.existsSync(previousPath) && !fs.existsSync(activePath))
      renameWithRetry(previousPath, activePath);
    atomicJson(installation.configPath, oldConfig);
    atomicJson(installation.recordPath, oldRecord);
    writeMcpConfig(oldConfig);
    throw error;
  }
}

export async function uninstallPlatform(input = {}) {
  const installation = loadInstallation(input.installRoot);
  await ensureStopped(installation);
  const defaults = defaultRoots();
  const archiveRoot = assertNarrowRoot(
    input.archiveRoot ?? defaults.backupRoot,
    "archiveRoot",
  );
  assertDistinctRoots([
    ["archiveRoot", archiveRoot],
    ["installRoot", installation.installRoot],
    ["dataRoot", installation.config.dataRoot],
  ]);
  fs.mkdirSync(archiveRoot, { recursive: true });
  const archive = path.join(archiveRoot, uniqueName("uninstall"));
  const archivedInstall = path.join(archive, "payload", "install");
  const archivedData = path.join(archive, "payload", "data");
  fs.mkdirSync(path.dirname(archivedInstall), { recursive: true });
  const installRecords = walkFiles(installation.installRoot);
  const dataRecords = walkFiles(installation.config.dataRoot);
  let installMoved = false;
  let dataMoved = false;
  try {
    renameWithRetry(installation.installRoot, archivedInstall);
    installMoved = true;
    renameWithRetry(installation.config.dataRoot, archivedData);
    dataMoved = true;
    verifyRecords(archivedInstall, installRecords, {
      label: "uninstall-install",
    });
    verifyRecords(archivedData, dataRecords, { label: "uninstall-data" });
    const receipt = {
      schemaVersion: 1,
      receiptType: "CODEX_WORK_PLATFORM_P10_RECOVERABLE_UNINSTALL",
      product: PRODUCT,
      version: installation.record.version,
      instanceId: installation.record.instanceId,
      status: "ARCHIVED",
      archivedAt: new Date().toISOString(),
      originalInstallRoot: installation.installRoot,
      originalDataRoot: installation.config.dataRoot,
      archivedInstall,
      archivedData,
      installRecords,
      dataRecords,
      installTreeSha256: recordsSha256(installRecords),
      dataTreeSha256: recordsSha256(dataRecords),
    };
    const receiptPath = path.join(archive, "uninstall-receipt.json");
    atomicJson(receiptPath, receipt);
    return { status: "ARCHIVED", receiptPath, instanceId: receipt.instanceId };
  } catch (error) {
    if (
      dataMoved &&
      fs.existsSync(archivedData) &&
      !fs.existsSync(installation.config.dataRoot)
    )
      renameWithRetry(archivedData, installation.config.dataRoot);
    if (
      installMoved &&
      fs.existsSync(archivedInstall) &&
      !fs.existsSync(installation.installRoot)
    )
      renameWithRetry(archivedInstall, installation.installRoot);
    throw error;
  }
}

export async function restoreUninstall(input = {}) {
  const receiptPath = requireAbsolute(input.receiptPath, "receiptPath");
  const receipt = readJson(receiptPath);
  if (
    receipt.schemaVersion !== 1 ||
    receipt.receiptType !== "CODEX_WORK_PLATFORM_P10_RECOVERABLE_UNINSTALL" ||
    receipt.status !== "ARCHIVED"
  )
    throw Error("UNINSTALL_RECEIPT_NOT_RESTORABLE");
  const installRoot = assertEmptyOrMissing(
    receipt.originalInstallRoot,
    "installRoot",
  );
  const dataRoot = assertEmptyOrMissing(receipt.originalDataRoot, "dataRoot");
  validateRecords(receipt.installRecords);
  validateRecords(receipt.dataRecords);
  if (
    recordsSha256(receipt.installRecords) !== receipt.installTreeSha256 ||
    recordsSha256(receipt.dataRecords) !== receipt.dataTreeSha256
  )
    throw Error("UNINSTALL_RECEIPT_TREE_HASH_INVALID");
  verifyRecords(receipt.archivedInstall, receipt.installRecords, {
    label: "uninstall-install",
  });
  verifyRecords(receipt.archivedData, receipt.dataRecords, {
    label: "uninstall-data",
  });
  let installMoved = false;
  let dataMoved = false;
  try {
    if (fs.existsSync(installRoot)) fs.rmdirSync(installRoot);
    renameWithRetry(receipt.archivedInstall, installRoot);
    installMoved = true;
    if (fs.existsSync(dataRoot)) fs.rmdirSync(dataRoot);
    renameWithRetry(receipt.archivedData, dataRoot);
    dataMoved = true;
    const doctor = await diagnosePlatform({ installRoot });
    if (doctor.status !== "PASS")
      throw Error(
        `POST_UNINSTALL_RESTORE_DIAGNOSE_FAILED:${doctor.failedChecks.join(",")}`,
      );
    const restored = {
      ...receipt,
      status: "RESTORED",
      restoredAt: new Date().toISOString(),
    };
    atomicJson(receiptPath, restored);
    return { status: "RESTORED", installRoot, dataRoot, doctor };
  } catch (error) {
    if (
      dataMoved &&
      fs.existsSync(dataRoot) &&
      !fs.existsSync(receipt.archivedData)
    )
      renameWithRetry(dataRoot, receipt.archivedData);
    if (
      installMoved &&
      fs.existsSync(installRoot) &&
      !fs.existsSync(receipt.archivedInstall)
    )
      renameWithRetry(installRoot, receipt.archivedInstall);
    throw error;
  }
}

function cliRoots(flags) {
  return {
    installRoot: flags.get("--install-root"),
    dataRoot: flags.get("--data-root"),
    workspaceRoot: flags.get("--workspace-root"),
    codexCommand: flags.get("--codex-command") || "codex",
    compatPort: integerFlag(
      flags,
      flags.has("--compat-port") ? "--compat-port" : "--legacy-port",
      19737,
      { min: 1, max: 65535 },
    ),
    webPort: integerFlag(flags, "--web-port", 19738, { min: 1, max: 65535 }),
    allowWebSearch: booleanFlag(flags, "--allow-web-search", true),
    autoApproveHighRisk: booleanFlag(flags, "--auto-approve-high-risk", false),
  };
}

const usage =
  "version|defaults|verify-release|preflight|install|diagnose|start|stop|backup|verify-backup|restore|export-state|enable-autostart|disable-autostart|upgrade|uninstall|restore-uninstall";

export async function runManagerCli(
  argv,
  write = (text) => process.stdout.write(text),
) {
  let parsed;
  try {
    parsed = parseCli(argv);
    const { command, flags } = parsed;
    if (!command || command === "help" || command === "--help") {
      write(
        `${JSON.stringify({ ok: Boolean(command), code: command ? "HELP" : "USAGE", usage, version: P10_VERSION })}\n`,
      );
      return command ? 0 : 2;
    }
    let result;
    if (command === "version")
      result = { product: PRODUCT, label: PRODUCT_LABEL, version: P10_VERSION };
    else if (command === "defaults") result = defaultRoots();
    else if (command === "verify-release")
      result = verifyPortableRelease(releaseRootFrom(flags.get("--release")));
    else if (command === "preflight")
      result = await preflightPlatform({
        releaseRoot: releaseRootFrom(flags.get("--release")),
        ...cliRoots(flags),
      });
    else if (command === "install")
      result = await installPlatform({
        releaseRoot: releaseRootFrom(flags.get("--release")),
        ...cliRoots(flags),
      });
    else if (command === "diagnose")
      result = await diagnosePlatform({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
      });
    else if (command === "start")
      result = {
        exitCode: await startPlatform({
          installRoot:
            flags.get("--install-root") ?? defaultRoots().installRoot,
          openBrowser: booleanFlag(flags, "--open", false),
        }),
      };
    else if (command === "stop")
      result = await stopPlatform({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
      });
    else if (command === "backup")
      result = await backupPlatform({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
        backupRoot: flags.get("--backup-root"),
      });
    else if (command === "verify-backup")
      result = verifyPlatformBackup(requiredFlag(flags, "--manifest"));
    else if (command === "restore")
      result = await restorePlatform({
        manifestPath: requiredFlag(flags, "--manifest"),
        ...cliRoots(flags),
      });
    else if (command === "export-state")
      result = await exportControlState({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
        targetPath: requiredFlag(flags, "--target"),
      });
    else if (command === "enable-autostart")
      result = enableAutostart({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
      });
    else if (command === "disable-autostart")
      result = disableAutostart({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
      });
    else if (command === "upgrade")
      result = await upgradePlatform({
        releaseRoot: releaseRootFrom(flags.get("--release")),
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
        backupRoot: flags.get("--backup-root"),
      });
    else if (command === "uninstall")
      result = await uninstallPlatform({
        installRoot: flags.get("--install-root") ?? defaultRoots().installRoot,
        archiveRoot: flags.get("--archive-root"),
      });
    else if (command === "restore-uninstall")
      result = await restoreUninstall({
        receiptPath: requiredFlag(flags, "--receipt"),
      });
    else {
      write(
        `${JSON.stringify({ ok: false, code: "COMMAND_UNKNOWN", command, usage })}\n`,
      );
      return 2;
    }
    write(`${JSON.stringify({ ok: true, command, result })}\n`);
    return 0;
  } catch (error) {
    write(
      `${JSON.stringify({ ok: false, code: "PLATFORM_MANAGER_ERROR", detail: redactSecrets(error instanceof Error ? error.message : String(error)) })}\n`,
    );
    return 3;
  }
}

const invokedPath = process.argv[1]
  ? fs.realpathSync.native(path.resolve(process.argv[1]))
  : "";
const realModulePath = fs.realpathSync.native(modulePath);
if (invokedPath === realModulePath) {
  runManagerCli(process.argv.slice(2))
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      process.stderr.write(
        `${JSON.stringify({ ok: false, code: redactSecrets(error instanceof Error ? error.message : String(error)) })}\n`,
      );
      process.exitCode = 1;
    });
}
