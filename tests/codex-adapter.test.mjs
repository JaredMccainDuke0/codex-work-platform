import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  LocalCodexCliAdapter,
  parseCodexJsonLine,
  projectOfficialChatGptConfig,
  projectSafeCodexProviderConfig,
} from "../codex-adapter.mjs";
import { CodexAppServerAdapter } from "../codex-app-server-adapter.mjs";

const fixture = path.join(
  import.meta.dirname,
  "fixtures",
  "fake-codex-cli.mjs",
);

function adapterFor(root, mode = "success", auth = "1") {
  return new LocalCodexCliAdapter({
    command: process.execPath,
    commandPrefix: [fixture],
    allowedRoots: [root],
    heartbeatMs: 250,
    env: {
      ...process.env,
      FAKE_CODEX_MODE: mode,
      FAKE_CODEX_AUTH: auth,
      FAKE_CODEX_REQUIRE_ISOLATION: "1",
      FAKE_CODEX_REQUIRE_LOW_REASONING: "1",
    },
  });
}

async function runFixture(adapter, root) {
  const task = adapter.createTask({
    prompt: "fixture prompt",
    cwd: root,
    sandbox: "read-only",
    skipGitRepoCheck: true,
  });
  const events = [];
  const exit = new Promise((resolve) => {
    adapter
      .startTask(task.id, {
        onEvent: (event) => events.push(event),
        onExit: resolve,
      })
      .catch((error) =>
        resolve({ state: "MANUAL_INTERVENTION", error: error.message }),
      );
  });
  return { task, events, result: await exit };
}

test("Codex CLI probe reports executable and authentication separately", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-probe-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const ready = adapterFor(root);
  const readyStatus = await ready.probe({ refresh: true });
  assert.equal(readyStatus.available, true);
  assert.equal(readyStatus.authenticated, true);
  assert.equal(readyStatus.capabilities.isolatedConfig, true);
  assert.match(readyStatus.version, /9\.9\.9-test/);
  const verifiedStatus = await ready.probe({
    refresh: true,
    verifyExecution: true,
  });
  assert.equal(verifiedStatus.authenticated, true);
  assert.equal(verifiedStatus.capabilities.executionVerified, true);
  const refreshedStatus = await ready.probe({ refresh: true });
  assert.equal(refreshedStatus.capabilities.executionVerified, true);
  assert.equal(
    refreshedStatus.executionVerifiedAt,
    verifiedStatus.executionVerifiedAt,
  );

  const failingExecution = adapterFor(root, "probe-failure");
  const invalidExecution = await failingExecution.probe({
    refresh: true,
    verifyExecution: true,
  });
  assert.equal(invalidExecution.authenticated, true);
  assert.equal(invalidExecution.reason, "CODEX_EXECUTION_PROBE_FAILED");
  const blockedTask = failingExecution.createTask({
    prompt: "must not run",
    cwd: root,
    sandbox: "read-only",
  });
  await assert.rejects(
    () => failingExecution.startTask(blockedTask.id),
    /CODEX_EXECUTION_PROBE_FAILED/,
  );

  const loggedOut = adapterFor(root, "success", "0");
  const loggedOutStatus = await loggedOut.probe({ refresh: true });
  assert.equal(loggedOutStatus.available, true);
  assert.equal(loggedOutStatus.authenticated, false);
});

test("Codex CLI probe handles a missing executable without throwing", async () => {
  const adapter = new LocalCodexCliAdapter({
    command: path.join(tmpdir(), "definitely-missing-codex.exe"),
    allowedRoots: [tmpdir()],
  });
  const status = await adapter.probe({ refresh: true });
  assert.equal(status.available, false);
  assert.equal(status.authenticated, false);
  assert.ok(status.reason);
});

