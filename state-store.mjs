import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { normalizePersistedState, safeSnapshot } from "./p10-state.mjs";
import { redactSecrets } from "./codex-adapter.mjs";

const SCHEMA_VERSION = 1;
const LEGACY_IMPORT_MIGRATION_VERSION = 2;
const sleepSync = (milliseconds) => {
  const wait = new Int32Array(new SharedArrayBuffer(4));
  Atomics.wait(wait, 0, 0, milliseconds);
};

function renameWithRetry(source, target, attempts = 8) {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      fs.renameSync(source, target);
      return;
    } catch (error) {
      lastError = error;
      if (
        !["EPERM", "EBUSY", "EACCES"].includes(error?.code) ||
        attempt === attempts - 1
      )
        break;
      sleepSync(50 * (attempt + 1));
    }
  }
  throw lastError;
}

function writeTextAtomically(target, text) {
  const absolute = path.resolve(target);
  const suffix = () => crypto.randomBytes(6).toString("hex");
  const temporary = `${absolute}.tmp-${process.pid}-${Date.now()}-${suffix()}`;
  const previous = `${absolute}.previous-${process.pid}-${Date.now()}-${suffix()}`;
  fs.writeFileSync(temporary, text, {
    encoding: "utf8",
    flag: "wx",
    mode: 0o600,
  });
  let movedPrevious = false;
  try {
    if (fs.existsSync(absolute)) {
      renameWithRetry(absolute, previous);
      movedPrevious = true;
    }
    renameWithRetry(temporary, absolute);
    if (movedPrevious) fs.unlinkSync(previous);
  } catch (error) {
    try {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    } catch {}
    try {
      if (movedPrevious && fs.existsSync(previous) && !fs.existsSync(absolute))
        renameWithRetry(previous, absolute);
    } catch {}
    throw error;
  }
}

function pruneStaleLockFiles(lockPath, keep = 3) {
  const directory = path.dirname(lockPath);
  const prefix = `${path.basename(lockPath)}.stale-`;
  if (!fs.existsSync(directory)) return;
  const files = fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.startsWith(prefix))
    .map((entry) => entry.name)
    .sort((left, right) => right.localeCompare(left));
  for (const name of files.slice(keep))
    fs.rmSync(path.join(directory, name), { force: true });
}

let DatabaseSync;
try {
  ({ DatabaseSync } = await import("node:sqlite"));
  if (typeof DatabaseSync !== "function") throw Error("missing DatabaseSync");
} catch {}

const COLLECTIONS = [
  "runs",
  "approvals",
  "artifacts",
  "executionLogs",
  "operatorActions",
  "workflows",
  "workflowExecutions",
  "workflowNodes",
  "workflowEdges",
];

const idFor = (collection, item) => {
  if (collection === "events") return Number(item.sequence);
  return String(item.id ?? "");
};

const payloadFor = (value) => JSON.stringify(safeSnapshot(value));

const sensitiveKey =
  /(?:api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|authorization|cookie)/i;
function redactDeep(value, key = "") {
  if (sensitiveKey.test(String(key))) return "[REDACTED]";
  if (typeof value === "string") return redactSecrets(value);
  if (Array.isArray(value)) return value.map((item) => redactDeep(item, key));
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).map(([childKey, child]) => [
      childKey,
      redactDeep(child, childKey),
    ]),
  );
}

function parsePayload(value, label) {
  try {
    return JSON.parse(value);
  } catch (error) {
    throw Error(`CONTROL_DB_PAYLOAD_INVALID:${label}:${error.message}`);
  }
}

function validateImportedState(state) {
  for (const collection of [...COLLECTIONS, "events"])
    if (!Array.isArray(state[collection]))
      throw Error(`LEGACY_STATE_COLLECTION_INVALID:${collection}`);
  const limits = {
    runs: 100_000,
    approvals: 100_000,
    artifacts: 100_000,
    executionLogs: 500_000,
    operatorActions: 500_000,
    workflows: 100_000,
    workflowExecutions: 100_000,
    workflowNodes: 500_000,
    workflowEdges: 500_000,
    events: 1_000_000,
  };
  for (const [collection, limit] of Object.entries(limits))
    if (state[collection].length > limit)
      throw Error(`LEGACY_STATE_COLLECTION_TOO_LARGE:${collection}`);
  const sequences = new Set();
  for (const event of state.events) {
    const sequence = Number(event?.sequence);
    if (
      !Number.isSafeInteger(sequence) ||
      sequence <= 0 ||
      sequences.has(sequence)
    )
      throw Error("LEGACY_STATE_EVENT_SEQUENCE_INVALID");
    sequences.add(sequence);
  }
  return state;
}

