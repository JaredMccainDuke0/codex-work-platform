#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignored = new Set([
  "node_modules",
  ".git",
  ".local",
  ".playwright-cli",
  "output",
  "coverage",
]);
const files = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(absolute);
    else if (
      entry.isFile() &&
      (absolute.endsWith(".mjs") ||
        absolute.endsWith(".js") ||
        absolute.endsWith(".cjs"))
    )
      files.push(absolute);
  }
}

walk(root);
for (const file of files.sort()) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) {
    process.stderr.write(
      result.stderr || result.stdout || `Syntax check failed: ${file}\n`,
    );
    process.exit(1);
  }
}
process.stdout.write(
  JSON.stringify({ ok: true, checked: files.length }) + "\n",
);
