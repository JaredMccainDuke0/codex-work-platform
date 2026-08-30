import os from "node:os";
import path from "node:path";
import { loadOfficialChatGptConfig } from "../codex-adapter.mjs";

const allowedArguments = new Set([
  "--allow-web-search",
  "--auto-approve-high-risk",
  "--codex-command",
  "--codex-home",
  "--compat-base",
  "--control-db",
  "--db",
  "--default-no-progress-timeout-ms",
  "--default-run-timeout-ms",
  "--instance-id",
  "--port",
  "--request-token",
  "--shutdown-token",
  "--tick-ms",
  "--watchdog-ms",
  "--workspace-root",
]);

function parseArguments(argv) {
  const args = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const flag = argv[index];
    const value = argv[index + 1];
    if (
      !flag?.startsWith("--") ||
      value === undefined ||
      value.startsWith("--")
    )
      throw Error(`INVALID_ARGUMENTS_AT:${index}`);
    if (!allowedArguments.has(flag)) throw Error(`ARGUMENT_UNKNOWN:${flag}`);
    if (args.has(flag)) throw Error(`ARGUMENT_DUPLICATE:${flag}`);
    args.set(flag, value);
  }
  return args;
}

function positiveInteger(value, fallback, code, minimum = 100) {
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum) throw Error(code);
  return parsed;
}

function booleanArgument(args, name, fallback) {
  const value = args.get(name);
  if (value === undefined) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw Error(`ARGUMENT_BOOLEAN_INVALID:${name}`);
}

function validateCompatBase(value) {
  try {
    const endpoint = new URL(value);
    if (
      endpoint.protocol !== "http:" ||
      endpoint.username ||
      endpoint.password ||
      endpoint.search ||
      endpoint.hash ||
      !["127.0.0.1", "localhost", "[::1]", "::1"].includes(
        endpoint.hostname.toLowerCase(),
      )
    )
      throw Error("COMPAT_BASE_NOT_LOOPBACK");
    return endpoint;
  } catch (error) {
    if (error?.message === "COMPAT_BASE_NOT_LOOPBACK") throw error;
    throw Error("COMPAT_BASE_INVALID");
  }
}

export function loadControlConfig(
  argv = process.argv.slice(2),
  { cwd = process.cwd(), env = process.env, home = os.homedir() } = {},
) {
  const args = parseArguments(argv);
  const host = "127.0.0.1";
  const port = Number(args.get("--port") ?? 19738);
  if (!Number.isInteger(port) || port < 1 || port > 65535)
    throw Error("PORT_INVALID");

  const compatBase = args.get("--compat-base") ?? "http://127.0.0.1:19737";
  const compatEndpoint = validateCompatBase(compatBase);
  const db = path.resolve(cwd, args.get("--db") ?? "./platform.sqlite");
  const controlDatabasePath = path.resolve(
    cwd,
    args.get("--control-db") ?? `${db}.p10.sqlite`,
  );
  const comparable = (value) =>
    process.platform === "win32" ? value.toLowerCase() : value;
  if (comparable(controlDatabasePath) === comparable(db))
    throw Error("CONTROL_DB_MUST_BE_SEPARATE");

  const requestToken = String(args.get("--request-token") ?? "");
  const shutdownToken = String(args.get("--shutdown-token") ?? requestToken);
  if (
    requestToken.length > 256 ||
    shutdownToken.length > 256 ||
    /[\r\n\0]/.test(requestToken) ||
    /[\r\n\0]/.test(shutdownToken)
  )
    throw Error("REQUEST_TOKEN_INVALID");

  const workspaceRoot = path.resolve(cwd, args.get("--workspace-root") ?? cwd);
  const codexHome = path.resolve(
    args.get("--codex-home") ?? env.CODEX_HOME ?? path.join(home, ".codex"),
  );

  return {
    allowWebSearch: booleanArgument(args, "--allow-web-search", true),
    autoApproveHighRisk: booleanArgument(
      args,
      "--auto-approve-high-risk",
      false,
    ),
    codexCommand: args.get("--codex-command") ?? "codex",
    codexHome,
    codexProviderConfig: loadOfficialChatGptConfig(
      path.join(codexHome, "config.toml"),
    ),
    compatBase,
    compatEndpoint,
    controlDatabasePath,
    db,
    defaultNoProgressTimeoutMs: positiveInteger(
      args.get("--default-no-progress-timeout-ms"),
      5 * 60_000,
      "DEFAULT_NO_PROGRESS_TIMEOUT_INVALID",
    ),
    defaultRunTimeoutMs: positiveInteger(
      args.get("--default-run-timeout-ms"),
      30 * 60_000,
      "DEFAULT_RUN_TIMEOUT_INVALID",
    ),
    host,
    instanceId: args.get("--instance-id") ?? null,
    legacyStatePath: `${db}.p10.json`,
    port,
    requestToken,
    shutdownToken,
    tickMs: positiveInteger(
      args.get("--tick-ms"),
      800,
      "TICK_INTERVAL_INVALID",
      25,
    ),
    watchdogMs: positiveInteger(
      args.get("--watchdog-ms"),
      1000,
      "WATCHDOG_INTERVAL_INVALID",
      25,
    ),
    workspaceRoot,
  };
}
