import test from "node:test";
import assert from "node:assert/strict";
import {
  addWorkflowEdge,
  addWorkflowNode,
  chooseWorkflowNode,
  createWorkflow,
  findReadyWorkflowNodes,
  listWorkflowGraphs,
  replaceWorkflowOrder,
} from "../workflow-core.mjs";
import { safeSnapshot } from "../p10-state.mjs";

function setup() {
  const state = { workflows: [], workflowNodes: [], workflowEdges: [] };
  let counter = 0;
  const context = {
    id: () => `id-${++counter}`,
    now: () => "2026-08-19T00:00:00.000Z",
    idempotencyKey: "test-key",
    emit: (type) => ({ id: `event-${type}-${++counter}` }),
  };
  return { state, context };
}

test("workflow dependencies reject cycles and duplicate edges are idempotent", () => {
  const { state, context } = setup();
  const workflow = createWorkflow(state, { title: "Build" }, context);
  const first = addWorkflowNode(
    state,
    workflow.id,
    { title: "Plan", promptTemplate: "plan", expectedVersion: 1 },
    context,
  );
  const second = addWorkflowNode(
    state,
    workflow.id,
    { title: "Implement", promptTemplate: "implement", expectedVersion: 2 },
    context,
  );
  const created = addWorkflowEdge(
    state,
    workflow.id,
    { fromNodeId: first.id, toNodeId: second.id, expectedVersion: 3 },
    context,
  );
  assert.equal(created.duplicate, false);
  assert.equal(workflow.version, 4);

  const duplicate = addWorkflowEdge(
    state,
    workflow.id,
    { fromNodeId: first.id, toNodeId: second.id, expectedVersion: 3 },
    context,
  );
  assert.equal(duplicate.duplicate, true);
  assert.equal(duplicate.edge.id, created.edge.id);
  assert.equal(workflow.version, 4);
  assert.throws(
    () =>
      addWorkflowEdge(
        state,
        workflow.id,
        { fromNodeId: second.id, toNodeId: first.id, expectedVersion: 4 },
        context,
      ),
    /WORKFLOW_EDGE_CYCLE/,
  );
  assert.equal(chooseWorkflowNode(state, workflow.id).id, first.id);
});

test("workflow mutation rejects stale versions and self dependencies", () => {
  const { state, context } = setup();
  const workflow = createWorkflow(state, { title: "Build" }, context);
  const node = addWorkflowNode(
    state,
    workflow.id,
    { title: "One", promptTemplate: "one", expectedVersion: 1 },
    context,
  );
  assert.throws(
    () =>
      addWorkflowNode(
        state,
        workflow.id,
        { title: "Stale", promptTemplate: "stale", expectedVersion: 1 },
        context,
      ),
    /WORKFLOW_VERSION_CONFLICT/,
  );
  assert.throws(
    () =>
      addWorkflowEdge(
        state,
        workflow.id,
        { fromNodeId: node.id, toNodeId: node.id, expectedVersion: 2 },
        context,
      ),
    /WORKFLOW_EDGE_SELF_DEPENDENCY/,
  );
});

test("visual workflow order replaces dependencies and records an audit event", () => {
  const { state, context } = setup();
  const workflow = createWorkflow(state, { title: "Visual order" }, context);
  const first = addWorkflowNode(
    state,
    workflow.id,
    { title: "First", promptTemplate: "first", expectedVersion: 1 },
    context,
  );
  const second = addWorkflowNode(
    state,
    workflow.id,
    { title: "Second", promptTemplate: "second", expectedVersion: 2 },
    context,
  );
  const third = addWorkflowNode(
    state,
    workflow.id,
    { title: "Third", promptTemplate: "third", expectedVersion: 3 },
    context,
  );

  const result = replaceWorkflowOrder(
    state,
    workflow.id,
    {
      nodeIds: [third.id, first.id, second.id],
      expectedVersion: 4,
    },
    context,
  );
  assert.equal(result.changed, true);
  assert.deepEqual(result.order, [third.id, first.id, second.id]);
  assert.deepEqual(
    state.workflowEdges.map((edge) => [edge.fromNodeId, edge.toNodeId]),
    [
      [third.id, first.id],
      [first.id, second.id],
    ],
  );
  assert.equal(workflow.version, 5);

  const unchanged = replaceWorkflowOrder(
    state,
    workflow.id,
    {
      nodeIds: [third.id, first.id, second.id],
      expectedVersion: 5,
    },
    context,
  );
  assert.equal(unchanged.changed, false);
  assert.throws(
    () =>
      replaceWorkflowOrder(
        state,
        workflow.id,
        {
          nodeIds: [first.id, first.id, second.id],
          expectedVersion: 5,
        },
        context,
      ),
    /WORKFLOW_ORDER_NODE_SET_INVALID/,
  );
});

