import test from "node:test";
import assert from "node:assert/strict";
import {
  boundedText,
  enumValue,
  finiteNumber,
  finiteInteger,
  validateConversationPrompt,
  validateRunInput,
} from "../validation.mjs";

test("run validation applies safe defaults and rejects invalid limits", () => {
  const value = validateRunInput({ title: "demo", prompt: "inspect only" });
  assert.equal(value.adapter, "mock");
  assert.equal(value.maxAttempts, 2);
  assert.equal(value.timeoutMs, 30 * 60 * 1000);
  assert.throws(
    () => validateRunInput({ title: "x", prompt: "y", maxAttempts: 99 }),
    /RUN_ATTEMPTS_INVALID/,
  );
  assert.throws(
    () => validateRunInput({ title: "x", prompt: "y", action: "UNKNOWN" }),
    /RUN_ACTION_INVALID/,
  );
});

test("bounded text and conversation prompts have deterministic limits", () => {
  assert.equal(boundedText("  ok  ", "X", 10), "ok");
  assert.throws(() => boundedText("x".repeat(11), "X", 10), /X_TOO_LONG/);
  assert.throws(
    () => validateConversationPrompt(""),
    /CONVERSATION_PROMPT_REQUIRED/,
  );
  assert.throws(
    () => validateConversationPrompt("x".repeat(256_001)),
    /CONVERSATION_PROMPT_REQUIRED_TOO_LONG/,
  );
  assert.equal(finiteInteger(undefined, "X", { fallback: 4 }), 4);
  assert.equal(finiteInteger(3, "X", { min: 1, max: 4 }), 3);
  assert.equal(finiteNumber(undefined, "X", { fallback: 2 }), 2);
  assert.equal(finiteNumber(1.5, "X", { min: 0 }), 1.5);
  assert.equal(enumValue(undefined, ["auto"], "X", "auto"), "auto");
  assert.throws(() => finiteInteger("not-a-number", "X"), /X/);
  assert.throws(() => finiteNumber(-1, "X", { min: 0 }), /X/);
  assert.throws(() => enumValue("bad", ["ok"], "X"), /X/);
});
