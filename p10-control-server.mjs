#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { PRODUCT_VERSION } from "./version.mjs";
import {
  MockCodexAdapter,
  LocalCodexCliAdapter,
  redactSecrets,
  sanitizeSummary,
} from "./codex-adapter.mjs";
import { CodexAppServerAdapter } from "./codex-app-server-adapter.mjs";
import { StateStore } from "./state-store.mjs";
import { CompatClient } from "./server/compat-client.mjs";
import { loadControlConfig } from "./server/config.mjs";
import { runDirectoryPicker } from "./server/directory-picker.mjs";
import { publicErrorCode, statusForError } from "./server/errors.mjs";
import {
  originAllowed,
  queryInteger,
  readJsonBody as body,
  sendJson as json,
} from "./server/http.mjs";
import { createIdempotencyExecutor } from "./server/idempotency.mjs";
import {
  pathWithinRoot,
  safeDirectoryName,
  safetyPath,
  sensitiveDirectory,
} from "./server/path-security.mjs";
import { serveWebAsset as serveStaticWebAsset } from "./server/static-assets.mjs";
import { cleanSnapshot } from "./server/redaction.mjs";
import {
  boundedText,
  validateConversationPrompt,
  validateRunInput,
} from "./validation.mjs";
import {
  addWorkflowEdge,
  addWorkflowNode,
  chooseWorkflowNode,
  createWorkflow,
  findReadyWorkflowNodes,
  getWorkflowGraph,
  listWorkflowGraphs,
  replaceWorkflowOrder,
} from "./workflow-core.mjs";

const {
  allowWebSearch,
  autoApproveHighRisk,
  codexCommand,
  codexHome,
  codexProviderConfig,
  compatBase,
  compatEndpoint,
  controlDatabasePath,
  db,
  defaultNoProgressTimeoutMs,
  defaultRunTimeoutMs,
  host,
  instanceId,
  legacyStatePath,
  port,
  requestToken,
  shutdownToken,
  tickMs,
  watchdogMs,
  workspaceRoot,
} = loadControlConfig();
const compatClient = new CompatClient({
  baseUrl: compatBase,
  endpoint: compatEndpoint,
});
const workbenchVersion = PRODUCT_VERSION;
const webRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "web");
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID();
if (sensitiveDirectory(workspaceRoot))
  throw Error("WORKSPACE_ROOT_SENSITIVE_DIRECTORY");
const stateStore = new StateStore({
  databasePath: controlDatabasePath,
  legacyStatePath,
});
stateStore.open();
let state = stateStore.load();
const originalAllowedRoots = JSON.stringify(state.settings.allowedRoots ?? []);
state.settings.allowedRoots = Array.isArray(state.settings.allowedRoots)
  ? state.settings.allowedRoots
  : [];
if (!state.settings.allowedRoots.includes(workspaceRoot))
  state.settings.allowedRoots.unshift(workspaceRoot);
state.settings.allowedRoots = state.settings.allowedRoots.filter(
  (candidate) => {
    try {
      return (
        path.isAbsolute(String(candidate)) && !sensitiveDirectory(candidate)
      );
    } catch {
      return false;
    }
  },
);
const rootsChanged =
  JSON.stringify(state.settings.allowedRoots) !== originalAllowedRoots;
let nextEventSequence = 0;
try {
  nextEventSequence = stateStore.latestEventSequence();
} catch {
  nextEventSequence = Math.max(
    0,
    ...state.events.map((item) => Number(item.sequence) || 0),
  );
}
let saveInProgress = false;
let saveQueued = false;
let saveRetryTimer = null;
const save = () => {
  if (saveInProgress) {
    saveQueued = true;
    return false;
  }
  saveInProgress = true;
  try {
    stateStore.save(state);
    return true;
  } catch (error) {
    console.error(
      JSON.stringify({
        ok: false,
        event: "CONTROL_STATE_SAVE_FAILED",
        databasePath: controlDatabasePath,
        error: redactSecrets(error?.message || String(error)),
      }),
    );
    if (!saveRetryTimer)
      saveRetryTimer = setTimeout(() => {
        saveRetryTimer = null;
        save();
      }, 500);
    return false;
  } finally {
    saveInProgress = false;
    if (saveQueued) {
      saveQueued = false;
      queueMicrotask(save);
    }
  }
};
if (rootsChanged) save();
const executeIdempotent = createIdempotencyExecutor({
  state,
  save,
  cleanSnapshot,
  createKey: id,
  now,
});
const clients = new Set();
const adapters = new Map([
  ["mock", new MockCodexAdapter({ tickMs })],
  [
    "local-codex-cli",
    new LocalCodexCliAdapter({
      command: codexCommand,
      commandPrefix: codexProviderConfig.args,
      provider: codexProviderConfig.provider,
      configurationError: codexProviderConfig.error,
      requireChatGptAuth: true,
      env: { ...process.env, CODEX_HOME: codexHome },
      allowedRoots: [workspaceRoot],
      allowWebSearch,
      autoApprove: autoApproveHighRisk,
    }),
  ],
  [
    "local-codex-app-server",
    new CodexAppServerAdapter({
      command: codexCommand,
      commandPrefix: codexProviderConfig.args,
      provider: codexProviderConfig.provider,
      requireChatGptAuth: true,
      env: { ...process.env, CODEX_HOME: codexHome },
      allowedRoots: [workspaceRoot],
      allowWebSearch,
    }),
  ],
]);
adapters.get("local-codex-cli").allowedRoots = allowedRoots();
adapters.get("local-codex-app-server").allowedRoots = allowedRoots();

