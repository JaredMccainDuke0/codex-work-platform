import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export const PRODUCT = "codex-work-platform";
export const PRODUCT_LABEL = "Codex Work Platform";
export const P10_VERSION = "1.0.0";
export const RELEASE_MANIFEST = "p10-release.json";
export const INSTALLATION_RECORD = "installation.json";
export const PLATFORM_CONFIG = "platform-config.json";

export function sha256Bytes(bytes) {
  return crypto.createHash("sha256").update(bytes).digest("hex");
}

export function sha256File(filePath) {
  return sha256Bytes(fs.readFileSync(filePath));
}

export function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function recordsSha256(records) {
  const stable = records.map(
    ({ path: relativePath, bytes, sha256, executable = false }) => ({
      path: relativePath,
      bytes,
      sha256,
      executable: Boolean(executable),
    }),
  );
  return sha256Bytes(canonicalJson(stable));
}

export function normalizeRelative(relativePath) {
  const normalized = String(relativePath ?? "")
    .replaceAll("\\", "/")
    .replace(/^\.\//, "");
  if (
    !normalized ||
    normalized.startsWith("/") ||
    /^[A-Za-z]:/.test(normalized)
  )
    throw Error("RELATIVE_PATH_INVALID");
  const segments = normalized.split("/");
  if (
    segments.some((segment) => !segment || segment === "." || segment === "..")
  )
    throw Error("RELATIVE_PATH_INVALID");
  return normalized;
}

export function requireAbsolute(value, label) {
  const text = String(value ?? "").trim();
  if (!text || !path.isAbsolute(text))
    throw Error(`ABSOLUTE_PATH_REQUIRED:${label}`);
  return path.normalize(text);
}

export function pathWithin(candidate, root, platform = process.platform) {
  const pathImpl = platform === "win32" ? path.win32 : path.posix;
  const normalize = (value) => {
    const resolved = pathImpl.resolve(value);
    return platform === "win32" ? resolved.toLowerCase() : resolved;
  };
  const target = normalize(candidate);
  const base = normalize(root);
  const separator = platform === "win32" ? path.win32.sep : path.posix.sep;
  return target === base || target.startsWith(`${base}${separator}`);
}

export function assertDistinctRoots(entries) {
  for (let left = 0; left < entries.length; left += 1) {
    for (let right = left + 1; right < entries.length; right += 1) {
      const [leftLabel, leftPath] = entries[left];
      const [rightLabel, rightPath] = entries[right];
      if (pathWithin(leftPath, rightPath) || pathWithin(rightPath, leftPath)) {
        throw Error(`ROOTS_MUST_NOT_OVERLAP:${leftLabel}:${rightLabel}`);
      }
    }
  }
}

export function assertNoSymlinkComponents(target) {
  const absolute = requireAbsolute(target, "path");
  const parsed = path.parse(absolute);
  const relative = absolute.slice(parsed.root.length);
  let current = parsed.root;
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) break;
    if (
      fs.lstatSync(current).isSymbolicLink() &&
      !(
        process.platform === "darwin" &&
        ["/var", "/tmp", "/etc"].includes(current.toLowerCase())
      )
    )
      throw Error(`SYMLINK_PATH_FORBIDDEN:${current}`);
  }
  return absolute;
}

export function assertNarrowRoot(target, label) {
  const absolute = assertNoSymlinkComponents(requireAbsolute(target, label));
  const parsed = path.parse(absolute);
  if (path.resolve(absolute) === path.resolve(parsed.root))
    throw Error(`BROAD_ROOT_FORBIDDEN:${label}`);
  if (path.resolve(absolute) === path.resolve(os.homedir()))
    throw Error(`HOME_ROOT_FORBIDDEN:${label}`);
  return absolute;
}

export function assertWorkspaceRoot(target) {
  const absolute = assertNarrowRoot(target, "workspaceRoot");
  const segments = absolute
    .split(/[\\/]+/)
    .map((segment) => segment.toLowerCase());
  if (
    segments.some((segment) =>
      [".ssh", ".aws", ".gnupg", "windows", "system32", "keychains"].includes(
        segment,
      ),
    )
  ) {
    throw Error("SENSITIVE_WORKSPACE_ROOT_FORBIDDEN");
  }
  return absolute;
}

export function assertEmptyOrMissing(target, label) {
  const absolute = assertNarrowRoot(target, label);
  if (!fs.existsSync(absolute)) return absolute;
  const stat = fs.lstatSync(absolute);
  if (!stat.isDirectory()) throw Error(`TARGET_NOT_DIRECTORY:${label}`);
  if (fs.readdirSync(absolute).length) throw Error(`TARGET_NOT_EMPTY:${label}`);
  return absolute;
}

