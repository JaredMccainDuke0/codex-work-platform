import { redactSecrets } from "../codex-adapter.mjs";

export function statusForError(code) {
  if (code === "Unexpected end of JSON input" || code.includes("JSON"))
    return 400;
  if (code === "REQUEST_TOKEN_REQUIRED" || code === "ORIGIN_NOT_ALLOWED")
    return 403;
  if (code === "EVENT_STREAM_LIMIT_REACHED") return 429;
  if (code === "REQUEST_BODY_TOO_LARGE") return 413;
  if (code === "REQUEST_URL_TOO_LONG") return 414;
  if (code === "REQUEST_CONCURRENCY_LIMIT") return 429;
  if (code === "REQUEST_BODY_OBJECT_REQUIRED") return 400;
  if (code === "REQUEST_TIMEOUT") return 504;
  if (
    code === "COMPAT_RESPONSE_INVALID" ||
    code === "UPSTREAM_RESPONSE_TOO_LARGE"
  )
    return 502;
  if (code === "COMPAT_UNAVAILABLE") return 503;
  if (code === "CONVERSATION_NOT_FOUND") return 410;
  if (code.endsWith("_NOT_FOUND")) return 404;
  if (
    /(REQUIRED|INVALID|OUTSIDE_ALLOWED_ROOT|SENSITIVE_DIRECTORY_FORBIDDEN|PROJECT_ROOT_|PROJECT_DIRECTORY_)/.test(
      code,
    )
  )
    return 400;
  if (
    /(CONFLICT|CYCLE|SELF_DEPENDENCY|NOT_PENDING|NOT_RUNNING|NOT_PAUSED|NOT_TERMINABLE|NOT_VERIFYING|NOT_DISPATCHABLE|NOT_RETRYABLE|RETRY_LIMIT_REACHED|APPROVAL_REQUIRED|ALREADY_RUNNING|EXPIRED)$/.test(
      code,
    )
  )
    return 409;
  if (
    /^(CODEX_CLI_NOT_AVAILABLE|CODEX_CLI_NOT_AUTHENTICATED|CODEX_NETWORK_POLICY_NOT_CONFIGURED)/.test(
      code,
    )
  )
    return 503;
  return 503;
}

export function publicErrorCode(error) {
  const raw = redactSecrets(error?.message || String(error || "INTERNAL_ERROR"))
    .replace(/[\r\n]+/g, " ")
    .trim();
  if (/^[A-Z][A-Z0-9_]*$/.test(raw)) return raw;
  const prefix = raw.match(/^([A-Z][A-Z0-9_]*):/);
  if (prefix) return prefix[1];
  if (/no rollout found|thread not loaded|conversation.*not found/i.test(raw))
    return "CONVERSATION_NOT_FOUND";
  if (/timed? out|timeout/i.test(raw)) return "REQUEST_TIMEOUT";
  return "INTERNAL_ERROR";
}
