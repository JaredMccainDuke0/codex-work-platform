#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  {
    cwd: root,
    encoding: "utf8",
  },
)
  .split("\0")
  .filter(Boolean)
  .filter(
    (file) =>
      !file.startsWith("release/compat-runtime/") &&
      ![".wasm", ".png", ".jpg", ".jpeg", ".gif", ".ico"].includes(
        path.extname(file).toLowerCase(),
      ),
  )
  .sort();
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
