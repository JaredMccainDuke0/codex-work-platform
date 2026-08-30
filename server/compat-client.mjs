const DEFAULT_RESPONSE_LIMIT = 8 * 1024 * 1024;

export class CompatClient {
  constructor({
    baseUrl,
    endpoint = new URL(baseUrl),
    fetchImpl = globalThis.fetch,
    responseLimit = DEFAULT_RESPONSE_LIMIT,
  }) {
    if (typeof fetchImpl !== "function") throw Error("COMPAT_FETCH_REQUIRED");
    if (!Number.isSafeInteger(responseLimit) || responseLimit < 1)
      throw Error("COMPAT_RESPONSE_LIMIT_INVALID");
    this.baseUrl = String(baseUrl);
    this.endpoint = endpoint;
    this.fetchImpl = fetchImpl;
    this.responseLimit = responseLimit;
  }

  target(relativePath) {
    const target = new URL(relativePath, this.baseUrl);
    if (target.origin !== this.endpoint.origin)
      throw Error("COMPAT_ORIGIN_INVALID");
    return target;
  }

  async request(
    relativePath,
    { method = "GET", headers = {}, body, timeoutMs = 10_000 } = {},
  ) {
    let response;
    try {
      response = await this.fetchImpl(this.target(relativePath), {
        method,
        headers,
        ...(body === undefined ? {} : { body }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      if (error?.message === "COMPAT_ORIGIN_INVALID") throw error;
      throw Error("COMPAT_UNAVAILABLE");
    }
    let bytes;
    try {
      bytes = Buffer.from(await response.arrayBuffer());
    } catch {
      throw Error("COMPAT_UNAVAILABLE");
    }
    if (bytes.length > this.responseLimit)
      throw Error("UPSTREAM_RESPONSE_TOO_LARGE");
    return { response, bytes };
  }

  async requestJson(relativePath, options = {}) {
    const { response, bytes } = await this.request(relativePath, options);
    let payload;
    try {
      payload = bytes.length ? JSON.parse(bytes.toString("utf8")) : {};
    } catch {
      throw Error("COMPAT_RESPONSE_INVALID");
    }
    return { ok: response.ok, status: response.status, payload };
  }

  async proxy({ url, method, accept, contentType, idempotencyKey, body }) {
    const headers = {
      accept: accept ?? "*/*",
      "content-type": contentType ?? "application/json",
      ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
    };
    const { response, bytes } = await this.request(url, {
      method,
      headers,
      body: ["GET", "HEAD"].includes(method) ? undefined : JSON.stringify(body),
    });
    return {
      status: response.status,
      contentType: response.headers.get("content-type") ?? "application/json",
      bytes,
    };
  }

  async ready() {
    try {
      const { ok, status, payload } = await this.requestJson("/healthz", {
        timeoutMs: 1500,
      });
      return { ok: ok && payload?.ok === true, status };
    } catch (error) {
      return {
        ok: false,
        code:
          error?.message === "COMPAT_RESPONSE_INVALID"
            ? "COMPAT_RESPONSE_INVALID"
            : "COMPAT_UNAVAILABLE",
      };
    }
  }
}
