export function createIdempotencyExecutor({
  state,
  save,
  cleanSnapshot,
  now = () => new Date().toISOString(),
  createKey,
  maxEntries = 2000,
}) {
  if (typeof createKey !== "function")
    throw Error("IDEMPOTENCY_KEY_FACTORY_REQUIRED");
  const inflight = new Map();

  return async function execute({ method, url, suppliedKey, status, handler }) {
    const normalizedKey = String(suppliedKey ?? "").trim();
    if (normalizedKey.length > 200) throw Error("IDEMPOTENCY_KEY_TOO_LONG");
    if (/[\r\n\0]/.test(normalizedKey)) throw Error("IDEMPOTENCY_KEY_INVALID");
    const key = normalizedKey || createKey();
    const scope = `${method}:${url}:${key}`;
    if (normalizedKey && state.idempotency[scope])
      return state.idempotency[scope];
    if (normalizedKey && inflight.has(scope)) return inflight.get(scope);

    const operation = (async () => {
      const responseBody = await handler(key);
      const result = { status, body: cleanSnapshot(responseBody) };
      if (normalizedKey) {
        state.idempotency[scope] = {
          ...result,
          createdAt: now(),
        };
        const keys = Object.keys(state.idempotency);
        if (keys.length > maxEntries) {
          keys.sort((left, right) =>
            String(state.idempotency[left]?.createdAt || "").localeCompare(
              String(state.idempotency[right]?.createdAt || ""),
            ),
          );
          for (const oldKey of keys.slice(0, keys.length - maxEntries))
            delete state.idempotency[oldKey];
        }
        save();
      }
      return result;
    })();
    if (normalizedKey) inflight.set(scope, operation);
    try {
      return await operation;
    } finally {
      if (normalizedKey) inflight.delete(scope);
    }
  };
}
