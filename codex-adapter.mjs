import { spawn } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const now = () => new Date().toISOString();
const secretPatterns = [
  /\b(?:sk|rk|pk)-[A-Za-z0-9_*.-]{4,}/gi,
  /\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_*.-]{4,}/gi,
  /\bAKIA[0-9A-Z*]{12,}/g,
  /\bBearer\s+[A-Za-z0-9._~+/*=-]{4,}/gi,
  /\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|token)\s*(?:provided\s*)?[:=]\s*[^\s,;)]+/gi,
  /["']?(?:api[_-]?key|access[_-]?token|refresh[_-]?token|authorization)["']?\s*[:=]\s*["']?[^\s,"'}]{20,}/gi,
  /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
];

export function redactSecrets(value) {
  let text = String(value ?? "").replace(/\u0000/g, "");
  for (const pattern of secretPatterns)
    text = text.replace(pattern, "[REDACTED]");
  return text;
}

export function sanitizeSummary(value, maxLength = 1200) {
  const text = redactSecrets(value).trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function parseSimpleTomlValue(rawValue) {
  const value = String(rawValue ?? "").trim();
  const basicString = value.match(/^"((?:\\.|[^"\\])*)"\s*(?:#.*)?$/);
  if (basicString) {
    try {
      return JSON.parse(`"${basicString[1]}"`);
    } catch {
      return undefined;
    }
  }
  const literalString = value.match(/^'([^']*)'\s*(?:#.*)?$/);
  if (literalString) return literalString[1];
  const booleanValue = value.match(/^(true|false)\s*(?:#.*)?$/);
  if (booleanValue) return booleanValue[1] === "true";
  return undefined;
}

function configArgument(args, key, value) {
  if (value === undefined || value === null || value === "") return;
  args.push(
    "-c",
    `${key}=${typeof value === "string" ? JSON.stringify(value) : String(value)}`,
  );
}

export function projectSafeCodexProviderConfig(configText = "") {
  const root = {};
  const providers = new Map();
  let section;
  for (const sourceLine of String(configText).split(/\r?\n/)) {
    const line = sourceLine.trim();
    const sectionMatch = line.match(
      /^\[model_providers\.(?:"([^"]+)"|'([^']+)'|([A-Za-z0-9_-]+))\]$/,
    );
    if (sectionMatch) {
      section = sectionMatch[1] ?? sectionMatch[2] ?? sectionMatch[3];
      if (!providers.has(section)) providers.set(section, {});
      continue;
    }
    if (line.startsWith("[")) {
      section = null;
      continue;
    }
    const assignment = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!assignment) continue;
    const parsedValue = parseSimpleTomlValue(assignment[2]);
    if (parsedValue === undefined) continue;
    if (typeof section === "string")
      providers.get(section)[assignment[1]] = parsedValue;
    else if (section === undefined) root[assignment[1]] = parsedValue;
  }

  const providerName =
    typeof root.model_provider === "string" ? root.model_provider : "openai";
  const model =
    typeof root.model === "string" &&
    root.model.length <= 128 &&
    !/[\r\n\0]/.test(root.model)
      ? root.model
      : null;
  const args = [];
  if (model) configArgument(args, "model", model);
  if (providerName === "openai") {
    return {
      args,
      error: null,
      provider: {
        name: "openai",
        label: "OpenAI",
        model,
        baseUrl: null,
        authentication: "openai",
        source: "safe-user-config-projection",
      },
    };
  }
  if (!/^[A-Za-z0-9_-]+$/.test(providerName)) {
    return {
      args: [],
      error: "CODEX_PROVIDER_NAME_INVALID",
      provider: {
        name: providerName,
        model,
        source: "safe-user-config-projection",
      },
    };
  }
  const provider = providers.get(providerName);
  if (!provider) {
    return {
      args: [],
      error: "CODEX_PROVIDER_SECTION_MISSING",
      provider: {
        name: providerName,
        model,
        source: "safe-user-config-projection",
      },
    };
  }
  let endpoint;
  try {
    endpoint = new URL(String(provider.base_url ?? ""));
    if (
      !["http:", "https:"].includes(endpoint.protocol) ||
      endpoint.username ||
      endpoint.password ||
      endpoint.hash ||
      endpoint.search
    )
      throw Error("unsafe");
  } catch {
    return {
      args: [],
      error: "CODEX_PROVIDER_BASE_URL_INVALID",
      provider: {
        name: providerName,
        model,
        source: "safe-user-config-projection",
      },
    };
  }
  const wireApi = provider.wire_api ?? "responses";
  if (typeof wireApi !== "string" || !["responses", "chat"].includes(wireApi)) {
    return {
      args: [],
      error: "CODEX_PROVIDER_WIRE_API_INVALID",
      provider: {
        name: providerName,
        model,
        source: "safe-user-config-projection",
      },
    };
  }
  if (
    provider.requires_openai_auth !== undefined &&
    typeof provider.requires_openai_auth !== "boolean"
  ) {
    return {
      args: [],
      error: "CODEX_PROVIDER_AUTH_MODE_INVALID",
      provider: {
        name: providerName,
        model,
        source: "safe-user-config-projection",
      },
    };
  }
  const requiresOpenAiAuth = provider.requires_openai_auth === true;
  if (
    provider.env_key !== undefined &&
    (typeof provider.env_key !== "string" ||
      !/^[A-Za-z_][A-Za-z0-9_]*$/.test(provider.env_key))
  ) {
    return {
      args: [],
      error: "CODEX_PROVIDER_ENV_KEY_INVALID",
      provider: {
        name: providerName,
        model,
        source: "safe-user-config-projection",
      },
    };
  }
  const envKey = typeof provider.env_key === "string" ? provider.env_key : null;
  const label =
    typeof provider.name === "string" &&
    provider.name.length <= 80 &&
    !/[\r\n\0]/.test(provider.name)
      ? provider.name
      : providerName;
  const baseUrl = endpoint.toString().replace(/\/$/, "");
  configArgument(args, "model_provider", providerName);
  configArgument(args, `model_providers.${providerName}.name`, label);
  configArgument(args, `model_providers.${providerName}.base_url`, baseUrl);
  configArgument(args, `model_providers.${providerName}.wire_api`, wireApi);
  configArgument(
    args,
    `model_providers.${providerName}.requires_openai_auth`,
    requiresOpenAiAuth,
  );
  if (!requiresOpenAiAuth && envKey)
    configArgument(args, `model_providers.${providerName}.env_key`, envKey);
  return {
    args,
    error: null,
    provider: {
      name: providerName,
      label,
      model,
      baseUrl,
      authentication: requiresOpenAiAuth
        ? "openai"
        : envKey
          ? "environment"
          : "none",
      source: "safe-user-config-projection",
    },
  };
}

export function loadSafeCodexProviderConfig(configPath) {
  try {
    return projectSafeCodexProviderConfig(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return projectSafeCodexProviderConfig("");
    return {
      args: [],
      error: "CODEX_CONFIG_READ_FAILED",
      provider: {
        name: "unknown",
        label: "Unknown",
        model: null,
        baseUrl: null,
        authentication: "unknown",
        source: "safe-user-config-projection",
      },
    };
  }
}

export function projectOfficialChatGptConfig(configText = "") {
  const root = {};
  let section;
  for (const sourceLine of String(configText).split(/\r?\n/)) {
    const line = sourceLine.trim();
    if (line.startsWith("[")) {
      section = line;
      continue;
    }
    if (section !== undefined) continue;
    const assignment = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
    if (!assignment) continue;
    const parsedValue = parseSimpleTomlValue(assignment[2]);
    if (parsedValue !== undefined) root[assignment[1]] = parsedValue;
  }
  const model =
    typeof root.model === "string" &&
    root.model.length <= 128 &&
    !/[\r\n\0]/.test(root.model)
      ? root.model
      : null;
  const args = [];
  if (model) configArgument(args, "model", model);
  configArgument(args, "model_provider", "openai");
  configArgument(args, "forced_login_method", "chatgpt");
  return {
    args,
    error: null,
    provider: {
      name: "openai",
      label: "OpenAI 官方",
      model,
      baseUrl: null,
      authentication: "chatgpt",
      source: "workbench-official-chatgpt-policy",
    },
  };
}

export function loadOfficialChatGptConfig(configPath) {
  try {
    return projectOfficialChatGptConfig(fs.readFileSync(configPath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return projectOfficialChatGptConfig("");
    return {
      args: [],
      error: "CODEX_CONFIG_READ_FAILED",
      provider: {
        name: "openai",
        label: "OpenAI 官方",
        model: null,
        baseUrl: null,
        authentication: "chatgpt",
        source: "workbench-official-chatgpt-policy",
      },
    };
  }
}

export function parseCodexJsonLine(line) {
  const text = String(line ?? "").trim();
  if (!text) return null;
  let raw;
  try {
    raw = JSON.parse(text);
  } catch {
    return {
      type: "protocol.invalid_json",
      summary: sanitizeSummary(text, 400),
    };
  }

  const event = { type: String(raw.type ?? "unknown") };
  if (raw.thread_id) event.threadId = String(raw.thread_id);
  if (raw.item?.type) event.itemType = String(raw.item.type);
  if (raw.item?.id) event.itemId = String(raw.item.id);
  if (raw.item?.status) event.itemStatus = String(raw.item.status);
  if (raw.item?.command) event.summary = sanitizeSummary(raw.item.command, 600);
  else if (raw.item?.text) event.summary = sanitizeSummary(raw.item.text);
  else if (raw.error?.message)
    event.summary = sanitizeSummary(raw.error.message);
  else if (raw.message) event.summary = sanitizeSummary(raw.message);
  if (raw.usage && typeof raw.usage === "object") {
    event.usage = {
      inputTokens: Number(raw.usage.input_tokens ?? 0),
      cachedInputTokens: Number(raw.usage.cached_input_tokens ?? 0),
      outputTokens: Number(raw.usage.output_tokens ?? 0),
      reasoningOutputTokens: Number(raw.usage.reasoning_output_tokens ?? 0),
    };
  }
  const paths = extractArtifactPaths(raw.item);
  if (paths.length) event.artifactPaths = paths;
  return event;
}

function extractArtifactPaths(item) {
  if (!item || typeof item !== "object" || item.type !== "file_change")
    return [];
  const values = [];
  for (const key of ["path", "file_path", "filePath"])
    if (typeof item[key] === "string") values.push(item[key]);
  if (Array.isArray(item.changes)) {
    for (const change of item.changes) {
      for (const key of ["path", "file_path", "filePath"])
        if (typeof change?.[key] === "string") values.push(change[key]);
    }
  }
  return [...new Set(values.map((value) => String(value)))];
}

function isWithinRoot(candidate, root, platform = process.platform) {
  const pathImpl = platform === "win32" ? path.win32 : path.posix;
  const normalize = (value) =>
    platform === "win32" ? value.toLowerCase() : value;
  const relative = pathImpl.relative(normalize(root), normalize(candidate));
  return (
    relative === "" ||
    (!relative.startsWith("..") && !pathImpl.isAbsolute(relative))
  );
}

function resolveExistingPath(value) {
  const resolved = path.resolve(value);
  try {
    return fs.realpathSync.native(resolved);
  } catch {
    return resolved;
  }
}

function publicTask(task) {
  return {
    id: task.id,
    adapter: task.adapter,
    state: task.state,
    threadId: task.threadId ?? null,
    createdAt: task.createdAt,
    startedAt: task.startedAt ?? null,
    updatedAt: task.updatedAt,
    cwd: task.cwd,
    sandbox: task.sandbox,
    progress: task.progress ?? 0,
    model: task.model ?? "auto",
    reasoningEffort: task.reasoningEffort ?? "auto",
    delegation: task.delegation ?? "DISABLED",
    subagentModel: task.subagentModel ?? "auto",
    subagentReasoningEffort: task.subagentReasoningEffort ?? "auto",
    lastError: task.lastError ?? null,
  };
}

async function terminateProcessTree(child, platform = process.platform) {
  if (!child?.pid || child.exitCode !== null) return;
  if (platform === "win32") {
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

function runCapture(command, args, options = {}) {
  return new Promise((resolve) => {
    let settled = false;
    let stdout = "";
    let stderr = "";
    let child;
    try {
      child = (options.spawnImpl ?? spawn)(command, args, {
        cwd: options.cwd,
        env: options.env ?? process.env,
        windowsHide: true,
        stdio: [
          options.input === undefined ? "ignore" : "pipe",
          "pipe",
          "pipe",
        ],
      });
    } catch (error) {
      return resolve({ code: null, stdout, stderr, error });
    }
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      void terminateProcessTree(child, options.platform);
      resolve({
        code: null,
        stdout,
        stderr,
        error: Error("CODEX_PROBE_TIMEOUT"),
      });
    }, options.timeoutMs ?? 5000);
    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    if (options.input !== undefined) child.stdin?.end(String(options.input));
    child.once("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code: null, stdout, stderr, error });
    });
    child.once("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout, stderr, error: null });
    });
  });
}

async function locateCodex(command, spawnImpl) {
  if (
    path.isAbsolute(command) ||
    command.includes("/") ||
    command.includes("\\")
  ) {
    if (
      process.platform === "win32" &&
      command.toLowerCase().endsWith(".cmd")
    ) {
      const npmScript = path.join(
        path.dirname(command),
        "node_modules",
        "@openai",
        "codex",
        "bin",
        "codex.js",
      );
      if (fs.existsSync(npmScript))
        return {
          command: process.execPath,
          prefix: [npmScript],
          displayCommand: command,
        };
      return {
        command: process.env.ComSpec ?? "cmd.exe",
        prefix: ["/d", "/s", "/c", command],
        displayCommand: command,
      };
    }
    return { command, prefix: [], displayCommand: command };
  }
  const locator = process.platform === "win32" ? "where.exe" : "which";
  const result = await runCapture(locator, [command], {
    spawnImpl,
    timeoutMs: 3000,
  });
  if (result.code !== 0)
    return { command, prefix: [], displayCommand: command };
  const candidates = result.stdout
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (process.platform === "win32") {
    const commandShim = candidates.find((item) =>
      item.toLowerCase().endsWith(".cmd"),
    );
    if (commandShim) {
      const npmScript = path.join(
        path.dirname(commandShim),
        "node_modules",
        "@openai",
        "codex",
        "bin",
        "codex.js",
      );
      if (fs.existsSync(npmScript))
        return {
          command: process.execPath,
          prefix: [npmScript],
          displayCommand: commandShim,
        };
      return {
        command: process.env.ComSpec ?? "cmd.exe",
        prefix: ["/d", "/s", "/c", commandShim],
        displayCommand: commandShim,
      };
    }
    const executable =
      candidates.find((item) => item.toLowerCase().endsWith(".exe")) ??
      candidates[0] ??
      command;
    return { command: executable, prefix: [], displayCommand: executable };
  }
  const executable = candidates[0] ?? command;
  return { command: executable, prefix: [], displayCommand: executable };
}

export class MockCodexAdapter {
  constructor(options = {}) {
    this.name = "mock";
    this.tickMs = Math.max(25, Number(options.tickMs ?? 800));
    this.tasks = new Map();
  }

  async probe() {
    return {
      adapter: this.name,
      available: true,
      authenticated: true,
      version: "deterministic-mock",
      capabilities: {
        pause: true,
        resume: true,
        terminate: true,
        network: false,
      },
    };
  }

  createTask(input = {}) {
    const task = {
      id: crypto.randomUUID(),
      adapter: this.name,
      state: input.state ?? "CREATED",
      createdAt: now(),
      updatedAt: now(),
      cwd: path.resolve(input.cwd ?? process.cwd()),
      sandbox: "simulated",
      progress: Number(input.progress ?? 0),
      title: String(input.title ?? "Mock Codex task"),
      timer: null,
      callbacks: null,
    };
    this.tasks.set(task.id, task);
    return publicTask(task);
  }

  async startTask(taskRef, callbacks = {}) {
    const task = this.#task(taskRef);
    clearInterval(task.timer);
    task.callbacks = callbacks;
    task.state = "RUNNING";
    task.startedAt ??= now();
    task.updatedAt = now();
    callbacks.onEvent?.({
      type: "turn.started",
      summary: "Mock Codex task started",
    });
    task.timer = setInterval(() => {
      if (task.state !== "RUNNING") return;
      task.progress = Math.min(100, task.progress + 20);
      task.updatedAt = now();
      callbacks.onHeartbeat?.({
        progress: task.progress,
        checkpoint: `checkpoint-${task.progress}`,
        timestamp: task.updatedAt,
      });
      if (task.progress >= 100) {
        clearInterval(task.timer);
        task.timer = null;
        task.state = "COMPLETED";
        callbacks.onEvent?.({
          type: "turn.completed",
          summary: "Mock Codex task completed",
          usage: {
            inputTokens: 0,
            cachedInputTokens: 0,
            outputTokens: 0,
            reasoningOutputTokens: 0,
          },
        });
        callbacks.onExit?.({
          state: "COMPLETED",
          code: 0,
          signal: null,
          finalSummary: task.title,
        });
      }
    }, this.tickMs);
    return publicTask(task);
  }

  async pauseTask(taskRef) {
    const task = this.#task(taskRef);
    if (task.state !== "RUNNING") throw Error("ADAPTER_TASK_NOT_RUNNING");
    clearInterval(task.timer);
    task.timer = null;
    task.state = "PAUSED";
    task.updatedAt = now();
    return publicTask(task);
  }

  async resumeTask(taskRef, callbacks = null) {
    const task = this.#task(taskRef);
    if (task.state !== "PAUSED") throw Error("ADAPTER_TASK_NOT_PAUSED");
    return this.startTask(task, callbacks ?? task.callbacks ?? {});
  }

  async terminateTask(taskRef) {
    const task = this.#task(taskRef);
    clearInterval(task.timer);
    task.timer = null;
    task.state = "TERMINATED";
    task.updatedAt = now();
    return publicTask(task);
  }

  readStatus(taskRef) {
    return publicTask(this.#task(taskRef));
  }

  async collectArtifacts(taskRef) {
    const task = this.#task(taskRef);
    const content = task.title;
    return [
      {
        name: `${task.title.replace(/[^\w\u4e00-\u9fff-]+/g, "-")}.artifact.txt`,
        kind: "result-summary",
        size: Buffer.byteLength(content),
        sha256: crypto.createHash("sha256").update(content).digest("hex"),
        verified: true,
      },
    ];
  }

  async close() {
    for (const task of this.tasks.values()) clearInterval(task.timer);
    this.tasks.clear();
  }

  #task(taskRef) {
    const taskId = typeof taskRef === "string" ? taskRef : taskRef?.id;
    const task = this.tasks.get(taskId);
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    return task;
  }
}

export class LocalCodexCliAdapter {
  constructor(options = {}) {
    this.name = "local-codex-cli";
    this.command = options.command ?? "codex";
    this.commandPrefix = Array.isArray(options.commandPrefix)
      ? options.commandPrefix
      : [];
    this.allowedRoots = (
      options.allowedRoots?.length ? options.allowedRoots : [process.cwd()]
    ).map(resolveExistingPath);
    this.spawnImpl = options.spawnImpl ?? spawn;
    this.env = { ...(options.env ?? process.env) };
    this.platform = options.platform ?? process.platform;
    this.heartbeatMs = Math.max(250, Number(options.heartbeatMs ?? 5000));
    this.allowWebSearch = options.allowWebSearch === true;
    this.isolateUserConfig = options.isolateUserConfig !== false;
    this.requireChatGptAuth = options.requireChatGptAuth === true;
    if (this.requireChatGptAuth) {
      delete this.env.OPENAI_API_KEY;
      delete this.env.CODEX_API_KEY;
      delete this.env.OPENAI_BASE_URL;
    }
    this.provider = options.provider ?? {
      name: "openai",
      label: "OpenAI",
      model: null,
      baseUrl: null,
      authentication: "openai",
      source: "default",
    };
    this.configurationError = options.configurationError
      ? sanitizeSummary(options.configurationError, 160)
      : null;
    this.tasks = new Map();
    this.resolvedLauncher = null;
    this.cachedProbe = null;
    this.lastExecutionVerification = null;
  }

  async probe(options = {}) {
    const cachedNeedsExecutionProbe =
      options.verifyExecution === true &&
      this.cachedProbe?.result?.capabilities?.executionVerified !== true;
    if (
      !options.refresh &&
      !cachedNeedsExecutionProbe &&
      this.cachedProbe &&
      Date.now() - this.cachedProbe.checkedAtMs < 15000
    )
      return this.cachedProbe.result;
    const launcher = await this.#launcher();
    const versionResult = await runCapture(
      launcher.command,
      [...launcher.prefix, ...this.commandPrefix, "--version"],
      { spawnImpl: this.spawnImpl, env: this.env },
    );
    if (versionResult.error || versionResult.code !== 0) {
      const result = {
        adapter: this.name,
        available: false,
        authenticated: false,
        version: null,
        command: launcher.displayCommand,
        reason: sanitizeSummary(
          versionResult.error?.message ||
            versionResult.stderr ||
            "CODEX_CLI_NOT_AVAILABLE",
        ),
        provider: this.provider,
        configurationError: this.configurationError,
        capabilities: {
          pause: this.platform !== "win32",
          resume: true,
          terminate: true,
          network: this.allowWebSearch,
          isolatedConfig: false,
        },
      };
      this.cachedProbe = { checkedAtMs: Date.now(), result };
      return result;
    }
    if (this.configurationError) {
      const result = {
        adapter: this.name,
        available: false,
        authenticated: false,
        version: sanitizeSummary(
          versionResult.stdout || versionResult.stderr,
          120,
        ),
        command: launcher.displayCommand,
        reason: this.configurationError,
        provider: this.provider,
        configurationError: this.configurationError,
        capabilities: {
          pause: this.platform !== "win32",
          resume: true,
          terminate: true,
          network: this.allowWebSearch,
          isolatedConfig: false,
          executionVerified: false,
        },
      };
      this.cachedProbe = { checkedAtMs: Date.now(), result };
      return result;
    }
    const helpResult = await runCapture(
      launcher.command,
      [...launcher.prefix, ...this.commandPrefix, "exec", "--help"],
      { spawnImpl: this.spawnImpl, env: this.env },
    );
    const loginResult = await runCapture(
      launcher.command,
      [...launcher.prefix, ...this.commandPrefix, "login", "status"],
      { spawnImpl: this.spawnImpl, env: this.env },
    );
    const isolationAvailable =
      /--ignore-user-config/.test(helpResult.stdout) &&
      /--ignore-rules/.test(helpResult.stdout);
    const executionAvailable =
      helpResult.code === 0 &&
      /--json/.test(helpResult.stdout) &&
      (!this.isolateUserConfig || isolationAvailable);
    let executionVerified = this.lastExecutionVerification?.verified ?? null;
    let executionProbeDetail = this.lastExecutionVerification?.detail ?? null;
    if (
      options.verifyExecution === true &&
      executionAvailable &&
      loginResult.code === 0
    ) {
      const isolationArgs = this.isolateUserConfig
        ? ["--ignore-user-config", "--ignore-rules"]
        : [];
      const executionResult = await runCapture(
        launcher.command,
        [
          ...launcher.prefix,
          ...this.commandPrefix,
          "-c",
          'model_reasoning_effort="low"',
          "--sandbox",
          "read-only",
          "--ask-for-approval",
          "never",
          "--cd",
          this.allowedRoots[0],
          "exec",
          "--json",
          "--color",
          "never",
          "--ephemeral",
          ...isolationArgs,
          "--skip-git-repo-check",
          "-",
        ],
        {
          spawnImpl: this.spawnImpl,
          env: this.env,
          cwd: this.allowedRoots[0],
          input: "Reply with exactly: CODEX_WORK_PLATFORM_PROBE_OK",
          timeoutMs: Number(options.executionTimeoutMs ?? 120_000),
        },
      );
      const events = executionResult.stdout
        .split(/\r?\n/)
        .map((line) => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      executionVerified =
        executionResult.code === 0 &&
        !executionResult.error &&
        events.some((event) => event.type === "turn.completed") &&
        !events.some((event) => event.type === "turn.failed");
      if (!executionVerified)
        executionProbeDetail = sanitizeSummary(
          executionResult.error?.message ||
            executionResult.stderr ||
            events.find((event) => event.type === "turn.failed")?.error
              ?.message ||
            "CODEX_EXECUTION_PROBE_FAILED",
          500,
        );
      else executionProbeDetail = null;
      this.lastExecutionVerification = {
        verified: executionVerified,
        detail: executionProbeDetail,
        checkedAt: now(),
      };
    }
    const loginStatus = `${loginResult.stdout}\n${loginResult.stderr}`;
    const authenticated =
      loginResult.code === 0 &&
      (!this.requireChatGptAuth ||
        /Logged in using ChatGPT/i.test(loginStatus));
    const result = {
      adapter: this.name,
      available: executionAvailable,
      authenticated,
      version: sanitizeSummary(
        versionResult.stdout || versionResult.stderr,
        120,
      ),
      command: launcher.displayCommand,
      provider: this.provider,
      configurationError: null,
      reason:
        !authenticated && loginResult.code === 0 && this.requireChatGptAuth
          ? "CODEX_CHATGPT_LOGIN_REQUIRED"
          : !executionAvailable
            ? helpResult.code === 0 &&
              this.isolateUserConfig &&
              !isolationAvailable
              ? "CODEX_EXEC_ISOLATION_UNAVAILABLE"
              : "CODEX_EXEC_JSON_UNAVAILABLE"
            : executionVerified === false
              ? "CODEX_EXECUTION_PROBE_FAILED"
              : null,
      executionProbeDetail,
      executionVerifiedAt: this.lastExecutionVerification?.checkedAt ?? null,
      capabilities: {
        pause: this.platform !== "win32",
        resume: true,
        terminate: true,
        network: this.allowWebSearch,
        isolatedConfig: this.isolateUserConfig && isolationAvailable,
        executionVerified,
      },
    };
    this.cachedProbe = { checkedAtMs: Date.now(), result };
    return result;
  }

  createTask(input = {}) {
    const prompt = String(input.prompt ?? "").trim();
    if (!prompt) throw Error("CODEX_PROMPT_REQUIRED");
    const cwd = this.#allowedCwd(input.cwd ?? process.cwd());
    const sandbox = String(input.sandbox ?? "read-only");
    if (
      !["read-only", "workspace-write", "danger-full-access"].includes(sandbox)
    )
      throw Error("CODEX_SANDBOX_INVALID");
    if (input.network === true && !this.allowWebSearch)
      throw Error("CODEX_NETWORK_POLICY_NOT_CONFIGURED");
    const model = String(input.model ?? "auto").trim() || "auto";
    const reasoningEffort =
      String(input.reasoningEffort ?? "auto")
        .trim()
        .toLowerCase() || "auto";
    const delegation =
      String(input.delegation ?? "DISABLED")
        .trim()
        .toUpperCase() || "DISABLED";
    const subagentModel =
      String(input.subagentModel ?? "auto").trim() || "auto";
    const subagentReasoningEffort =
      String(input.subagentReasoningEffort ?? "auto")
        .trim()
        .toLowerCase() || "auto";
    const validEfforts = new Set([
      "auto",
      "none",
      "minimal",
      "low",
      "medium",
      "high",
      "xhigh",
    ]);
    if (
      !validEfforts.has(reasoningEffort) ||
      !validEfforts.has(subagentReasoningEffort)
    )
      throw Error("CODEX_REASONING_EFFORT_INVALID");
    if (!["DISABLED", "AUTO"].includes(delegation))
      throw Error("CODEX_DELEGATION_POLICY_INVALID");
    const maxSubagents =
      input.maxSubagents === undefined ||
      input.maxSubagents === null ||
      input.maxSubagents === ""
        ? 4
        : Number(input.maxSubagents);
    if (!Number.isInteger(maxSubagents) || maxSubagents < 1 || maxSubagents > 6)
      throw Error("CODEX_SUBAGENT_LIMIT_INVALID");
    const task = {
      id: crypto.randomUUID(),
      adapter: this.name,
      state: input.state ?? "CREATED",
      createdAt: now(),
      updatedAt: now(),
      cwd,
      sandbox,
      prompt,
      network: input.network === true,
      skipGitRepoCheck: input.skipGitRepoCheck === true,
      model,
      reasoningEffort,
      delegation,
      subagentModel,
      subagentReasoningEffort,
      maxSubagents,
      threadId: input.threadId ?? null,
      process: null,
      heartbeat: null,
      stdoutBuffer: "",
      stderrSummary: "",
      finalSummary: "",
      artifactPaths: new Set(),
      callbacks: null,
      terminalSent: false,
      intentionalAction: null,
      sawTurnCompleted: false,
      protocolFailed: false,
    };
    this.tasks.set(task.id, task);
    return publicTask(task);
  }

  async startTask(taskRef, callbacks = {}) {
    const task = this.#task(taskRef);
    if (task.state === "RUNNING") throw Error("ADAPTER_TASK_ALREADY_RUNNING");
    const probe = await this.probe({ verifyExecution: true });
    if (!probe.available) throw Error("CODEX_CLI_NOT_AVAILABLE");
    if (!probe.authenticated) throw Error("CODEX_CLI_NOT_AUTHENTICATED");
    if (probe.capabilities.executionVerified !== true)
      throw Error("CODEX_EXECUTION_PROBE_FAILED");
    task.callbacks = callbacks;
    task.intentionalAction = null;
    return this.#spawn(task, false);
  }

  async pauseTask(taskRef) {
    const task = this.#task(taskRef);
    if (task.state !== "RUNNING" || !task.process)
      throw Error("ADAPTER_TASK_NOT_RUNNING");
    task.intentionalAction = "PAUSE";
    if (this.platform === "win32") {
      await this.#killTree(task.process.pid);
      task.process = null;
      task.state = "PAUSED";
      task.updatedAt = now();
      return { ...publicTask(task), resumeMode: "restart-session" };
    }
    task.process.kill("SIGSTOP");
    task.state = "PAUSED";
    task.updatedAt = now();
    return { ...publicTask(task), resumeMode: "signal" };
  }

  async resumeTask(taskRef, callbacks = null) {
    const task = this.#task(taskRef);
    if (task.state !== "PAUSED") throw Error("ADAPTER_TASK_NOT_PAUSED");
    const probe = await this.probe({ verifyExecution: true });
    if (!probe.available) throw Error("CODEX_CLI_NOT_AVAILABLE");
    if (!probe.authenticated) throw Error("CODEX_CLI_NOT_AUTHENTICATED");
    if (probe.capabilities.executionVerified !== true)
      throw Error("CODEX_EXECUTION_PROBE_FAILED");
    if (callbacks) task.callbacks = callbacks;
    task.intentionalAction = null;
    if (this.platform !== "win32" && task.process) {
      task.process.kill("SIGCONT");
      task.state = "RUNNING";
      task.updatedAt = now();
      return publicTask(task);
    }
    if (!task.threadId) throw Error("CODEX_RESUME_CHECKPOINT_MISSING");
    task.prompt =
      "Continue the approved task from the last saved state. Re-check the workspace before making further changes.";
    return this.#spawn(task, true);
  }

  async terminateTask(taskRef) {
    const task = this.#task(taskRef);
    task.intentionalAction = "TERMINATE";
    if (task.process?.pid) await this.#killTree(task.process.pid);
    clearInterval(task.heartbeat);
    task.heartbeat = null;
    task.process = null;
    task.state = "TERMINATED";
    task.updatedAt = now();
    return publicTask(task);
  }

  readStatus(taskRef) {
    return publicTask(this.#task(taskRef));
  }

  async collectArtifacts(taskRef) {
    const task = this.#task(taskRef);
    const records = [];
    for (const candidate of task.artifactPaths) {
      const resolved = resolveExistingPath(path.resolve(task.cwd, candidate));
      if (
        !this.allowedRoots.some((root) =>
          isWithinRoot(resolved, root, this.platform),
        )
      )
        continue;
      try {
        const stat = fs.statSync(resolved);
        if (!stat.isFile()) continue;
        const bytes = fs.readFileSync(resolved);
        records.push({
          name: path.basename(resolved),
          path: resolved,
          kind: "file",
          size: stat.size,
          sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
          verified: true,
        });
      } catch {}
    }
    if (!records.length) {
      const summary =
        task.finalSummary ||
        "Codex completed without a reported file artifact.";
      records.push({
        name: "codex-result-summary.txt",
        kind: "result-summary",
        size: Buffer.byteLength(summary),
        sha256: crypto.createHash("sha256").update(summary).digest("hex"),
        verified: true,
        summary: sanitizeSummary(summary),
      });
    }
    return records;
  }

  async close() {
    for (const task of this.tasks.values()) {
      clearInterval(task.heartbeat);
      if (task.process?.pid) await this.#killTree(task.process.pid);
    }
    this.tasks.clear();
  }

  async #spawn(task, resume) {
    const launcher = await this.#launcher();
    const configArgs = [];
    if (task.model !== "auto") configArgs.push("--model", task.model);
    if (task.reasoningEffort !== "auto")
      configArgs.push(
        "-c",
        `model_reasoning_effort=${JSON.stringify(task.reasoningEffort)}`,
      );
    if (task.delegation === "DISABLED") {
      configArgs.push(
        "-c",
        "features.multi_agent=false",
        "-c",
        "agents.enabled=false",
      );
    } else {
      configArgs.push(
        "-c",
        "features.multi_agent=true",
        "-c",
        "agents.enabled=true",
        "-c",
        `agents.max_concurrent_threads_per_session=${task.maxSubagents}`,
      );
      if (task.subagentModel !== "auto")
        configArgs.push(
          "-c",
          `agents.default_subagent_model=${JSON.stringify(task.subagentModel)}`,
        );
      if (task.subagentReasoningEffort !== "auto")
        configArgs.push(
          "-c",
          `agents.default_subagent_reasoning_effort=${JSON.stringify(task.subagentReasoningEffort)}`,
        );
    }
    const globalArgs = [
      ...configArgs,
      "--sandbox",
      task.sandbox,
      "--ask-for-approval",
      "never",
      "--cd",
      task.cwd,
    ];
    if (task.network) globalArgs.push("--search");
    const isolationArgs = this.isolateUserConfig
      ? ["--ignore-user-config", "--ignore-rules"]
      : [];
    const execArgs = resume
      ? [
          "exec",
          "resume",
          "--json",
          ...isolationArgs,
          ...(task.skipGitRepoCheck ? ["--skip-git-repo-check"] : []),
          task.threadId,
          "-",
        ]
      : [
          "exec",
          "--json",
          "--color",
          "never",
          ...isolationArgs,
          ...(task.skipGitRepoCheck ? ["--skip-git-repo-check"] : []),
          "-",
        ];
    const spawnArgs = [
      ...launcher.prefix,
      ...this.commandPrefix,
      ...globalArgs,
      ...execArgs,
    ];
    if (
      this.platform === "win32" &&
      /(?:cmd(?:\.exe)?|\.cmd)$/i.test(String(launcher.command)) &&
      spawnArgs.some((value) => /[&|<>^%\r\n]/.test(String(value)))
    )
      throw Error("CODEX_ARGUMENT_UNSAFE");
    const child = this.spawnImpl(launcher.command, spawnArgs, {
      cwd: task.cwd,
      env: this.env,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"],
    });
    task.process = child;
    task.state = "RUNNING";
    task.startedAt ??= now();
    task.updatedAt = now();
    task.terminalSent = false;
    task.callbacks?.onEvent?.({
      type: resume ? "adapter.resumed" : "adapter.started",
      summary: resume ? "Codex session resumed" : "Codex process started",
    });

    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => this.#consumeStdout(task, chunk));
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk) => {
      task.stderrSummary = sanitizeSummary(
        `${task.stderrSummary}\n${chunk}`,
        1600,
      );
      task.callbacks?.onEvent?.({
        type: "adapter.stderr",
        summary: sanitizeSummary(chunk, 500),
      });
    });
    child.once("error", (error) =>
      this.#finish(task, { code: null, signal: null, error }),
    );
    child.once("close", (code, signal) =>
      this.#finish(task, { code, signal, error: null }),
    );
    task.heartbeat = setInterval(() => {
      if (task.state === "RUNNING")
        task.callbacks?.onHeartbeat?.({
          progress: null,
          checkpoint: task.threadId,
          timestamp: now(),
        });
    }, this.heartbeatMs);
    child.stdin.end(task.prompt);
    return publicTask(task);
  }

  #consumeStdout(task, chunk) {
    task.stdoutBuffer += chunk;
    const lines = task.stdoutBuffer.split(/\r?\n/);
    task.stdoutBuffer = lines.pop() ?? "";
    for (const line of lines) {
      const event = parseCodexJsonLine(line);
      if (!event) continue;
      if (event.threadId) task.threadId = event.threadId;
      if (event.type === "turn.completed") task.sawTurnCompleted = true;
      if (["turn.failed", "protocol.invalid_json"].includes(event.type))
        task.protocolFailed = true;
      if (event.itemType === "agent_message" && event.summary)
        task.finalSummary = event.summary;
      for (const artifactPath of event.artifactPaths ?? [])
        task.artifactPaths.add(artifactPath);
      task.callbacks?.onEvent?.(event);
    }
  }

  #finish(task, result) {
    if (task.stdoutBuffer.trim()) {
      const event = parseCodexJsonLine(task.stdoutBuffer);
      task.stdoutBuffer = "";
      if (event) {
        if (event.threadId) task.threadId = event.threadId;
        if (event.type === "turn.completed") task.sawTurnCompleted = true;
        if (["turn.failed", "protocol.invalid_json"].includes(event.type))
          task.protocolFailed = true;
        if (event.itemType === "agent_message" && event.summary)
          task.finalSummary = event.summary;
        task.callbacks?.onEvent?.(event);
      }
    }
    clearInterval(task.heartbeat);
    task.heartbeat = null;
    task.process = null;
    task.updatedAt = now();
    if (task.intentionalAction === "PAUSE") {
      task.state = "PAUSED";
      task.intentionalAction = null;
      return;
    }
    if (task.intentionalAction === "TERMINATE") {
      task.state = "TERMINATED";
      task.intentionalAction = null;
      return;
    }
    if (task.terminalSent) return;
    task.terminalSent = true;
    const successful =
      result.code === 0 &&
      !result.error &&
      task.sawTurnCompleted &&
      !task.protocolFailed;
    task.state = successful ? "COMPLETED" : "MANUAL_INTERVENTION";
    task.lastError = successful
      ? null
      : sanitizeSummary(
          result.error?.message ||
            task.stderrSummary ||
            (task.protocolFailed
              ? "Codex reported a failed or invalid JSONL event"
              : task.sawTurnCompleted
                ? `Codex exited with code ${result.code ?? "unknown"}`
                : "Codex disconnected before turn.completed"),
        );
    task.callbacks?.onExit?.({
      state: successful ? "COMPLETED" : "MANUAL_INTERVENTION",
      code: result.code,
      signal: result.signal,
      error: task.lastError,
      threadId: task.threadId,
      finalSummary: task.finalSummary,
    });
  }

  async #launcher() {
    this.resolvedLauncher ??= await locateCodex(this.command, this.spawnImpl);
    return this.resolvedLauncher;
  }

  #allowedCwd(value) {
    const candidate = resolveExistingPath(value);
    if (
      !this.allowedRoots.some((root) =>
        isWithinRoot(candidate, root, this.platform),
      )
    )
      throw Error("CODEX_WORKSPACE_OUTSIDE_ALLOWED_ROOT");
    const segments = candidate
      .split(/[\\/]+/)
      .map((part) => part.toLowerCase());
    const forbiddenRoots = [
      path.join(os.homedir(), ".codex"),
      path.join(os.homedir(), ".ssh"),
      path.join(os.homedir(), ".aws"),
      path.join(os.homedir(), ".gnupg"),
    ];
    if (this.platform === "win32")
      forbiddenRoots.push(
        path.resolve(process.env.SystemRoot || "C:\\Windows"),
        path.resolve(process.env.ProgramFiles || "C:\\Program Files"),
      );
    if (
      segments.some((part) =>
        [".ssh", ".aws", ".gnupg", "keychains"].includes(part),
      ) ||
      forbiddenRoots.some((root) =>
        isWithinRoot(candidate, root, this.platform),
      )
    )
      throw Error("CODEX_SENSITIVE_DIRECTORY_FORBIDDEN");
    return candidate;
  }

  #task(taskRef) {
    const taskId = typeof taskRef === "string" ? taskRef : taskRef?.id;
    const task = this.tasks.get(taskId);
    if (!task) throw Error("ADAPTER_TASK_NOT_FOUND");
    return task;
  }

  async #killTree(pid) {
    if (!pid) return;
    if (this.platform !== "win32") {
      try {
        process.kill(pid, "SIGTERM");
      } catch {}
      return;
    }
    await runCapture("taskkill.exe", ["/pid", String(pid), "/t", "/f"], {
      spawnImpl: this.spawnImpl,
      timeoutMs: 5000,
    });
  }
}
