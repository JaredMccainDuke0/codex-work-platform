import test from "node:test";
import assert from "node:assert/strict";
import { CompatClient } from "../server/compat-client.mjs";

test("compat client bounds JSON requests and preserves proxy metadata", async () => {
  let observed = null;
  const client = new CompatClient({
    baseUrl: "http://127.0.0.1:19737",
    fetchImpl: async (url, init) => {
      observed = { url: String(url), init };
      return new Response(JSON.stringify({ ok: true, value: 3 }), {
        status: 201,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    },
  });
  const json = await client.requestJson("/api/test", {
    method: "POST",
    body: JSON.stringify({ input: true }),
  });
  assert.equal(json.status, 201);
  assert.equal(json.payload.value, 3);

  const proxied = await client.proxy({
    url: "/api/test",
    method: "POST",
    idempotencyKey: "retry-1",
    body: { input: true },
  });
  assert.equal(proxied.status, 201);
  assert.equal(observed.init.headers["idempotency-key"], "retry-1");
  assert.deepEqual(JSON.parse(observed.init.body), { input: true });
});

test("compat client fails closed on cross-origin and oversized responses", async () => {
  assert.throws(
    () =>
      new CompatClient({
        baseUrl: "http://127.0.0.1:19737",
        responseLimit: 0,
      }),
    /COMPAT_RESPONSE_LIMIT_INVALID/,
  );
  const client = new CompatClient({
    baseUrl: "http://127.0.0.1:19737",
    responseLimit: 3,
    fetchImpl: async () => new Response("large"),
  });
  assert.throws(
    () => client.target("https://example.com/api"),
    /COMPAT_ORIGIN_INVALID/,
  );
  await assert.rejects(
    client.request("/api/test"),
    /UPSTREAM_RESPONSE_TOO_LARGE/,
  );
});

test("compat readiness returns a safe degraded status", async () => {
  const ready = new CompatClient({
    baseUrl: "http://127.0.0.1:19737",
    fetchImpl: async () => new Response('{"ok":true}', { status: 200 }),
  });
  assert.deepEqual(await ready.ready(), { ok: true, status: 200 });

  const unavailable = new CompatClient({
    baseUrl: "http://127.0.0.1:19737",
    fetchImpl: async () => {
      throw Error("private network detail");
    },
  });
  assert.deepEqual(await unavailable.ready(), {
    ok: false,
    code: "COMPAT_UNAVAILABLE",
  });
});
