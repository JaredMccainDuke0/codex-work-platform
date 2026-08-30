# Architecture

The workbench is intentionally local and single-user.

```text
browser -> p10 control service -> Codex CLI/App Server
                |
                +-> control.sqlite (runs, approvals, events, workflows)
                +-> compat-runtime -> platform.sqlite (formal project objects)
                +-> supervisor logs and runtime lease
```

The control service owns orchestration state and the compatibility runtime owns
the formal project/MCP database. They communicate over loopback HTTP. A
supervisor starts both in dependency order, exposes liveness and readiness,
restarts failed children with bounded backoff, and performs a graceful stop.

The control database is versioned. On first start it imports a legacy
`platform.sqlite.p10.json` sidecar when present, keeps an immutable local copy,
and records the migration. Public repository checkouts never contain local
database files.

The control-service entrypoint is a composition root. Reusable infrastructure
under `server/` owns argument validation, HTTP bounds, error mapping, path
security, native directory selection, redaction, idempotency, static assets,
and compatibility transport. Run/workflow/approval orchestration remains in
the entrypoint until later extractions can preserve its state-transition and
audit contracts without a database migration.
