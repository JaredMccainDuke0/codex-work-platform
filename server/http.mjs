export const MAX_REQUEST_BYTES = 4 * 1024 * 1024;

export function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

export async function readJsonBody(req, { maxBytes = MAX_REQUEST_BYTES } = {}) {
  const declared = Number(req.headers["content-length"]);
  if (Number.isSafeInteger(declared) && declared > maxBytes)
    throw Error("REQUEST_BODY_TOO_LARGE");
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > maxBytes) throw Error("REQUEST_BODY_TOO_LARGE");
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  if (!text) return {};
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed))
    throw Error("REQUEST_BODY_OBJECT_REQUIRED");
  return parsed;
}

export function queryInteger(value, fallback, minimum, maximum) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, parsed));
}

export function originAllowed(origin, { host, port }) {
  const value = String(origin ?? "");
  return (
    !value ||
    [
      `http://${host}:${port}`,
      `http://localhost:${port}`,
      `http://[::1]:${port}`,
    ].includes(value)
  );
}
