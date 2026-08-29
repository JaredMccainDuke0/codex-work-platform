#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPortableRelease } from "../installer/platform-manager.mjs";
import { redactSecrets } from "../codex-adapter.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  let output = path.join(root, "output", "codex-work-platform-1.0.0-portable");
  for (let index = 2; index < process.argv.length; index += 1) {
    if (process.argv[index] === "--output") {
      if (!process.argv[index + 1]) throw Error("VERIFY_OUTPUT_REQUIRED");
      output = path.resolve(process.argv[++index]);
    } else if (!process.argv[index].startsWith("--"))
      output = path.resolve(process.argv[index]);
    else throw Error(`VERIFY_ARGUMENT_UNKNOWN:${process.argv[index]}`);
  }
  const result = verifyPortableRelease(output);
  process.stdout.write(
    `${JSON.stringify({ ok: true, outputRoot: result.releaseRoot, version: result.manifest.version, fileCount: result.fileCount, bytes: result.bytes, manifestSha256: result.manifestSha256, treeSha256: result.treeSha256 })}\n`,
  );
} catch (error) {
  process.stderr.write(
    `${JSON.stringify({ ok: false, code: redactSecrets(error?.message || String(error)) })}\n`,
  );
  process.exitCode = 1;
}