function emit(type, payload) {
  const timestamp = now();
  const cleanPayload = cleanSnapshot(payload);
  const event = {
    sequence: ++nextEventSequence,
    id: id(),
    projectId: cleanPayload.projectId ?? null,
    version: 1,
    sourceEventId: null,
    idempotencyKey: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    state: "RECORDED",
    type,
    timestamp,
    ...cleanPayload,
  };
  event.sourceEventId = event.id;
  state.events.push(event);
  save();
  for (const res of clients) {
    try {
      res.write(`id: ${event.sequence}\ndata: ${JSON.stringify(event)}\n\n`);
    } catch {
      clients.delete(res);
    }
  }
  return event;
}
async function idempotent(req, res, status, handler) {
  const result = await executeIdempotent({
    method: req.method,
    url: req.url,
    suppliedKey: req.headers["idempotency-key"],
    status,
    handler,
  });
  return json(res, result.status, result.body);
}
function findRun(runId) {
  return state.runs.find((r) => r.id === runId);
}
function allowedRoots() {
  return [
    ...new Set(
      [workspaceRoot, ...(state.settings.allowedRoots || [])]
        .map((root) => path.resolve(root))
        .filter((root) => !sensitiveDirectory(root)),
    ),
  ];
}
function pathWithinAllowedRoots(candidate) {
  const resolved = safetyPath(candidate);
  return allowedRoots().some((root) =>
    pathWithinRoot(resolved, safetyPath(root)),
  );
}
function defaultProjectRoot(input = null, projectId = null) {
  const candidate = path.resolve(
    String(
      input ||
        (projectId && state.projectDirectories?.[projectId]) ||
        state.settings?.projectRoot ||
        workspaceRoot,
    ),
  );
  if (!pathWithinAllowedRoots(candidate))
    throw Error("PROJECT_ROOT_OUTSIDE_ALLOWED_ROOT");
  if (sensitiveDirectory(candidate))
    throw Error("PROJECT_ROOT_SENSITIVE_DIRECTORY");
  return candidate;
}
function deleteWorkflow(workflowId, idempotencyKey) {
  const workflow = state.workflows.find((item) => item.id === workflowId);
  if (!workflow) throw Error("WORKFLOW_NOT_FOUND");
  const executions = state.workflowExecutions.filter(
    (execution) => execution.workflowId === workflowId,
  );
  if (
    executions.some((execution) =>
      [
        "QUEUED",
        "RUNNING",
        "WAITING_USER",
        "PAUSED",
        "VERIFYING",
        "MANUAL_INTERVENTION",
      ].includes(execution.state),
    )
  )
    throw Error("WORKFLOW_HAS_ACTIVE_EXECUTION");
  const runIds = new Set(
    state.runs
      .filter((run) => run.workflowId === workflowId)
      .map((run) => run.id),
  );
  const deletedAt = now();
  state.approvals = state.approvals.filter((item) => !runIds.has(item.runId));
  state.artifacts = state.artifacts.filter((item) => !runIds.has(item.runId));
  state.executionLogs = state.executionLogs.filter(
    (item) => !runIds.has(item.runId),
  );
  state.operatorActions = state.operatorActions.filter(
    (item) => !runIds.has(item.runId),
  );
  state.runs = state.runs.filter((item) => !runIds.has(item.id));
  state.workflowExecutions = state.workflowExecutions.filter(
    (item) => item.workflowId !== workflowId,
  );
  state.workflowEdges = state.workflowEdges.filter(
    (item) => item.workflowId !== workflowId,
  );
  state.workflowNodes = state.workflowNodes.filter(
    (item) => item.workflowId !== workflowId,
  );
  state.workflows = state.workflows.filter((item) => item.id !== workflowId);
  emit("WORKFLOW_DELETED", {
    workflowId,
    title: workflow.title,
    deletedRunCount: runIds.size,
    deletedAt,
    idempotencyKey,
  });
  save();
  return {
    id: workflowId,
    title: workflow.title,
    deletedRunCount: runIds.size,
    deletedAt,
  };
}
function deleteProjectState(projectId, idempotencyKey) {
  const workflowIds = new Set(
    state.workflows
      .filter((item) => item.projectId === projectId)
      .map((item) => item.id),
  );
  const runs = state.runs.filter(
    (run) => run.projectId === projectId || workflowIds.has(run.workflowId),
  );
  if (
    runs.some((run) =>
      [
        "QUEUED",
        "RUNNING",
        "WAITING_USER",
        "PAUSED",
        "VERIFYING",
        "MANUAL_INTERVENTION",
      ].includes(run.state),
    )
  )
    throw Error("PROJECT_HAS_ACTIVE_RUNS");
  const runIds = new Set(runs.map((run) => run.id));
  state.approvals = state.approvals.filter(
    (item) => !runIds.has(item.runId) && item.projectId !== projectId,
  );
  state.artifacts = state.artifacts.filter(
    (item) => !runIds.has(item.runId) && item.projectId !== projectId,
  );
  state.executionLogs = state.executionLogs.filter(
    (item) => !runIds.has(item.runId) && item.projectId !== projectId,
  );
  state.operatorActions = state.operatorActions.filter(
    (item) => !runIds.has(item.runId) && item.projectId !== projectId,
  );
  state.runs = state.runs.filter(
    (item) => !runIds.has(item.id) && item.projectId !== projectId,
  );
  state.workflowExecutions = state.workflowExecutions.filter(
    (item) => item.projectId !== projectId && !workflowIds.has(item.workflowId),
  );
  state.workflowEdges = state.workflowEdges.filter(
    (item) => !workflowIds.has(item.workflowId),
  );
  state.workflowNodes = state.workflowNodes.filter(
    (item) => !workflowIds.has(item.workflowId),
  );
  state.workflows = state.workflows.filter(
    (item) => item.projectId !== projectId,
  );
  delete state.projectDirectories?.[projectId];
  emit("PROJECT_DELETED", {
    projectId,
    deletedWorkflowCount: workflowIds.size,
    deletedRunCount: runIds.size,
    idempotencyKey,
    deletedAt: now(),
  });
  save();
  return {
    projectId,
    deletedWorkflowCount: workflowIds.size,
    deletedRunCount: runIds.size,
  };
}
function riskFor(action) {
  return [
    "FILE_WRITE",
    "COMMAND",
    "NETWORK",
    "TERMINATE",
    "RESUME",
    "TAKEOVER",
    "COMPLETE",
    "EXPORT",
  ].includes(action)
    ? "HIGH"
    : "LOW";
}
function commonRecord(
  projectId,
  idempotencyKey = null,
  recordState = "ACTIVE",
) {
  const timestamp = now();
  return {
    id: id(),
    projectId: projectId ?? null,
    version: 1,
    sourceEventId: null,
    idempotencyKey: idempotencyKey || null,
    createdAt: timestamp,
    updatedAt: timestamp,
    state: recordState,
  };
}
function bump(run) {
  run.version = Number(run.version ?? 0) + 1;
  run.updatedAt = now();
}
function findWorkflowExecution(executionId) {
  return state.workflowExecutions.find(
    (execution) => execution.id === executionId,
  );
}
function runsForWorkflowExecution(executionId) {
  return state.runs.filter((run) => run.workflowExecutionId === executionId);
}
function syncWorkflowExecution(executionId) {
  const execution = findWorkflowExecution(executionId);
  if (!execution) return null;
  const runs = runsForWorkflowExecution(executionId);
  const completedNodeIds = [
    ...new Set(
      runs
        .filter((run) => run.state === "COMPLETED")
        .map((run) => run.workflowNodeId),
    ),
  ];
  const runIds = runs.map((run) => run.id);
  const adapterThreadId =
    runs.find(
      (run) => run.adapter === "local-codex-app-server" && run.adapterThreadId,
    )?.adapterThreadId ??
    execution.adapterThreadId ??
    null;
  const active = runs.some((run) =>
    ["QUEUED", "RUNNING", "WAITING_USER", "PAUSED", "VERIFYING"].includes(
      run.state,
    ),
  );
  const manualRun = runs.find((run) => run.state === "MANUAL_INTERVENTION");
  const failedRun = runs.find(
    (run) => run.state === "FAILED" && !run.supersededBy,
  );
  const allCompleted =
    execution.nodeIds.length > 0 &&
    execution.nodeIds.every((nodeId) => completedNodeIds.includes(nodeId));

  let nextState = "QUEUED";
  let phase = runs.length ? "awaiting-dependencies" : "scheduling";
  let error = null;
  if (allCompleted) {
    nextState = "COMPLETED";
    phase = "completed";
  } else if (manualRun) {
    nextState = "MANUAL_INTERVENTION";
    phase = "node-manual-intervention";
    error = manualRun.error ?? manualRun.manualInterventionReason ?? null;
  } else if (failedRun) {
    nextState = "FAILED";
    phase = "node-failed";
    error = failedRun.error ?? "A workflow node failed";
  } else if (runs.some((run) => run.state === "WAITING_USER")) {
    nextState = "WAITING_USER";
    phase = "awaiting-user";
  } else if (runs.some((run) => run.state === "RUNNING")) {
    nextState = "RUNNING";
    phase = "running";
  } else if (runs.some((run) => run.state === "VERIFYING")) {
    nextState = "VERIFYING";
    phase = "verifying";
  } else if (runs.some((run) => run.state === "PAUSED")) {
    nextState = "PAUSED";
    phase = "paused";
  }

  const finishedAt =
    allCompleted || ((manualRun || failedRun) && !active)
      ? (execution.finishedAt ?? now())
      : null;
  const progress = execution.nodeIds.length
    ? Math.round((completedNodeIds.length / execution.nodeIds.length) * 100)
    : 0;
  const changed =
    execution.state !== nextState ||
    execution.phase !== phase ||
    execution.error !== error ||
    execution.progress !== progress ||
    execution.finishedAt !== finishedAt ||
    JSON.stringify(execution.completedNodeIds ?? []) !==
      JSON.stringify(completedNodeIds) ||
    JSON.stringify(execution.runIds ?? []) !== JSON.stringify(runIds) ||
    execution.adapterThreadId !== adapterThreadId;
  if (!changed) return execution;

  Object.assign(execution, {
    state: nextState,
    phase,
    error,
    progress,
    finishedAt,
    completedNodeIds,
    runIds,
    adapterThreadId,
  });
  bump(execution);
  emit("WORKFLOW_EXECUTION_UPDATED", {
    projectId: execution.projectId,
    workflowId: execution.workflowId,
    workflowExecutionId: execution.id,
    execution,
  });
  return execution;
}
function syncWorkflowExecutionForRun(run) {
  return run.workflowExecutionId
    ? syncWorkflowExecution(run.workflowExecutionId)
    : null;
}
function transitionRun(run, nextState, phase, eventType, extra = {}) {
  run.state = nextState;
  run.phase = phase;
  Object.assign(run, extra);
  bump(run);
  const event = emit(eventType, {
    projectId: run.projectId,
    runId: run.id,
    run,
  });
  run.sourceEventId ??= event.id;
  syncWorkflowExecutionForRun(run);
  return run;
}
function requestApproval(run, action, reason, idempotencyKey = null) {
  const existing = state.approvals.find(
    (a) => a.runId === run.id && a.action === action && a.state === "PENDING",
  );
  if (existing) return existing;
  const approval = {
    ...commonRecord(run.projectId, idempotencyKey, "PENDING"),
    runId: run.id,
    action,
    reason,
    targetObjectId: run.id,
    targetVersion: run.version,
    requester: "web-operator",
    approver: null,
    requestedAt: now(),
    expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    decidedAt: null,
    beforeSummary: `${run.state}/${run.phase}`,
    afterSummary: action,
  };
  state.approvals.push(approval);
  const event = emit("APPROVAL_REQUESTED", {
    projectId: run.projectId,
    runId: run.id,
    approval,
  });
  approval.sourceEventId = event.id;
  return approval;
}
async function approveAutomatically(approval) {
  if (!autoApproveHighRisk || !approval || approval.state !== "PENDING")
    return approval;
  return approve(approval.id, {
    decision: "APPROVED",
    approver: "auto-policy",
    reason:
      "工作台已按配置自动通过；Codex 自身权限与 approve-for-me 策略负责执行控制",
  });
}
function adapterFor(run) {
  const adapter = adapters.get(run.adapter);
  if (!adapter) throw Error("CODEX_ADAPTER_INVALID");
  return adapter;
}
function adapterFailureMessage(value) {
  const summary = sanitizeSummary(value ?? "Codex adapter failed", 500);
  if (
    /invalid_refresh_token|token_expired|access token could not be refreshed|401\s+Unauthorized|invalid_api_key|incorrect api key|authentication failed/i.test(
      summary,
    )
  ) {
    return "ChatGPT 官方账号登录已过期。请先执行 codex logout，再执行 codex login 完成浏览器登录，然后重新验证执行环境。";
  }
  if (/CODEX_PROBE_TIMEOUT|timed?\s*out/i.test(summary))
    return "Codex 在执行超时前没有响应。";
  return summary;
}
function estimateRunProgress(run, adapterEvent) {
  const type = String(adapterEvent?.type ?? "");
  const item = String(adapterEvent?.itemType ?? "");
  if (type === "adapter.started")
    return { progress: Math.max(run.progress ?? 0, 3), phase: "starting" };
  if (type === "thread.started" || type === "turn.started")
    return { progress: Math.max(run.progress ?? 0, 10), phase: "planning" };
  if (type === "item.started" && /command|shell|file|patch|mcp/i.test(item))
    return {
      progress: Math.max(run.progress ?? 0, /file|patch/i.test(item) ? 45 : 25),
      phase: /file|patch/i.test(item) ? "editing" : "reading",
    };
  if (type === "item.completed")
    return {
      progress: Math.min(90, Math.max((run.progress ?? 0) + 8, 35)),
      phase: /command|shell/i.test(item) ? "verifying" : "working",
    };
  if (type === "turn.completed")
    return { progress: Math.max(run.progress ?? 0, 95), phase: "finalizing" };
  if (type === "agent_message")
    return { progress: Math.max(run.progress ?? 0, 85), phase: "working" };
  return null;
}
function webStateSnapshot(options = {}) {
  const eventLimit = Math.max(
    1,
    Math.min(500, Number(options.eventLimit ?? 200)),
  );
  const eventAfter = Math.max(0, Number(options.eventAfter ?? 0));
  const allEvents = state.events;
  const runLimit = Math.max(1, Math.min(500, Number(options.runLimit ?? 500)));
  const approvalLimit = Math.max(
    1,
    Math.min(500, Number(options.approvalLimit ?? 500)),
  );
  const workflowLimit = Math.max(
    1,
    Math.min(500, Number(options.workflowLimit ?? 500)),
  );
  const logLimit = Math.max(1, Math.min(500, Number(options.logLimit ?? 500)));
  let eventPage;
  try {
    eventPage = stateStore.listEventsPage({
      after: eventAfter,
      limit: eventLimit,
    });
  } catch {
    const matching = allEvents.filter(
      (event) => Number(event.sequence) > eventAfter,
    );
    eventPage = {
      events: matching.slice(-eventLimit),
      eventTotal: matching.length,
      latestSequence: Number(allEvents.at(-1)?.sequence ?? 0),
    };
  }
  const snapshot = cleanSnapshot({
    ...state,
    events: eventPage.events,
    runs: state.runs.slice(-runLimit),
    approvals: state.approvals.slice(-approvalLimit),
    workflows: state.workflows.slice(-workflowLimit),
    executionLogs: state.executionLogs.slice(-logLimit),
  });
  snapshot.runs = snapshot.runs.map((run) => {
    const { prompt, ...publicRun } = run;
    return {
      ...publicRun,
      promptPreview: prompt ? sanitizeSummary(prompt, 800) : "",
      displayError: run.error ? adapterFailureMessage(run.error) : null,
    };
  });
  snapshot.events = snapshot.events.map((event) => {
    if (event.run && typeof event.run === "object") {
      const { prompt, ...run } = event.run;
      event.run = {
        ...run,
        promptPreview: prompt ? sanitizeSummary(prompt, 800) : "",
      };
    }
    return event;
  });
  snapshot.eventTotal = eventPage.eventTotal;
  snapshot.latestEventSequence = eventPage.latestSequence;
  snapshot.pagination = {
    eventAfter,
    eventLimit,
    hasMoreEvents: snapshot.events.length < eventPage.eventTotal,
    runLimit,
    hasMoreRuns: snapshot.runs.length < state.runs.length,
    approvalLimit,
    hasMoreApprovals: snapshot.approvals.length < state.approvals.length,
    workflowLimit,
    hasMoreWorkflows: snapshot.workflows.length < state.workflows.length,
    logLimit,
    hasMoreExecutionLogs:
      snapshot.executionLogs.length < state.executionLogs.length,
  };
  return snapshot;
}
function sandboxFor(run) {
  return (
    run.sandbox ||
    (["FILE_WRITE", "COMMAND"].includes(run.action)
      ? "workspace-write"
      : "read-only")
  );
}
function hasGitRepository(start) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, ".git"))) return true;
    const parent = path.dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}
