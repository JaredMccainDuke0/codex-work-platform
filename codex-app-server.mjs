import { spawn } from "node:child_process";
import path from "node:path";
import { PRODUCT_VERSION } from "./version.mjs";

function jsonLine(value) {
  return `${JSON.stringify(value)}\n`;
}
const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));
const safeProcessDetail = (value) =>
  String(value ?? "")
    .replace(/\b(?:sk|rk|pk)-[A-Za-z0-9_-]{12,}\b/g, "[REDACTED]")
    .replace(
      /\bBearer\s+[A-Za-z0-9._~+\/-]{16,}={0,2}\b/gi,
      "Bearer [REDACTED]",
    )
    .replace(
      /\b(?:access[_-]?token|refresh[_-]?token|api[_-]?key)\s*[:=]\s*[^\s,;]+/gi,
      "credential=[REDACTED]",
    )
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 500);

async function terminateChild(child, force = false) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn(
        "taskkill.exe",
        ["/pid", String(child.pid), "/t", "/f"],
        { windowsHide: true, stdio: "ignore" },
      );
      killer.once("error", resolve);
      killer.once("close", resolve);
    });
    return;
  }
  try {
    child.kill(force ? "SIGKILL" : "SIGTERM");
  } catch {}
}

export function appServerSpawnSpec(command, args, platform = process.platform) {
  if (platform !== "win32") return { command, args, shell: false };
  if (path.isAbsolute(command) && !/\.(cmd|bat)$/i.test(command))
    return { command, args, shell: false };
  if (
    /[&|<>^%\r\n]/.test(String(command)) ||
    args.some((value) => /[&|<>^%\r\n]/.test(String(value)))
  )
    throw Error("CODEX_ARGUMENT_UNSAFE");
  const quote = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const rendered = [command, ...args].map(quote).join(" ");
  return {
    command: process.env.ComSpec || "cmd.exe",
    args: ["/d", "/s", "/c", `"${rendered}"`],
    shell: false,
    windowsVerbatimArguments: true,
  };
}

export class CodexAppServerClient {
  constructor(options = {}) {
    this.command = options.command ?? "codex";
    if (/[&|<>^\r\n]/.test(String(this.command)))
      throw Error("CODEX_COMMAND_UNSAFE");
    this.commandPrefix = Array.isArray(options.commandPrefix)
      ? options.commandPrefix
      : [];
    this.env = { ...(options.env ?? process.env) };
    this.cwd = options.cwd ?? process.cwd();
    this.spawnImpl = options.spawnImpl ?? spawn;
    this.experimentalApi = options.experimentalApi !== false;
    this.onNotification = options.onNotification ?? (() => {});
    this.onServerRequest =
      options.onServerRequest ?? (async () => ({ decision: "cancel" }));
    this.onStderr = options.onStderr ?? (() => {});
    this.child = null;
    this.buffer = "";
    this.nextId = 1;
    this.pending = new Map();
    this.started = false;
    this.initialized = false;
    this.stderr = "";
  }

  async start() {
    if (this.started) return this;
    if (/[&|<>^\r\n]/.test(String(this.command)))
      throw Error("CODEX_COMMAND_UNSAFE");
    const spec = appServerSpawnSpec(this.command, [
      ...this.commandPrefix,
      "app-server",
      "--stdio",
    ]);
    this.child = this.spawnImpl(spec.command, spec.args, {
      cwd: this.cwd,
      env: this.env,
      windowsHide: true,
      windowsVerbatimArguments: spec.windowsVerbatimArguments === true,
      stdio: ["pipe", "pipe", "pipe"],
      shell: spec.shell,
    });
    this.stderr = "";
    this.started = true;
    this.child.stdout.setEncoding("utf8");
    this.child.stdout.on("data", (chunk) => this.#consume(chunk));
    this.child.stderr.setEncoding("utf8");
    this.child.stderr.on("data", (chunk) => {
      const text = String(chunk);
      this.stderr = `${this.stderr}${text}`.slice(-2000);
      this.onStderr(text);
    });
    this.child.once("error", (error) => {
      this.#failAll(error);
      this.started = false;
      this.initialized = false;
      this.child = null;
    });
    this.child.once("close", (code, signal) => {
      const detail = safeProcessDetail(this.stderr);
      this.#failAll(
        new Error(
          `CODEX_APP_SERVER_EXIT:${code ?? "unknown"}:${signal ?? ""}${detail ? `:${detail}` : ""}`,
        ),
      );
      this.started = false;
      this.initialized = false;
      this.child = null;
    });
    try {
      await this.request("initialize", {
        clientInfo: {
          name: "codex_work_platform",
          title: "Codex 工作台",
          version: PRODUCT_VERSION,
        },
        capabilities: { experimentalApi: this.experimentalApi },
      });
      this.notify("initialized", {});
      this.initialized = true;
      return this;
    } catch (error) {
      await this.close();
      throw error;
    }
  }

