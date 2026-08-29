#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = [
  ".env.example",
  ".gitattributes",
  "CHANGELOG.md",
  "CODE_OF_CONDUCT.md",
  "CONTRIBUTING.md",
  "LICENSE",
  "NOTICE",
  "THIRD_PARTY_NOTICES.md",
  "README.md",
  "README.zh-CN.md",
  "SECURITY.md",
  "bin/build-p10-release.mjs",
  "codex-adapter.mjs",
  "codex-app-server-adapter.mjs",
  "codex-app-server.mjs",
  "docs/api.md",
  "docs/architecture.md",
  "docs/migrations.md",
  "docs/release.md",
  "installer/install-macos.command",
  "installer/install-windows.ps1",
  "installer/platform-common.mjs",
  "installer/platform-manager.mjs",
  "installer/workbench-supervisor.mjs",
  "p10-control-server.mjs",
  "p10-state.mjs",
  "package-lock.json",
  "package.json",
  "scripts/check-syntax.mjs",
  "scripts/dev.mjs",
  "scripts/e2e-smoke.mjs",
  "scripts/format-check.mjs",
  "scripts/public-audit.mjs",
  "scripts/verify-release.mjs",
  "state-store.mjs",
  "validation.mjs",
  "web/app.js",
  "web/index.html",
  "web/styles.css",
  "workflow-core.mjs",
  ".github/dependabot.yml",
  ".github/workflows/ci.yml",
  ".github/workflows/release.yml",
];
const prettierCli = path.join(
  root,
  "node_modules",
  "prettier",
  "bin",
  "prettier.cjs",
);
execFileSync(
  process.execPath,
  [prettierCli, "--ignore-unknown", "--check", ...files],
  {
    cwd: root,
    stdio: "inherit",
  },
);
process.stdout.write(
  JSON.stringify({ ok: true, checked: files.length }) + "\n",
);
