import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { copyFile, mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { CodexAppServerAdapter } from "../codex-app-server-adapter.mjs";
import {
  CodexAppServerClient,
  appServerSpawnSpec,
} from "../codex-app-server.mjs";

const fixture = path.join(
  import.meta.dirname,
  "fixtures",
  "fake-app-server.mjs",
);

test("App Server spawn policy uses the Windows shell only for command wrappers", () => {
  const wrapper = appServerSpawnSpec("codex", ["app-server"], "win32");
  assert.match(wrapper.command, /cmd\.exe$/i);
  assert.equal(wrapper.shell, false);
  assert.equal(wrapper.windowsVerbatimArguments, true);
  assert.equal(wrapper.args.at(-1), '""codex" "app-server""');
  assert.equal(
    appServerSpawnSpec("C:\\tools\\codex.exe", ["app-server"], "win32").shell,
    false,
  );
  assert.equal(
    appServerSpawnSpec("/usr/local/bin/codex", ["app-server"], "linux").shell,
    false,
  );
  assert.throws(
    () => appServerSpawnSpec("codex&whoami", ["app-server"], "win32"),
    /CODEX_ARGUMENT_UNSAFE/,
  );
});

test(
  "App Server client launches a Windows command wrapper from a spaced path",
  { skip: process.platform !== "win32" },
  async (t) => {
    const root = await mkdtemp(path.join(tmpdir(), "cwp-app-wrapper-"));
    const wrapperRoot = path.join(root, "wrapper with spaces");
    await mkdir(wrapperRoot);
    const wrapper = path.join(wrapperRoot, "fake-codex.cmd");
    const localFixture = path.join(wrapperRoot, "fake-app-server.mjs");
    await copyFile(fixture, localFixture);
    await writeFile(
      wrapper,
      `@echo off\r\n"${process.execPath}" "${localFixture}" %*\r\n`,
      "utf8",
    );
    const client = new CodexAppServerClient({
      command: wrapper,
      cwd: root,
    });
    t.after(async () => {
      await client.close().catch(() => null);
      await rm(root, { recursive: true, force: true });
    });
    await client.start();
    const models = await client.listModels({ limit: 5 });
    assert.equal(models.models?.[0]?.id, "gpt-test");
  },
);

test("App Server adapter starts, streams notifications, reads history, and continues a thread", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-app-server-"));
  const adapter = new CodexAppServerAdapter({
    command: process.execPath,
    commandPrefix: [fixture],
    allowedRoots: [root],
    requireChatGptAuth: false,
  });
  t.after(async () => {
    await adapter.close().catch(() => null);
    await rm(root, { recursive: true, force: true });
  });
  const events = [];
  let exited;
  const task = adapter.createTask({
    cwd: root,
    prompt: "hello",
    model: "auto",
    sandbox: "read-only",
  });
  await adapter.startTask(task.id, {
    onEvent: (event) => events.push(event),
    onExit: (result) => {
      exited = result;
    },
  });
  for (let index = 0; index < 50 && !exited; index += 1)
    await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(exited?.state, "COMPLETED");
  assert.ok(events.some((event) => event.type === "turn.completed"));
  const history = await adapter.readThread("019fake-thread", true);
  assert.equal(history.thread.id, "019fake-thread");
  const followup = await adapter.sendFollowup("019fake-thread", "continue", {
    cwd: root,
    sandbox: "read-only",
  });
  assert.ok(followup.turn.id);
  await adapter.close();
});
