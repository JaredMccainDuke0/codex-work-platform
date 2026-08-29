import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import http from "node:http";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const allocatedPorts = new Set();

async function stopChild(child) {
  if (!child || child.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once("exit", resolve));
  if (process.platform === "win32") {
    const killer = spawn("taskkill.exe", ["/pid", String(child.pid), "/t", "/f"], {
      windowsHide: true,
      stdio: "ignore",
    });
    await new Promise((resolve) => {
      killer.once("error", resolve);
      killer.once("close", resolve);
    });
  } else child.kill();
  await Promise.race([exited, sleep(3000)]);
}

async function waitForHealth(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      if ((await fetch(`${url}/healthz`)).ok) return;
    } catch {}
    await sleep(100);
  }
  throw new Error("P10_TEST_SERVER_NOT_READY");
}

async function getFreePort() {
  while (true) {
    const server = http.createServer();
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, "127.0.0.1", resolve);
    });
    const { port } = server.address();
    await new Promise((resolve) => server.close(resolve));
    if (allocatedPorts.has(port)) continue;
    allocatedPorts.add(port);
    return port;
  }
}

async function waitForState(url, predicate, code = "P10_TEST_STATE_TIMEOUT") {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const state = await fetch(`${url}/api/p10/state`).then((response) =>
      response.json(),
    );
    if (predicate(state)) return state;
    await sleep(50);
  }
  throw new Error(code);
}

async function approveRequest(url, approval) {
  const response = await fetch(`${url}/api/p10/approvals/${approval.id}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": `approve-${approval.id}`,
    },
    body: JSON.stringify({ decision: "APPROVED", approver: "test-operator" }),
  });
  assert.equal(response.status, 200);
  return response.json();
}

test("run, approval, verification and completion persist", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "250",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const created = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "network approval test", action: "NETWORK" }),
  }).then((r) => r.json());
  let state = await fetch(`${url}/api/p10/state`).then((r) => r.json());
  const startApproval = state.approvals.find(
    (item) => item.runId === created.run.id && item.action === "NETWORK",
  );
  assert.equal(startApproval.state, "PENDING");
  const startDecision = await fetch(
    `${url}/api/p10/approvals/${startApproval.id}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "APPROVED" }),
    },
  );
  assert.equal(startDecision.status, 200, await startDecision.text());

  await sleep(3000);
  state = await fetch(`${url}/api/p10/state`).then((r) => r.json());
  assert.equal(
    state.runs.find((item) => item.id === created.run.id).state,
    "VERIFYING",
  );
  const completionApproval = state.approvals.find(
    (item) => item.runId === created.run.id && item.action === "COMPLETE",
  );
  assert.equal(completionApproval.state, "PENDING");
  assert.equal(
    state.artifacts.filter((item) => item.runId === created.run.id).length,
    1,
  );

  await fetch(`${url}/api/p10/approvals/${completionApproval.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision: "APPROVED" }),
  });
  state = await fetch(`${url}/api/p10/state`).then((r) => r.json());
  assert.equal(
    state.runs.find((item) => item.id === created.run.id).state,
    "COMPLETED",
  );
  assert.ok(state.events.some((item) => item.type === "RUN_COMPLETED"));

  const duplicateDecision = await fetch(
    `${url}/api/p10/approvals/${completionApproval.id}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "APPROVED" }),
    },
  );
  assert.equal(duplicateDecision.status, 409);
  assert.equal((await fetch(`${url}/healthz`)).status, 200);
});

test("idempotency keys prevent duplicate run creation", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-idempotency-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "100",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "idempotency-key": "same-create-request",
    },
    body: JSON.stringify({ title: "idempotent run", action: "FILE_WRITE" }),
  };
  const [first, second] = await Promise.all(
    [1, 2].map(() =>
      fetch(`${url}/api/p10/runs`, options).then((response) => response.json()),
    ),
  );
  const state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );

  assert.equal(second.run.id, first.run.id);
  assert.notEqual(second.run, "[circular]");
  assert.equal(typeof second.run.id, "string");
  assert.equal(state.runs.length, 1);
  assert.equal(state.approvals.length, 1);
  assert.equal(state.runs[0].state, "WAITING_USER");
});

