#!/usr/bin/env node
let buffer = "";
let threadCounter = 0;
const threadId = "019fake-thread";
const send = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() || "";
  for (const line of lines) {
    if (!line.trim()) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    if (message.method === "initialize") {
      send({ id: message.id, result: { protocolVersion: "2025-11-25" } });
      continue;
    }
    if (message.method === "model/list") {
      send({
        id: message.id,
        result: {
          models: [
            {
              id: "gpt-test",
              displayName: "Test model",
              supportedReasoningEfforts: ["low"],
            },
          ],
        },
      });
      continue;
    }
    if (
      message.method === "thread/start" ||
      message.method === "thread/resume"
    ) {
      send({ id: message.id, result: { thread: { id: threadId } } });
      continue;
    }
    if (message.method === "thread/read") {
      send({
        id: message.id,
        result: {
          thread: {
            id: threadId,
            turns: [
              {
                id: "turn-1",
                status: "completed",
                items: [{ type: "agent_message", text: "fake response" }],
              },
            ],
          },
        },
      });
      continue;
    }
    if (message.method === "turn/start") {
      threadCounter += 1;
      send({
        id: message.id,
        result: { turn: { id: `turn-${threadCounter}`, status: "inProgress" } },
      });
      setTimeout(
        () =>
          send({
            method: "turn/started",
            params: { threadId, turn: { id: `turn-${threadCounter}` } },
          }),
        5,
      );
      setTimeout(
        () =>
          send({
            method: "item/agentMessage/delta",
            params: { threadId, delta: "fake response" },
          }),
        10,
      );
      setTimeout(
        () =>
          send({
            method: "turn/completed",
            params: {
              threadId,
              turn: { id: `turn-${threadCounter}`, status: "completed" },
            },
          }),
        20,
      );
      continue;
    }
    if (message.method === "turn/interrupt") {
      send({ id: message.id, result: {} });
      continue;
    }
    if (message.id !== undefined) send({ id: message.id, result: {} });
  }
});
