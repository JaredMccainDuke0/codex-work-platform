import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { CodexAppServerClient } from "./codex-app-server.mjs";

const now = () => new Date().toISOString();
const safeText = (value, limit = 1600) => {
  const text = String(value ?? "");
  return text.length > limit ? `${text.slice(0, limit)}…` : text;
};
const within = (candidate, root) => {
  const pathImpl = process.platform === "win32" ? path.win32 : path.posix;
  const relative = pathImpl.relative(root, candidate);
  return (
    relative === "" ||
    (!relative.startsWith("..") && !pathImpl.isAbsolute(relative))
  );
};
const resolveExistingPath = (value) => {
  const resolved = path.resolve(String(value));
  try {
    return fs.realpathSync.native(resolved);
  } catch {
    return resolved;
  }
};
const sandboxPolicyType = (sandbox) =>
  ({
    "read-only": "readOnly",
    "workspace-write": "workspaceWrite",
    "danger-full-access": "dangerFullAccess",
    external: "externalSandbox",
    "external-sandbox": "externalSandbox",
  })[
    String(sandbox ?? "")
      .trim()
      .toLowerCase()
  ] ?? "readOnly";
const normalizeApprovalPolicy = (value) => {
  const policy = String(value ?? "never")
    .trim()
    .toLowerCase();
  if (!["never", "on-request", "on-failure", "untrusted"].includes(policy))
    throw Error("CODEX_APPROVAL_POLICY_INVALID");
  return policy;
};

async function terminateProcessTree(child) {
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
    child.kill("SIGTERM");
  } catch {}
}