test("automatic approval policy approves high-risk actions and preserves audit records", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-auto-approval-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "100",
      "--auto-approve-high-risk",
      "true",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);
  const created = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "auto approval", action: "FILE_WRITE" }),
  }).then((response) => response.json());
  const state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  const approval = state.approvals.find(
    (item) => item.runId === created.run.id,
  );
  assert.equal(approval.state, "APPROVED");
  assert.equal(approval.approver, "auto-policy");
  assert.equal(state.runs[0].state === "WAITING_USER", false);
  assert.ok(state.events.some((event) => event.type === "APPROVAL_APPROVED"));
});

test("terminal historical runs can be removed through the audited API", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-delete-run-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "50",
      "--auto-approve-high-risk",
      "true",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);
  const created = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "historical delete fixture",
      adapter: "mock",
      action: "RUN",
    }),
  }).then((response) => response.json());
  await waitForState(
    url,
    (value) =>
      value.runs.find((run) => run.id === created.run.id)?.state ===
      "COMPLETED",
  );
  const deleted = await fetch(`${url}/api/p10/runs/${created.run.id}`, {
    method: "DELETE",
    headers: { "idempotency-key": "delete-terminal-run" },
  }).then((response) => response.json());
  assert.equal(deleted.ok, true);
  const state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(
    state.runs.some((run) => run.id === created.run.id),
    false,
  );
  assert.ok(state.events.some((event) => event.type === "RUN_DELETED"));
});

test("pause and terminate approval stop progress immediately", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-control-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "250",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const created = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: "controlled run", action: "RUN" }),
  }).then((response) => response.json());
  await sleep(350);
  await fetch(`${url}/api/p10/runs/${created.run.id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "PAUSE" }),
  });
  let state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  const pausedProgress = state.runs[0].progress;
  await sleep(900);
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs[0].progress, pausedProgress);

  const resumeResponse = await fetch(
    `${url}/api/p10/runs/${created.run.id}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "RESUME" }),
    },
  ).then((response) => response.json());
  await fetch(`${url}/api/p10/approvals/${resumeResponse.approval.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision: "APPROVED" }),
  });
  await sleep(200);
  const terminateResponse = await fetch(
    `${url}/api/p10/runs/${created.run.id}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "TERMINATE" }),
    },
  ).then((response) => response.json());
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  const waitingProgress = state.runs[0].progress;
  assert.equal(state.runs[0].state, "WAITING_USER");
  await sleep(900);
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs[0].progress, waitingProgress);

  await fetch(`${url}/api/p10/approvals/${terminateResponse.approval.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision: "REJECTED" }),
  });
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs[0].state, "PAUSED");
  assert.equal(state.runs[0].phase, "termination-rejected");

  const takeoverResponse = await fetch(
    `${url}/api/p10/runs/${created.run.id}/actions`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "TAKEOVER" }),
    },
  ).then((response) => response.json());
  assert.equal(takeoverResponse.approval.action, "TAKEOVER");
  await fetch(`${url}/api/p10/approvals/${takeoverResponse.approval.id}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ decision: "APPROVED" }),
  });
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs[0].state, "MANUAL_INTERVENTION");
});

test("workflow API persists nodes, rejects cycles and links a run", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-workflow-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "250",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const create = (route, payload, key) =>
    fetch(`${url}${route}`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": key },
      body: JSON.stringify(payload),
    });
  const workflow = (
    await create(
      "/api/p10/workflows",
      { title: "Two-step workflow" },
      "workflow-create",
    )
  ).json();
  const workflowPayload = await workflow;
  const workflowId = workflowPayload.workflow.id;
  const first = await (
    await create(
      `/api/p10/workflows/${workflowId}/nodes`,
      {
        title: "Plan",
        promptTemplate: "Plan only",
        timeoutMs: 60_000,
        noProgressTimeoutMs: 15_000,
        tokenBudget: 5_000,
        expectedVersion: 1,
      },
      "node-1",
    )
  ).json();
  const second = await (
    await create(
      `/api/p10/workflows/${workflowId}/nodes`,
      { title: "Execute", promptTemplate: "Execute", expectedVersion: 2 },
      "node-2",
    )
  ).json();
  const edge = await (
    await create(
      `/api/p10/workflows/${workflowId}/edges`,
      {
        fromNodeId: first.node.id,
        toNodeId: second.node.id,
        expectedVersion: 3,
      },
      "edge-1",
    )
  ).json();
  const duplicate = await (
    await create(
      `/api/p10/workflows/${workflowId}/edges`,
      {
        fromNodeId: first.node.id,
        toNodeId: second.node.id,
        expectedVersion: 3,
      },
      "edge-duplicate",
    )
  ).json();
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.edge.id, edge.edge.id);

  const cycle = await create(
    `/api/p10/workflows/${workflowId}/edges`,
    { fromNodeId: second.node.id, toNodeId: first.node.id, expectedVersion: 4 },
    "edge-cycle",
  );
  assert.equal(cycle.status, 409);
  assert.equal((await cycle.json()).code, "WORKFLOW_EDGE_CYCLE");

  const runPayload = await (
    await create(`/api/p10/workflows/${workflowId}/runs`, {}, "workflow-run")
  ).json();
  assert.ok(runPayload.execution.id);
  assert.equal(runPayload.run.workflowExecutionId, runPayload.execution.id);
  assert.equal(runPayload.run.workflowId, workflowId);
  assert.equal(runPayload.run.workflowNodeId, first.node.id);
  assert.equal(runPayload.run.adapter, "mock");
  assert.equal(runPayload.run.timeoutMs, 60_000);
  assert.equal(runPayload.run.noProgressTimeoutMs, 15_000);
  assert.equal(runPayload.run.tokenBudget, 5_000);
  const state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.workflows.length, 1);
  assert.equal(state.workflowNodes.length, 2);
  assert.equal(state.workflowEdges.length, 1);
  assert.doesNotMatch(
    JSON.stringify(state.events),
    /"timer"|"childProcess"|"process"/,
  );
});

