#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([
  ".git",
  "node_modules",
  "output",
  ".local",
  "coverage",
  ".playwright-cli",
]);
const suspiciousNames =
  /(^|[\\/])(auth\.json|credentials?\b|\.env(?:\.|$)|.*\.(sqlite|db)(?:[-.]|$)|.*\.p10\.json(?:\.|$)|.*(?:playwright|test-results?|coverage|screenshots?)[-_].*)/i;
const secretPatterns = [
  /\b(?:sk|rk|pk)-[A-Za-z0-9_-]{20,}\b/g,
  /\b(?:gh[pousr]|github_pat)_[A-Za-z0-9_-]{20,}\b/g,
  /\bAKIA[0-9A-Z]{16}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+\/-]{24,}={0,2}\b/gi,
  /\b(?:api[_ -]?key|access[_ -]?token|refresh[_ -]?token|secret)\s*[:=]\s*["']?[A-Za-z0-9._~+\/-]{20,}/gi,
];
const personalPathPatterns = [
  /\bC:\\Users\\[^\\\r\n]+/gi,
  /\b\/Users\/[^\/\r\n]+/g,
];
const personalEmailPattern =
  /\b[A-Z0-9._%+-]+@(?!example\.(?:com|org|net)\b)(?!localhost\b)[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const allowedBinaryExtensions = new Set([".wasm"]);
const findings = [];

try {
  const tracked = execFileSync("git", ["ls-files"], {
    cwd: root,
    encoding: "utf8",
  })
    .split(/\r?\n/)
    .filter(Boolean);
  for (const file of tracked)
    if (
      /^(?:output|\.local|\.playwright-cli|.*\.sqlite|.*\.p10\.json)(?:\/|$)/i.test(
        file,
      )
    )
      findings.push({ type: "tracked-private-artifact", path: file });
} catch {}

try {
  const candidates = execFileSync(
    "git",
    ["status", "--porcelain", "--untracked-files=all"],
    { cwd: root, encoding: "utf8" },
  );
  for (const line of candidates.split(/\r?\n/)) {
    const file = line.slice(3).trim().replaceAll("\\", "/");
    if (
      file &&
      /^(?:output|\.local|coverage|.*\.sqlite(?:[-.]|$)|.*\.p10\.json(?:[-.]|$))/i.test(
        file,
      )
    )
      findings.push({ type: "candidate-private-artifact", path: file });
  }
} catch {}

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(root, absolute).replaceAll("\\", "/");
    if (entry.isSymbolicLink()) {
      findings.push({ type: "symlink-forbidden", path: relative });
      continue;
    }
    if (suspiciousNames.test(relative) && relative !== ".env.example")
      findings.push({ type: "suspicious-file", path: relative });
    if (entry.isDirectory()) walk(absolute);
    else if (entry.isFile() && relative !== "scripts/public-audit.mjs") {
      const bytes = fs.readFileSync(absolute);
      if (bytes.length > 20 * 1024 * 1024)
        findings.push({
          type: "oversized-file",
          path: relative,
          bytes: bytes.length,
        });
      const text = entry.name.endsWith(".wasm")
        ? bytes.toString("latin1")
        : bytes.toString("utf8");
      if (
        bytes.includes(0) &&
        !allowedBinaryExtensions.has(path.extname(entry.name).toLowerCase())
      )
        findings.push({ type: "undeclared-binary", path: relative });
      for (const pattern of secretPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(text))
          findings.push({
            type: "secret-pattern",
            path: relative,
            pattern: pattern.source,
          });
      }
      for (const pattern of personalPathPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(text))
          findings.push({
            type: "personal-path",
            path: relative,
            pattern: pattern.source,
          });
      }
      personalEmailPattern.lastIndex = 0;
      if (personalEmailPattern.test(text))
        findings.push({
          type: "personal-email",
          path: relative,
          pattern: personalEmailPattern.source,
        });
    }
  }
}

walk(root);
const vendorSource = path.join(
  root,
  "vendor",
  "compat-runtime",
  "SOURCES.json",
);
const vendor = JSON.parse(fs.readFileSync(vendorSource, "utf8"));
const noticesPath = path.join(
  root,
  "vendor",
  "compat-runtime",
  "THIRD_PARTY_NOTICES.md",
);
if (!fs.existsSync(noticesPath))
  findings.push({
    type: "vendor-notices-missing",
    path: "vendor/compat-runtime/THIRD_PARTY_NOTICES.md",
  });
for (const dependency of vendor.dependencies || []) {
  if (
    !dependency?.name ||
    !dependency?.spdx ||
    !/^https?:\/\//.test(String(dependency.source || ""))
  )
    findings.push({ type: "vendor-dependency-record-incomplete", dependency });
}
for (const record of vendor.files || []) {
  const absolute = path.join(root, record.path);
  if (!fs.existsSync(absolute))
    findings.push({ type: "vendor-file-missing", path: record.path });
  else {
    const bytes = fs.readFileSync(absolute);
    const digest = (await import("node:crypto"))
      .createHash("sha256")
      .update(bytes)
      .digest("hex");
    if (bytes.length !== record.bytes || digest !== record.sha256)
      findings.push({ type: "vendor-file-mismatch", path: record.path });
  }
}
const releaseMode =
  process.argv.includes("--release") ||
  process.env.npm_config_release === "true";
if (
  releaseMode &&
  !["VERIFIED", "VERIFIED_LOCAL_ARTIFACT"].includes(vendor.status)
)
  findings.push({
    type: "vendor-audit-incomplete",
    path: "vendor/compat-runtime/SOURCES.json",
    status: vendor.status,
  });
const result = { ok: findings.length === 0, releaseMode, findings };
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
if (!result.ok) process.exit(1);
