import { redactSecrets } from "../codex-adapter.mjs";
import { safeSnapshot } from "../p10-state.mjs";

const sensitiveKey =
  /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|authorization|cookie)/i;

export function redactSecretsDeep(value, key = "") {
  if (sensitiveKey.test(String(key))) return "[REDACTED]";
  if (typeof value === "string") return redactSecrets(value);
  if (Array.isArray(value))
    return value.map((item) => redactSecretsDeep(item, key));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([childKey, child]) => [
      childKey,
      redactSecretsDeep(child, childKey),
    ]),
  );
}

export const cleanSnapshot = (value) => redactSecretsDeep(safeSnapshot(value));
