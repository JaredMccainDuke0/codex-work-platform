import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { serveWebAsset } from "../server/static-assets.mjs";

function responseRecorder() {
  return {
    status: null,
    headers: null,
    payload: null,
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(payload) {
      this.payload = payload;
    },
  };
}

test("static asset service sends typed files and rejects escapes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "cwp-assets-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, "app.js"), "export const ok = true;\n");

  const served = responseRecorder();
  serveWebAsset({ res: served, webRoot: root, relativePath: "app.js" });
  assert.equal(served.status, 200);
  assert.equal(
    served.headers["content-type"],
    "text/javascript; charset=utf-8",
  );
  assert.match(served.payload.toString(), /ok = true/);

  const escaped = responseRecorder();
  serveWebAsset({ res: escaped, webRoot: root, relativePath: "../secret.txt" });
  assert.equal(escaped.status, 404);
  assert.deepEqual(JSON.parse(escaped.payload), {
    ok: false,
    code: "ASSET_NOT_FOUND",
  });
});