test("visual workflow order API replaces all dependency edges atomically", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-order-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "100",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const create = (route, payload, key) =>
    fetch(`${url}${route}`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": key },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      const result = await response.json();
      assert.equal(response.ok, true, result.code);
      return result;
    });
  const workflow = (
    await create(
      "/api/p10/workflows",
      { title: "Drag order" },
      "order-workflow",
    )
  ).workflow;
  const first = (
    await create(
      `/api/p10/workflows/${workflow.id}/nodes`,
      { title: "First", promptTemplate: "First", expectedVersion: 1 },
      "order-node-1",
    )
  ).node;
  const second = (
    await create(
      `/api/p10/workflows/${workflow.id}/nodes`,
      { title: "Second", promptTemplate: "Second", expectedVersion: 2 },
      "order-node-2",
    )
  ).node;
  const third = (
    await create(
      `/api/p10/workflows/${workflow.id}/nodes`,
      { title: "Third", promptTemplate: "Third", expectedVersion: 3 },
      "order-node-3",
    )
  ).node;
  await create(
    `/api/p10/workflows/${workflow.id}/edges`,
    { fromNodeId: first.id, toNodeId: third.id, expectedVersion: 4 },
    "order-edge-old",
  );

  const ordered = await create(
    `/api/p10/workflows/${workflow.id}/order`,
    { nodeIds: [third.id, first.id, second.id], expectedVersion: 5 },
    "order-save",
  );
  assert.equal(ordered.changed, true);
  assert.deepEqual(ordered.order, [third.id, first.id, second.id]);
  assert.deepEqual(
    ordered.edges.map((edge) => [edge.fromNodeId, edge.toNodeId]),
    [
      [third.id, first.id],
      [first.id, second.id],
    ],
  );
  const state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.deepEqual(
    state.workflowEdges
      .filter((edge) => edge.workflowId === workflow.id)
      .map((edge) => [edge.fromNodeId, edge.toNodeId]),
    [
      [third.id, first.id],
      [first.id, second.id],
    ],
  );
  assert.ok(
    state.events.some((event) => event.type === "WORKFLOW_ORDER_UPDATED"),
  );
});

