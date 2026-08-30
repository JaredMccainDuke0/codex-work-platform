import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export function pathWithinRoot(candidate, root, platform = process.platform) {
  const pathImpl = platform === "win32" ? path.win32 : path.posix;
  const resolved = pathImpl.resolve(candidate);
  const base = pathImpl.resolve(root);
  const normalize = (value) =>
    platform === "win32" ? value.toLowerCase() : value;
  const relative = pathImpl.relative(normalize(base), normalize(resolved));
  return (
    relative === "" ||
    (relative && !relative.startsWith("..") && !pathImpl.isAbsolute(relative))
  );
}

export function safetyPath(candidate) {
  const resolved = path.resolve(String(candidate));
  try {
    return fs.realpathSync.native(resolved);
  } catch {
    let current = resolved;
    const suffix = [];
    while (!fs.existsSync(current)) {
      const parent = path.dirname(current);
      if (parent === current) return resolved;
      suffix.unshift(path.basename(current));
      current = parent;
    }
    try {
      return path.join(fs.realpathSync.native(current), ...suffix);
    } catch {
      return resolved;
    }
  }
}

export function sensitiveDirectory(
  candidate,
  { platform = process.platform, home = os.homedir(), env = process.env } = {},
) {
  const resolved = safetyPath(candidate).toLowerCase();
  const normalizedHome = home.toLowerCase();
  const forbidden = [path.join(normalizedHome, ".codex").toLowerCase()];
  if (platform === "win32")
    forbidden.push(
      path.resolve(env.SystemRoot || "C:\\Windows").toLowerCase(),
      path.resolve(env.ProgramFiles || "C:\\Program Files").toLowerCase(),
      path.resolve(env.ProgramData || "C:\\ProgramData").toLowerCase(),
    );
  else
    forbidden.push(
      "/etc",
      "/usr",
      "/bin",
      "/sbin",
      "/system",
      "/library",
      "/private/etc",
      "/private/var/root",
      "/private/var/db",
      "/private/system",
      "/private/library",
      path.join(normalizedHome, ".ssh").toLowerCase(),
      path.join(normalizedHome, ".aws").toLowerCase(),
      path.join(normalizedHome, ".gnupg").toLowerCase(),
      path.join(normalizedHome, "library", "keychains").toLowerCase(),
    );
  return (
    forbidden.some((root) => pathWithinRoot(resolved, root, platform)) ||
    (platform !== "win32" && resolved === path.parse(resolved).root) ||
    (platform === "win32" && /^[a-z]:\\?$/.test(resolved))
  );
}

export function safeDirectoryName(value) {
  const normalized = String(value ?? "")
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "-")
    .replace(/[. ]+$/g, "")
    .slice(0, 80);
  if (!normalized || normalized === "." || normalized === "..")
    throw Error("PROJECT_DIRECTORY_NAME_INVALID");
  return normalized;
}
