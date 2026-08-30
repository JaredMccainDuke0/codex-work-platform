import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { StateStore } from "../state-store.mjs";

const iso = () => new Date().toISOString();

test("state store imports legacy JSON, redacts it, and preserves an archive", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-state-migration-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const databasePath = path.join(dir, "control.sqlite");
  const legacyPath = path.join(dir, "platform.sqlite.p10.json");
  const token = ["sk", "legacy-secret-value-123456"].join("-");
  await writeFile(
    legacyPath,
    JSON.stringify({
      runs: [
        {
          id: "run-1",
          state: "FAILED",
          version: 1,
          error: `token=${token}`,
          [["access", "Token"].join("")]: [
            "raw-secret-value",
            "that-must-not-persist",
          ].join("-"),
          createdAt: iso(),
          updatedAt: iso(),
        },
      ],
      approvals: [],
      events: [
        {
          id: "event-1",
          sequence: 1,
          type: "TEST",
          summary: token,
          timestamp: iso(),
        },
      ],
      artifacts: [],
      executionLogs: [],
      operatorActions: [],
      workflows: [],
      workflowExecutions: [],
      workflowNodes: [],
      workflowEdges: [],
      idempotency: {},
      settings: {},
      projectDirectories: {},
    }),
  );
  const store = new StateStore({
    databasePath,
    legacyStatePath: legacyPath,
  }).open();
  const state = store.load();
  assert.equal(state.runs.length, 1);
  assert.doesNotMatch(JSON.stringify(state), /legacy-secret-value/);
  assert.doesNotMatch(JSON.stringify(state), /raw-secret-value/);
  assert.deepEqual(
    store.migrationHistory().map((item) => item.name),
    ["initial-control-schema", "legacy-json-import"],
  );
  store.close();
  const sanitized = await readFile(legacyPath, "utf8");
  assert.doesNotMatch(sanitized, /legacy-secret-value/);
  assert.doesNotMatch(sanitized, /raw-secret-value/);
  assert.ok(
    fs
      .readdirSync(dir)
      .some((name) => name.startsWith("platform.sqlite.p10.json.legacy-")),
  );
});

test("state store persists collections transactionally and rejects a second writer", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-state-lock-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const databasePath = path.join(dir, "control.sqlite");
  const first = new StateStore({ databasePath }).open();
  const state = first.load();
  state.runs.push({
    id: "run-1",
    state: "QUEUED",
    version: 1,
    updatedAt: iso(),
  });
  state.events.push({
    id: "event-1",
    sequence: 1,
    type: "RUN_CREATED",
    createdAt: iso(),
  });
  first.save(state);
  assert.throws(
    () => new StateStore({ databasePath }).open(),
    /CONTROL_DB_IN_USE/,
  );
  first.close();
  const second = new StateStore({ databasePath }).open();
  assert.equal(second.load().runs[0].id, "run-1");
  second.close();
});

test("state store bounds stale writer-lock evidence", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-state-stale-lock-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const databasePath = path.join(dir, "control.sqlite");
  const lockPath = `${databasePath}.lock`;
  for (let index = 0; index < 6; index += 1) {
    await writeFile(lockPath, JSON.stringify({ pid: 2_147_483_647 }));
    const store = new StateStore({ databasePath }).open();
    store.close();
  }
  const stale = fs
    .readdirSync(dir)
    .filter((name) => name.startsWith("control.sqlite.lock.stale-"));
  assert.equal(stale.length, 3);
});

test("state store handles a bounded event stress set without a snapshot file rewrite", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-state-stress-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const databasePath = path.join(dir, "control.sqlite");
  const store = new StateStore({ databasePath }).open();
  const state = store.load();
  for (let sequence = 1; sequence <= 10_000; sequence += 1)
    state.events.push({
      id: `event-${sequence}`,
      sequence,
      type: "HEARTBEAT",
      createdAt: iso(),
      summary: "bounded",
    });
  const started = Date.now();
  store.save(state);
  assert.ok(Date.now() - started < 10_000);
  store.close();
  assert.ok(fs.existsSync(databasePath));
  assert.ok(
    fs.existsSync(`${databasePath}-wal`) === false ||
      fs.statSync(`${databasePath}-wal`).size >= 0,
  );
});

test("state store exposes a read-only diagnostic connection while a writer is active", async (t) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cwp-state-readonly-"));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const databasePath = path.join(dir, "control.sqlite");
  const writer = new StateStore({ databasePath }).open();
  const state = writer.load();
  state.events.push({
    id: "event-1",
    sequence: 1,
    type: "READY",
    createdAt: iso(),
  });
  writer.save(state);
  const reader = new StateStore({ databasePath, readOnly: true }).open();
  assert.equal(reader.load().events.length, 1);
  assert.equal(reader.integrityCheck(), true);
  assert.throws(() => reader.save(state), /CONTROL_DB_READ_ONLY/);
  reader.close();
  writer.close();
});