test("workflow execution advances dependencies once and survives restart", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-execution-"));
  const dbPath = path.join(dir, "platform.sqlite");
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const startServer = () =>
    spawn(
      process.execPath,
      [
        path.join(root, "p10-control-server.mjs"),
        "--db",
        dbPath,
        "--port",
        String(port),
        "--tick-ms",
        "50",
      ],
      { stdio: "ignore" },
    );
  let child = startServer();
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const create = (route, payload, key) =>
    fetch(`${url}${route}`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": key },
      body: JSON.stringify(payload),
    }).then(async (response) => {
      const payload = await response.json();
      assert.equal(response.ok, true, payload.code);
      return payload;
    });
  const workflow = (
    await create(
      "/api/p10/workflows",
      { title: "Release chain" },
      "execution-workflow",
    )
  ).workflow;
  const plan = (
    await create(
      `/api/p10/workflows/${workflow.id}/nodes`,
      {
        title: "Plan",
        promptTemplate: "Plan",
        action: "RUN",
        expectedVersion: 1,
      },
      "execution-plan",
    )
  ).node;
  const write = (
    await create(
      `/api/p10/workflows/${workflow.id}/nodes`,
      {
        title: "Write",
        promptTemplate: "Write",
        action: "FILE_WRITE",
        expectedVersion: 2,
      },
      "execution-write",
    )
  ).node;
  const verify = (
    await create(
      `/api/p10/workflows/${workflow.id}/nodes`,
      {
        title: "Verify",
        promptTemplate: "Verify",
        action: "RUN",
        expectedVersion: 3,
      },
      "execution-verify",
    )
  ).node;
  await create(
    `/api/p10/workflows/${workflow.id}/edges`,
    {
      fromNodeId: plan.id,
      toNodeId: write.id,
      expectedVersion: 4,
    },
    "execution-edge-1",
  );
  await create(
    `/api/p10/workflows/${workflow.id}/edges`,
    {
      fromNodeId: write.id,
      toNodeId: verify.id,
      expectedVersion: 5,
    },
    "execution-edge-2",
  );

  const launched = await create(
    `/api/p10/workflows/${workflow.id}/runs`,
    {},
    "execution-launch",
  );
  assert.ok(launched.execution.id);
  assert.equal(launched.runs.length, 1);
  let state = await waitForState(
    url,
    (value) =>
      value.runs.find((run) => run.workflowNodeId === plan.id)?.state ===
      "VERIFYING",
  );
  await approveRequest(
    url,
    state.approvals.find(
      (approval) =>
        approval.runId ===
          state.runs.find((run) => run.workflowNodeId === plan.id).id &&
        approval.action === "COMPLETE",
    ),
  );

  state = await waitForState(
    url,
    (value) =>
      value.runs.find((run) => run.workflowNodeId === write.id)?.state ===
      "WAITING_USER",
  );
  assert.equal(
    state.runs.filter(
      (run) => run.workflowExecutionId === launched.execution.id,
    ).length,
    2,
  );
  const writeRun = state.runs.find((run) => run.workflowNodeId === write.id);
  await approveRequest(
    url,
    state.approvals.find(
      (approval) =>
        approval.runId === writeRun.id && approval.action === "FILE_WRITE",
    ),
  );
  state = await waitForState(
    url,
    (value) =>
      value.runs.find((run) => run.id === writeRun.id)?.state === "VERIFYING",
  );
  await approveRequest(
    url,
    state.approvals.find(
      (approval) =>
        approval.runId === writeRun.id && approval.action === "COMPLETE",
    ),
  );

  state = await waitForState(
    url,
    (value) =>
      value.runs.find((run) => run.workflowNodeId === verify.id)?.state ===
      "VERIFYING",
  );
  const verifyRun = state.runs.find((run) => run.workflowNodeId === verify.id);
  await approveRequest(
    url,
    state.approvals.find(
      (approval) =>
        approval.runId === verifyRun.id && approval.action === "COMPLETE",
    ),
  );
  state = await waitForState(
    url,
    (value) =>
      value.workflowExecutions.find(
        (execution) => execution.id === launched.execution.id,
      )?.state === "COMPLETED",
  );
  assert.equal(
    state.runs.filter(
      (run) => run.workflowExecutionId === launched.execution.id,
    ).length,
    3,
  );
  assert.equal(
    new Set(
      state.runs
        .filter((run) => run.workflowExecutionId === launched.execution.id)
        .map((run) => run.workflowNodeId),
    ).size,
    3,
  );
  assert.equal(
    state.workflowExecutions.find(
      (execution) => execution.id === launched.execution.id,
    ).progress,
    100,
  );

  const exit = new Promise((resolve) => child.once("exit", resolve));
  child.kill();
  await exit;
  child = startServer();
  await waitForHealth(url);
  await create(
    `/api/p10/workflows/${workflow.id}/runs`,
    {},
    "execution-launch",
  );
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.workflowExecutions.length, 1);
  assert.equal(
    state.runs.filter(
      (run) => run.workflowExecutionId === launched.execution.id,
    ).length,
    3,
  );
  assert.equal(state.workflowExecutions[0].state, "COMPLETED");
});

