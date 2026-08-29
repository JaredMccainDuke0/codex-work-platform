export const LIMITS = Object.freeze({
  title: 200,
  description: 8_000,
  prompt: 256_000,
  model: 128,
  path: 4_096,
  idempotencyKey: 200,
  reason: 8_000,
});

export function boundedText(value, code, limit, { required = false } = {}) {
  const text = String(value ?? "").trim();
  if (required && !text) throw Error(code);
  if (text.length > limit) throw Error(`${code}_TOO_LONG`);
  return text;
}

export function finiteInteger(
  value,
  code,
  { min = 0, max = Number.MAX_SAFE_INTEGER, fallback = null } = {},
) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max)
    throw Error(code);
  return parsed;
}

export function finiteNumber(
  value,
  code,
  { min = 0, max = Number.MAX_VALUE, fallback = null } = {},
) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max)
    throw Error(code);
  return parsed;
}

export function enumValue(value, allowed, code, fallback) {
  const normalized = String(value ?? fallback ?? "").trim();
  if (!allowed.includes(normalized)) throw Error(code);
  return normalized;
}

export function validateRunInput(input = {}) {
  return {
    title: boundedText(
      input.title ?? "P10 run",
      "RUN_TITLE_REQUIRED",
      LIMITS.title,
      { required: true },
    ),
    prompt: boundedText(
      input.prompt ?? input.title ?? "P10 run",
      "CODEX_PROMPT_REQUIRED",
      LIMITS.prompt,
      { required: true },
    ),
    action: enumValue(
      String(input.action ?? "RUN").toUpperCase(),
      [
        "RUN",
        "FILE_WRITE",
        "COMMAND",
        "NETWORK",
        "TERMINATE",
        "RESUME",
        "TAKEOVER",
        "COMPLETE",
        "EXPORT",
      ],
      "RUN_ACTION_INVALID",
      "RUN",
    ),
    adapter: enumValue(
      input.adapter ?? "mock",
      ["mock", "local-codex-cli", "local-codex-app-server"],
      "CODEX_ADAPTER_INVALID",
      "mock",
    ),
    model:
      boundedText(input.model ?? "auto", "RUN_MODEL_INVALID", LIMITS.model) ||
      "auto",
    reasoningEffort: enumValue(
      String(input.reasoningEffort ?? "auto").toLowerCase(),
      ["auto", "none", "minimal", "low", "medium", "high", "xhigh"],
      "RUN_REASONING_EFFORT_INVALID",
      "auto",
    ),
    delegation: enumValue(
      String(input.delegation ?? "DISABLED").toUpperCase(),
      ["DISABLED", "AUTO"],
      "RUN_DELEGATION_POLICY_INVALID",
      "DISABLED",
    ),
    maxSubagents: finiteInteger(
      input.maxSubagents,
      "RUN_SUBAGENT_LIMIT_INVALID",
      { min: 1, max: 6, fallback: 4 },
    ),
    maxAttempts: finiteInteger(input.maxAttempts, "RUN_ATTEMPTS_INVALID", {
      min: 1,
      max: 5,
      fallback: 2,
    }),
    timeoutMs: finiteInteger(input.timeoutMs, "RUN_TIMEOUT_INVALID", {
      min: 100,
      max: 24 * 60 * 60 * 1000,
      fallback: 30 * 60 * 1000,
    }),
    noProgressTimeoutMs: finiteInteger(
      input.noProgressTimeoutMs,
      "RUN_NO_PROGRESS_TIMEOUT_INVALID",
      { min: 100, max: 24 * 60 * 60 * 1000, fallback: 5 * 60 * 1000 },
    ),
    tokenBudget: finiteInteger(input.tokenBudget, "RUN_TOKEN_BUDGET_INVALID", {
      min: 1,
      max: Number.MAX_SAFE_INTEGER,
      fallback: null,
    }),
    costBudget: finiteNumber(input.costBudget, "RUN_COST_BUDGET_INVALID", {
      min: 0.000001,
      fallback: null,
    }),
  };
}

export function validateConversationPrompt(value) {
  return boundedText(value, "CONVERSATION_PROMPT_REQUIRED", LIMITS.prompt, {
    required: true,
  });
}