test("safe provider projection keeps routing fields and drops credentials, plugins and MCP", () => {
  const fixtureToken = ["sk", "secret-not-for-child-process"].join("-");
  const projected = projectSafeCodexProviderConfig(`
model = "gpt-5.6-sol"
model_provider = "custom"
experimental_bearer_token = "${fixtureToken}"

[model_providers.custom]
name = "Company Gateway"
base_url = "https://gateway.example.test/v1"
wire_api = "responses"
requires_openai_auth = true

[plugins.example]
enabled = true
model = "must-not-override-root"

[mcp_servers.github]
command = "must-not-start"
`);

  assert.equal(projected.error, null);
  assert.deepEqual(projected.provider, {
    name: "custom",
    label: "Company Gateway",
    model: "gpt-5.6-sol",
    baseUrl: "https://gateway.example.test/v1",
    authentication: "openai",
    source: "safe-user-config-projection",
  });
  const serialized = JSON.stringify(projected);
  assert.match(serialized, /model_providers\.custom\.base_url/);
  assert.doesNotMatch(
    serialized,
    /secret-not-for-child-process|experimental_bearer_token|plugins|mcp_servers|must-not-start|must-not-override-root/,
  );
});

test("official account projection ignores custom providers and forces ChatGPT authentication", () => {
  const fixtureToken = ["sk", "secret-not-for-child-process"].join("-");
  const projected = projectOfficialChatGptConfig(`
model = "gpt-5.6-sol"
model_provider = "custom"
experimental_bearer_token = "${fixtureToken}"
[model_providers.custom]
base_url = "https://gateway.example.test/v1"
`);
  assert.equal(projected.error, null);
  assert.deepEqual(projected.provider, {
    name: "openai",
    label: "OpenAI 官方",
    model: "gpt-5.6-sol",
    baseUrl: null,
    authentication: "chatgpt",
    source: "workbench-official-chatgpt-policy",
  });
  const serialized = JSON.stringify(projected);
  assert.match(serialized, /model_provider=\\"openai\\"/);
  assert.match(serialized, /forced_login_method=\\"chatgpt\\"/);
  assert.doesNotMatch(
    serialized,
    /gateway|secret-not-for-child-process|model_providers\.custom/,
  );
});

test("official account mode rejects non-ChatGPT login and strips API environment overrides", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-chatgpt-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const adapter = new LocalCodexCliAdapter({
    command: process.execPath,
    commandPrefix: [fixture],
    provider: projectOfficialChatGptConfig("").provider,
    requireChatGptAuth: true,
    allowedRoots: [root],
    env: {
      ...process.env,
      FAKE_CODEX_AUTH: "1",
      FAKE_CODEX_LOGIN_LABEL: "Logged in using API key",
      OPENAI_API_KEY: ["sk", "test-only"].join("-"),
      CODEX_API_KEY: ["sk", "test-only"].join("-"),
      OPENAI_BASE_URL: "https://gateway.example.test/v1",
    },
  });
  assert.equal(adapter.env.OPENAI_API_KEY, undefined);
  assert.equal(adapter.env.CODEX_API_KEY, undefined);
  assert.equal(adapter.env.OPENAI_BASE_URL, undefined);
  const status = await adapter.probe({ refresh: true });
  assert.equal(status.authenticated, false);
  assert.equal(status.reason, "CODEX_CHATGPT_LOGIN_REQUIRED");
});

test("local Codex tasks accept danger-full-access for the approved full-access policy", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-full-access-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const adapter = adapterFor(root);
  const task = adapter.createTask({
    prompt: "full access fixture",
    cwd: root,
    sandbox: "danger-full-access",
    network: false,
  });
  assert.equal(task.sandbox, "danger-full-access");
  await adapter.close();
});

test("App Server adapter strips API-key environment overrides in official-account mode", () => {
  const adapter = new CodexAppServerAdapter({
    requireChatGptAuth: true,
    env: {
      OPENAI_API_KEY: "placeholder",
      CODEX_API_KEY: "placeholder",
      OPENAI_BASE_URL: "https://example.invalid",
    },
  });
  assert.equal(adapter.env.OPENAI_API_KEY, undefined);
  assert.equal(adapter.env.CODEX_API_KEY, undefined);
  assert.equal(adapter.env.OPENAI_BASE_URL, undefined);
});

