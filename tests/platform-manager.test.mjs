import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  appendFile,
  chmod,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  unlink,
  writeFile,
} from "node:fs/promises";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { buildPortableRelease } from "../bin/build-p10-release.mjs";
import { StateStore } from "../state-store.mjs";
import {
  atomicJson,
  defaultRoots,
  readJson,
  recordsSha256,
  walkFiles,
} from "../installer/platform-common.mjs";
import {
  backupPlatform,
  compareP10Versions,
  diagnosePlatform,
  findAvailablePortPair,
  installPlatform,
  restorePlatform,
  restoreUninstall,
  stopPlatform,
  upgradePlatform,
  uninstallPlatform,
  verifyPlatformBackup,
  verifyPortableRelease,
} from "../installer/platform-manager.mjs";

const root = path.resolve(import.meta.dirname, "..");
const fixture = path.join(root, "tests", "fixtures", "fake-codex-cli.mjs");
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
let testRequestToken = "";

function readControlState(dataRoot) {
  const statePath = path.join(dataRoot, "platform.sqlite.p10.json");
  const controlPath = path.join(dataRoot, "control.sqlite");
  const store = new StateStore({
    databasePath: controlPath,
    legacyStatePath: statePath,
  }).open();
  try {
    return store.load();
  } finally {
    store.close();
  }
}

async function fakeCodex(directory) {
  if (process.platform === "win32") {
    return path.join(root, "tests", "fixtures", "fake-codex.cmd");
  }
  const command = path.join(directory, "fake-codex");
  await writeFile(
    command,
    `#!/bin/sh\nexec "${process.execPath}" "${fixture}" "$@"\n`,
  );
  await chmod(command, 0o755);
  return command;
}

async function waitForHealth(url, instanceId) {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      const response = await fetch(`${url}/healthz`);
      if (response.ok) {
        const health = await response.json();
        if (health.instanceId === instanceId) return health;
      }
    } catch {}
    await sleep(100);
  }
  throw Error("INSTALLER_TEST_SERVER_NOT_READY");
}

async function waitForChildExit(child) {
  if (child.exitCode !== null) return;
  await Promise.race([
    new Promise((resolve) => child.once("exit", resolve)),
    sleep(10_000).then(() => {
      throw Error("INSTALLER_TEST_CHILD_STOP_TIMEOUT");
    }),
  ]);
}

