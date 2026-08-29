const MAX_TEXT = 256_000;
function requiredText(value, code, limit = MAX_TEXT) {
  const text = String(value ?? "").trim();
  if (!text) throw Error(code);
  if (text.length > limit) throw Error(`${code}_TOO_LONG`);
  return text;
}

function optionalText(value, code, limit = MAX_TEXT) {
  const text = String(value ?? "").trim();
  if (text.length > limit) throw Error(`${code}_TOO_LONG`);
  return text;
}

function optionalPositiveNumber(
  value,
  code,
  { integer = false, minimum = 0 } = {},
) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (
    !Number.isFinite(parsed) ||
    parsed <= minimum ||
    (integer && !Number.isInteger(parsed))
  )
    throw Error(code);
  return parsed;
}

function boundedNumber(
  value,
  code,
  fallback,
  { min = 1, max = 6, integer = true } = {},
) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (
    !Number.isFinite(parsed) ||
    (integer && !Number.isInteger(parsed)) ||
    parsed < min ||
    parsed > max
  )
    throw Error(code);
  return parsed;
}

function assertVersion(workflow, expectedVersion) {
  if (!Number.isInteger(expectedVersion))
    throw Error("WORKFLOW_VERSION_REQUIRED");
  if (workflow.version !== expectedVersion)
    throw Error("WORKFLOW_VERSION_CONFLICT");
}

function baseRecord(input, context) {
  const timestamp = context.now();
  return {
    id: context.id(),
    projectId: input.projectId ?? null,
    version: 1,
    sourceEventId: null,
    idempotencyKey: context.idempotencyKey || null,
    createdAt: timestamp,
    updatedAt: timestamp,
    state: input.state ?? "DRAFT",
  };
}

function attachSourceEvent(record, event) {
  record.sourceEventId = event.id;
  return record;
}

export function createWorkflow(state, input, context) {
  const workflow = {
    ...baseRecord(input, context),
    title: requiredText(input.title, "WORKFLOW_TITLE_REQUIRED", 200),
    description: optionalText(input.description, "WORKFLOW_DESCRIPTION", 8000),
    completionCriteria: optionalText(
      input.completionCriteria,
      "WORKFLOW_COMPLETION_CRITERIA",
      8000,
    ),
  };
  state.workflows.push(workflow);
  const event = context.emit("WORKFLOW_CREATED", {
    workflowId: workflow.id,
    workflow,
  });
  return attachSourceEvent(workflow, event);
}

export function addWorkflowNode(state, workflowId, input, context) {
  const workflow = state.workflows.find((item) => item.id === workflowId);
  if (!workflow) throw Error("WORKFLOW_NOT_FOUND");
  assertVersion(workflow, input.expectedVersion);

  const node = {
    ...baseRecord({ ...input, projectId: workflow.projectId }, context),
    workflowId,
    title: requiredText(input.title, "WORKFLOW_NODE_TITLE_REQUIRED", 200),
    promptTemplate: requiredText(
      input.promptTemplate,
      "WORKFLOW_NODE_PROMPT_REQUIRED",
    ),
    action: String(input.action ?? "RUN")
      .trim()
      .toUpperCase(),
    adapter: String(input.adapter ?? "mock").trim(),
    completionCriteria: optionalText(
      input.completionCriteria,
      "WORKFLOW_NODE_COMPLETION_CRITERIA",
      8000,
    ),
    validationCommand: optionalText(
      input.validationCommand,
      "WORKFLOW_NODE_VALIDATION_COMMAND",
      8000,
    ),
    model:
      optionalText(input.model ?? "auto", "WORKFLOW_NODE_MODEL", 128) || "auto",
    reasoningEffort:
      String(input.reasoningEffort ?? "auto")
        .trim()
        .toLowerCase() || "auto",
    delegation:
      String(input.delegation ?? "DISABLED")
        .trim()
        .toUpperCase() || "DISABLED",
    subagentModel:
      optionalText(
        input.subagentModel ?? "auto",
        "WORKFLOW_NODE_SUBAGENT_MODEL",
        128,
      ) || "auto",
    subagentReasoningEffort:
      String(input.subagentReasoningEffort ?? "auto")
        .trim()
        .toLowerCase() || "auto",
    maxSubagents: boundedNumber(
      input.maxSubagents,
      "WORKFLOW_NODE_SUBAGENT_LIMIT_INVALID",
      4,
      { min: 1, max: 6 },
    ),
    maxAttempts: boundedNumber(
      input.maxAttempts,
      "WORKFLOW_NODE_ATTEMPTS_INVALID",
      2,
      { min: 1, max: 5 },
    ),
    timeoutMs: optionalPositiveNumber(
      input.timeoutMs,
      "WORKFLOW_NODE_TIMEOUT_INVALID",
      { integer: true, minimum: 99 },
    ),
    noProgressTimeoutMs: optionalPositiveNumber(
      input.noProgressTimeoutMs,
      "WORKFLOW_NODE_NO_PROGRESS_TIMEOUT_INVALID",
      { integer: true, minimum: 99 },
    ),
    tokenBudget: optionalPositiveNumber(
      input.tokenBudget,
      "WORKFLOW_NODE_TOKEN_BUDGET_INVALID",
      { integer: true },
    ),
    costBudget: optionalPositiveNumber(
      input.costBudget,
      "WORKFLOW_NODE_COST_BUDGET_INVALID",
    ),
    riskPolicy: optionalText(
      input.riskPolicy ?? "DEFAULT",
      "WORKFLOW_NODE_RISK_POLICY",
      32,
    ).toUpperCase(),
  };
  if (!["RUN", "FILE_WRITE", "COMMAND", "NETWORK"].includes(node.action))
    throw Error("WORKFLOW_NODE_ACTION_INVALID");
  if (
    !["mock", "local-codex-cli", "local-codex-app-server"].includes(
      node.adapter,
    )
  )
    throw Error("WORKFLOW_NODE_ADAPTER_INVALID");
  if (
    !["auto", "none", "minimal", "low", "medium", "high", "xhigh"].includes(
      node.reasoningEffort,
    )
  )
    throw Error("WORKFLOW_NODE_REASONING_EFFORT_INVALID");
  if (!["DISABLED", "AUTO"].includes(node.delegation))
    throw Error("WORKFLOW_NODE_DELEGATION_INVALID");
  if (!["DEFAULT", "MANUAL", "AUTOMATIC"].includes(node.riskPolicy))
    throw Error("WORKFLOW_NODE_RISK_POLICY_INVALID");
  state.workflowNodes.push(node);
  workflow.version += 1;
  workflow.updatedAt = context.now();
  const event = context.emit("WORKFLOW_NODE_CREATED", {
    workflowId,
    node,
    workflowVersion: workflow.version,
  });
  return attachSourceEvent(node, event);
}