function adapterCallbacks(runId) {
  return {
    onEvent(adapterEvent) {
      const run = findRun(runId);
      if (!run) return;
      if (adapterEvent.threadId) run.adapterThreadId = adapterEvent.threadId;
      const timestamp = now();
      run.heartbeatAt = timestamp;
      if (adapterEvent.type !== "adapter.stderr") {
        run.lastProgressAt = timestamp;
        run.lastProgressEvent = adapterEvent.itemType
          ? `${adapterEvent.type}:${adapterEvent.itemType}`
          : adapterEvent.type;
        if (adapterEvent.type === "turn.completed")
          run.turnCompletedAt = timestamp;
        const estimate = estimateRunProgress(run, adapterEvent);
        if (estimate) {
          run.progress = estimate.progress;
          run.phase = estimate.phase;
        }
      }
      if (adapterEvent.usage)
        run.usage = { ...run.usage, ...adapterEvent.usage };
      const log = {
        ...commonRecord(run.projectId, null, "RECORDED"),
        runId,
        adapter: run.adapter,
        eventType: adapterEvent.type,
        itemType: adapterEvent.itemType ?? null,
        summary: sanitizeSummary(adapterEvent.summary ?? ""),
        usage: adapterEvent.usage ?? null,
        timestamp,
      };
      state.executionLogs.push(log);
      const event = emit("CODEX_ADAPTER_EVENT", {
        projectId: run.projectId,
        runId,
        adapter: run.adapter,
        adapterEvent,
      });
      log.sourceEventId = event.id;
      save();
    },
    onHeartbeat(heartbeat) {
      const run = findRun(runId);
      if (!run || run.state !== "RUNNING") return;
      const timestamp = heartbeat.timestamp ?? now();
      let progressed = false;
      if (Number.isFinite(heartbeat.progress)) {
        progressed = Number(heartbeat.progress) > Number(run.progress ?? 0);
        run.progress = heartbeat.progress;
      }
      if (heartbeat.checkpoint && heartbeat.checkpoint !== run.checkpoint) {
        run.checkpoint = heartbeat.checkpoint;
        progressed = true;
      }
      if (progressed) {
        run.lastProgressAt = timestamp;
        run.lastProgressEvent = "heartbeat-progress";
      }
      run.heartbeatAt = timestamp;
      run.updatedAt = now();
      emit("RUN_HEARTBEAT", {
        projectId: run.projectId,
        runId,
        progress: run.progress,
        checkpoint: run.checkpoint,
        heartbeatAt: run.heartbeatAt,
      });
    },
    onExit(result) {
      void handleAdapterExit(runId, result);
    },
  };
}
async function handleAdapterExit(runId, result) {
  const run = findRun(runId);
  if (
    !run ||
    ["PAUSED", "FAILED", "COMPLETED", "WAITING_USER"].includes(run.state)
  )
    return;
  if (result.threadId) run.adapterThreadId = result.threadId;
  if (result.state !== "COMPLETED") {
    const failure = adapterFailureMessage(
      result.error ?? `Codex exited with code ${result.code ?? "unknown"}`,
    );
    transitionRun(
      run,
      "MANUAL_INTERVENTION",
      "adapter-failed",
      "RUN_MANUAL_INTERVENTION",
      {
        dispatchState: "MANUAL_INTERVENTION",
        error: failure,
        manualInterventionReason: failure,
      },
    );
    return;
  }
  const totalTokens =
    Number(run.usage?.inputTokens ?? 0) + Number(run.usage?.outputTokens ?? 0);
  if (run.tokenBudget && totalTokens > run.tokenBudget) {
    transitionRun(
      run,
      "FAILED",
      "token-budget-exceeded",
      "RUN_TOKEN_BUDGET_EXCEEDED",
      {
        dispatchState: "TERMINATED",
        error: `Token budget exceeded: ${totalTokens}/${run.tokenBudget}`,
        finishedAt: now(),
      },
    );
    recordOperatorAction(run, "AUTO_STOP", run.error, "system");
    save();
    return;
  }
  try {
    const adapter = adapterFor(run);
    const artifacts = await adapter.collectArtifacts(run.adapterTaskId);
    for (const artifactInput of artifacts) {
      const artifact = {
        ...commonRecord(run.projectId, null, "VERIFIED"),
        runId,
        ...artifactInput,
        createdAt: now(),
        updatedAt: now(),
      };
      state.artifacts.push(artifact);
      const event = emit("ARTIFACT_VERIFIED", {
        projectId: run.projectId,
        runId,
        artifact,
      });
      artifact.sourceEventId = event.id;
    }
    run.progress = 100;
    transitionRun(
      run,
      "VERIFYING",
      "awaiting-completion-approval",
      "RUN_VERIFYING",
      { dispatchState: "COMPLETED", error: null },
    );
    await approveAutomatically(
      requestApproval(
        run,
        "COMPLETE",
        autoApproveHighRisk
          ? "Artifact verified; automatic completion policy enabled"
          : "Artifact verified; operator confirmation is required before completion",
      ),
    );
    save();
  } catch (error) {
    transitionRun(
      run,
      "MANUAL_INTERVENTION",
      "artifact-collection-failed",
      "RUN_MANUAL_INTERVENTION",
      {
        dispatchState: "MANUAL_INTERVENTION",
        error: error.message,
        manualInterventionReason: error.message,
      },
    );
  }
}
async function dispatchRun(runId) {
  const run = findRun(runId);
  if (!run) throw Error("RUN_NOT_FOUND");
  if (run.state === "WAITING_USER") throw Error("RUN_APPROVAL_REQUIRED");
  if (!["QUEUED", "PAUSED"].includes(run.state))
    throw Error("RUN_NOT_DISPATCHABLE");
  const adapter = adapterFor(run);
  if (run.adapter === "local-codex-cli") {
    const probe = await adapter.probe({ refresh: true, verifyExecution: true });
    run.adapterStatus = probe;
    if (
      !probe.available ||
      !probe.authenticated ||
      probe.capabilities?.executionVerified !== true
    ) {
      const failure = adapterFailureMessage(
        probe.executionProbeDetail ??
          probe.reason ??
          (probe.authenticated
            ? "CODEX_CLI_NOT_AVAILABLE"
            : "CODEX_CLI_NOT_AUTHENTICATED"),
      );
      transitionRun(
        run,
        "MANUAL_INTERVENTION",
        "codex-environment-unavailable",
        "RUN_MANUAL_INTERVENTION",
        {
          dispatchState: "MANUAL_INTERVENTION",
          error: failure,
          manualInterventionReason: failure,
        },
      );
      return run;
    }
  }
  try {
    const task = adapter.createTask({
      title: run.title,
      prompt: run.prompt,
      cwd: run.cwd,
      sandbox: sandboxFor(run),
      approvalPolicy: run.approvalPolicy,
      network: run.action === "NETWORK",
      skipGitRepoCheck: run.skipGitRepoCheck,
      progress: run.progress,
      threadId: run.adapterThreadId,
      state: run.state === "PAUSED" ? "PAUSED" : "CREATED",
    });
    run.adapterTaskId = task.id;
    run.dispatchState = "DISPATCHING";
    bump(run);
    emit("RUN_DISPATCHING", {
      projectId: run.projectId,
      runId,
      adapter: run.adapter,
      adapterTaskId: task.id,
    });
    await adapter.startTask(task.id, adapterCallbacks(runId));
    const startedAt = run.startedAt ?? now();
    transitionRun(run, "RUNNING", "executing", "RUN_STARTED", {
      dispatchState: "RUNNING",
      startedAt,
      heartbeatAt: now(),
      lastProgressAt: now(),
      lastProgressEvent: "run-started",
      error: null,
      manualInterventionReason: null,
    });
    save();
    return run;
  } catch (error) {
    transitionRun(
      run,
      "MANUAL_INTERVENTION",
      "dispatch-failed",
      "RUN_MANUAL_INTERVENTION",
      {
        dispatchState: "MANUAL_INTERVENTION",
        error: error.message,
        manualInterventionReason: error.message,
      },
    );
    return run;
  }
}
async function createRun(input, idempotencyKey = null) {
  const validated = validateRunInput(input);
  const action = validated.action;
  const adapter = validated.adapter;
  const title = validated.title;
  if (!adapters.has(adapter)) throw Error("CODEX_ADAPTER_INVALID");
  const timeoutMs =
    input.timeoutMs === undefined ? defaultRunTimeoutMs : validated.timeoutMs;
  const noProgressTimeoutMs =
    input.noProgressTimeoutMs === undefined
      ? defaultNoProgressTimeoutMs
      : validated.noProgressTimeoutMs;
  const run = {
    ...commonRecord(input.projectId ?? null, idempotencyKey, "QUEUED"),
    title,
    phase: "queued",
    risk: riskFor(action),
    progress: 0,
    action,
    checkpoint: null,
    error: null,
    prompt: validated.prompt,
    cwd: defaultProjectRoot(input.cwd, input.projectId),
    workflowId: input.workflowId ?? null,
    workflowNodeId: input.workflowNodeId ?? null,
    model: validated.model,
    reasoningEffort: validated.reasoningEffort,
    delegation: validated.delegation,
    subagentModel: String(input.subagentModel ?? "auto").trim() || "auto",
    subagentReasoningEffort:
      String(input.subagentReasoningEffort ?? "auto")
        .trim()
        .toLowerCase() || "auto",
    maxSubagents: validated.maxSubagents,
    maxAttempts: validated.maxAttempts,
    attempt: Number(input.attempt ?? 1),
    retryOf: input.retryOf ?? null,
    supersededBy: null,
    workflowExecutionId: input.workflowExecutionId ?? null,
    adapter,
    sandbox: ["FILE_WRITE", "COMMAND"].includes(action)
      ? "workspace-write"
      : "read-only",
    approvalPolicy: "never",
    adapterTaskId: null,
    adapterThreadId: input.adapterThreadId ?? null,
    adapterStatus: null,
    dispatchState: "NOT_DISPATCHED",
    heartbeatAt: null,
    startedAt: null,
    finishedAt: null,
    lastProgressAt: null,
    lastProgressEvent: null,
    timeoutMs,
    noProgressTimeoutMs,
    tokenBudget: validated.tokenBudget,
    costBudget: validated.costBudget,
    usage: {},
    manualInterventionReason: null,
    turnCompletedAt: null,
    skipGitRepoCheck:
      input.skipGitRepoCheck ??
      !hasGitRepository(defaultProjectRoot(input.cwd, input.projectId)),
  };
  state.runs.push(run);
  const event = emit("RUN_CREATED", {
    projectId: run.projectId,
    runId: run.id,
    run,
  });
  run.sourceEventId = event.id;
  if (run.risk === "HIGH") {
    if (!autoApproveHighRisk)
      transitionRun(
        run,
        "WAITING_USER",
        "awaiting-start-approval",
        "RUN_WAITING_USER",
        { dispatchState: "AWAITING_APPROVAL" },
      );
    const approval = requestApproval(
      run,
      run.action,
      input.reason ??
        (autoApproveHighRisk
          ? "High-risk action uses automatic approval policy"
          : "High-risk action requires operator approval"),
      idempotencyKey,
    );
    if (autoApproveHighRisk) await approveAutomatically(approval);
  } else if (input.autoDispatch !== false) await dispatchRun(run.id);
  save();
  return run;
}
async function retryRun(runId, idempotencyKey = null) {
  const original = findRun(runId);
  if (!original) throw Error("RUN_NOT_FOUND");
  if (!["FAILED", "MANUAL_INTERVENTION"].includes(original.state))
    throw Error("RUN_NOT_RETRYABLE");
  const maxAttempts = Math.max(
    1,
    Math.min(5, Number(original.maxAttempts ?? 2)),
  );
  if (Number(original.attempt ?? 1) >= maxAttempts)
    throw Error("RUN_RETRY_LIMIT_REACHED");
  const retry = await createRun(
    {
      projectId: original.projectId,
      title: `${original.title} / 重试 ${Number(original.attempt ?? 1) + 1}`,
      prompt: original.prompt,
      action: original.action,
      adapter: original.adapter,
      cwd: original.cwd,
      workflowId: original.workflowId,
      workflowNodeId: original.workflowNodeId,
      workflowExecutionId: original.workflowExecutionId,
      timeoutMs: original.timeoutMs,
      noProgressTimeoutMs: original.noProgressTimeoutMs,
      tokenBudget: original.tokenBudget,
      costBudget: original.costBudget,
      model: original.model,
      reasoningEffort: original.reasoningEffort,
      delegation: original.delegation,
      subagentModel: original.subagentModel,
      subagentReasoningEffort: original.subagentReasoningEffort,
      maxSubagents: original.maxSubagents,
      maxAttempts,
      attempt: Number(original.attempt ?? 1) + 1,
      retryOf: original.id,
      skipGitRepoCheck: original.skipGitRepoCheck,
    },
    idempotencyKey,
  );
  original.supersededBy = retry.id;
  bump(original);
  emit("RUN_RETRY_CREATED", {
    projectId: original.projectId,
    runId: retry.id,
    retryOf: original.id,
    run: retry,
  });
  syncWorkflowExecutionForRun(original);
  save();
  return retry;
}
async function scheduleWorkflowExecution(executionId) {
  const execution = findWorkflowExecution(executionId);
  if (!execution) throw Error("WORKFLOW_EXECUTION_NOT_FOUND");
  const nodes = execution.nodes ?? [];
  const edges = execution.edges;
  if (nodes.length !== execution.nodeIds.length) {
    transitionWorkflowExecutionToManual(
      execution,
      "The persisted workflow snapshot is incomplete",
    );
    return [];
  }
  const runs = runsForWorkflowExecution(execution.id);
  const scheduledNodeIds = runs.map((run) => run.workflowNodeId);
  const completedNodeIds = runs
    .filter((run) => run.state === "COMPLETED")
    .map((run) => run.workflowNodeId);
  const readyNodes = findReadyWorkflowNodes(
    nodes,
    edges,
    completedNodeIds,
    scheduledNodeIds,
  );
  if (
    !readyNodes.length &&
    !runs.some((run) =>
      ["QUEUED", "RUNNING", "WAITING_USER", "PAUSED", "VERIFYING"].includes(
        run.state,
      ),
    ) &&
    completedNodeIds.length < nodes.length
  ) {
    transitionWorkflowExecutionToManual(
      execution,
      "No runnable node remains; the workflow graph may contain a cycle",
    );
    save();
    return [];
  }
  const createdRuns = [];
  for (const node of readyNodes) {
    const run = await createRun(
      {
        projectId: execution.projectId,
        title: `${execution.workflowTitle} / ${node.title}`,
        prompt: node.promptTemplate,
        action: node.action,
        adapter: node.adapter,
        timeoutMs: node.timeoutMs,
        noProgressTimeoutMs: node.noProgressTimeoutMs,
        tokenBudget: node.tokenBudget,
        costBudget: node.costBudget,
        model: node.model,
        reasoningEffort: node.reasoningEffort,
        delegation: node.delegation,
        subagentModel: node.subagentModel,
        subagentReasoningEffort: node.subagentReasoningEffort,
        maxSubagents: node.maxSubagents,
        maxAttempts: node.maxAttempts,
        workflowId: execution.workflowId,
        workflowNodeId: node.id,
        workflowExecutionId: execution.id,
        adapterThreadId: execution.adapterThreadId ?? null,
      },
      `workflow-execution:${execution.id}:node:${node.id}`,
    );
    createdRuns.push(run);
  }
  syncWorkflowExecution(execution.id);
  save();
  return createdRuns;
}
function transitionWorkflowExecutionToManual(execution, reason) {
  if (execution.state === "MANUAL_INTERVENTION" && execution.error === reason)
    return execution;
  execution.state = "MANUAL_INTERVENTION";
  execution.phase = "invalid-snapshot";
  execution.error = reason;
  execution.finishedAt = now();
  bump(execution);
  emit("WORKFLOW_EXECUTION_MANUAL_INTERVENTION", {
    projectId: execution.projectId,
    workflowId: execution.workflowId,
    workflowExecutionId: execution.id,
    reason,
    execution,
  });
  return execution;
}
async function createWorkflowExecution(
  workflowId,
  input,
  idempotencyKey = null,
) {
  const existing = idempotencyKey
    ? state.workflowExecutions.find(
        (execution) =>
          execution.workflowId === workflowId &&
          execution.idempotencyKey === idempotencyKey,
      )
    : null;
  if (existing) {
    await scheduleWorkflowExecution(existing.id);
    return { execution: existing, runs: runsForWorkflowExecution(existing.id) };
  }
  const graph = getWorkflowGraph(state, workflowId);
  if (!graph.nodes.length) throw Error("WORKFLOW_HAS_NO_RUNNABLE_NODE");
  if (input.workflowNodeId) {
    const node = chooseWorkflowNode(state, workflowId, input.workflowNodeId);
    return {
      execution: null,
      runs: [
        await createRun(
          {
            ...input,
            projectId: graph.workflow.projectId,
            title: input.title ?? `${graph.workflow.title} / ${node.title}`,
            prompt: input.prompt ?? node.promptTemplate,
            action: input.action ?? node.action,
            adapter: input.adapter ?? node.adapter,
            timeoutMs: input.timeoutMs ?? node.timeoutMs,
            noProgressTimeoutMs:
              input.noProgressTimeoutMs ?? node.noProgressTimeoutMs,
            tokenBudget: input.tokenBudget ?? node.tokenBudget,
            costBudget: input.costBudget ?? node.costBudget,
            model: input.model ?? node.model,
            reasoningEffort: input.reasoningEffort ?? node.reasoningEffort,
            delegation: input.delegation ?? node.delegation,
            subagentModel: input.subagentModel ?? node.subagentModel,
            subagentReasoningEffort:
              input.subagentReasoningEffort ?? node.subagentReasoningEffort,
            maxSubagents: input.maxSubagents ?? node.maxSubagents,
            workflowId,
            workflowNodeId: node.id,
          },
          idempotencyKey,
        ),
      ],
    };
  }

  const execution = {
    ...commonRecord(graph.workflow.projectId, idempotencyKey, "QUEUED"),
    workflowId,
    workflowVersion: graph.workflow.version,
    workflowTitle: graph.workflow.title,
    phase: "scheduling",
    progress: 0,
    nodeIds: graph.nodes.map((node) => node.id),
    nodes: graph.nodes.map((node) => cleanSnapshot(node)),
    edges: graph.edges.map((edge) => ({
      fromNodeId: edge.fromNodeId,
      toNodeId: edge.toNodeId,
    })),
    runIds: [],
    completedNodeIds: [],
    adapterThreadId: null,
    startedAt: now(),
    finishedAt: null,
    error: null,
  };
  state.workflowExecutions.push(execution);
  const event = emit("WORKFLOW_EXECUTION_CREATED", {
    projectId: execution.projectId,
    workflowId,
    workflowExecutionId: execution.id,
    execution,
  });
  execution.sourceEventId = event.id;
  const runs = await scheduleWorkflowExecution(execution.id);
  return { execution, runs };
}
function completeRun(run) {
  if (run.state !== "VERIFYING") throw Error("RUN_NOT_VERIFYING");
  transitionRun(run, "COMPLETED", "completed", "RUN_COMPLETED", {
    dispatchState: "COMPLETED",
    error: null,
  });
}
function recordOperatorAction(
  run,
  action,
  reason = "",
  operator = "web-operator",
  idempotencyKey = null,
) {
  const record = {
    ...commonRecord(run.projectId, idempotencyKey, "RECORDED"),
    runId: run.id,
    action,
    operator,
    reason: String(reason ?? ""),
    objectVersion: run.version,
    timestamp: now(),
  };
  state.operatorActions.push(record);
  const event = emit("OPERATOR_ACTION_RECORDED", {
    projectId: run.projectId,
    runId: run.id,
    operatorAction: record,
  });
  record.sourceEventId = event.id;
}
async function applyRunAction(
  runId,
  action,
  reason = "",
  idempotencyKey = null,
) {
  const run = findRun(runId);
  if (!run) throw Error("RUN_NOT_FOUND");
  action = String(action ?? "").toUpperCase();
  if (action === "PAUSE") {
    if (run.state !== "RUNNING") throw Error("RUN_NOT_RUNNING");
    await adapterFor(run).pauseTask(run.adapterTaskId);
    transitionRun(run, "PAUSED", "paused", "RUN_PAUSED", {
      dispatchState: "PAUSED",
    });
    recordOperatorAction(run, action, reason, "web-operator", idempotencyKey);
    save();
    return { run };
  }
  if (!["RESUME", "TERMINATE", "TAKEOVER"].includes(action))
    throw Error("RUN_ACTION_INVALID");
  if (action === "RESUME" && run.state !== "PAUSED")
    throw Error("RUN_NOT_PAUSED");
  if (
    ["TERMINATE", "TAKEOVER"].includes(action) &&
    !["RUNNING", "PAUSED", "WAITING_USER"].includes(run.state)
  )
    throw Error("RUN_NOT_TERMINABLE");
  if (["TERMINATE", "TAKEOVER"].includes(action) && run.state === "RUNNING") {
    await adapterFor(run).pauseTask(run.adapterTaskId);
    transitionRun(
      run,
      "WAITING_USER",
      `awaiting-${action.toLowerCase()}-approval`,
      "RUN_WAITING_USER",
      { dispatchState: "PAUSED" },
    );
  }
  recordOperatorAction(run, action, reason, "web-operator", idempotencyKey);
  const approval = requestApproval(
    run,
    action,
    autoApproveHighRisk
      ? `${action} uses automatic approval policy`
      : `${action} requires operator approval`,
    idempotencyKey,
  );
  if (autoApproveHighRisk)
    return { run, approval: await approveAutomatically(approval) };
  return { run, approval };
}
async function resumeRun(run) {
  const adapter = adapterFor(run);
  let taskId = run.adapterTaskId;
  try {
    adapter.readStatus(taskId);
  } catch {
    const task = adapter.createTask({
      title: run.title,
      prompt: run.prompt,
      cwd: run.cwd,
      sandbox: sandboxFor(run),
      approvalPolicy: run.approvalPolicy,
      network: run.action === "NETWORK",
      skipGitRepoCheck: run.skipGitRepoCheck,
      progress: run.progress,
      threadId: run.adapterThreadId,
      state: "PAUSED",
    });
    taskId = task.id;
    run.adapterTaskId = taskId;
  }
  await adapter.resumeTask(taskId, adapterCallbacks(run.id));
  transitionRun(run, "RUNNING", "executing", "RUN_RESUMED", {
    dispatchState: "RUNNING",
    heartbeatAt: now(),
    lastProgressAt: now(),
    lastProgressEvent: "run-resumed",
    error: null,
    manualInterventionReason: null,
  });
}