function capture(command, args, options = {}) {
  return new Promise((resolve) => {
    if (/[&|<>^\r\n]/.test(String(command)))
      return resolve({
        code: null,
        stdout: "",
        stderr: "CODEX_COMMAND_UNSAFE",
      });
    const useShell =
      process.platform === "win32" &&
      !(
        path.isAbsolute(String(command)) &&
        !/\.(cmd|bat)$/i.test(String(command))
      );
    let child;
    try {
      child = spawn(command, args, {
        cwd: options.cwd,
        env: options.env ?? process.env,
        windowsHide: true,
        shell: useShell,
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      return resolve({ code: null, stdout: "", stderr: error.message });
    }
    let stdout = "";
    let stderr = "";
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const timer = setTimeout(() => {
      void terminateProcessTree(child);
      finish({ code: null, stdout, stderr, timedOut: true });
    }, options.timeoutMs ?? 10_000);
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.once("error", (error) => {
      clearTimeout(timer);
      finish({ code: null, stdout, stderr: `${stderr}\n${error.message}` });
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      finish({ code, stdout, stderr });
    });
  });
}

function publicTask(task) {
  return {
    id: task.id,
    adapter: task.adapter,
    state: task.state,
    threadId: task.threadId,
    turnId: task.turnId,
    cwd: task.cwd,
    model: task.model,
    reasoningEffort: task.reasoningEffort,
    approvalPolicy: task.approvalPolicy ?? "never",
    createdAt: task.createdAt,
    startedAt: task.startedAt,
    updatedAt: task.updatedAt,
    progress: task.progress,
    lastError: task.lastError,
  };
}

export class CodexAppServerAdapter {
  constructor(options = {}) {
    this.name = "local-codex-app-server";
    this.command = options.command ?? "codex";
    this.commandPrefix = Array.isArray(options.commandPrefix)
      ? options.commandPrefix
      : [];
    this.env = { ...(options.env ?? process.env) };
    if (options.requireChatGptAuth === true) {
      delete this.env.OPENAI_API_KEY;
      delete this.env.CODEX_API_KEY;
      delete this.env.OPENAI_BASE_URL;
    }
    this.allowedRoots = (
      options.allowedRoots?.length ? options.allowedRoots : [process.cwd()]
    ).map(resolveExistingPath);
    this.provider = options.provider ?? {
      name: "openai",
      label: "OpenAI 官方",
      model: null,
      baseUrl: null,
      authentication: "chatgpt",
    };
    this.requireChatGptAuth = options.requireChatGptAuth === true;
    this.allowWebSearch = options.allowWebSearch === true;
    this.autoApprove = options.autoApprove === true;
    this.client = null;
    this.tasks = new Map();
    this.threadTasks = new Map();
    this.lastProbe = null;
  }

  #hasActiveTasks() {
    return [...this.tasks.values()].some((task) =>
      ["CREATED", "RUNNING"].includes(task.state),
    );
  }

  async #closeIfIdle() {
    if (!this.client || this.#hasActiveTasks()) return;
    const client = this.client;
    this.client = null;
    await client.close().catch(() => null);
  }

  async #ensureClient() {
    if (this.client) return this.client;
    this.client = new CodexAppServerClient({
      command: this.command,
      commandPrefix: this.commandPrefix,
      env: this.env,
      cwd: this.allowedRoots[0],
      onNotification: (message) => this.#notification(message),
      onServerRequest: async (message) => this.#approval(message),
    });
    try {
      await this.client.start();
    } catch (error) {
      await this.client.close().catch(() => null);
      this.client = null;
      throw error;
    }
    return this.client;
  }

  async #approval(message) {
    // The workbench's approval policy is applied at the RUN layer. In the first
    // app-server slice, automatic policy accepts only when explicitly enabled;
    // callers can replace this callback with the approval-center bridge.
    if (
      this.autoApprove &&
      /requestApproval|requestUserInput|fileChange/.test(message.method)
    )
      return { decision: "accept" };
    return { decision: "cancel" };
  }

  #notification(message) {
    const params = message.params ?? {};
    const threadId =
      params.threadId ?? params.thread?.id ?? params.turn?.threadId;
    const task = threadId ? this.threadTasks.get(threadId) : null;
    if (!task) return;
    const method = message.method;
    if (method === "turn/started") {
      task.turnId = params.turn?.id ?? task.turnId;
      task.progress = Math.max(task.progress, 10);
      task.phase = "planning";
      task.callbacks?.onEvent?.({
        type: "turn.started",
        threadId,
        turnId: task.turnId,
        summary: "Codex turn started",
      });
      return;
    }
    if (method === "turn/completed") {
      const completed = params.turn?.status === "completed";
      task.state = completed ? "COMPLETED" : "FAILED";
      task.progress = completed ? 95 : task.progress;
      task.phase = "finalizing";
      task.callbacks?.onEvent?.({
        type: "turn.completed",
        threadId,
        turnId: params.turn?.id ?? task.turnId,
        summary: params.turn?.status ?? "completed",
        usage: params.turn?.usage ?? null,
      });
      task.callbacks?.onExit?.({
        state: completed ? "COMPLETED" : "FAILED",
        code: completed ? 0 : 1,
        threadId,
      });
      void this.#closeIfIdle();
      return;
    }
    if (method === "item/agentMessage/delta") {
      task.progress = Math.max(task.progress, 80);
      task.callbacks?.onEvent?.({
        type: "agent_message.delta",
        threadId,
        turnId: task.turnId,
        summary: params.delta ?? params.text ?? "",
      });
      return;
    }
    if (method === "item/started" || method === "item/completed") {
      const item = params.item ?? {};
      task.progress = Math.max(
        task.progress,
        method === "item/completed" ? 70 : 35,
      );
      task.phase = /fileChange/i.test(item.type)
        ? "editing"
        : /commandExecution/i.test(item.type)
          ? "verifying"
          : "working";
      task.callbacks?.onEvent?.({
        type: method === "item/started" ? "item.started" : "item.completed",
        itemType: item.type,
        threadId,
        turnId: task.turnId,
        summary: item.command ?? item.type ?? "",
      });
      return;
    }
    task.callbacks?.onEvent?.({
      type: method,
      threadId,
      turnId: task.turnId,
      summary: "",
    });
  }

  async probe(options = {}) {
    const version = await capture(
      this.command,
      [...this.commandPrefix, "--version"],
      { env: this.env },
    );
    const login = await capture(
      this.command,
      [...this.commandPrefix, "login", "status"],
      { env: this.env },
    );
    let appServerAvailable = false;
    let models = [];
    let reason = null;
    try {
      const client = await this.#ensureClient();
      const response = await client.listModels({ limit: 100 });
      models = response.models ?? response.data ?? [];
      appServerAvailable = true;
    } catch (error) {
      reason = safeText(error.message, 500);
    }
    await this.#closeIfIdle();
    const loginText = `${login.stdout}\n${login.stderr}`;
    const authenticated =
      login.code === 0 &&
      (!this.requireChatGptAuth || /Logged in using ChatGPT/i.test(loginText));
    const result = {
      adapter: this.name,
      available: version.code === 0 && appServerAvailable,
      authenticated,
      version: safeText(version.stdout || version.stderr, 120),
      command: this.command,
      provider: this.provider,
      models: models.map((model) => ({
        id: model.id ?? model.model,
        name: model.displayName ?? model.name ?? model.id,
        reasoningEfforts:
          model.supportedReasoningEfforts ?? model.reasoningEfforts ?? [],
      })),
      reason:
        reason ?? (!authenticated ? "CODEX_CHATGPT_LOGIN_REQUIRED" : null),
      capabilities: {
        pause: true,
        resume: true,
        terminate: true,
        network: this.allowWebSearch,
        appServer: true,
        executionVerified: appServerAvailable && authenticated,
      },
    };
    this.lastProbe = result;
    return result;
  }

  createTask(input = {}) {
    const cwd = resolveExistingPath(input.cwd ?? this.allowedRoots[0]);
    if (!this.allowedRoots.some((root) => within(cwd, root)))
      throw Error("CODEX_WORKSPACE_OUTSIDE_ALLOWED_ROOT");
    if (
      cwd
        .split(/[\\/]+/)
        .map((part) => part.toLowerCase())
        .some((part) => [".ssh", ".aws", ".gnupg", "keychains"].includes(part))
    )
      throw Error("CODEX_SENSITIVE_DIRECTORY_FORBIDDEN");
    const task = {
      id: crypto.randomUUID(),
      adapter: this.name,
      state: input.state ?? "CREATED",
      createdAt: now(),
      updatedAt: now(),
      startedAt: null,
      cwd,
      prompt: String(input.prompt ?? "").trim(),
      model: input.model ?? "auto",
      reasoningEffort: input.reasoningEffort ?? "auto",
      delegation: input.delegation ?? "DISABLED",
      subagentModel: input.subagentModel ?? "auto",
      subagentReasoningEffort: input.subagentReasoningEffort ?? "auto",
      maxSubagents: input.maxSubagents ?? 4,
      sandbox: input.sandbox ?? "read-only",
      approvalPolicy: normalizeApprovalPolicy(input.approvalPolicy),
      network: input.network === true,
      threadId: input.threadId ?? null,
      turnId: null,
      progress: 0,
      phase: "queued",
      lastError: null,
      callbacks: null,
    };
    if (!task.prompt) throw Error("CODEX_PROMPT_REQUIRED");
    this.tasks.set(task.id, task);
    return publicTask(task);
  }

  async startTask(taskRef, callbacks = {}) {
    const task = this.tasks.get(
      typeof taskRef === "string" ? taskRef : taskRef.id,
    );
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    task.callbacks = callbacks;
    const client = await this.#ensureClient();
    const threadResponse = task.threadId
      ? await client.resumeThread(task.threadId, {
          cwd: task.cwd,
          model: task.model,
          approvalPolicy: task.approvalPolicy,
          sandbox: task.sandbox,
        })
      : await client.startThread({
          cwd: task.cwd,
          model: task.model,
          approvalPolicy: task.approvalPolicy,
          sandbox: task.sandbox,
        });
    task.threadId =
      threadResponse.thread?.id ?? threadResponse.id ?? task.threadId;
    if (!task.threadId) throw Error("CODEX_APP_SERVER_THREAD_ID_MISSING");
    this.threadTasks.set(task.threadId, task);
    const turn = await client.startTurn(task.threadId, task.prompt, {
      cwd: task.cwd,
      model: task.model,
      reasoningEffort: task.reasoningEffort,
      approvalPolicy: task.approvalPolicy,
      sandboxPolicy: { type: sandboxPolicyType(task.sandbox) },
    });
    task.turnId = turn.turn?.id ?? turn.id ?? null;
    task.state = "RUNNING";
    task.phase = "planning";
    task.progress = Math.max(task.progress, 5);
    task.startedAt = task.startedAt ?? now();
    task.updatedAt = now();
    callbacks.onEvent?.({
      type: "adapter.started",
      threadId: task.threadId,
      turnId: task.turnId,
      summary: "Codex app-server turn started",
    });
    return publicTask(task);
  }

  async pauseTask(taskRef) {
    const task = this.tasks.get(
      typeof taskRef === "string" ? taskRef : taskRef.id,
    );
    if (!task?.threadId || !task.turnId)
      throw Error("ADAPTER_TASK_NOT_RUNNING");
    await this.client.interruptTurn(task.threadId, task.turnId);
    task.state = "PAUSED";
    task.updatedAt = now();
    await this.#closeIfIdle();
    return publicTask(task);
  }
  async resumeTask(taskRef, callbacks = null) {
    const task = this.tasks.get(
      typeof taskRef === "string" ? taskRef : taskRef.id,
    );
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    if (callbacks) task.callbacks = callbacks;
    task.prompt =
      "Continue the task from the current thread state and report the next concrete action.";
    return this.startTask(task);
  }
  async terminateTask(taskRef) {
    const task = this.tasks.get(
      typeof taskRef === "string" ? taskRef : taskRef.id,
    );
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    if (task.threadId && task.turnId)
      await this.client
        .interruptTurn(task.threadId, task.turnId)
        .catch(() => null);
    task.state = "TERMINATED";
    task.updatedAt = now();
    await this.#closeIfIdle();
    return publicTask(task);
  }
  readStatus(taskRef) {
    const task = this.tasks.get(
      typeof taskRef === "string" ? taskRef : taskRef.id,
    );
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    return publicTask(task);
  }
  async collectArtifacts(taskRef) {
    const task = this.tasks.get(
      typeof taskRef === "string" ? taskRef : taskRef.id,
    );
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    const records = [];
    for (const name of ["index.html", "style.css", "game.js", "README.md"]) {
      const file = path.join(task.cwd, name);
      if (
        fs.existsSync(file) &&
        !fs.lstatSync(file).isSymbolicLink() &&
        fs.statSync(file).isFile()
      ) {
        const bytes = fs.readFileSync(file);
        records.push({
          name,
          path: file,
          kind: "file",
          size: bytes.length,
          sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
          verified: true,
        });
      }
    }
    return records.length
      ? records
      : [
          {
            name: "codex-app-server-summary.txt",
            kind: "result-summary",
            size: 0,
            sha256: crypto.createHash("sha256").update("").digest("hex"),
            verified: true,
            summary: "Codex app-server completed.",
          },
        ];
  }
  async readThread(threadId, includeTurns = true) {
    const client = await this.#ensureClient();
    const result = await client.readThread(threadId, includeTurns);
    await this.#closeIfIdle();
    return result;
  }
  async sendFollowup(threadId, prompt, options = {}) {
    const client = await this.#ensureClient();
    const followupCwd = resolveExistingPath(
      options.cwd ?? this.allowedRoots[0],
    );
    if (!this.allowedRoots.some((root) => within(followupCwd, root)))
      throw Error("CODEX_WORKSPACE_OUTSIDE_ALLOWED_ROOT");
    let task = this.threadTasks.get(threadId);
    if (!task) {
      task = {
        id: `conversation:${threadId}`,
        adapter: this.name,
        state: "RUNNING",
        createdAt: now(),
        updatedAt: now(),
        startedAt: null,
        cwd: followupCwd,
        prompt: String(prompt ?? ""),
        model: options.model ?? "auto",
        reasoningEffort: options.reasoningEffort ?? "auto",
        sandbox: options.sandbox ?? "read-only",
        approvalPolicy: normalizeApprovalPolicy(options.approvalPolicy),
        threadId,
        turnId: null,
        progress: 0,
        phase: "working",
        callbacks: null,
      };
      this.tasks.set(task.id, task);
      this.threadTasks.set(threadId, task);
    } else {
      task.state = "RUNNING";
      task.prompt = String(prompt ?? "");
      task.updatedAt = now();
    }
    const turn = await client.startTurn(threadId, prompt, {
      ...options,
      cwd: followupCwd,
      approvalPolicy: normalizeApprovalPolicy(options.approvalPolicy),
      sandboxPolicy: options.sandboxPolicy ?? {
        type: sandboxPolicyType(options.sandbox ?? task.sandbox ?? "read-only"),
      },
    });
    task.turnId = turn.turn?.id ?? turn.id ?? task.turnId;
    return turn;
  }
  async listModels(options = {}) {
    const client = await this.#ensureClient();
    const result = await client.listModels(options);
    await this.#closeIfIdle();
    return result;
  }
  async close() {
    if (this.client) await this.client.close();
    this.client = null;
    this.tasks.clear();
    this.threadTasks.clear();
  }
}
