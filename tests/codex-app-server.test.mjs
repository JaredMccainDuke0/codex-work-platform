import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { CodexAppServerAdapter } from "../codex-app-server-adapter.mjs";

const fixture = path.join(
  import.meta.dirname,
  "fixtures",
  "fake-app-server.mjs",
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
