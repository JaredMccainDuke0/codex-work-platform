import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { publicErrorCode, statusForError } from "../server/errors.mjs";
import {
  originAllowed,
  queryInteger,
  readJsonBody,
  sendJson,
} from "../server/http.mjs";

test("HTTP helpers parse bounded object bodies", async () => {
  const request = Readable.from([Buffer.from('{"ok":true}')]);
  request.headers = { "content-length": "11" };
  assert.deepEqual(await readJsonBody(request), { ok: true });

  const arrayRequest = Readable.from([Buffer.from("[]")]);
  arrayRequest.headers = {};
  await assert.rejects(
    readJsonBody(arrayRequest),
    /REQUEST_BODY_OBJECT_REQUIRED/,
  );

  const largeRequest = Readable.from([Buffer.from("12345")]);
  largeRequest.headers = { "content-length": "5" };
  await assert.rejects(
    readJsonBody(largeRequest, { maxBytes: 4 }),
    /REQUEST_BODY_TOO_LARGE/,
  );
});

test("HTTP helpers emit safe JSON and normalize query bounds", () => {
  const response = {
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
  sendJson(response, 201, { ok: true });
  assert.equal(response.status, 201);
  assert.equal(response.headers["cache-control"], "no-store");
  assert.deepEqual(JSON.parse(response.payload), { ok: true });
  assert.equal(queryInteger("500", 10, 1, 100), 100);
  assert.equal(queryInteger("invalid", 10, 1, 100), 10);
});

test("origin and error helpers preserve the public API contract", () => {
  const endpoint = { host: "127.0.0.1", port: 19738 };
  assert.equal(originAllowed("", endpoint), true);
  assert.equal(originAllowed("http://localhost:19738", endpoint), true);
  assert.equal(originAllowed("https://example.com", endpoint), false);
  assert.equal(
    publicErrorCode(new Error("RUN_NOT_FOUND:private detail")),
    "RUN_NOT_FOUND",
  );
  assert.equal(
    publicErrorCode(new Error("thread not loaded")),
    "CONVERSATION_NOT_FOUND",
  );
  assert.equal(statusForError("RUN_NOT_FOUND"), 404);
  assert.equal(statusForError("REQUEST_BODY_TOO_LARGE"), 413);
  assert.equal(statusForError("COMPAT_RESPONSE_INVALID"), 502);
  assert.equal(statusForError("WORKFLOW_VERSION_CONFLICT"), 409);
});
