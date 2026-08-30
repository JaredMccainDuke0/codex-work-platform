# Compatibility runtime replacement contract

This contract defines the behavior that a recovered or clean-room runtime must
preserve before the current vendor bundle can be retired.
`CONTRACT.json` contains the machine-checked CLI, HTTP, and MCP names; the
public audit confirms that every recorded name is still present in the retained
bundles.

## Process and data boundary

- The runtime is a separate Node.js process bound to loopback only.
- It exclusively owns the formal `platform.sqlite` database.
- The workbench control service must never write that database directly.
- `CODEX_WORK_PLATFORM_DB` selects the database when an explicit CLI flag is
  not supplied.
- Initialization and reads must not copy Codex credentials, transcripts, or
  private project files into a public artifact.

## Required CLI behavior

The installed workbench directly depends on:

- `init --db <absolute path>`;
- `serve --db <absolute path> --port <loopback port>`;
- `status`, `projects`, and `events` for diagnosis and compatibility reads.

The retained bundle also exposes project lifecycle, candidate, context-pack,
backup/restore, long-task, public-search, knowledge-candidate, and official-info
commands. A replacement may not silently remove them; it must either preserve
them or publish a versioned migration and deprecation plan.

## Required local HTTP behavior

The control service currently relies on:

- `GET /healthz`;
- `GET /api/status`;
- `POST /api/projects` with an idempotency key;
- `DELETE /api/projects/:id` with an idempotency key;
- bounded JSON responses for compatibility API passthrough.

Every write must remain idempotent. Project deletion and restore behavior must
remain recoverable and must keep the formal audit sequence intact.

## Required MCP surface

The current MCP server registers these compatibility groups:

- entry/status: `entry_capabilities`, `platform_status`;
- projects and changes: `project_create`, `project_list`,
  `project_transition`, `project_bootstrap`, `change_candidate_submit`,
  `change_candidate_decide`, `task_sync_projection`;
- briefs and lifecycle: `project_brief_read`, `project_brief_quote_read`,
  `project_brief_record`, lifecycle enter/return/complete/restore actions;
- context and recovery: `context_pack_publish`, `context_pack_current`,
  `project_recover_task`, `project_backup`, `project_restore_backup`;
- long work: `long_task_create`, run/resume/status/takeover actions;
- sourced knowledge: `public_search_run`, `knowledge_candidate_submit`,
  `knowledge_candidate_decide`, `search_evidence_refresh`,
  `knowledge_projection`;
- official information: consent create/restrict/close, import, decide, and
  projection actions;
- audit/control: `operation_list_actionable`, `event_list`,
  `control_page_open`.

Exact input schemas remain authoritative in the retained MCP bundle until a
source replacement exports and tests equivalent schemas.

## Acceptance gate for replacement

Before switching runtimes, CI must demonstrate:

1. fresh database initialization and integrity checks;
2. project create/list/delete through the workbench control service;
3. read-only loading of an existing formal database without count or identity
   loss;
4. MCP tool-name and input-schema compatibility;
5. backup, corruption rejection, restore, and new-root recovery;
6. bounded response, loopback, path-escape, and idempotency tests;
7. Windows x64, macOS arm64, and Linux CI package verification;
8. a migration receipt and rollback path for real user data.

The existing bundle remains the migration fallback until every gate passes.
