const args = process.argv.slice(2);

if (args.includes("--version")) {
  console.log("codex-cli 9.9.9-test");
  process.exit(0);
}

if (args.includes("login") && args.includes("status")) {
  if (process.env.FAKE_CODEX_AUTH === "0") {
    console.error("Not logged in");
    process.exit(1);
  }
  console.log(process.env.FAKE_CODEX_LOGIN_LABEL ?? "Logged in using ChatGPT");
  process.exit(0);
}

if (args.includes("exec") && args.includes("--help")) {
  console.log("Usage: codex exec --json --ignore-user-config --ignore-rules");
  process.exit(0);
}

if (
  process.env.FAKE_CODEX_REQUIRE_ISOLATION === "1" &&
  args.includes("exec") &&
  (!args.includes("--ignore-user-config") || !args.includes("--ignore-rules"))
) {
  console.error("fixture isolation flags missing");
  process.exit(9);
}

let prompt = "";
for await (const chunk of process.stdin) prompt += chunk;
const mode = process.env.FAKE_CODEX_MODE ?? "success";
const send = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);
const executionProbe = prompt.includes("CODEX_WORK_PLATFORM_PROBE_OK");

if (executionProbe && process.env.FAKE_CODEX_REQUIRE_LOW_REASONING === "1") {
  const lowReasoning = args.some(
    (value, index) =>
      value === "-c" && args[index + 1] === 'model_reasoning_effort="low"',
  );
  if (!lowReasoning) {
    console.error("fixture low-reasoning probe override missing");
    process.exit(10);
  }
}

send({ type: "thread.started", thread_id: "019test-thread" });
send({ type: "turn.started" });

if (mode === "probe-failure") {
  send({ type: "turn.failed", error: { message: "fixture failure" } });
  process.exit(7);
}
if (executionProbe) {
  send({
    type: "item.completed",
    item: {
      id: "probe-item",
      type: "agent_message",
      text: "CODEX_WORK_PLATFORM_PROBE_OK",
    },
  });
  send({
    type: "turn.completed",
    usage: { input_tokens: 1, output_tokens: 1 },
  });
  process.exit(0);
}
if (mode === "nonzero") {
  send({ type: "turn.failed", error: { message: "fixture failure" } });
  process.exit(7);
}

if (mode === "transient")
  send({ type: "error", message: "temporary reconnect warning" });

send({
  type: "item.completed",
  item: {
    id: "item-1",
    type: "agent_message",
    text: `handled ${prompt.trim()}`,
  },
});
if (mode === "disconnect") process.exit(0);
send({
  type: "turn.completed",
  usage: {
    input_tokens: 10,
    cached_input_tokens: 2,
    output_tokens: 4,
    reasoning_output_tokens: 1,
  },
});
process.exit(0);
