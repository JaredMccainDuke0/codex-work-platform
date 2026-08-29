# Local HTTP API

The control service listens on loopback and exposes JSON endpoints. The web
client obtains an installation-scoped token from `GET /api/p10/client-config`
and sends it as `X-CWP-Request-Token` on mutating requests. Requests from a
different `Origin` are rejected.

Core endpoints:

- `GET /healthz` — process liveness;
- `GET /readyz` — control database and compat-runtime readiness;
- `GET /api/p10/state?eventLimit=200` — bounded orchestration snapshot;
- `GET /api/p10/events?after=&before=&limit=` — cursor-aware event pages;
- `GET /api/p10/runs?state=&limit=` — filtered run pages;
- `GET /api/p10/events/stream` — SSE incremental events;
- `GET /api/p10/conversations/:threadId` — bounded local thread history;
- `POST /api/p10/conversations/:threadId/turns` — continue a permitted thread;
- `POST /api/p10/workflows/:id/runs` — start a workflow execution;
- `POST /api/p10/approvals/:id` — approve or reject a pending action.

The state snapshot accepts bounded `eventLimit`, `runLimit`, `approvalLimit`,
`workflowLimit`, and `logLimit` query parameters (each capped at 500). Event
pages are read from the control SQLite index, so loading older audit history
does not require rendering the complete event log in the browser.

All JSON request bodies are objects and are capped at 4 MiB. URLs are capped at
8 KiB, concurrent requests are bounded, and upstream compatibility responses
are capped at 8 MiB. Errors return a stable `code` and a short safe message;
they do not include stack traces or credentials.

Every mutating operation accepts an `Idempotency-Key`. Clients should reuse
the same key when retrying a request and must not place credentials in JSON
payloads.