  request(method, params = {}, timeoutMs = 30_000) {
    if (!this.child?.stdin?.writable)
      return Promise.reject(new Error("CODEX_APP_SERVER_NOT_RUNNING"));
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CODEX_APP_SERVER_TIMEOUT:${method}`));
      }, timeoutMs);
      this.pending.set(id, { resolve, reject, timer });
      this.child.stdin.write(jsonLine({ id, method, params }));
    });
  }

  notify(method, params = {}) {
    if (!this.child?.stdin?.writable)
      throw Error("CODEX_APP_SERVER_NOT_RUNNING");
    this.child.stdin.write(jsonLine({ method, params }));
  }

  async startThread(options = {}) {
    await this.start();
    return this.request("thread/start", {
      cwd: options.cwd,
      model:
        options.model && options.model !== "auto" ? options.model : undefined,
      approvalPolicy: options.approvalPolicy ?? "never",
      sandbox: options.sandbox ?? "read-only",
      ...(options.projectId ? { projectId: options.projectId } : {}),
    });
  }

  async resumeThread(threadId, options = {}) {
    await this.start();
    return this.request("thread/resume", {
      threadId,
      cwd: options.cwd,
      model:
        options.model && options.model !== "auto" ? options.model : undefined,
      approvalPolicy: options.approvalPolicy ?? "never",
      sandbox: options.sandbox ?? "read-only",
    });
  }

  async startTurn(threadId, prompt, options = {}) {
    await this.start();
    return this.request("turn/start", {
      threadId,
      input: [{ type: "text", text: String(prompt ?? "") }],
      cwd: options.cwd,
      model:
        options.model && options.model !== "auto" ? options.model : undefined,
      effort:
        options.reasoningEffort && options.reasoningEffort !== "auto"
          ? options.reasoningEffort
          : undefined,
      approvalPolicy: options.approvalPolicy,
      sandboxPolicy: options.sandboxPolicy,
    });
  }

  readThread(threadId, includeTurns = true) {
    return this.request("thread/read", { threadId, includeTurns });
  }
  listThreads(params = {}) {
    return this.request("thread/list", params);
  }
  listModels(params = {}) {
    return this.request("model/list", params);
  }
  interruptTurn(threadId, turnId) {
    return this.request("turn/interrupt", { threadId, turnId });
  }

  async close() {
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(new Error("CODEX_APP_SERVER_CLOSED"));
    }
    this.pending.clear();
    const child = this.child;
    if (child?.pid) {
      if (child.exitCode === null) await terminateChild(child);
      if (child.exitCode === null)
        await Promise.race([
          new Promise((resolve) => child.once("close", resolve)),
          sleep(2000),
        ]);
      if (child.exitCode === null) {
        await terminateChild(child, true);
      }
    }
    this.child = null;
    this.started = false;
    this.initialized = false;
  }

  #consume(chunk) {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch {
        continue;
      }
      if (
        message.id !== undefined &&
        (message.result !== undefined || message.error !== undefined)
      ) {
        const entry = this.pending.get(message.id);
        if (!entry) continue;
        this.pending.delete(message.id);
        clearTimeout(entry.timer);
        if (message.error)
          entry.reject(
            new Error(
              `CODEX_APP_SERVER_RPC:${message.error.message ?? "unknown"}`,
            ),
          );
        else entry.resolve(message.result);
      } else if (message.id !== undefined && message.method) {
        Promise.resolve(this.onServerRequest(message))
          .then((result) => {
            if (this.child?.stdin?.writable)
              this.child.stdin.write(jsonLine({ id: message.id, result }));
          })
          .catch((error) => {
            if (this.child?.stdin?.writable)
              this.child.stdin.write(
                jsonLine({
                  id: message.id,
                  error: { code: -32000, message: error.message },
                }),
              );
          });
      } else if (message.method) {
        this.onNotification(message);
      }
    }
  }

  #failAll(error) {
    for (const entry of this.pending.values()) {
      clearTimeout(entry.timer);
      entry.reject(error);
    }
    this.pending.clear();
  }
}