test("visual order may remove boxes and leave unselected nodes independent", () => {
  const { state, context } = setup();
  const workflow = createWorkflow(state, { title: "Partial order" }, context);
  const first = addWorkflowNode(
    state,
    workflow.id,
    { title: "First", promptTemplate: "first", expectedVersion: 1 },
    context,
  );
  const second = addWorkflowNode(
    state,
    workflow.id,
    { title: "Second", promptTemplate: "second", expectedVersion: 2 },
    context,
  );
  const third = addWorkflowNode(
    state,
    workflow.id,
    { title: "Third", promptTemplate: "third", expectedVersion: 3 },
    context,
  );
  const partial = replaceWorkflowOrder(
    state,
    workflow.id,
    { nodeIds: [second.id, first.id], expectedVersion: 4 },
    context,
  );
  assert.deepEqual(
    partial.edges.map((edge) => [edge.fromNodeId, edge.toNodeId]),
    [[second.id, first.id]],
  );
  const cleared = replaceWorkflowOrder(
    state,
    workflow.id,
    { nodeIds: [], expectedVersion: 5 },
    context,
  );
  assert.deepEqual(cleared.edges, []);
  assert.equal(state.workflowNodes.length, 3);
  assert.equal(third.workflowId, workflow.id);
});

test("ready nodes require every predecessor and are returned only once", () => {
  const nodes = [{ id: "plan" }, { id: "review" }, { id: "publish" }];
  const edges = [
    { fromNodeId: "plan", toNodeId: "publish" },
    { fromNodeId: "review", toNodeId: "publish" },
  ];

  assert.deepEqual(
    findReadyWorkflowNodes(nodes, edges).map((node) => node.id),
    ["plan", "review"],
  );
  assert.deepEqual(
    findReadyWorkflowNodes(nodes, edges, ["plan"], ["plan", "review"]),
    [],
  );
  assert.deepEqual(
    findReadyWorkflowNodes(
      nodes,
      edges,
      ["plan", "review"],
      ["plan", "review"],
    ).map((node) => node.id),
    ["publish"],
  );
  assert.deepEqual(
    findReadyWorkflowNodes(
      nodes,
      edges,
      ["plan", "review"],
      ["plan", "review", "publish"],
    ),
    [],
  );
  assert.throws(
    () =>
      findReadyWorkflowNodes(nodes, [
        { fromNodeId: "missing", toNodeId: "publish" },
      ]),
    /WORKFLOW_EXECUTION_GRAPH_INVALID/,
  );
});

test("event snapshots omit runtime process and timer objects", () => {
  const timer = setInterval(() => {}, 1000);
  try {
    const snapshot = safeSnapshot({
      run: {
        id: "run-1",
        timer,
        process: { pid: 42 },
        childProcess: { pid: 43 },
      },
    });
    assert.equal(snapshot.run.id, "run-1");
    assert.equal("timer" in snapshot.run, false);
    assert.equal("process" in snapshot.run, false);
    assert.equal("childProcess" in snapshot.run, false);
    assert.doesNotMatch(JSON.stringify(snapshot), /_idleTimeout|pid/);
  } finally {
    clearInterval(timer);
  }
});

test("workflow validation covers malformed graphs and bounded fields", () => {
  const { state, context } = setup();
  assert.throws(
    () => createWorkflow(state, { title: "" }, context),
    /WORKFLOW_TITLE_REQUIRED/,
  );
  assert.throws(
    () =>
      createWorkflow(
        state,
        { title: "x", description: "d".repeat(8001) },
        context,
      ),
    /WORKFLOW_DESCRIPTION_TOO_LONG/,
  );
  const workflow = createWorkflow(state, { title: "Validated" }, context);
  assert.throws(
    () =>
      addWorkflowNode(
        state,
        workflow.id,
        { title: "", promptTemplate: "x", expectedVersion: 1 },
        context,
      ),
    /WORKFLOW_NODE_TITLE_REQUIRED/,
  );
  const node = addWorkflowNode(
    state,
    workflow.id,
    {
      title: "Node",
      promptTemplate: "x",
      expectedVersion: 1,
      timeoutMs: 1000,
      noProgressTimeoutMs: 1000,
      tokenBudget: 100,
      costBudget: 1,
    },
    context,
  );
  assert.throws(
    () =>
      addWorkflowNode(
        state,
        workflow.id,
        {
          title: "Bad action",
          promptTemplate: "x",
          action: "TERMINATE",
          expectedVersion: 2,
        },
        context,
      ),
    /WORKFLOW_NODE_ACTION_INVALID/,
  );
  assert.throws(
    () =>
      addWorkflowEdge(
        state,
        workflow.id,
        { fromNodeId: "missing", toNodeId: node.id, expectedVersion: 2 },
        context,
      ),
    /WORKFLOW_EDGE_NODE_NOT_FOUND/,
  );
  assert.throws(
    () =>
      replaceWorkflowOrder(state, workflow.id, { expectedVersion: 2 }, context),
    /WORKFLOW_ORDER_REQUIRED/,
  );
  assert.throws(
    () =>
      replaceWorkflowOrder(
        state,
        workflow.id,
        { nodeIds: ["missing"], expectedVersion: 2 },
        context,
      ),
    /WORKFLOW_ORDER_NODE_SET_INVALID/,
  );
  assert.equal(listWorkflowGraphs(state).length, 1);
  assert.equal(chooseWorkflowNode(state, workflow.id, node.id).id, node.id);
  assert.throws(
    () => chooseWorkflowNode(state, "missing"),
    /WORKFLOW_NOT_FOUND/,
  );
});