test("invalid custom provider configuration fails closed instead of falling back to OpenAI", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-config-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const projected = projectSafeCodexProviderConfig(`
model_provider = "custom"
[model_providers.custom]
base_url = "https://gateway.example.test/v1"
wire_api = "unsupported"
`);
  assert.equal(projected.error, "CODEX_PROVIDER_WIRE_API_INVALID");
  assert.deepEqual(projected.args, []);

  const adapter = new LocalCodexCliAdapter({
    command: process.execPath,
    commandPrefix: [fixture],
    provider: projected.provider,
    configurationError: projected.error,
    allowedRoots: [root],
    env: { ...process.env, FAKE_CODEX_AUTH: "1", FAKE_CODEX_MODE: "success" },
  });
  const status = await adapter.probe({ refresh: true, verifyExecution: true });
  assert.equal(status.available, false);
  assert.equal(status.authenticated, false);
  assert.equal(status.reason, "CODEX_PROVIDER_WIRE_API_INVALID");
  assert.equal(status.capabilities.executionVerified, false);
});

test("Codex JSONL parser keeps structured summaries and redacts tokens", () => {
  const fullToken = ["sk", "secretvalue123456"].join("-");
  const maskedToken = ["sk", "4KOu8" + "*".repeat(39) + "RlZj"].join("-");
  const event = parseCodexJsonLine(
    JSON.stringify({
      type: "item.completed",
      item: {
        id: "1",
        type: "agent_message",
        text: `result ${fullToken} and masked ${maskedToken}`,
      },
    }),
  );
  assert.equal(event.type, "item.completed");
  assert.equal(event.itemType, "agent_message");
  assert.doesNotMatch(event.summary, /secretvalue/);
  assert.doesNotMatch(event.summary, /4KOu8|RlZj/);
  assert.match(event.summary, /REDACTED/);
});

test("Codex CLI adapter completes only after turn.completed", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-run-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const adapter = adapterFor(root, "success");
  const { task, events, result } = await runFixture(adapter, root);
  assert.equal(result.state, "COMPLETED");
  assert.equal(result.threadId, "019test-thread");
  assert.ok(events.some((event) => event.type === "turn.completed"));
  const artifacts = await adapter.collectArtifacts(task.id);
  assert.equal(artifacts.length, 1);
  assert.equal(artifacts[0].verified, true);
  assert.match(artifacts[0].sha256, /^[a-f0-9]{64}$/);
});

test("transient error events do not override a later successful completion", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-transient-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const adapter = adapterFor(root, "transient");
  const { result } = await runFixture(adapter, root);
  assert.equal(result.state, "COMPLETED");
});

test("nonzero exit and clean disconnect both require manual intervention", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-fail-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const nonzero = await runFixture(adapterFor(root, "nonzero"), root);
  assert.equal(nonzero.result.state, "MANUAL_INTERVENTION");
  assert.match(nonzero.result.error, /fixture failure|failed/i);

  const disconnected = await runFixture(adapterFor(root, "disconnect"), root);
  assert.equal(disconnected.result.state, "MANUAL_INTERVENTION");
  assert.match(disconnected.result.error, /turn\.completed/);
});

test("Codex CLI adapter rejects workspaces outside the allowlisted root", async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), "cwp-adapter-root-"));
  const outside = await mkdtemp(path.join(tmpdir(), "cwp-adapter-outside-"));
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(outside, { recursive: true, force: true });
  });
  const adapter = adapterFor(root);
  assert.throws(
    () => adapter.createTask({ prompt: "no", cwd: outside }),
    /CODEX_WORKSPACE_OUTSIDE_ALLOWED_ROOT/,
  );
});
