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
let historyCommitsScanned = 0;

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

try {
  const history = execFileSync(
    "git",
    ["log", "--all", "-p", "--no-color", "--format=COMMIT:%H"],
    { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const commits = new Set();
  const seen = new Set();
  let commit = "";
  let file = "";
  for (const line of history.split(/\r?\n/)) {
    const commitMatch = line.match(/^COMMIT:([a-f0-9]{40})$/);
    if (commitMatch) {
      commit = commitMatch[1];
      commits.add(commit);
      continue;
    }
    const fileMatch = line.match(/^diff --git a\/(.+) b\/(.+)$/);
    if (fileMatch) {
      file = fileMatch[2];
      continue;
    }
    if (
      !commit ||
      !file ||
      file === "scripts/public-audit.mjs" ||
      !line.startsWith("+") ||
      line.startsWith("+++")
    )
      continue;
    const added = line.slice(1);
    const record = (type, pattern) => {
      const key = `${commit}:${file}:${type}:${pattern}`;
      if (seen.has(key)) return;
      seen.add(key);
      findings.push({
        type,
        commit: commit.slice(0, 12),
        path: file,
        pattern,
      });
    };
    for (const pattern of secretPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(added)) record("history-secret-pattern", pattern.source);
    }
    for (const pattern of personalPathPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(added)) record("history-personal-path", pattern.source);
    }
    personalEmailPattern.lastIndex = 0;
    if (personalEmailPattern.test(added))
      record("history-personal-email", personalEmailPattern.source);
  }
  historyCommitsScanned = commits.size;
} catch (error) {
  findings.push({
    type: "history-audit-failed",
    code: String(error?.message || error).slice(0, 200),
  });
}

const vendorSource = path.join(
  root,
  "vendor",
  "compat-runtime",
  "SOURCES.json",
);
const vendor = JSON.parse(fs.readFileSync(vendorSource, "utf8"));
const recovery = vendor.recovery;
if (!recovery || typeof recovery !== "object")
  findings.push({
    type: "vendor-recovery-record-missing",
    path: "vendor/compat-runtime/SOURCES.json",
  });
else {
  for (const field of ["evidence", "replacementContract", "machineContract"]) {
    const relative = String(recovery[field] || "");
    if (!relative || !fs.existsSync(path.join(root, relative)))
      findings.push({
        type: "vendor-recovery-document-missing",
        field,
        path: relative,
      });
  }
  const runtimeBundle = path.join(
    root,
    "release",
    "compat-runtime",
    "plugins",
    "codex-work-platform",
    "runtime",
    "codex-work-platform.mjs",
  );
  const runtimeText = fs.readFileSync(runtimeBundle, "utf8");
  for (const sourceModule of recovery.bundleModuleComments || [])
    if (!runtimeText.includes(`// ${sourceModule}`))
      findings.push({
        type: "vendor-module-evidence-missing",
        path: sourceModule,
      });
  const contractPath = path.join(root, String(recovery.machineContract || ""));
  if (fs.existsSync(contractPath)) {
    const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));
    const mcpBundle = fs.readFileSync(
      path.join(
        root,
        "release",
        "compat-runtime",
        "plugins",
        "codex-work-platform",
        "runtime",
        "mcp-server.mjs",
      ),
      "utf8",
    );
    for (const command of contract.cliCommands || [])
      if (!runtimeText.includes(`"${command}"`))
        findings.push({ type: "vendor-cli-contract-missing", command });
    for (const httpPath of contract.httpPaths || [])
      if (!runtimeText.includes(`"${httpPath}"`))
        findings.push({ type: "vendor-http-contract-missing", path: httpPath });
    for (const tool of contract.mcpTools || [])
      if (!mcpBundle.includes(`"${tool}"`))
        findings.push({ type: "vendor-mcp-contract-missing", tool });
  }
}
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
const onboardingContracts = [
  {
    path: "README.md",
    patterns: [
      /releases\/latest/,
      /windows-x64\.zip/,
      /Keep the launcher window open/,
      /docs\/user-guide\.md/,
    ],
  },
  {
    path: "README.zh-CN.md",
    patterns: [/releases\/latest/, /windows-x64\.zip/, /保持启动窗口打开/],
  },
  {
    path: "installer/install-windows.cmd",
    patterns: [/install-windows\.ps1/, /-Start/],
  },
  {
    path: "docs/user-guide.md",
    patterns: [/Installed lifecycle commands/, /codex login status/],
  },
  {
    path: ".github/workflows/release.yml",
    patterns: [/Package release \(Windows ZIP\)/, /\.zip"/],
  },
];
for (const contract of onboardingContracts) {
  const absolute = path.join(root, contract.path);
  if (!fs.existsSync(absolute)) {
    findings.push({ type: "onboarding-file-missing", path: contract.path });
    continue;
  }
  const content = fs.readFileSync(absolute, "utf8");
  for (const pattern of contract.patterns)
    if (!pattern.test(content))
      findings.push({
        type: "onboarding-contract-missing",
        path: contract.path,
        pattern: pattern.source,
      });
}
const windowsInstallerBytes = fs.readFileSync(
  path.join(root, "installer", "install-windows.ps1"),
);
if (windowsInstallerBytes.some((value) => value > 127))
  findings.push({
    type: "windows-powershell-non-ascii",
    path: "installer/install-windows.ps1",
  });
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
const result = {
  ok: findings.length === 0,
  releaseMode,
  historyCommitsScanned,
  findings,
};
process.stdout.write(JSON.stringify(result, null, 2) + "\n");
if (!result.ok) process.exit(1);
