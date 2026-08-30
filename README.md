# Codex Work Platform

[![CI](https://github.com/JaredMccainDuke0/codex-work-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/JaredMccainDuke0/codex-work-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/JaredMccainDuke0/codex-work-platform?include_prereleases)](https://github.com/JaredMccainDuke0/codex-work-platform/releases)

Codex Work Platform is a local-first desktop workbench for planning and
running Codex workflows. It provides projects, dependency-aware workflows,
approval gates, live progress, conversation history, artifacts, backups, and
recoverable installation operations. It does not provide cloud collaboration
and it does not require a third-party API key.

The workbench binds to loopback only. A supervisor starts the web control
service and the compatibility runtime for you; users do not need to launch
the internal services separately.

The interface intentionally uses a bright, light theme and remains readable
when the operating system is configured for dark mode.

## Requirements

- Windows 10/11, macOS arm64, or Linux for development;
- Node.js 22.5 or newer;
- the current Codex CLI;
- an official ChatGPT/Codex account authenticated locally with `codex login`.

The control database uses Node's built-in SQLite support. Node 22.5–22.12 may
require the `--experimental-sqlite` runtime flag; the included npm scripts and
launchers add it automatically. The launcher shows an actionable capability
error rather than silently falling back to the legacy JSON writer.

See the [official Node.js SQLite documentation](https://nodejs.org/api/sqlite.html)
for the runtime API and version history.

The first run uses the official ChatGPT login path. The workbench never copies
`auth.json`, API keys, or tokens into the repository, release package, logs, or
project history.

## Quick start (development)

```bash
npm ci
npm run dev
```

The development launcher creates ignored local data under `.local/`, starts
both internal services, waits for readiness, and opens the local control page.
Use `Ctrl+C` to stop the supervisor and its children.

For an installed copy, run the generated `start-workbench.cmd` on Windows or
`start-workbench.command` on macOS. The supervisor chooses the preferred
loopback ports (19737/19738) when available, persists the actual pair, and
prints the URL to open.

On macOS or Linux, preserve the executable bit when extracting a tarball (or
run `chmod +x install-macos.command start-workbench.command`).

From a portable directory, install with:

```powershell
powershell -ExecutionPolicy Bypass -File .\install-windows.ps1
```

```bash
chmod +x ./install-macos.command
./install-macos.command
```

Automatic approval is never enabled by these commands unless the explicit
`-AutoApproveHighRisk` (Windows) or `CWP_AUTO_APPROVE_HIGH_RISK=1` (macOS)
option is supplied.

To create a portable directory locally:

```bash
npm run build -- -- --output ./output/codex-work-platform-1.1.0-portable
npm run verify-release -- ./output/codex-work-platform-1.1.0-portable
```

The extra `--` keeps option forwarding reliable across npm versions. You can
also invoke the build CLI directly with `node --experimental-sqlite
bin/build-p10-release.mjs --output <directory>`.

The Windows and macOS installer scripts run the same preflight checks and keep
application files, user data, and the selected workspace in separate roots.
If a preferred port is occupied, the supervisor selects the next available
pair and records it in `platform-config.json`; `/healthz` reports liveness and
`/readyz` is the gate the browser waits for before loading data.

## How it works

```text
Browser ──> local control service ──> Codex CLI/App Server
                    │
                    ├── control.sqlite (P10 state, events, approvals)
                    └── compat-runtime ──> platform.sqlite (formal objects)
```

The two SQLite files have separate owners. This prevents the compatibility
runtime and the control service from overwriting each other's transactions.
Existing `platform.sqlite.p10.json` state files are imported once and retained
as legacy evidence; migration never deletes user data.

## Safety model

- High-risk actions (file changes, commands, network access, termination, and
  takeover) require an explicit approval by default.
- Web search is available by default, but a network action still requires an
  approval. Automatic approval is an explicit opt-in configuration.
- Workspaces are restricted to configured allowed roots. Sensitive directories,
  symlink escapes, and paths outside the root are rejected.
- Conversation follow-ups inherit the run's sandbox and approval policy.
- Logs and API responses use bounded, redacted summaries; complete transcripts
  and credentials are not written to project state.
- The web service includes a readiness check, loopback/Origin protection, and a
  per-installation request token for mutating calls.

## User workflow

1. Authenticate the local Codex CLI:

   ```bash
   codex login
   codex login status
   ```

2. Open **Workflows** and set a normal project/workspace directory.
3. Create a project, workflow, and one or more nodes.
4. Add dependencies or use the visual order editor. Keyboard move controls
   are available when drag-and-drop is not convenient.
5. Verify the execution environment.
6. Run the workflow and handle approvals in **Approvals**.
7. Follow live progress, events, artifacts, and Codex conversations in
   **Activity**. New App Server conversations appear without restarting the
   desktop client.

The interface is English-first and includes a Chinese locale switch. It is
responsive at desktop and narrow mobile widths.

## Verification status

| Environment | Automated verification                                      | Physical-device acceptance                 |
| ----------- | ----------------------------------------------------------- | ------------------------------------------ |
| Windows x64 | CI, installer lifecycle, supervisor recovery, browser smoke | Fresh-device and reboot acceptance pending |
| macOS arm64 | CI, installer lifecycle, portable verification              | Physical arm64 device pending              |
| Linux x64   | CI and development workflow                                 | No desktop installer claim                 |

CI evidence is intentionally reported separately from real-device acceptance.

## Commands

```text
npm run dev             Start a local development supervisor
npm run dev:no-open     Start without opening a browser
npm start               Start the local development supervisor
npm run check           Check JavaScript syntax and version metadata
npm run check:version   Verify product and compatibility-runtime versions
npm test                Run unit and integration tests
npm run test:coverage   Run tests with the Node coverage report
npm run test:coverage:all  Include every instrumented integration module
npm run test:e2e        Run the browser smoke checks
npm run public-audit    Check the public repository boundary
npm run build           Build a verified portable package
npm run build:clean     Build without retaining a previous portable directory
npm run verify-release  Verify a portable package manifest

# Installed lifecycle (run from the installed release directory)
node release/bin/platform-manager.mjs enable-autostart --install-root <install-root>
node release/bin/platform-manager.mjs disable-autostart --install-root <install-root>
```

## Data, backup, and privacy

Installed data is kept outside the application directory. Backups contain the
control database, compatibility database, release manifest, and workspace
metadata. Before sharing a repository or release, verify that it contains no
`output/` directory, SQLite database, `.codex` directory, authentication file,
private project, or browser cache.

## Troubleshooting

`19737` is the compatibility data service and `19738` is the web control
service. They are implementation ports, not two user-facing applications;
the supervisor starts them in order and chooses another pair when either is
occupied. `ERR_CONNECTION_REFUSED` means the supervisor is not running (or is
still starting), not that the workbench has a time limit. Start it again with
the generated launcher and wait for the printed `/readyz` URL. The runtime
lease and daily redacted log under the data root show the last state without
requiring credentials or a browser cache.

## Compatibility runtime

`release/compat-runtime` is a vendored runtime used for formal project objects
and MCP compatibility. Its available provenance, dependency identities,
licenses, checksums, and third-party notices are maintained under
`vendor/compat-runtime/`. The current artifact is documented as a local bundle
without an upstream commit or encoded dependency versions; future vendor
updates must add a locked source checkout before claiming full reproducibility.

The vendored compatibility runtime currently remains at component version
1.0.0. Its version is intentionally independent from the workbench release.
The original TypeScript checkout and lockfile could not be recovered after a
local, Git-history, and public-source search. See the documented
[recovery evidence](vendor/compat-runtime/RECOVERY.md) and
[replacement contract](vendor/compat-runtime/CONTRACT.md); neither document
pretends that the generated bundle is source code.

## Development and security

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and
[CHANGELOG.md](CHANGELOG.md). Report vulnerabilities privately rather than in
a public issue.

## License

Original Codex Work Platform code is released under the MIT license. Vendored
dependencies retain their own licenses; see [NOTICE](NOTICE) and the vendor
notice file.