function startInstalled(installRoot) {
  const manager = path.join(
    installRoot,
    "release",
    "bin",
    "platform-manager.mjs",
  );
  const child = spawn(
    process.execPath,
    [manager, "start", "--install-root", installRoot, "--open", "false"],
    {
      cwd: installRoot,
      env: { ...process.env, FAKE_CODEX_AUTH: "1" },
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  let output = "";
  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.testOutput = () => output;
  return child;
}

async function post(url, route, value, key) {
  const response = await fetch(`${url}${route}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": key,
      ...(testRequestToken ? { "x-cwp-request-token": testRequestToken } : {}),
    },
    body: JSON.stringify(value),
  });
  const body = await response.json();
  if (!response.ok) throw Error(`${route}:${response.status}:${body.code}`);
  return body;
}

test("Windows and macOS default layouts keep app, data and workspace separate", () => {
  const windows = defaultRoots(
    "win32",
    { LOCALAPPDATA: "C:\\Users\\tester\\AppData\\Local" },
    "C:\\Users\\tester",
  );
  assert.equal(
    windows.installRoot,
    "C:\\Users\\tester\\AppData\\Local\\Programs\\CodexWorkPlatform",
  );
  assert.equal(
    windows.dataRoot,
    "C:\\Users\\tester\\AppData\\Local\\CodexWorkPlatform\\data",
  );
  assert.equal(
    windows.workspaceRoot,
    "C:\\Users\\tester\\Documents\\CodexWorkspace",
  );

  const mac = defaultRoots("darwin", {}, "/Users/tester");
  assert.equal(mac.installRoot, "/Users/tester/Applications/CodexWorkPlatform");
  assert.equal(
    mac.dataRoot,
    "/Users/tester/Library/Application Support/CodexWorkPlatform",
  );
  assert.equal(mac.workspaceRoot, "/Users/tester/Documents/CodexWorkspace");
  assert.equal(compareP10Versions("1.2.0-dev.3", "1.2.0-dev.2"), 1);
  assert.equal(compareP10Versions("1.2.0", "1.2.0-rc.1"), 1);
  assert.equal(compareP10Versions("1.2.0-dev.1", "1.2.0-dev.1"), 0);
  assert.equal(compareP10Versions("1.1.0", "1.0.9"), 1);
});

test("port selection moves to the next free pair when preferred ports are occupied", async (t) => {
  const first = http.createServer();
  const second = http.createServer();
  await new Promise((resolve) => first.listen(0, "127.0.0.1", resolve));
  const base = first.address().port;
  await new Promise((resolve) => second.listen(base + 1, "127.0.0.1", resolve));
  t.after(async () => {
    await new Promise((resolve) => first.close(resolve));
    await new Promise((resolve) => second.close(resolve));
  });
  const selected = await findAvailablePortPair({
    compatPort: base,
    webPort: base + 1,
    maxOffset: 5,
  });
  assert.notEqual(selected.compatPort, base);
  assert.notEqual(selected.webPort, base + 1);
});

test("cross-platform installer contracts enable network and automatic approval policy", async () => {
  const windowsScript = await readFile(
    path.join(root, "installer", "install-windows.ps1"),
    "utf8",
  );
  const macScript = await readFile(
    path.join(root, "installer", "install-macos.command"),
    "utf8",
  );
  const windowsLauncher = await readFile(
    path.join(root, "installer", "install-windows.cmd"),
    "utf8",
  );
  const supervisor = await readFile(
    path.join(root, "installer", "workbench-supervisor.mjs"),
    "utf8",
  );
  assert.match(windowsScript, /--allow-web-search[\s\S]*true/);
  assert.match(macScript, /--allow-web-search true/);
  assert.equal(
    Buffer.from(windowsScript, "utf8").some((value) => value > 127),
    false,
    "Windows PowerShell 5.1 installer source must remain ASCII",
  );
  assert.match(windowsScript, /\\u5b89\\u88c5\\u5b8c\\u6210/);
  assert.match(macScript, /Installation completed.*安装完成/);
  assert.match(windowsLauncher, /chcp 65001/);
  assert.match(windowsLauncher, /install-windows\.ps1" -Start/);
  assert.match(supervisor, /autoApproveHighRisk/);
  assert.match(supervisor, /--auto-approve-high-risk/);
});

test(
  "Windows double-click installer emits bilingual guidance and installs from a ZIP-shaped directory",
  { skip: process.platform !== "win32", timeout: 120_000 },
  async (t) => {
    const temporary = await mkdtemp(
      path.join(os.tmpdir(), "cwp-script-install-"),
    );
    t.after(() => rm(temporary, { recursive: true, force: true }));
    const releaseRoot = path.join(temporary, "extracted release");
    const installRoot = path.join(temporary, "installed app");
    const dataRoot = path.join(temporary, "installed data");
    const workspaceRoot = path.join(temporary, "workspace");
    const wrapperRoot = path.join(temporary, "codex wrapper");
    const npmBin = path.join(
      wrapperRoot,
      "node_modules",
      "@openai",
      "codex",
      "bin",
    );
    await mkdir(npmBin, { recursive: true });
    await writeFile(
      path.join(
        wrapperRoot,
        "node_modules",
        "@openai",
        "codex",
        "package.json",
      ),
      '{"type":"module"}\n',
      "utf8",
    );
    const localFixture = path.join(npmBin, "codex.js");
    await cp(fixture, localFixture);
    const wrapper = path.join(wrapperRoot, "codex.cmd");
    await writeFile(
      wrapper,
      `@echo off\r\n"${process.execPath}" "${localFixture}" %*\r\n`,
      "utf8",
    );
    buildPortableRelease(releaseRoot);
    const child = spawn(
      "powershell.exe",
      [
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        path.join(releaseRoot, "install-windows.ps1"),
        "-InstallRoot",
        installRoot,
        "-DataRoot",
        dataRoot,
        "-WorkspaceRoot",
        workspaceRoot,
        "-CodexCommand",
        wrapper,
      ],
      {
        cwd: releaseRoot,
        env: { ...process.env, FAKE_CODEX_AUTH: "1" },
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    const code = await new Promise((resolve) => child.once("close", resolve));
    assert.equal(code, 0, stderr || stdout);
    assert.match(stdout, /Installation completed \/ 安装完成/);
    assert.match(stdout, /Launcher \/ 启动入口/);
    assert.equal(
      fs.existsSync(path.join(installRoot, "start-workbench.cmd")),
      true,
    );
    assert.equal(
      (await diagnosePlatform({ installRoot: installRoot.toUpperCase() }))
        .status,
      "PASS",
    );
  },
);

test(
  "POSIX installer emits bilingual guidance and installs from an extracted archive",
  { skip: process.platform === "win32", timeout: 120_000 },
  async (t) => {
    const temporary = await mkdtemp(
      path.join(os.tmpdir(), "cwp-script-install-"),
    );
    t.after(() => rm(temporary, { recursive: true, force: true }));
    const releaseRoot = path.join(temporary, "extracted release");
    const installRoot = path.join(temporary, "installed app");
    const dataRoot = path.join(temporary, "installed data");
    const workspaceRoot = path.join(temporary, "workspace");
    const localFixture = path.join(temporary, "fake-codex-cli.mjs");
    await cp(fixture, localFixture);
    const wrapper = path.join(temporary, "fake codex");
    await writeFile(
      wrapper,
      `#!/bin/sh\nexec "${process.execPath}" "${localFixture}" "$@"\n`,
      "utf8",
    );
    await chmod(wrapper, 0o755);
    buildPortableRelease(releaseRoot);
    const child = spawn(path.join(releaseRoot, "install-macos.command"), [], {
      cwd: releaseRoot,
      env: {
        ...process.env,
        FAKE_CODEX_AUTH: "1",
        CWP_CODEX_COMMAND: wrapper,
        CWP_INSTALL_ROOT: installRoot,
        CWP_DATA_ROOT: dataRoot,
        CWP_WORKSPACE_ROOT: workspaceRoot,
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    const code = await new Promise((resolve) => child.once("close", resolve));
    assert.equal(code, 0, stderr || stdout);
    assert.match(stdout, /Installation completed \/ 安装完成/);
    assert.match(stdout, /Launcher \/ 启动入口/);
    assert.equal(
      fs.existsSync(path.join(installRoot, "start-workbench.command")),
      true,
    );
  },
);

test(
  "portable install runs, backs up, rejects corruption and restores into new roots",
  { timeout: 90_000 },
  async (t) => {
    const temporary = await mkdtemp(
      path.join(os.tmpdir(), "cwp-p10-installer-"),
    );
    const releaseRoot = path.join(temporary, "portable-release");
    const secondReleaseRoot = path.join(temporary, "portable-release-repeat");
    const corruptReleaseRoot = path.join(temporary, "portable-release-corrupt");
    const installRoot = path.join(temporary, "installed-app");
    const dataRoot = path.join(temporary, "installed-data");
    const workspaceRoot = path.join(temporary, "workspace");
    const backupRoot = path.join(temporary, "backups");
    const restoredInstall = path.join(temporary, "restored-app");
    const restoredData = path.join(temporary, "restored-data");
    const restoredWorkspace = path.join(temporary, "restored-workspace");
    const archiveRoot = path.join(temporary, "archives");
    const codexCommand = await fakeCodex(temporary);
    const portBase = 20000 + Math.floor(Math.random() * 8000);
    let runningChild = null;
    let restoredChild = null;

    t.after(async () => {
      for (const [child, app] of [
        [restoredChild, restoredInstall],
        [runningChild, installRoot],
      ]) {
        if (child && child.exitCode === null) {
          try {
            await stopPlatform({ installRoot: app });
          } catch {
            child.kill();
          }
        }
      }
      await rm(temporary, { recursive: true, force: true });
    });

    const built = buildPortableRelease(releaseRoot);
    assert.equal(built.fileCount >= 18, true);
    assert.equal(
      verifyPortableRelease(releaseRoot).treeSha256,
      built.treeSha256,
    );
    const repeated = buildPortableRelease(secondReleaseRoot);
    assert.equal(repeated.manifestSha256, built.manifestSha256);
    assert.equal(repeated.treeSha256, built.treeSha256);
    await cp(releaseRoot, corruptReleaseRoot, { recursive: true });
    await appendFile(
      path.join(corruptReleaseRoot, "app", "p10-state.mjs"),
      "tampered",
    );
    assert.throws(
      () => verifyPortableRelease(corruptReleaseRoot),
      /FILE_BYTES_MISMATCH/,
    );

    assert.equal(fs.existsSync(workspaceRoot), false);
    const installed = await installPlatform({
      releaseRoot,
      installRoot,
      dataRoot,
      workspaceRoot,
      codexCommand,
      compatPort: portBase,
      webPort: portBase + 1,
      allowWebSearch: false,
      autoApproveHighRisk: true,
    });
    assert.equal(installed.status, "INSTALLED");
    assert.equal(installed.doctor.status, "PASS");
    assert.equal(
      (
        await installPlatform({
          releaseRoot,
          installRoot,
          dataRoot,
          workspaceRoot,
          codexCommand,
        })
      ).status,
      "IDEMPOTENT_NOOP",
    );

    const config = readJson(path.join(dataRoot, "platform-config.json"));
    testRequestToken = config.requestToken;
    assert.equal(fs.existsSync(config.controlDatabasePath), true);
    runningChild = startInstalled(installRoot);
    await waitForHealth(
      `http://127.0.0.1:${config.webPort}`,
      config.instanceId,
    ).catch((error) => {
      throw Error(`${error.message}:${runningChild.testOutput()}`);
    });
    await assert.rejects(
      () => backupPlatform({ installRoot, backupRoot }),
      /WORKBENCH_RUNNING_STOP_REQUIRED/,
    );

    const baseUrl = `http://127.0.0.1:${config.webPort}`;
    const workflow = await post(
      baseUrl,
      "/api/p10/workflows",
      { title: "Installer acceptance workflow" },
      "installer-test-workflow",
    );
    const node = await post(
      baseUrl,
      `/api/p10/workflows/${workflow.workflow.id}/nodes`,
      {
        title: "Mock step",
        promptTemplate: "Complete installer acceptance",
        adapter: "mock",
        action: "RUN",
        expectedVersion: 1,
      },
      "installer-test-node",
    );
    const run = await post(
      baseUrl,
      `/api/p10/workflows/${workflow.workflow.id}/runs`,
      { workflowNodeId: node.node.id },
      "installer-test-run",
    );
    let state;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      state = await fetch(`${baseUrl}/api/p10/state`).then((response) =>
        response.json(),
      );
      if (
        state.runs.find((item) => item.id === run.run.id)?.state === "COMPLETED"
      )
        break;
      await sleep(150);
    }
    const completion = state.approvals.find(
      (item) => item.runId === run.run.id && item.action === "COMPLETE",
    );
    assert.equal(completion?.state, "APPROVED");
    assert.equal(completion?.approver, "auto-policy");
    state = await fetch(`${baseUrl}/api/p10/state`).then((response) =>
      response.json(),
    );
    assert.equal(
      state.runs.find((item) => item.id === run.run.id).state,
      "COMPLETED",
    );
    const artifactHash = state.artifacts.find(
      (item) => item.runId === run.run.id,
    ).sha256;

    await stopPlatform({ installRoot });
    await waitForChildExit(runningChild);
    runningChild = null;

    const sameVersionReleaseRoot = path.join(
      temporary,
      "portable-release-same-version",
    );
    await cp(releaseRoot, sameVersionReleaseRoot, { recursive: true });
    await appendFile(
      path.join(sameVersionReleaseRoot, "README.md"),
      "\nbyte variation for upgrade conflict coverage\n",
    );
    const sameVersionManifestPath = path.join(
      sameVersionReleaseRoot,
      "p10-release.json",
    );
    const sameVersionManifest = readJson(sameVersionManifestPath);
    sameVersionManifest.files = walkFiles(sameVersionReleaseRoot, {
      exclude: ["p10-release.json"],
      executable: sameVersionManifest.files
        .filter((record) => record.executable)
        .map((record) => record.path),
    });
    sameVersionManifest.treeSha256 = recordsSha256(sameVersionManifest.files);
    atomicJson(sameVersionManifestPath, sameVersionManifest);
    const currentReleaseBeforeConflict = verifyPortableRelease(
      path.join(installRoot, "release"),
    );
    const sameVersionRelease = verifyPortableRelease(sameVersionReleaseRoot);
    assert.equal(
      sameVersionRelease.manifest.version,
      currentReleaseBeforeConflict.manifest.version,
    );
    assert.notEqual(
      sameVersionRelease.manifestSha256,
      currentReleaseBeforeConflict.manifestSha256,
    );
    const installationBeforeConflict = readJson(
      path.join(installRoot, "installation.json"),
    );
    await assert.rejects(
      () =>
        upgradePlatform({
          installRoot,
          releaseRoot: sameVersionReleaseRoot,
          backupRoot,
        }),
      /SAME_VERSION_RELEASE_BYTES_CONFLICT/,
    );
    const installationAfterConflict = readJson(
      path.join(installRoot, "installation.json"),
    );
    const currentReleaseAfterConflict = verifyPortableRelease(
      path.join(installRoot, "release"),
    );
    assert.equal(
      installationAfterConflict.releaseManifestSha256,
      installationBeforeConflict.releaseManifestSha256,
    );
    assert.equal(
      currentReleaseAfterConflict.manifestSha256,
      currentReleaseBeforeConflict.manifestSha256,
    );

    const secretProbe = path.join(dataRoot, "secret-probe.txt");
    await writeFile(
      secretProbe,
      ["access", "token=abcdefghijklmnopqrstuvwxyz123456"].join("_"),
    );
    await assert.rejects(
      () => backupPlatform({ installRoot, backupRoot }),
      /BACKUP_SECRET_DETECTED:secret-probe.txt/,
    );
    await unlink(secretProbe);

    const backup = await backupPlatform({ installRoot, backupRoot });
    assert.equal(verifyPlatformBackup(backup.manifestPath).status, "PASS");
    assert.ok(
      readJson(backup.manifestPath).dataRecords.some(
        (record) => record.path === "control.sqlite",
      ),
    );

    const corruptRoot = path.join(temporary, "corrupt-backup");
    await cp(path.dirname(backup.manifestPath), corruptRoot, {
      recursive: true,
    });
    const corruptManifest = path.join(corruptRoot, "backup-manifest.json");
    const corruptDefinition = readJson(corruptManifest);
    const corruptFile = path.join(
      corruptRoot,
      "payload",
      "data",
      ...corruptDefinition.dataRecords[0].path.split("/"),
    );
    await appendFile(corruptFile, "tampered");
    assert.throws(
      () => verifyPlatformBackup(corruptManifest),
      /FILE_BYTES_MISMATCH/,
    );

    const restored = await restorePlatform({
      manifestPath: backup.manifestPath,
      installRoot: restoredInstall,
      dataRoot: restoredData,
      workspaceRoot: restoredWorkspace,
      codexCommand,
      compatPort: portBase + 2,
      webPort: portBase + 3,
      allowWebSearch: false,
      autoApproveHighRisk: true,
    });
    assert.equal(restored.status, "RESTORED");
    assert.notEqual(restored.installation.instanceId, config.instanceId);
    assert.equal(restored.doctor.status, "PASS");
    const restoredState = readControlState(restoredData);
    assert.equal(restoredState.runs[0].id, run.run.id);
    assert.equal(restoredState.runs[0].state, "COMPLETED");
    assert.equal(restoredState.artifacts[0].sha256, artifactHash);

    const restoredConfig = readJson(
      path.join(restoredData, "platform-config.json"),
    );
    restoredChild = startInstalled(restoredInstall);
    await waitForHealth(
      `http://127.0.0.1:${restoredConfig.webPort}`,
      restoredConfig.instanceId,
    ).catch((error) => {
      throw Error(`${error.message}:${restoredChild.testOutput()}`);
    });
    const liveRestoredState = await fetch(
      `http://127.0.0.1:${restoredConfig.webPort}/api/p10/state`,
    ).then((response) => response.json());
    assert.equal(liveRestoredState.workflows[0].id, workflow.workflow.id);
    assert.equal(liveRestoredState.runs[0].state, "COMPLETED");
    await stopPlatform({ installRoot: restoredInstall });
    await waitForChildExit(restoredChild);
    restoredChild = null;

    const uninstalled = await uninstallPlatform({
      installRoot: restoredInstall,
      archiveRoot,
    });
    assert.equal(uninstalled.status, "ARCHIVED");
    assert.equal(fs.existsSync(restoredInstall), false);
    assert.equal(fs.existsSync(restoredData), false);
    const reactivated = await restoreUninstall({
      receiptPath: uninstalled.receiptPath,
    });
    assert.equal(reactivated.status, "RESTORED");
    assert.equal(
      (await diagnosePlatform({ installRoot: restoredInstall })).status,
      "PASS",
    );
  },
);
