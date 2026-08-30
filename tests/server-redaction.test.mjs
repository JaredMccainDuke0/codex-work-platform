import test from "node:test";
import assert from "node:assert/strict";
import { cleanSnapshot, redactSecretsDeep } from "../server/redaction.mjs";

test("server redaction removes sensitive keys and token-like strings", () => {
  const token = ["sk", "server-secret-value-1234567890"].join("-");
  const clean = redactSecretsDeep({
    authorization: "private-value",
    nested: { summary: `token=${token}` },
  });
  assert.equal(clean.authorization, "[REDACTED]");
  assert.doesNotMatch(JSON.stringify(clean), /server-secret-value/);
});

test("clean snapshots remove runtime objects and cycles", () => {
  const value = { id: "run-1", process: { pid: 1 } };
  value.self = value;
  const clean = cleanSnapshot(value);
  assert.equal(clean.id, "run-1");
  assert.equal(clean.process, undefined);
  assert.equal(clean.self, "[circular]");
});