function wouldCreateCycle(edges, fromNodeId, toNodeId) {
  const adjacency = new Map();
  for (const edge of edges) {
    if (!adjacency.has(edge.fromNodeId)) adjacency.set(edge.fromNodeId, []);
    adjacency.get(edge.fromNodeId).push(edge.toNodeId);
  }
  if (!adjacency.has(fromNodeId)) adjacency.set(fromNodeId, []);
  adjacency.get(fromNodeId).push(toNodeId);

  const stack = [toNodeId];
  const visited = new Set();
  while (stack.length) {
    const nodeId = stack.pop();
    if (nodeId === fromNodeId) return true;
    if (visited.has(nodeId)) continue;
    visited.add(nodeId);
    stack.push(...(adjacency.get(nodeId) ?? []));
  }
  return false;
}

export function addWorkflowEdge(state, workflowId, input, context) {
  const workflow = state.workflows.find((item) => item.id === workflowId);
  if (!workflow) throw Error("WORKFLOW_NOT_FOUND");
  const fromNodeId = requiredText(
    input.fromNodeId,
    "WORKFLOW_EDGE_FROM_REQUIRED",
  );
  const toNodeId = requiredText(input.toNodeId, "WORKFLOW_EDGE_TO_REQUIRED");
  if (fromNodeId === toNodeId) throw Error("WORKFLOW_EDGE_SELF_DEPENDENCY");

  const nodes = state.workflowNodes.filter(
    (item) => item.workflowId === workflowId,
  );
  if (
    !nodes.some((item) => item.id === fromNodeId) ||
    !nodes.some((item) => item.id === toNodeId)
  ) {
    throw Error("WORKFLOW_EDGE_NODE_NOT_FOUND");
  }

  const existing = state.workflowEdges.find(
    (item) =>
      item.workflowId === workflowId &&
      item.fromNodeId === fromNodeId &&
      item.toNodeId === toNodeId,
  );
  if (existing) return { edge: existing, duplicate: true };
  assertVersion(workflow, input.expectedVersion);

  const edges = state.workflowEdges.filter(
    (item) => item.workflowId === workflowId,
  );
  if (wouldCreateCycle(edges, fromNodeId, toNodeId))
    throw Error("WORKFLOW_EDGE_CYCLE");

  const edge = {
    ...baseRecord(
      { ...input, projectId: workflow.projectId, state: "ACTIVE" },
      context,
    ),
    workflowId,
    fromNodeId,
    toNodeId,
  };
  state.workflowEdges.push(edge);
  workflow.version += 1;
  workflow.updatedAt = context.now();
  const event = context.emit("WORKFLOW_EDGE_CREATED", {
    workflowId,
    edge,
    workflowVersion: workflow.version,
  });
  attachSourceEvent(edge, event);
  return { edge, duplicate: false };
}