function sanitizeLegacyFile(legacyPath) {
  if (fs.statSync(legacyPath).size > 128 * 1024 * 1024)
    throw Error("LEGACY_STATE_TOO_LARGE");
  const raw = fs.readFileSync(legacyPath, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw Error(`LEGACY_STATE_INVALID:${error.message}`);
  }
  const clean = normalizePersistedState(redactDeep(parsed));
  const serialized = `${JSON.stringify(clean, null, 2)}\n`;
  if (raw !== serialized) {
    const archivePath = `${legacyPath}.legacy-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    fs.copyFileSync(legacyPath, archivePath, fs.constants.COPYFILE_EXCL);
    writeTextAtomically(legacyPath, serialized);
  }
  return clean;
}

/**
 * Durable P10 control state store.
 *
 * The compatibility runtime owns its formal SQLite database. This store owns
 * a separate control database so the two processes never overwrite one
 * another's file. Legacy `.p10.json` files are imported once and retained.
 */
export class StateStore {
  constructor(options = {}) {
    this.databasePath = path.resolve(
      String(options.databasePath ?? "control.sqlite"),
    );
    this.legacyStatePath = options.legacyStatePath
      ? path.resolve(String(options.legacyStatePath))
      : null;
    this.database = null;
    this.lockPath = `${this.databasePath}.lock`;
    this.lockHandle = null;
    this.readOnly = options.readOnly === true;
    this.lastIndex = null;
    this.lastEventSequence = 0;
    this.migratedFrom = null;
  }

  open() {
    if (typeof DatabaseSync !== "function")
      throw Error("NODE_SQLITE_REQUIRED:use Node.js 22.5 or newer");
    fs.mkdirSync(path.dirname(this.databasePath), { recursive: true });
    const existed = fs.existsSync(this.databasePath);
    if (this.readOnly && !fs.existsSync(this.databasePath))
      throw Error("CONTROL_DB_READ_ONLY_MISSING");
    if (!this.readOnly) this.#acquireLock();
    try {
      this.database = new DatabaseSync(this.databasePath, {
        readOnly: this.readOnly,
      });
      if (!this.readOnly && !existed) {
        try {
          fs.chmodSync(this.databasePath, 0o600);
        } catch {}
      }
    } catch (error) {
      this.#releaseLock();
      throw Error(`CONTROL_DB_OPEN_FAILED:${error.message}`);
    }
    try {
      if (!this.readOnly) {
        this.database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA foreign_keys = ON;
      PRAGMA busy_timeout = 5000;
      CREATE TABLE IF NOT EXISTS p10_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS p10_objects (
        collection TEXT NOT NULL,
        id TEXT NOT NULL,
        project_id TEXT,
        state TEXT,
        version INTEGER,
        payload TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (collection, id)
      );
      CREATE INDEX IF NOT EXISTS p10_objects_project_idx ON p10_objects(project_id);
      CREATE INDEX IF NOT EXISTS p10_objects_state_idx ON p10_objects(collection, state);
      CREATE TABLE IF NOT EXISTS p10_events (
        sequence INTEGER PRIMARY KEY,
        id TEXT NOT NULL UNIQUE,
        project_id TEXT,
        event_type TEXT,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS p10_events_project_idx ON p10_events(project_id, sequence);
      CREATE TABLE IF NOT EXISTS p10_idempotency (
        scope TEXT PRIMARY KEY,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS p10_project_directories (
        project_id TEXT PRIMARY KEY,
        directory TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS p10_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS p10_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        source TEXT,
        applied_at TEXT NOT NULL
      );
        `);
      } else {
        const tables = new Set(
          this.database
            .prepare(
              "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'p10_%'",
            )
            .all()
            .map((row) => row.name),
        );
        if (!tables.has("p10_objects") || !tables.has("p10_events"))
          throw Error("CONTROL_DB_SCHEMA_MISSING");
      }
      if (!this.readOnly) {
        const existingVersion = this.database
          .prepare("SELECT value FROM p10_meta WHERE key=?")
          .get("schemaVersion");
        if (existingVersion && Number(existingVersion.value) > SCHEMA_VERSION)
          throw Error("CONTROL_DB_SCHEMA_NEWER");
        this.database
          .prepare(
            "INSERT INTO p10_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO NOTHING",
          )
          .run("schemaVersion", String(SCHEMA_VERSION));
        this.database
          .prepare(
            "INSERT INTO p10_migrations(version,name,source,applied_at) VALUES(?,?,?,?) ON CONFLICT(version) DO NOTHING",
          )
          .run(
            SCHEMA_VERSION,
            "initial-control-schema",
            null,
            new Date().toISOString(),
          );
      }
    } catch (error) {
      try {
        this.database.close();
      } catch {}
      this.database = null;
      this.#releaseLock();
      throw Error(`CONTROL_DB_SCHEMA_FAILED:${error.message}`);
    }
    return this;
  }

  load() {
    if (!this.database) this.open();
    const state = normalizePersistedState({});
    const objectRows = this.database
      .prepare(
        "SELECT collection, id, payload FROM p10_objects ORDER BY rowid ASC",
      )
      .all();
    for (const row of objectRows) {
      if (!COLLECTIONS.includes(row.collection)) continue;
      state[row.collection].push(
        parsePayload(row.payload, `${row.collection}:${row.id}`),
      );
    }
    const eventRows = this.database
      .prepare("SELECT payload FROM p10_events ORDER BY sequence ASC")
      .all();
    state.events = eventRows.map((row) => parsePayload(row.payload, "events"));
    this.lastEventSequence = Number(state.events.at(-1)?.sequence ?? 0);
    const idempotencyRows = this.database
      .prepare("SELECT scope, payload FROM p10_idempotency")
      .all();
    for (const row of idempotencyRows)
      state.idempotency[row.scope] = parsePayload(
        row.payload,
        `idempotency:${row.scope}`,
      );
    const directoryRows = this.database
      .prepare("SELECT project_id, directory FROM p10_project_directories")
      .all();
    for (const row of directoryRows)
      state.projectDirectories[row.project_id] = row.directory;
    const settingRows = this.database
      .prepare("SELECT key, value FROM p10_settings")
      .all();
    for (const row of settingRows)
      state.settings[row.key] = parsePayload(row.value, `settings:${row.key}`);

    const hasRows =
      objectRows.length ||
      eventRows.length ||
      idempotencyRows.length ||
      directoryRows.length ||
      settingRows.length;
    const migrated = this.database
      .prepare("SELECT value FROM p10_meta WHERE key=?")
      .get("migratedFrom");
    const legacySanitized = this.database
      .prepare("SELECT value FROM p10_meta WHERE key=?")
      .get("legacySanitizedAt");
    if (
      migrated &&
      !legacySanitized &&
      !this.readOnly &&
      this.legacyStatePath &&
      fs.existsSync(this.legacyStatePath)
    ) {
      sanitizeLegacyFile(this.legacyStatePath);
      this.database
        .prepare(
          "INSERT INTO p10_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .run("legacySanitizedAt", new Date().toISOString());
    }
    if (
      !hasRows &&
      !migrated &&
      this.legacyStatePath &&
      fs.existsSync(this.legacyStatePath)
    ) {
      if (fs.statSync(this.legacyStatePath).size > 128 * 1024 * 1024)
        throw Error("LEGACY_STATE_TOO_LARGE");
      let legacy;
      try {
        legacy = JSON.parse(fs.readFileSync(this.legacyStatePath, "utf8"));
      } catch (error) {
        throw Error(`LEGACY_STATE_INVALID:${error.message}`);
      }
      const imported = validateImportedState(
        normalizePersistedState(redactDeep(legacy)),
      );
      this.save(imported, { migration: this.legacyStatePath });
      // Keep an immutable local copy of the pre-migration file, then replace
      // the legacy sidecar with a redacted export so future backups cannot
      // accidentally carry credentials forward.
      try {
        sanitizeLegacyFile(this.legacyStatePath);
        this.database
          .prepare(
            "INSERT INTO p10_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .run("legacySanitizedAt", new Date().toISOString());
      } catch (error) {
        if (error?.message === "LEGACY_STATE_TOO_LARGE") throw error;
        throw Error(`LEGACY_STATE_SANITIZE_FAILED:${error.message}`);
      }
      this.migratedFrom = this.legacyStatePath;
      this.lastIndex = this.#index(imported);
      return imported;
    }
    this.lastIndex = this.#index(state);
    return state;
  }

  save(state, options = {}) {
    if (this.readOnly) throw Error("CONTROL_DB_READ_ONLY");
    if (!this.database) this.open();
    const clean = normalizePersistedState(redactDeep(safeSnapshot(state)));
    const nextIndex = this.#index(clean, this.lastIndex);
    const previous = this.lastIndex ?? new Map();
    try {
      this.database.exec("BEGIN IMMEDIATE");
      for (const collection of COLLECTIONS)
        this.#syncObjects(
          collection,
          clean[collection],
          previous.get(collection) ?? new Map(),
        );
      this.#syncEvents(clean.events, previous.get("events") ?? new Map());
      this.#syncIdempotency(
        clean.idempotency,
        previous.get("idempotency") ?? new Map(),
      );
      this.#syncDirectories(
        clean.projectDirectories,
        previous.get("projectDirectories") ?? new Map(),
      );
      this.#syncSettings(clean.settings, previous.get("settings") ?? new Map());
      const timestamp = new Date().toISOString();
      this.database
        .prepare(
          "INSERT INTO p10_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
        )
        .run("updatedAt", timestamp);
      if (options.migration) {
        this.database
          .prepare(
            "INSERT INTO p10_meta(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .run("migratedFrom", options.migration);
        this.database
          .prepare(
            "INSERT INTO p10_migrations(version,name,source,applied_at) VALUES(?,?,?,?) ON CONFLICT(version) DO UPDATE SET source=excluded.source",
          )
          .run(
            LEGACY_IMPORT_MIGRATION_VERSION,
            "legacy-json-import",
            options.migration,
            timestamp,
          );
      }
      this.database.exec("COMMIT");
      this.lastIndex = nextIndex;
      this.lastEventSequence = Number(clean.events.at(-1)?.sequence ?? 0);
      return true;
    } catch (error) {
      try {
        this.database.exec("ROLLBACK");
      } catch {}
      throw Error(`CONTROL_DB_SAVE_FAILED:${error.message}`);
    }
  }

  exportLegacy(state, targetPath) {
    const target = path.resolve(String(targetPath));
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      `${JSON.stringify(redactDeep(safeSnapshot(state)), null, 2)}\n`,
      { encoding: "utf8", flag: "wx" },
    );
    return target;
  }

  listEventsPage({
    after = 0,
    before = Number.MAX_SAFE_INTEGER,
    limit = 100,
    type = null,
    projectId = null,
  } = {}) {
    if (!this.database) this.open();
    const clauses = ["sequence > ?", "sequence < ?"];
    const params = [
      Number(after) || 0,
      Number(before) || Number.MAX_SAFE_INTEGER,
    ];
    if (type) {
      clauses.push("event_type = ?");
      params.push(String(type));
    }
    if (projectId) {
      clauses.push("project_id = ?");
      params.push(String(projectId));
    }
    const where = clauses.join(" AND ");
    const count = Number(
      this.database
        .prepare(`SELECT COUNT(*) AS count FROM p10_events WHERE ${where}`)
        .get(...params).count,
    );
    const rows = this.database
      .prepare(
        `SELECT payload FROM p10_events WHERE ${where} ORDER BY sequence DESC LIMIT ?`,
      )
      .all(...params, Math.max(1, Math.min(500, Number(limit) || 100)));
    const events = rows
      .map((row) => parsePayload(row.payload, "events"))
      .reverse();
    const latest = this.database
      .prepare("SELECT sequence FROM p10_events ORDER BY sequence DESC LIMIT 1")
      .get();
    this.lastEventSequence = Number(latest?.sequence ?? 0);
    return {
      events,
      eventTotal: count,
      latestSequence: Number(latest?.sequence ?? 0),
      nextAfter: Number(events.at(-1)?.sequence ?? after),
      nextBefore: Number(events.at(0)?.sequence ?? before),
      hasMoreBefore: count > events.length,
    };
  }

  latestEventSequence() {
    if (!this.database) this.open();
    this.lastEventSequence = Number(
      this.database
        .prepare(
          "SELECT COALESCE(MAX(sequence), 0) AS sequence FROM p10_events",
        )
        .get().sequence,
    );
    return this.lastEventSequence;
  }

  integrityCheck() {
    if (!this.database) this.open();
    const row = this.database.prepare("PRAGMA quick_check").get();
    return String(row?.quick_check ?? row?.integrity_check ?? "") === "ok";
  }

  migrationHistory() {
    if (!this.database) this.open();
    return this.database
      .prepare(
        "SELECT version, name, source, applied_at AS appliedAt FROM p10_migrations ORDER BY version ASC",
      )
      .all();
  }

  close() {
    if (!this.database) return;
    try {
      this.database.exec("PRAGMA wal_checkpoint(TRUNCATE)");
    } catch {}
    try {
      this.database.close();
    } finally {
      this.database = null;
      this.#releaseLock();
    }
  }

  #acquireLock() {
    try {
      this.lockHandle = fs.openSync(this.lockPath, "wx");
      fs.writeFileSync(
        this.lockHandle,
        JSON.stringify({
          pid: process.pid,
          startedAt: new Date().toISOString(),
        }),
      );
    } catch (error) {
      if (error?.code !== "EEXIST")
        throw Error(`CONTROL_DB_LOCK_FAILED:${error.message}`);
      let prior = null;
      try {
        prior = JSON.parse(fs.readFileSync(this.lockPath, "utf8"));
      } catch {}
      let alive = false;
      try {
        if (Number.isInteger(Number(prior?.pid))) {
          process.kill(Number(prior.pid), 0);
          alive = true;
        }
      } catch (probeError) {
        if (probeError?.code === "EPERM") alive = true;
      }
      if (alive) throw Error(`CONTROL_DB_IN_USE:${prior.pid}`);
      const stale = `${this.lockPath}.stale-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      try {
        renameWithRetry(this.lockPath, stale);
        pruneStaleLockFiles(this.lockPath);
      } catch (renameError) {
        throw Error(`CONTROL_DB_LOCK_STALE:${renameError.message}`);
      }
      this.lockHandle = fs.openSync(this.lockPath, "wx");
      fs.writeFileSync(
        this.lockHandle,
        JSON.stringify({
          pid: process.pid,
          startedAt: new Date().toISOString(),
        }),
      );
    }
  }

  #releaseLock() {
    if (this.lockHandle !== null) {
      try {
        fs.closeSync(this.lockHandle);
      } catch {}
      this.lockHandle = null;
    }
    try {
      const current = JSON.parse(fs.readFileSync(this.lockPath, "utf8"));
      if (Number(current.pid) === process.pid) fs.unlinkSync(this.lockPath);
    } catch {}
  }

  #index(state, priorIndex = this.lastIndex) {
    const index = new Map();
    for (const collection of COLLECTIONS) {
      const rows = new Map();
      for (const item of state[collection] ?? []) {
        const key = idFor(collection, item);
        if (key) rows.set(String(key), payloadFor(item));
      }
      index.set(collection, rows);
    }
    const events = new Map();
    const priorEvents = priorIndex?.get("events");
    const priorLastKey = priorEvents?.size
      ? String(this.lastEventSequence || [...priorEvents.keys()].at(-1))
      : null;
    const boundary =
      priorEvents?.size && (state.events?.length ?? 0) >= priorEvents.size
        ? state.events?.[priorEvents.size - 1]
        : null;
    const appendOnly = Boolean(
      boundary &&
      priorLastKey &&
      String(idFor("events", boundary)) === String(priorLastKey) &&
      priorEvents.get(String(priorLastKey)) === payloadFor(boundary),
    );
    if (appendOnly) {
      for (const [key, payload] of priorEvents) events.set(key, payload);
      for (const item of (state.events ?? []).slice(priorEvents.size)) {
        const key = idFor("events", item);
        if (Number.isSafeInteger(key) && key > 0)
          events.set(String(key), payloadFor(item));
      }
    } else {
      for (const item of state.events ?? []) {
        const key = idFor("events", item);
        if (Number.isSafeInteger(key) && key > 0)
          events.set(String(key), payloadFor(item));
      }
    }
    index.set("events", events);
    index.set(
      "idempotency",
      new Map(
        Object.entries(state.idempotency ?? {}).map(([key, value]) => [
          key,
          payloadFor(value),
        ]),
      ),
    );
    index.set(
      "projectDirectories",
      new Map(
        Object.entries(state.projectDirectories ?? {}).map(([key, value]) => [
          key,
          payloadFor(value),
        ]),
      ),
    );
    index.set(
      "settings",
      new Map(
        Object.entries(state.settings ?? {}).map(([key, value]) => [
          key,
          payloadFor(value),
        ]),
      ),
    );
    return index;
  }

  #syncObjects(collection, values, previous) {
    const next = new Map();
    const upsert = this.database.prepare(
      "INSERT INTO p10_objects(collection,id,project_id,state,version,payload,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(collection,id) DO UPDATE SET project_id=excluded.project_id,state=excluded.state,version=excluded.version,payload=excluded.payload,updated_at=excluded.updated_at",
    );
    for (const item of values ?? []) {
      const key = String(idFor(collection, item));
      if (!key) continue;
      const payload = payloadFor(item);
      next.set(key, payload);
      if (previous.get(key) === payload) continue;
      upsert.run(
        collection,
        key,
        item.projectId ?? null,
        item.state ?? null,
        Number.isInteger(item.version) ? item.version : null,
        payload,
        item.updatedAt ?? new Date().toISOString(),
      );
    }
    const remove = this.database.prepare(
      "DELETE FROM p10_objects WHERE collection=? AND id=?",
    );
    for (const key of previous.keys())
      if (!next.has(key)) remove.run(collection, key);
  }

  #syncEvents(values, previous) {
    const priorLastKey = previous.size
      ? String(this.lastEventSequence || [...previous.keys()].at(-1))
      : null;
    const priorBoundary =
      previous.size && (values?.length ?? 0) >= previous.size
        ? values?.[previous.size - 1]
        : null;
    const appendOnly = Boolean(
      priorBoundary &&
      priorLastKey &&
      String(idFor("events", priorBoundary)) === String(priorLastKey) &&
      previous.get(String(priorLastKey)) === payloadFor(priorBoundary),
    );
    const next = appendOnly ? new Map(previous) : new Map();
    const upsert = this.database.prepare(
      "INSERT INTO p10_events(sequence,id,project_id,event_type,payload,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(sequence) DO UPDATE SET id=excluded.id,project_id=excluded.project_id,event_type=excluded.event_type,payload=excluded.payload,created_at=excluded.created_at",
    );
    const candidates = appendOnly
      ? (values ?? []).slice(previous.size)
      : (values ?? []);
    for (const item of candidates) {
      const sequence = Number(item.sequence);
      if (!Number.isSafeInteger(sequence) || sequence <= 0) continue;
      const payload = payloadFor(item);
      const key = String(sequence);
      next.set(key, payload);
      if (previous.get(key) === payload) continue;
      upsert.run(
        sequence,
        String(item.id ?? `event-${sequence}`),
        item.projectId ?? null,
        item.type ?? null,
        payload,
        item.createdAt ?? item.timestamp ?? new Date().toISOString(),
      );
    }
    const remove = this.database.prepare(
      "DELETE FROM p10_events WHERE sequence=?",
    );
    for (const key of previous.keys())
      if (!next.has(key)) remove.run(Number(key));
  }

  #syncIdempotency(values, previous) {
    const next = new Map(
      Object.entries(values ?? {}).map(([key, value]) => [
        key,
        payloadFor(value),
      ]),
    );
    const upsert = this.database.prepare(
      "INSERT INTO p10_idempotency(scope,payload,created_at) VALUES(?,?,?) ON CONFLICT(scope) DO UPDATE SET payload=excluded.payload,created_at=excluded.created_at",
    );
    for (const [key, payload] of next)
      if (previous.get(key) !== payload)
        upsert.run(
          key,
          payload,
          values[key]?.createdAt ?? new Date().toISOString(),
        );
    const remove = this.database.prepare(
      "DELETE FROM p10_idempotency WHERE scope=?",
    );
    for (const key of previous.keys()) if (!next.has(key)) remove.run(key);
  }

  #syncDirectories(values, previous) {
    const next = new Map(
      Object.entries(values ?? {}).map(([key, value]) => [
        key,
        payloadFor(value),
      ]),
    );
    const upsert = this.database.prepare(
      "INSERT INTO p10_project_directories(project_id,directory) VALUES(?,?) ON CONFLICT(project_id) DO UPDATE SET directory=excluded.directory",
    );
    for (const [key, payload] of next)
      if (previous.get(key) !== payload) upsert.run(key, JSON.parse(payload));
    const remove = this.database.prepare(
      "DELETE FROM p10_project_directories WHERE project_id=?",
    );
    for (const key of previous.keys()) if (!next.has(key)) remove.run(key);
  }

  #syncSettings(values, previous) {
    const next = new Map(
      Object.entries(values ?? {}).map(([key, value]) => [
        key,
        payloadFor(value),
      ]),
    );
    const upsert = this.database.prepare(
      "INSERT INTO p10_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    );
    for (const [key, payload] of next)
      if (previous.get(key) !== payload) upsert.run(key, payload);
    const remove = this.database.prepare(
      "DELETE FROM p10_settings WHERE key=?",
    );
    for (const key of previous.keys()) if (!next.has(key)) remove.run(key);
  }
}
