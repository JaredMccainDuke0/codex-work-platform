#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  COMPAT_RUNTIME_VERSION,
  PRODUCT_ID,
  PRODUCT_VERSION,
} from "../version.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

let requestedTag = null;
for (let index = 2; index < process.argv.length; index += 1) {
  const flag = process.argv[index];
  if (flag !== "--tag") throw Error(`VERSION_ARGUMENT_UNKNOWN:${flag}`);
  if (requestedTag !== null) throw Error("VERSION_TAG_DUPLICATE");
  requestedTag = String(process.argv[++index] ?? "").trim();
  if (!requestedTag) throw Error("VERSION_TAG_REQUIRED");
}

const packageJson = readJson("package.json");
const packageLock = readJson("package-lock.json");
const compatPlugin = readJson(
  "release/compat-runtime/plugins/codex-work-platform/.codex-plugin/plugin.json",
);
const compatManifest = readJson(
  "release/compat-runtime/plugins/codex-work-platform/runtime/build-manifest.json",
);
const changelog = fs.readFileSync(path.join(root, "CHANGELOG.md"), "utf8");

const checks = {
  packageName: packageJson.name === PRODUCT_ID,
  packageVersion: packageJson.version === PRODUCT_VERSION,
  lockVersion:
    packageLock.version === PRODUCT_VERSION &&
    packageLock.packages?.[""]?.version === PRODUCT_VERSION,
  changelog: new RegExp(
    `^## \\[?${PRODUCT_VERSION.replaceAll(".", "\\.")}\\]?\\s+-`,
    "m",
  ).test(changelog),
  compatPlugin: compatPlugin.version === COMPAT_RUNTIME_VERSION,
  compatManifest: compatManifest.version === COMPAT_RUNTIME_VERSION,
  releaseTag: requestedTag === null || requestedTag === `v${PRODUCT_VERSION}`,
};

const failed = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);
if (failed.length) throw Error(`VERSION_CHECK_FAILED:${failed.join(",")}`);

process.stdout.write(
  `${JSON.stringify({ ok: true, product: PRODUCT_ID, version: PRODUCT_VERSION, compatRuntimeVersion: COMPAT_RUNTIME_VERSION, tag: requestedTag })}\n`,
);
