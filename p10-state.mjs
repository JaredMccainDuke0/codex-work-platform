const OMIT_KEYS = new Set([
  "timer",
  "process",
  "child",
  "childProcess",
  "stdin",
  "stdout",
  "stderr",
]);

export function safeSnapshot(value) {
  const seen = new WeakSet();

  function visit(current, key = "", depth = 0) {
    if (OMIT_KEYS.has(key) || key.startsWith("_")) return undefined;
    if (depth > 40) return "[depth-limit]";
    if (
      current === null ||
      typeof current === "string" ||
      typeof current === "boolean"
    )
      return current;
    if (typeof current === "number")
      return Number.isFinite(current) ? current : null;
    if (typeof current === "bigint") return current.toString();
    if (
      typeof current === "undefined" ||
      typeof current === "function" ||
      typeof current === "symbol"
    )
      return undefined;
    if (current instanceof Date) return current.toISOString();
    if (Buffer.isBuffer(current)) return `[buffer:${current.length}]`;
    if (typeof current !== "object") return String(current);
    if (seen.has(current)) return "[circular]";
    seen.add(current);

    if (Array.isArray(current)) {
      return current
        .map((item) => visit(item, "", depth + 1))
        .filter((item) => item !== undefined);
    }

    const prototype = Object.getPrototypeOf(current);
    if (prototype !== Object.prototype && prototype !== null)
      return `[runtime:${current.constructor?.name ?? "object"}]`;

    const result = {};
    for (const [childKey, childValue] of Object.entries(current)) {
      const clean = visit(childValue, childKey, depth + 1);
      if (clean !== undefined) result[childKey] = clean;
    }
    return result;
  }

  return visit(value) ?? null;
}

export function normalizePersistedState(input) {
  const state = safeSnapshot(input && typeof input === "object" ? input : {});
  state.schemaVersion =
    Number.isInteger(state.schemaVersion) && state.schemaVersion > 0
      ? state.schemaVersion
      : 1;
  state.runs = Array.isArray(state.runs) ? state.runs : [];
  state.approvals = Array.isArray(state.approvals) ? state.approvals : [];
  state.events = Array.isArray(state.events) ? state.events : [];
  state.artifacts = Array.isArray(state.artifacts) ? state.artifacts : [];
  state.executionLogs = Array.isArray(state.executionLogs)
    ? state.executionLogs
    : [];
  state.operatorActions = Array.isArray(state.operatorActions)
    ? state.operatorActions
    : [];
  state.workflows = Array.isArray(state.workflows) ? state.workflows : [];
  state.workflowExecutions = Array.isArray(state.workflowExecutions)
    ? state.workflowExecutions
    : [];
  state.workflowNodes = Array.isArray(state.workflowNodes)
    ? state.workflowNodes
    : [];
  state.workflowEdges = Array.isArray(state.workflowEdges)
    ? state.workflowEdges
    : [];
  state.settings =
    state.settings && typeof state.settings === "object" ? state.settings : {};
  state.projectDirectories =
    state.projectDirectories && typeof state.projectDirectories === "object"
      ? state.projectDirectories
      : {};
  state.idempotency =
    state.idempotency && typeof state.idempotency === "object"
      ? state.idempotency
      : {};
  return state;
}