/**
 * Replace a workflow's dependency graph with the linear order supplied by the
 * visual editor. Unselected nodes remain valid workflow nodes but become
 * independent roots. The order is represented as adjacent edges: A -> B -> C.
 */
export function replaceWorkflowOrder(state, workflowId, input, context) {
  const workflow = state.workflows.find((item) => item.id === workflowId);
  if (!workflow) throw Error("WORKFLOW_NOT_FOUND");
  assertVersion(workflow, input.expectedVersion);
  if (!Array.isArray(input.nodeIds)) {
    throw Error("WORKFLOW_ORDER_REQUIRED");
  }

  const nodes = state.workflowNodes.filter(
    (item) => item.workflowId === workflowId,
  );
  const nodeIds = input.nodeIds.map((value) => String(value ?? "").trim());
  const known = new Set(nodes.map((node) => node.id));
  if (nodeIds.some((nodeId) => !nodeId || !known.has(nodeId))) {
    throw Error("WORKFLOW_ORDER_NODE_SET_INVALID");
  }
  if (new Set(nodeIds).size !== nodeIds.length) {
    throw Error("WORKFLOW_ORDER_NODE_SET_INVALID");
  }

  const previous = state.workflowEdges.filter(
    (edge) => edge.workflowId === workflowId,
  );
  const same =
    previous.length === Math.max(0, nodeIds.length - 1) &&
    previous.every(
      (edge, index) =>
        edge.fromNodeId === nodeIds[index] &&
        edge.toNodeId === nodeIds[index + 1],
    );
  if (same) {
    return {
      workflow,
      nodes,
      edges: previous,
      order: nodeIds,
      changed: false,
    };
  }

  const edges = [];
  for (let index = 0; index < nodeIds.length - 1; index += 1) {
    const edge = {
      ...baseRecord(
        { projectId: workflow.projectId, state: "ACTIVE" },
        context,
      ),
      workflowId,
      fromNodeId: nodeIds[index],
      toNodeId: nodeIds[index + 1],
    };
    edges.push(edge);
  }
  state.workflowEdges = state.workflowEdges
    .filter((edge) => edge.workflowId !== workflowId)
    .concat(edges);
  workflow.version += 1;
  workflow.updatedAt = context.now();
  const event = context.emit("WORKFLOW_ORDER_UPDATED", {
    workflowId,
    order: nodeIds,
    removedEdgeIds: previous.map((edge) => edge.id),
    edges,
    workflowVersion: workflow.version,
  });
  for (const edge of edges) attachSourceEvent(edge, event);
  return {
    workflow,
    nodes,
    edges,
    order: nodeIds,
    changed: true,
    eventId: event.id,
  };
}

export function getWorkflowGraph(state, workflowId) {
  const workflow = state.workflows.find((item) => item.id === workflowId);
  if (!workflow) throw Error("WORKFLOW_NOT_FOUND");
  return {
    workflow,
    nodes: state.workflowNodes.filter((item) => item.workflowId === workflowId),
    edges: state.workflowEdges.filter((item) => item.workflowId === workflowId),
  };
}

export function listWorkflowGraphs(state) {
  return state.workflows.map((workflow) =>
    getWorkflowGraph(state, workflow.id),
  );
}

export function findReadyWorkflowNodes(
  nodes,
  edges,
  completedNodeIds = [],
  scheduledNodeIds = [],
) {
  const completed = new Set(completedNodeIds);
  const scheduled = new Set(scheduledNodeIds);
  const nodeIds = new Set(nodes.map((node) => node.id));
  const predecessors = new Map(nodes.map((node) => [node.id, []]));

  for (const edge of edges) {
    if (!nodeIds.has(edge.fromNodeId) || !nodeIds.has(edge.toNodeId))
      throw Error("WORKFLOW_EXECUTION_GRAPH_INVALID");
    predecessors.get(edge.toNodeId).push(edge.fromNodeId);
  }

  return nodes.filter(
    (node) =>
      !scheduled.has(node.id) &&
      predecessors
        .get(node.id)
        .every((predecessorId) => completed.has(predecessorId)),
  );
}

export function chooseWorkflowNode(state, workflowId, requestedNodeId = null) {
  const graph = getWorkflowGraph(state, workflowId);
  if (requestedNodeId) {
    const requested = graph.nodes.find((item) => item.id === requestedNodeId);
    if (!requested) throw Error("WORKFLOW_NODE_NOT_FOUND");
    return requested;
  }
  const dependentIds = new Set(graph.edges.map((edge) => edge.toNodeId));
  const rootNode = graph.nodes.find((node) => !dependentIds.has(node.id));
  if (!rootNode) throw Error("WORKFLOW_HAS_NO_RUNNABLE_NODE");
  return rootNode;
}
