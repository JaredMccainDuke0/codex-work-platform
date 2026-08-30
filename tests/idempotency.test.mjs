import test from "node:test";
import assert from "node:assert/strict";
import { createIdempotencyExecutor } from "../server/idempotency.mjs";

test("idempotency executor coalesces and caches supplied keys", async () => {
  const state = { idempotency: {} };
  let calls = 0;
  let saves = 0;
  const execute = createIdempotencyExecutor({
    state,
    save: () => {
      saves += 1;
    },
    cleanSnapshot: (value) => structuredClone(value),
    createKey: () => "generated",
    now: () => "2026-08-30T00:00:00.000Z",
  });
  const input = {
    method: "POST",
    url: "/runs",
    suppliedKey: "retry-1",
    status: 201,
    handler: async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 5));
      return { ok: true };
    },
  };
  const [first, second] = await Promise.all([execute(input), execute(input)]);
  assert.deepEqual(first.body, { ok: true });
  assert.deepEqual(second.body, { ok: true });
  assert.equal(calls, 1);
  assert.equal(saves, 1);
  await execute(input);
  assert.equal(calls, 1);
});

test("idempotency executor bounds cache entries and validates keys", async () => {
  const state = { idempotency: {} };
  let sequence = 0;
  const execute = createIdempotencyExecutor({
    state,
    save: () => {},
    cleanSnapshot: (value) => value,
    createKey: () => `generated-${sequence++}`,
    now: () => `2026-08-30T00:00:0${sequence}.000Z`,
    maxEntries: 2,
  });
  for (const key of ["one", "two", "three"])
    await execute({
      method: "POST",
      url: "/runs",
      suppliedKey: key,
      status: 201,
      handler: async () => ({ key }),
    });
  assert.equal(Object.keys(state.idempotency).length, 2);
  await assert.rejects(
    execute({
      method: "POST",
      url: "/runs",
      suppliedKey: "bad\nkey",
      status: 201,
      handler: async () => ({}),
    }),
    /IDEMPOTENCY_KEY_INVALID/,
  );
});