export function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function renameWithRetry(source, target, options = {}) {
  const attempts = Math.max(1, Number(options.attempts ?? 8));
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      fs.renameSync(source, target);
      return true;
    } catch (error) {
      lastError = error;
      if (
        !["EPERM", "EBUSY", "EACCES"].includes(error?.code) ||
        attempt === attempts - 1
      )
        break;
      const wait = new Int32Array(new SharedArrayBuffer(4));
      Atomics.wait(wait, 0, 0, 50 * (attempt + 1));
    }
  }
  throw lastError;
}

export function atomicText(filePath, text, options = {}) {
  const absolute = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  const suffix = `${process.pid}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  const temporary = `${absolute}.tmp-${suffix}`;
  const previous = `${absolute}.previous-${suffix}`;
  fs.writeFileSync(temporary, text, {
    flag: "wx",
    mode: options.mode ?? 0o600,
  });
  let movedPrevious = false;
  try {
    if (fs.existsSync(absolute)) {
      renameWithRetry(absolute, previous);
      movedPrevious = true;
    }
    renameWithRetry(temporary, absolute);
    if (movedPrevious) fs.unlinkSync(previous);
  } catch (error) {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    if (movedPrevious && fs.existsSync(previous) && !fs.existsSync(absolute))
      renameWithRetry(previous, absolute);
    throw error;
  }
}

export function atomicJson(filePath, value, options = {}) {
  atomicText(filePath, `${JSON.stringify(value, null, 2)}\n`, options);
}

export function walkFiles(root, options = {}) {
  const absoluteRoot = requireAbsolute(root, "root");
  if (!fs.existsSync(absoluteRoot)) return [];
  const excluded = new Set((options.exclude ?? []).map(normalizeRelative));
  const executable = new Set((options.executable ?? []).map(normalizeRelative));
  const records = [];

  function visit(directory) {
    const entries = fs
      .readdirSync(directory, { withFileTypes: true })
      .sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(directory, entry.name);
      const relative = normalizeRelative(path.relative(absoluteRoot, absolute));
      if (excluded.has(relative)) continue;
      if (entry.isSymbolicLink())
        throw Error(`SYMLINK_PAYLOAD_FORBIDDEN:${relative}`);
      if (entry.isDirectory()) {
        visit(absolute);
        continue;
      }
      if (!entry.isFile())
        throw Error(`NON_FILE_PAYLOAD_FORBIDDEN:${relative}`);
      const bytes = fs.readFileSync(absolute);
      records.push({
        path: relative,
        bytes: bytes.length,
        sha256: sha256Bytes(bytes),
        executable: executable.has(relative),
      });
    }
  }

  visit(absoluteRoot);
  return records.sort((a, b) => a.path.localeCompare(b.path));
}

export function validateRecords(records) {
  if (!Array.isArray(records) || !records.length)
    throw Error("FILE_RECORDS_REQUIRED");
  const seen = new Set();
  for (const record of records) {
    record.path = normalizeRelative(record.path);
    if (seen.has(record.path))
      throw Error(`FILE_RECORD_DUPLICATE:${record.path}`);
    seen.add(record.path);
    if (!Number.isSafeInteger(record.bytes) || record.bytes < 0)
      throw Error(`FILE_RECORD_BYTES_INVALID:${record.path}`);
    if (!/^[a-f0-9]{64}$/.test(record.sha256))
      throw Error(`FILE_RECORD_SHA256_INVALID:${record.path}`);
    if (typeof record.executable !== "boolean")
      throw Error(`FILE_RECORD_EXECUTABLE_INVALID:${record.path}`);
  }
  const sorted = [...records].sort((a, b) => a.path.localeCompare(b.path));
  if (JSON.stringify(sorted) !== JSON.stringify(records))
    throw Error("FILE_RECORDS_NOT_SORTED");
  return records;
}

export function verifyRecords(root, expected, options = {}) {
  const records = validateRecords(expected.map((record) => ({ ...record })));
  const actual = walkFiles(root, {
    exclude: options.exclude ?? [],
    executable: records
      .filter((record) => record.executable)
      .map((record) => record.path),
  });
  if (actual.length !== records.length)
    throw Error(`FILE_SET_MISMATCH:${options.label ?? "payload"}`);
  for (let index = 0; index < records.length; index += 1) {
    const wanted = records[index];
    const found = actual[index];
    if (
      wanted.path !== found.path ||
      wanted.bytes !== found.bytes ||
      wanted.sha256 !== found.sha256
    ) {
      throw Error(`FILE_BYTES_MISMATCH:${wanted.path}`);
    }
  }
  return {
    fileCount: records.length,
    bytes: records.reduce((sum, record) => sum + record.bytes, 0),
    treeSha256: recordsSha256(records),
  };
}

export function copyRecords(sourceRoot, targetRoot, records) {
  const source = requireAbsolute(sourceRoot, "sourceRoot");
  const target = requireAbsolute(targetRoot, "targetRoot");
  validateRecords(records);
  for (const record of records) {
    const sourcePath = path.join(source, ...record.path.split("/"));
    const targetPath = path.join(target, ...record.path.split("/"));
    if (!pathWithin(sourcePath, source) || !pathWithin(targetPath, target))
      throw Error(`COPY_PATH_ESCAPE:${record.path}`);
    if (!fs.existsSync(sourcePath) || fs.lstatSync(sourcePath).isSymbolicLink())
      throw Error(`COPY_SOURCE_INVALID:${record.path}`);
    const stat = fs.statSync(sourcePath);
    if (
      !stat.isFile() ||
      stat.size !== record.bytes ||
      sha256File(sourcePath) !== record.sha256
    )
      throw Error(`COPY_SOURCE_MISMATCH:${record.path}`);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.copyFileSync(sourcePath, targetPath, fs.constants.COPYFILE_EXCL);
    if (process.platform !== "win32")
      fs.chmodSync(targetPath, record.executable ? 0o755 : 0o644);
  }
  return verifyRecords(target, records);
}

export function parseCli(argv) {
  const [command, ...rest] = argv;
  const flags = new Map();
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index];
    const value = rest[index + 1];
    if (!key?.startsWith("--") || value === undefined || value.startsWith("--"))
      throw Error(`INVALID_ARGUMENTS_AT:${index}`);
    if (flags.has(key)) throw Error(`FLAG_DUPLICATE:${key}`);
    flags.set(key, value);
  }
  return { command, flags };
}

export function requiredFlag(flags, name) {
  const value = flags.get(name)?.trim();
  if (!value) throw Error(`FLAG_REQUIRED:${name}`);
  return value;
}

export function booleanFlag(flags, name, fallback = false) {
  const value = flags.get(name);
  if (value === undefined) return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw Error(`FLAG_BOOLEAN_INVALID:${name}`);
}

export function integerFlag(
  flags,
  name,
  fallback,
  { min = 0, max = 65535 } = {},
) {
  const value = flags.get(name);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max)
    throw Error(`FLAG_INTEGER_INVALID:${name}`);
  return parsed;
}

export function processAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error?.code === "EPERM";
  }
}

export function redactSecrets(value) {
  return String(value ?? "")
    .replace(/\b(sk-[A-Za-z0-9_-]{12,})\b/g, "[REDACTED]")
    .replace(
      /["']?(?:api[_-]?key|access[_-]?token|refresh[_-]?token|authorization)["']?\s*[:=]\s*["']?[^\s,"'}]{20,}/gi,
      "[REDACTED]",
    )
    .replace(
      /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
      "[REDACTED]",
    )
    .replace(
      /((?:api[_-]?key|token|authorization)\s*[:=]\s*)[^\s,;]+/gi,
      "$1[REDACTED]",
    );
}

export function defaultRoots(
  platform = process.platform,
  env = process.env,
  home = os.homedir(),
) {
  const paths = platform === "win32" ? path.win32 : path.posix;
  if (platform === "win32") {
    const local = env.LOCALAPPDATA
      ? paths.resolve(env.LOCALAPPDATA)
      : paths.join(home, "AppData", "Local");
    return {
      installRoot: paths.join(local, "Programs", "CodexWorkPlatform"),
      dataRoot: paths.join(local, "CodexWorkPlatform", "data"),
      workspaceRoot: paths.join(home, "Documents", "CodexWorkspace"),
      backupRoot: paths.join(home, "Documents", "CodexWorkPlatform Backups"),
    };
  }
  if (platform === "darwin") {
    return {
      installRoot: paths.join(home, "Applications", "CodexWorkPlatform"),
      dataRoot: paths.join(
        home,
        "Library",
        "Application Support",
        "CodexWorkPlatform",
      ),
      workspaceRoot: paths.join(home, "Documents", "CodexWorkspace"),
      backupRoot: paths.join(home, "Documents", "CodexWorkPlatform Backups"),
    };
  }
  return {
    installRoot: paths.join(
      home,
      ".local",
      "share",
      "codex-work-platform",
      "app",
    ),
    dataRoot: paths.join(
      home,
      ".local",
      "share",
      "codex-work-platform",
      "data",
    ),
    workspaceRoot: paths.join(home, "CodexWorkspace"),
    backupRoot: paths.join(home, "codex-work-platform-backups"),
  };
}

export function uniqueName(prefix) {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(5).toString("hex")}`;
}