test("approval is rejected after its target run version changes", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-stale-approval-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const run = (
    await fetch(`${url}/api/p10/runs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "stale approval", action: "FILE_WRITE" }),
    }).then((response) => response.json())
  ).run;
  let state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  const startApproval = state.approvals.find(
    (approval) => approval.runId === run.id && approval.action === "FILE_WRITE",
  );
  const terminate = await fetch(`${url}/api/p10/runs/${run.id}/actions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "TERMINATE" }),
  }).then((response) => response.json());
  await approveRequest(url, terminate.approval);

  const staleDecision = await fetch(
    `${url}/api/p10/approvals/${startApproval.id}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "APPROVED" }),
    },
  );
  assert.equal(staleDecision.status, 409);
  assert.equal(
    (await staleDecision.json()).code,
    "APPROVAL_TARGET_VERSION_CONFLICT",
  );
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs.find((item) => item.id === run.id).state, "FAILED");
  assert.equal(
    state.approvals.find((approval) => approval.id === startApproval.id).state,
    "STALE",
  );
  assert.ok(
    state.events.some(
      (event) =>
        event.type === "APPROVAL_STALE" &&
        event.approvalId === startApproval.id,
    ),
  );
});

test("no-progress watchdog terminates a stalled run and writes a system audit record", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-watchdog-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--tick-ms",
      "1000",
      "--watchdog-ms",
      "25",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const created = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "stalled run",
      action: "RUN",
      timeoutMs: 5000,
      noProgressTimeoutMs: 150,
    }),
  }).then((response) => response.json());

  let state;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    state = await fetch(`${url}/api/p10/state`).then((response) =>
      response.json(),
    );
    if (
      state.runs.find((item) => item.id === created.run.id)?.state === "FAILED"
    )
      break;
    await sleep(25);
  }
  const run = state.runs.find((item) => item.id === created.run.id);
  assert.equal(run.state, "FAILED");
  assert.equal(run.phase, "no-progress-timeout");
  assert.match(run.error, /No useful progress/);
  assert.ok(run.finishedAt);
  assert.ok(
    state.events.some(
      (item) =>
        item.runId === run.id && item.type === "RUN_NO_PROGRESS_TIMEOUT",
    ),
  );
  assert.ok(
    state.operatorActions.some(
      (item) =>
        item.runId === run.id &&
        item.action === "AUTO_STOP" &&
        item.operator === "system",
    ),
  );
});

test("missing CLI never falls back to mock and restart loss becomes manual intervention", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-recovery-"));
  const dbPath = path.join(dir, "platform.sqlite");
  const statePath = `${dbPath}.p10.json`;
  await writeFile(
    statePath,
    JSON.stringify({
      runs: [
        {
          id: "local-running",
          projectId: null,
          version: 1,
          title: "Interrupted local run",
          state: "RUNNING",
          phase: "executing",
          adapter: "local-codex-cli",
          adapterTaskId: "task-old",
          progress: 40,
          action: "RUN",
          checkpoint: "thread-old",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      approvals: [],
      events: [],
      artifacts: [],
      idempotency: {},
    }),
  );
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const missingCli = path.join(dir, "missing-codex.exe");
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      dbPath,
      "--port",
      String(port),
      "--codex-command",
      missingCli,
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  let state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs[0].state, "MANUAL_INTERVENTION");
  assert.equal(state.runs[0].adapter, "local-codex-cli");
  assert.match(state.runs[0].manualInterventionReason, /connection was lost/i);

  const status = await fetch(`${url}/api/p10/codex/status?refresh=1`).then(
    (response) => response.json(),
  );
  assert.equal(
    status.adapters.find((item) => item.adapter === "local-codex-cli")
      .available,
    false,
  );
  const created = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      title: "Must stay local",
      prompt: "Inspect only",
      action: "RUN",
      adapter: "local-codex-cli",
    }),
  }).then((response) => response.json());
  assert.equal(created.run.adapter, "local-codex-cli");
  assert.equal(created.run.state, "MANUAL_INTERVENTION");
  state = await fetch(`${url}/api/p10/state`).then((response) =>
    response.json(),
  );
  assert.equal(state.runs.filter((item) => item.adapter === "mock").length, 0);
});

test("persisted state and state API redact complete and partially masked secrets", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-redaction-"));
  const dbPath = path.join(dir, "platform.sqlite");
  const statePath = `${dbPath}.p10.json`;
  const leaked = "sk-4KOu8***************************************RlZj";
  await writeFile(
    statePath,
    JSON.stringify({
      runs: [
        {
          id: "failed-run",
          version: 1,
          state: "FAILED",
          phase: "adapter-failed",
          error: `401 Unauthorized. Incorrect API key provided: ${leaked}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      approvals: [],
      events: [
        {
          id: "event-1",
          sequence: 1,
          type: "CODEX_ADAPTER_EVENT",
          summary: `token=${leaked}`,
          timestamp: new Date().toISOString(),
        },
      ],
      artifacts: [],
      idempotency: {},
    }),
  );
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      dbPath,
      "--port",
      String(port),
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const responseText = await fetch(`${url}/api/p10/state`).then((response) =>
    response.text(),
  );
  const persistedText = await readFile(statePath, "utf8");
  for (const output of [responseText, persistedText]) {
    assert.doesNotMatch(output, /4KOu8|RlZj/);
    assert.match(output, /REDACTED/);
  }
  const responseState = JSON.parse(responseText);
  assert.equal(
    responseState.runs[0].displayError,
    "ChatGPT 官方账号登录已过期。请先执行 codex logout，再执行 codex login 完成浏览器登录，然后重新验证执行环境。",
  );
});