const watchdogStops = new Set();
async function stopRunForLimit(run, eventType, phase, message) {
  if (watchdogStops.has(run.id) || run.state !== "RUNNING") return;
  watchdogStops.add(run.id);
  try {
    await adapterFor(run)
      .terminateTask(run.adapterTaskId)
      .catch(() => null);
    transitionRun(run, "FAILED", phase, eventType, {
      dispatchState: "TERMINATED",
      error: message,
      finishedAt: now(),
    });
    recordOperatorAction(run, "AUTO_STOP", message, "system");
    save();
  } finally {
    watchdogStops.delete(run.id);
  }
}

async function enforceRunLimits() {
  const timestamp = Date.now();
  for (const run of state.runs.filter((item) => item.state === "RUNNING")) {
    const startedAt = Date.parse(
      run.startedAt ?? run.updatedAt ?? run.createdAt,
    );
    const lastProgressAt = Date.parse(
      run.lastProgressAt ?? run.startedAt ?? run.updatedAt ?? run.createdAt,
    );
    if (Number.isFinite(startedAt) && timestamp - startedAt >= run.timeoutMs) {
      await stopRunForLimit(
        run,
        "RUN_TIMEOUT",
        "runtime-timeout",
        `Runtime exceeded ${run.timeoutMs} ms`,
      );
      continue;
    }
    if (run.phase === "finalizing") {
      const turnCompletedAt = Date.parse(
        run.turnCompletedAt ?? run.lastProgressAt ?? run.updatedAt,
      );
      if (
        Number.isFinite(turnCompletedAt) &&
        timestamp - turnCompletedAt < 60_000
      )
        continue;
    }
    if (run.phase === "finalizing") continue;
    if (
      Number.isFinite(lastProgressAt) &&
      timestamp - lastProgressAt >= run.noProgressTimeoutMs
    ) {
      await stopRunForLimit(
        run,
        "RUN_NO_PROGRESS_TIMEOUT",
        "no-progress-timeout",
        `No useful progress for ${run.noProgressTimeoutMs} ms`,
      );
    }
  }
}
async function approve(approvalId, input, idempotencyKey = null) {
  const approval = state.approvals.find((a) => a.id === approvalId);
  if (!approval) throw Error("APPROVAL_NOT_FOUND");
  if (approval.state !== "PENDING") throw Error("APPROVAL_NOT_PENDING");
  if (new Date(approval.expiresAt) <= new Date()) {
    approval.state = "EXPIRED";
    approval.decidedAt = now();
    approval.updatedAt = now();
    bump(approval);
    emit("APPROVAL_EXPIRED", {
      projectId: approval.projectId,
      approvalId,
      approval,
    });
    save();
    throw Error("APPROVAL_EXPIRED");
  }
  const decision = String(input.decision ?? "").toUpperCase();
  if (!["APPROVED", "REJECTED"].includes(decision))
    throw Error("APPROVAL_DECISION_INVALID");
  const run = findRun(approval.runId);
  if (!run) throw Error("RUN_NOT_FOUND");
  if (approval.targetVersion !== run.version) {
    approval.state = "STALE";
    approval.decidedAt = now();
    approval.approver = "system";
    approval.decisionReason = `Target version changed from ${approval.targetVersion} to ${run.version}`;
    bump(approval);
    emit("APPROVAL_STALE", {
      projectId: approval.projectId,
      approvalId,
      runId: run.id,
      approval,
    });
    save();
    throw Error("APPROVAL_TARGET_VERSION_CONFLICT");
  }
  approval.state = decision;
  approval.decidedAt = now();
  approval.approver = String(input.approver ?? "web-operator");
  approval.decisionReason = String(input.reason ?? "");
  approval.decisionIdempotencyKey = idempotencyKey;
  approval.updatedAt = now();
  approval.version += 1;
  emit(`APPROVAL_${decision}`, { approvalId, approval });
  if (decision === "APPROVED") {
    if (approval.action === "COMPLETE") {
      completeRun(run);
      if (run.workflowExecutionId)
        await scheduleWorkflowExecution(run.workflowExecutionId);
    } else if (approval.action === "TERMINATE") {
      await adapterFor(run)
        .terminateTask(run.adapterTaskId)
        .catch(() => null);
      transitionRun(run, "FAILED", "terminated", "RUN_TERMINATED", {
        dispatchState: "TERMINATED",
        error: "Terminated by operator",
      });
    } else if (approval.action === "TAKEOVER") {
      await adapterFor(run)
        .terminateTask(run.adapterTaskId)
        .catch(() => null);
      transitionRun(
        run,
        "MANUAL_INTERVENTION",
        "operator-takeover",
        "RUN_MANUAL_INTERVENTION",
        {
          dispatchState: "TERMINATED",
          manualInterventionReason: "Operator took control",
        },
      );
    } else if (approval.action === "RESUME") await resumeRun(run);
    else {
      run.state = "QUEUED";
      run.phase = "approved-for-dispatch";
      run.dispatchState = "READY";
      bump(run);
      await dispatchRun(run.id);
    }
  } else if (approval.action === "COMPLETE") {
    transitionRun(
      run,
      "MANUAL_INTERVENTION",
      "completion-rejected",
      "RUN_MANUAL_INTERVENTION",
      {
        error: "Completion confirmation rejected",
        manualInterventionReason: "Completion confirmation rejected",
      },
    );
  } else if (["TERMINATE", "TAKEOVER"].includes(approval.action)) {
    const rejectedPhase =
      approval.action === "TERMINATE"
        ? "termination-rejected"
        : "takeover-rejected";
    transitionRun(
      run,
      "PAUSED",
      rejectedPhase,
      `RUN_${approval.action}_REJECTED`,
      { error: null, dispatchState: "PAUSED" },
    );
  } else if (approval.action === "RESUME") {
    transitionRun(run, "PAUSED", "resume-rejected", "RUN_RESUME_REJECTED", {
      error: null,
      dispatchState: "PAUSED",
    });
  } else {
    transitionRun(run, "FAILED", "start-rejected", "RUN_FAILED", {
      dispatchState: "REJECTED",
      error: "Operator rejected high-risk action",
    });
  }
  save();
  return approval;
}
function deleteRun(
  runId,
  reason = "Removed historical run from workbench",
  idempotencyKey = null,
) {
  const run = findRun(runId);
  if (!run) throw Error("RUN_NOT_FOUND");
  if (!["FAILED", "MANUAL_INTERVENTION", "COMPLETED"].includes(run.state))
    throw Error("RUN_NOT_TERMINAL");
  const deletedAt = now();
  state.approvals = state.approvals.filter((item) => item.runId !== runId);
  state.artifacts = state.artifacts.filter((item) => item.runId !== runId);
  state.executionLogs = state.executionLogs.filter(
    (item) => item.runId !== runId,
  );
  state.operatorActions = state.operatorActions.filter(
    (item) => item.runId !== runId,
  );
  state.runs = state.runs.filter((item) => item.id !== runId);
  emit("RUN_DELETED", {
    projectId: run.projectId,
    runId,
    title: run.title,
    previousState: run.state,
    reason,
    idempotencyKey,
    deletedAt,
  });
  save();
  return { id: runId, title: run.title, previousState: run.state, deletedAt };
}
async function recoverPersistedRuns() {
  for (const approval of state.approvals) {
    if (
      approval.state === "PENDING" &&
      new Date(approval.expiresAt) <= new Date()
    ) {
      approval.state = "EXPIRED";
      approval.decidedAt = now();
      approval.updatedAt = now();
      emit("APPROVAL_EXPIRED", {
        projectId: approval.projectId,
        approvalId: approval.id,
        approval,
      });
    }
  }
  for (const run of state.runs) {
    if (run.state === "RUNNING") {
      if (run.adapter === "local-codex-cli") {
        transitionRun(
          run,
          "MANUAL_INTERVENTION",
          "adapter-disconnected-after-restart",
          "RUN_MANUAL_INTERVENTION",
          {
            dispatchState: "MANUAL_INTERVENTION",
            error: "Control server restarted while Codex was running",
            manualInterventionReason:
              "Codex process connection was lost during server restart",
          },
        );
      } else {
        transitionRun(
          run,
          "PAUSED",
          "restart-recovery-required",
          "RUN_PAUSED_AFTER_RESTART",
          { dispatchState: "PAUSED" },
        );
      }
    }
    if (run.state === "VERIFYING")
      await approveAutomatically(
        requestApproval(
          run,
          "COMPLETE",
          autoApproveHighRisk
            ? "Artifact verified; automatic completion policy enabled"
            : "Artifact verified; operator confirmation is required before completion",
        ),
      );
  }
  for (const execution of state.workflowExecutions) {
    syncWorkflowExecution(execution.id);
    try {
      await scheduleWorkflowExecution(execution.id);
    } catch (error) {
      transitionWorkflowExecutionToManual(execution, error.message);
    }
  }
  save();
}
function expirePendingApprovals() {
  let changed = false;
  for (const approval of state.approvals) {
    if (
      approval.state === "PENDING" &&
      new Date(approval.expiresAt) <= new Date()
    ) {
      approval.state = "EXPIRED";
      approval.decidedAt = now();
      approval.updatedAt = now();
      approval.version = Number(approval.version ?? 0) + 1;
      emit("APPROVAL_EXPIRED", {
        projectId: approval.projectId,
        approvalId: approval.id,
        approval,
      });
      changed = true;
    }
  }
  if (changed) save();
}
function workflowContext(idempotencyKey = null) {
  return { id, now, emit, idempotencyKey };
}
async function proxyCompat(req, res) {
  if (!String(req.url || "").startsWith("/"))
    throw Error("COMPAT_PATH_INVALID");
  const upstream = await compatClient.proxy({
    url: req.url,
    method: req.method,
    accept: req.headers.accept,
    contentType: req.headers["content-type"],
    idempotencyKey: req.headers["idempotency-key"],
    body: ["GET", "HEAD"].includes(req.method) ? undefined : await body(req),
  });
  res.writeHead(upstream.status, {
    "content-type": upstream.contentType,
    "cache-control": "no-store",
  });
  res.end(upstream.bytes);
}
const compatReady = () => compatClient.ready();
async function createProjectThroughCompat(req, res) {
  const input = await body(req);
  input.title = boundedText(input.title, "PROJECT_TITLE_REQUIRED", 200, {
    required: true,
  });
  const projectRoot = defaultProjectRoot(input.projectRoot);
  fs.mkdirSync(projectRoot, { recursive: true });
  const directoryName = safeDirectoryName(input.directoryName || input.title);
  const projectDirectory = path.join(projectRoot, directoryName);
  if (!pathWithinAllowedRoots(projectDirectory))
    throw Error("PROJECT_DIRECTORY_OUTSIDE_ALLOWED_ROOT");
  try {
    fs.mkdirSync(projectDirectory, { recursive: false });
  } catch (error) {
    if (error?.code === "EEXIST")
      throw Error("PROJECT_DIRECTORY_ALREADY_EXISTS");
    throw error;
  }
  let upstream;
  try {
    upstream = await compatClient.requestJson("/api/projects", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "idempotency-key":
          req.headers["idempotency-key"] ?? crypto.randomUUID(),
      },
      body: JSON.stringify({ ...input, projectDirectory }),
    });
  } catch (error) {
    try {
      fs.rmSync(projectDirectory, { recursive: true, force: true });
    } catch {}
    throw error;
  }
  const { ok, status, payload } = upstream;
  if (ok && payload.project?.id) {
    state.projectDirectories[payload.project.id] = projectDirectory;
    save();
  }
  if (!ok) {
    try {
      fs.rmSync(projectDirectory, { recursive: true, force: true });
    } catch {}
  }
  return json(res, status, payload);
}
await recoverPersistedRuns();
const watchdog = setInterval(() => {
  void enforceRunLimits();
}, watchdogMs);
watchdog.unref();
let activeRequests = 0;
const maxConcurrentRequests = 100;
const server = http.createServer(async (req, res) => {
  if (activeRequests >= maxConcurrentRequests) {
    res.writeHead(429, {
      "content-type": "application/json; charset=utf-8",
      "retry-after": "1",
    });
    res.end(JSON.stringify({ ok: false, code: "REQUEST_CONCURRENCY_LIMIT" }));
    return;
  }
  activeRequests += 1;
  res.once("close", () => {
    activeRequests = Math.max(0, activeRequests - 1);
  });
  try {
    if (String(req.url || "").length > 8192)
      return json(res, 414, { ok: false, code: "REQUEST_URL_TOO_LONG" });
    const u = new URL(req.url, `http://${host}`);
    const mutating = !["GET", "HEAD", "OPTIONS"].includes(req.method);
    const origin = String(req.headers.origin ?? "");
    if (!originAllowed(origin, { host, port }))
      return json(res, 403, { ok: false, code: "ORIGIN_NOT_ALLOWED" });
    if (
      mutating &&
      requestToken &&
      req.headers["x-cwp-request-token"] !== requestToken
    )
      return json(res, 403, { ok: false, code: "REQUEST_TOKEN_REQUIRED" });
    if (u.pathname === "/healthz")
      return json(res, 200, {
        ok: true,
        p10: true,
        version: workbenchVersion,
        host,
        instanceId,
      });
    if (u.pathname === "/api/p10/client-config" && req.method === "GET")
      return json(res, 200, {
        ok: true,
        version: workbenchVersion,
        requestToken,
        host,
        port,
        compatBase,
        networkDefault: allowWebSearch,
        approvalDefault: autoApproveHighRisk ? "automatic" : "manual",
      });
    if (u.pathname === "/__internal/shutdown" && req.method === "POST") {
      if (
        !shutdownToken ||
        req.headers["x-cwp-request-token"] !== shutdownToken
      )
        return json(res, 403, { ok: false, code: "REQUEST_TOKEN_REQUIRED" });
      json(res, 202, { ok: true, shuttingDown: true });
      setImmediate(() => {
        void shutdown("requested").then(() => process.exit(0));
      });
      return;
    }
    if (u.pathname === "/readyz") {
      const compat = await compatReady();
      let controlDatabase = { ok: false };
      try {
        controlDatabase = {
          ok:
            stateStore.database !== null &&
            stateStore.integrityCheck() === true,
        };
      } catch (error) {
        controlDatabase = { ok: false, code: "CONTROL_DB_NOT_READY" };
      }
      const ready = compat.ok === true && controlDatabase.ok === true;
      return json(res, ready ? 200 : 503, {
        ok: ready,
        ready,
        version: workbenchVersion,
        controlDatabaseStatus: controlDatabase,
        compat,
      });
    }
    if (u.pathname === "/favicon.ico") {
      res.writeHead(204, { "cache-control": "public, max-age=86400" });
      return res.end();
    }
    if (u.pathname === "/api/p10/settings" && req.method === "GET") {
      return json(res, 200, {
        ok: true,
        workspaceRoot,
        allowedRoots: allowedRoots(),
        projectRoot: defaultProjectRoot(),
      });
    }
    if (
      u.pathname === "/api/p10/settings/pick-directory" &&
      req.method === "POST"
    ) {
      const selected = await runDirectoryPicker();
      return json(res, 200, { ok: true, projectRoot: path.resolve(selected) });
    }
    if (
      u.pathname === "/api/p10/settings/project-root" &&
      req.method === "POST"
    ) {
      return await idempotent(req, res, 200, async () => {
        const input = await body(req);
        const rawProjectRoot = String(input.projectRoot ?? "").trim();
        if (!rawProjectRoot) throw Error("PROJECT_ROOT_REQUIRED");
        const projectRoot = path.resolve(rawProjectRoot);
        if (sensitiveDirectory(projectRoot))
          throw Error("PROJECT_ROOT_SENSITIVE_DIRECTORY");
        if (!fs.existsSync(projectRoot))
          fs.mkdirSync(projectRoot, { recursive: true });
        if (!fs.statSync(projectRoot).isDirectory())
          throw Error("PROJECT_ROOT_NOT_DIRECTORY");
        fs.mkdirSync(projectRoot, { recursive: true });
        state.settings.allowedRoots = [
          ...new Set([...(state.settings.allowedRoots || []), projectRoot]),
        ];
        state.settings.projectRoot = projectRoot;
        adapters.get("local-codex-cli").allowedRoots = allowedRoots();
        adapters.get("local-codex-app-server").allowedRoots = allowedRoots();
        emit("PROJECT_ROOT_CONFIGURED", { projectRoot, workspaceRoot });
        save();
        return {
          ok: true,
          workspaceRoot,
          allowedRoots: allowedRoots(),
          projectRoot,
        };
      });
    }
    const projectDeleteMatch = u.pathname.match(/^\/api\/projects\/([^/]+)$/);
    if (projectDeleteMatch && req.method === "DELETE") {
      return await idempotent(req, res, 200, async (key) => {
        const upstream = await compatClient.requestJson(
          `/api/projects/${encodeURIComponent(projectDeleteMatch[1])}`,
          {
            method: "DELETE",
            headers: {
              accept: "application/json",
              "content-type": "application/json",
              "idempotency-key": key,
            },
            body: JSON.stringify(await body(req)),
          },
        );
        const { ok, status, payload } = upstream;
        if (!ok) {
          const error = new Error(payload.code || "PROJECT_DELETE_FAILED");
          error.statusCode = status;
          throw error;
        }
        const cleanup = deleteProjectState(projectDeleteMatch[1], key);
        return {
          ok: true,
          deleted: payload.deleted ?? { projectId: projectDeleteMatch[1] },
          cleanup,
        };
      });
    }
    if (u.pathname === "/api/projects" && req.method === "POST")
      return await createProjectThroughCompat(req, res);
    if (u.pathname === "/api/p10/state" && req.method === "GET") {
      expirePendingApprovals();
      return json(
        res,
        200,
        webStateSnapshot({
          eventAfter: queryInteger(
            u.searchParams.get("eventAfter"),
            0,
            0,
            Number.MAX_SAFE_INTEGER,
          ),
          eventLimit: queryInteger(
            u.searchParams.get("eventLimit"),
            200,
            1,
            500,
          ),
          runLimit: queryInteger(u.searchParams.get("runLimit"), 500, 1, 500),
          approvalLimit: queryInteger(
            u.searchParams.get("approvalLimit"),
            500,
            1,
            500,
          ),
          workflowLimit: queryInteger(
            u.searchParams.get("workflowLimit"),
            500,
            1,
            500,
          ),
          logLimit: queryInteger(u.searchParams.get("logLimit"), 500, 1, 500),
        }),
      );
    }
    if (u.pathname === "/api/p10/events" && req.method === "GET") {
      const after = queryInteger(
        u.searchParams.get("after"),
        0,
        0,
        Number.MAX_SAFE_INTEGER,
      );
      const limit = queryInteger(u.searchParams.get("limit"), 100, 1, 500);
      const before = queryInteger(
        u.searchParams.get("before"),
        Number.MAX_SAFE_INTEGER,
        1,
        Number.MAX_SAFE_INTEGER,
      );
      const type = u.searchParams.get("type");
      const projectId = u.searchParams.get("projectId");
      let page;
      try {
        page = stateStore.listEventsPage({
          after,
          before,
          limit,
          type,
          projectId,
        });
      } catch {
        const filtered = state.events.filter(
          (event) =>
            Number(event.sequence) > after &&
            Number(event.sequence) < before &&
            (!type || event.type === type) &&
            (!projectId || event.projectId === projectId),
        );
        const events = filtered.slice(-limit);
        page = {
          events,
          eventTotal: filtered.length,
          latestSequence: Number(state.events.at(-1)?.sequence ?? 0),
          nextAfter: Number(events.at(-1)?.sequence ?? after),
          nextBefore: Number(events.at(0)?.sequence ?? before),
          hasMoreBefore: filtered.length > events.length,
        };
      }
      return json(res, 200, { ok: true, ...cleanSnapshot(page) });
    }
    if (u.pathname === "/api/p10/runs" && req.method === "GET") {
      const limit = queryInteger(u.searchParams.get("limit"), 100, 1, 500);
      const stateFilter = u.searchParams.get("state");
      const runs = state.runs
        .filter((run) => !stateFilter || run.state === stateFilter)
        .slice(-limit)
        .reverse()
        .map((run) => ({
          ...run,
          displayError: run.error ? adapterFailureMessage(run.error) : null,
        }));
      return json(res, 200, {
        ok: true,
        runs: cleanSnapshot(runs),
        total: state.runs.filter(
          (run) => !stateFilter || run.state === stateFilter,
        ).length,
      });
    }
    if (u.pathname === "/api/p10/codex/status" && req.method === "GET") {
      const [mock, local, appServer] = await Promise.all([
        adapters.get("mock").probe(),
        adapters.get("local-codex-cli").probe({
          refresh: u.searchParams.get("refresh") === "1",
          verifyExecution: u.searchParams.get("verify") === "1",
        }),
        adapters
          .get("local-codex-app-server")
          .probe({ refresh: u.searchParams.get("refresh") === "1" }),
      ]);
      const localForWeb = cleanSnapshot(local);
      localForWeb.displayExecutionProbeDetail = local.executionProbeDetail
        ? adapterFailureMessage(local.executionProbeDetail)
        : null;
      return json(res, 200, {
        ok: true,
        workspaceRoot,
        allowedRoots: allowedRoots(),
        adapters: [mock, localForWeb, cleanSnapshot(appServer)],
      });
    }
    const conversationMatch = u.pathname.match(
      /^\/api\/p10\/conversations\/([^/]+)$/,
    );
    if (conversationMatch && req.method === "GET") {
      const thread = await adapters
        .get("local-codex-app-server")
        .readThread(decodeURIComponent(conversationMatch[1]), true);
      return json(res, 200, {
        ok: true,
        thread: cleanSnapshot(thread.thread ?? thread),
      });
    }
    const conversationTurnMatch = u.pathname.match(
      /^\/api\/p10\/conversations\/([^/]+)\/turns$/,
    );
    if (conversationTurnMatch && req.method === "POST") {
      return await idempotent(req, res, 201, async () => {
        const input = await body(req);
        const prompt = validateConversationPrompt(input.prompt);
        const threadId = decodeURIComponent(conversationTurnMatch[1]);
        const owner = state.runs.find(
          (run) => run.adapterThreadId === threadId,
        );
        const result = await adapters
          .get("local-codex-app-server")
          .sendFollowup(threadId, prompt, {
            model: input.model ?? owner?.model,
            reasoningEffort: input.reasoningEffort ?? owner?.reasoningEffort,
            cwd: owner?.cwd,
            sandbox: owner ? sandboxFor(owner) : "read-only",
            network: owner?.action === "NETWORK",
          });
        return { ok: true, turn: cleanSnapshot(result.turn ?? result) };
      });
    }
    if (u.pathname === "/api/p10/workflows" && req.method === "GET") {
      return json(res, 200, { ok: true, workflows: listWorkflowGraphs(state) });
    }
    if (u.pathname === "/api/p10/workflows" && req.method === "POST") {
      return await idempotent(req, res, 201, async (key) => {
        const workflow = createWorkflow(
          state,
          await body(req),
          workflowContext(key),
        );
        save();
        return { ok: true, workflow };
      });
    }
    const workflowDeleteMatch = u.pathname.match(
      /^\/api\/p10\/workflows\/([^/]+)$/,
    );
    if (workflowDeleteMatch && req.method === "DELETE") {
      return await idempotent(req, res, 200, async (key) => {
        return {
          ok: true,
          deleted: deleteWorkflow(workflowDeleteMatch[1], key),
        };
      });
    }
    const workflowNodeMatch = u.pathname.match(
      /^\/api\/p10\/workflows\/([^/]+)\/nodes$/,
    );
    if (workflowNodeMatch && req.method === "POST") {
      return await idempotent(req, res, 201, async (key) => {
        const node = addWorkflowNode(
          state,
          workflowNodeMatch[1],
          await body(req),
          workflowContext(key),
        );
        save();
        return { ok: true, node };
      });
    }
    const workflowEdgeMatch = u.pathname.match(
      /^\/api\/p10\/workflows\/([^/]+)\/edges$/,
    );
    if (workflowEdgeMatch && req.method === "POST") {
      return await idempotent(req, res, 201, async (key) => {
        const result = addWorkflowEdge(
          state,
          workflowEdgeMatch[1],
          await body(req),
          workflowContext(key),
        );
        save();
        return { ok: true, ...result };
      });
    }
    const workflowOrderMatch = u.pathname.match(
      /^\/api\/p10\/workflows\/([^/]+)\/order$/,
    );
    if (workflowOrderMatch && (req.method === "POST" || req.method === "PUT")) {
      return await idempotent(req, res, 200, async (key) => {
        const result = replaceWorkflowOrder(
          state,
          workflowOrderMatch[1],
          await body(req),
          workflowContext(key),
        );
        save();
        return { ok: true, ...result };
      });
    }
    const workflowRunMatch = u.pathname.match(
      /^\/api\/p10\/workflows\/([^/]+)\/runs$/,
    );
    if (workflowRunMatch && req.method === "POST") {
      return await idempotent(req, res, 201, async (key) => {
        const input = await body(req);
        const result = await createWorkflowExecution(
          workflowRunMatch[1],
          input,
          key,
        );
        return {
          ok: true,
          execution: result.execution ? cleanSnapshot(result.execution) : null,
          runs: result.runs.map((run) => cleanSnapshot(run)),
          run: result.runs[0] ? cleanSnapshot(result.runs[0]) : null,
        };
      });
    }
    if (u.pathname === "/api/p10/events/stream" && req.method === "GET") {
      if (clients.size >= 20)
        return json(res, 429, {
          ok: false,
          code: "EVENT_STREAM_LIMIT_REACHED",
        });
      res.writeHead(200, {
        "content-type": "text/event-stream",
        "cache-control": "no-cache",
        connection: "keep-alive",
        "x-content-type-options": "nosniff",
      });
      res.write("retry: 3000\n\n");
      const last = queryInteger(
        req.headers["last-event-id"] ?? u.searchParams.get("after"),
        0,
        0,
        Number.MAX_SAFE_INTEGER,
      );
      const pendingEvents = state.events.filter((e) => e.sequence > last);
      try {
        for (const event of pendingEvents.slice(-500))
          res.write(
            `id: ${event.sequence}\ndata: ${JSON.stringify(cleanSnapshot(event))}\n\n`,
          );
      } catch {
        return res.end();
      }
      if (pendingEvents.length > 500)
        res.write(
          `event: history-truncated\ndata: ${JSON.stringify({ after: last, latest: pendingEvents.at(-1)?.sequence ?? last })}\n\n`,
        );
      res.write(": connected\n\n");
      clients.add(res);
      const heartbeat = setInterval(() => {
        try {
          res.write(": ping\n\n");
        } catch {}
      }, 15_000);
      heartbeat.unref();
      req.on("close", () => {
        clearInterval(heartbeat);
        clients.delete(res);
      });
      return;
    }
    if (u.pathname === "/api/p10/runs" && req.method === "POST") {
      return await idempotent(req, res, 201, async (key) => ({
        ok: true,
        run: await createRun(await body(req), key),
      }));
    }
    const deleteRunMatch = u.pathname.match(/^\/api\/p10\/runs\/([^/]+)$/);
    if (deleteRunMatch && req.method === "DELETE") {
      return await idempotent(req, res, 200, async (key) => ({
        ok: true,
        deleted: deleteRun(deleteRunMatch[1], undefined, key),
      }));
    }
    const dispatchMatch = u.pathname.match(
      /^\/api\/p10\/runs\/([^/]+)\/dispatch$/,
    );
    if (dispatchMatch && req.method === "POST") {
      return await idempotent(req, res, 200, async () => ({
        ok: true,
        run: await dispatchRun(dispatchMatch[1]),
      }));
    }
    const retryMatch = u.pathname.match(/^\/api\/p10\/runs\/([^/]+)\/retry$/);
    if (retryMatch && req.method === "POST") {
      return await idempotent(req, res, 201, async (key) => ({
        ok: true,
        run: await retryRun(retryMatch[1], key),
      }));
    }
    const actionMatch = u.pathname.match(
      /^\/api\/p10\/runs\/([^/]+)\/actions$/,
    );
    if (actionMatch && req.method === "POST") {
      return await idempotent(req, res, 200, async (key) => {
        const input = await body(req);
        return {
          ok: true,
          ...(await applyRunAction(
            actionMatch[1],
            input.action,
            input.reason,
            key,
          )),
        };
      });
    }
    const approvalMatch = u.pathname.match(/^\/api\/p10\/approvals\/([^/]+)$/);
    if (approvalMatch && req.method === "POST") {
      return await idempotent(req, res, 200, async (key) => ({
        ok: true,
        approval: await approve(approvalMatch[1], await body(req), key),
      }));
    }
    if (u.pathname === "/" && req.method === "GET") {
      const htmlPath = path.join(webRoot, "index.html");
      if (!fs.existsSync(htmlPath))
        return json(res, 500, { ok: false, code: "WEB_ASSET_MISSING" });
      res.writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "content-security-policy":
          "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self'; object-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
      });
      return res.end(fs.readFileSync(htmlPath));
    }
    if (u.pathname.startsWith("/assets/") && req.method === "GET")
      return serveStaticWebAsset({
        res,
        webRoot,
        relativePath: u.pathname.slice("/assets/".length),
      });
    if (u.pathname.startsWith("/api/")) return await proxyCompat(req, res);
    return json(res, 404, { ok: false, code: "NOT_FOUND" });
  } catch (error) {
    if (res.headersSent || res.writableEnded) {
      try {
        res.destroy();
      } catch {}
      return;
    }
    const code = publicErrorCode(error);
    return json(res, statusForError(code), {
      ok: false,
      code,
      message: code === "INTERNAL_ERROR" ? "Request failed" : code,
    });
  }
});
let shuttingDown = false;
async function shutdown(reason = "signal") {
  if (shuttingDown) return;
  shuttingDown = true;
  clearInterval(watchdog);
  let saved = save();
  for (let attempt = 0; !saved && attempt < 3; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 100 * (attempt + 1)));
    saved = save();
  }
  if (!saved)
    console.error(
      JSON.stringify({ ok: false, event: "CONTROL_STATE_FINAL_SAVE_FAILED" }),
    );
  if (saveRetryTimer) {
    clearTimeout(saveRetryTimer);
    saveRetryTimer = null;
  }
  for (const adapter of adapters.values())
    await adapter.close?.().catch(() => null);
  server.closeAllConnections?.();
  server.closeIdleConnections?.();
  await new Promise((resolve) => server.close(() => resolve()));
  stateStore.close();
  console.log(
    JSON.stringify({ ok: true, event: "CONTROL_SERVER_STOPPED", reason }),
  );
}
server.on("error", (error) => {
  console.error(
    JSON.stringify({
      ok: false,
      event: "CONTROL_SERVER_ERROR",
      code: error.code,
      message: redactSecrets(error.message),
    }),
  );
  if (error.code === "EADDRINUSE" || error.code === "EACCES") {
    process.exitCode = 2;
    clearInterval(watchdog);
    try {
      stateStore.close();
    } catch {}
  }
});
server.requestTimeout = 120_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;
process.once("SIGINT", () => {
  void shutdown("SIGINT").then(() => process.exit(130));
});
process.once("SIGTERM", () => {
  void shutdown("SIGTERM").then(() => process.exit(143));
});
process.once("uncaughtException", (error) => {
  console.error(
    JSON.stringify({
      ok: false,
      event: "CONTROL_SERVER_UNCAUGHT_EXCEPTION",
      error: redactSecrets(error?.stack || error?.message || String(error)),
    }),
  );
  void shutdown("uncaught-exception").then(() => process.exit(1));
});
process.once("unhandledRejection", (error) => {
  console.error(
    JSON.stringify({
      ok: false,
      event: "CONTROL_SERVER_UNHANDLED_REJECTION",
      error: redactSecrets(error?.stack || error?.message || String(error)),
    }),
  );
  void shutdown("unhandled-rejection").then(() => process.exit(1));
});
server.listen(port, host, () =>
  console.log(
    JSON.stringify({
      ok: true,
      url: `http://${host}:${port}/`,
      version: workbenchVersion,
    }),
  ),
);