test("rendered workbench serves a standalone secure UI shell", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-ui-script-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);

  const response = await fetch(`${url}/`);
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /\/assets\/app\.js/);
  assert.match(
    response.headers.get("content-security-policy"),
    /script-src 'self'/,
  );
  const js = await fetch(`${url}/assets/app.js`).then((result) =>
    result.text(),
  );
  assert.doesNotThrow(() => new vm.Script(js, { filename: "web/app.js" }));
  assert.equal((await fetch(`${url}/api/p10/client-config`)).status, 200);
  assert.equal((await fetch(`${url}/assets/..%2Fpackage.json`)).status, 404);
});

test("readiness separates a live control process from an unavailable compat service", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-ready-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--compat-base",
      "http://127.0.0.1:1",
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);
  assert.equal((await fetch(`${url}/healthz`)).status, 200);
  assert.equal((await fetch(`${url}/readyz`)).status, 503);
});

test("mutating requests require the installation request token when a browser origin is present", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-token-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const token = "test-request-token";
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
      "--request-token",
      token,
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);
  const denied = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: { origin: url, "content-type": "application/json" },
    body: JSON.stringify({ title: "denied" }),
  });
  assert.equal(denied.status, 403);
  const accepted = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: {
      origin: url,
      "content-type": "application/json",
      "x-cwp-request-token": token,
    },
    body: JSON.stringify({ title: "accepted", adapter: "mock" }),
  });
  assert.equal(accepted.status, 201);
  const wrongOrigin = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: {
      origin: "http://127.0.0.1:9",
      "content-type": "application/json",
      "x-cwp-request-token": token,
    },
    body: JSON.stringify({ title: "wrong-origin" }),
  });
  assert.equal(wrongOrigin.status, 403);
  const arrayBody = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cwp-request-token": token,
    },
    body: JSON.stringify([]),
  });
  assert.equal(arrayBody.status, 400);
  assert.equal((await arrayBody.json()).code, "REQUEST_BODY_OBJECT_REQUIRED");
  const oversized = await fetch(`${url}/api/p10/runs`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-cwp-request-token": token,
    },
    body: "x".repeat(4 * 1024 * 1024 + 1),
  });
  assert.equal(oversized.status, 413);
});

test("event and state endpoints return bounded, cursor-aware pages", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "cwp-p10-pagination-"));
  const port = await getFreePort();
  const url = `http://127.0.0.1:${port}`;
  const child = spawn(
    process.execPath,
    [
      path.join(root, "p10-control-server.mjs"),
      "--db",
      path.join(dir, "platform.sqlite"),
      "--port",
      String(port),
    ],
    { stdio: "ignore" },
  );
  t.after(async () => {
    await stopChild(child);
    await rm(dir, { recursive: true, force: true });
  });
  await waitForHealth(url);
  for (let index = 0; index < 8; index += 1)
    await fetch(`${url}/api/p10/runs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: `run-${index}`, adapter: "mock" }),
    });
  const state = await fetch(`${url}/api/p10/state?eventLimit=3`).then(
    (response) => response.json(),
  );
  assert.equal(state.events.length, 3);
  assert.equal(state.eventTotal >= 8, true);
  const page = await fetch(
    `${url}/api/p10/events?before=${state.events[0].sequence}&limit=2`,
  ).then((response) => response.json());
  assert.equal(page.events.length <= 2, true);
  assert.equal(typeof page.hasMoreBefore, "boolean");
});
