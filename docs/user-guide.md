# User guide

This guide covers installation, startup, diagnostics, backup, upgrade, and
uninstallation for a local Codex Work Platform installation.

## Before installing

Install Node.js 22.5 or newer and the current Codex CLI. Then sign in with your
own ChatGPT account:

```text
node --version
codex --version
codex login
codex login status
```

The expected authentication status is `Logged in using ChatGPT`. The workbench
does not need or copy an API key.

## Verify the download

Every GitHub Release archive has a neighboring `.sha256` file. Compare it
before running the installer.

Windows PowerShell:

```powershell
(Get-FileHash .\codex-work-platform-v1.1.1-windows-x64.zip -Algorithm SHA256).Hash.ToLower()
Get-Content .\codex-work-platform-v1.1.1-windows-x64.zip.sha256
```

macOS:

```bash
shasum -a 256 codex-work-platform-v1.1.1-macos-arm64.tar.gz
cat codex-work-platform-v1.1.1-macos-arm64.tar.gz.sha256
```

Release scripts are checksum-verifiable but are not signed with a commercial
Windows Authenticode certificate or Apple Developer ID. Do not disable system
security globally. Only continue after the SHA-256 matches the published
sidecar and the GitHub Release digest.

## Install and start

### Windows 10/11

Download the `windows-x64.zip` asset, extract it completely, and either
double-click `install-windows.cmd` or open PowerShell in that directory and run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install-windows.ps1 -Start
```

The browser opens only after both local services are ready. Keep the launcher
window open while using the workbench. Press `Ctrl+C` or close that window to
stop the foreground service.

Default locations:

| Purpose       | Path                                                |
| ------------- | --------------------------------------------------- |
| Application   | `%LOCALAPPDATA%\Programs\CodexWorkPlatform`         |
| Data and logs | `%LOCALAPPDATA%\CodexWorkPlatform\data`             |
| Workspaces    | `%USERPROFILE%\Documents\CodexWorkspace`            |
| Backups       | `%USERPROFILE%\Documents\CodexWorkPlatform Backups` |

### macOS arm64

```bash
tar -xzf codex-work-platform-v1.1.1-macos-arm64.tar.gz
cd <extracted-directory>
chmod +x ./install-macos.command
CWP_START=1 ./install-macos.command
```

Keep the Terminal window open while using the foreground service. If Finder
shows a Gatekeeper warning, verify the release SHA-256 first, then use
Control-click → Open or run the command from Terminal. Do not disable Gatekeeper
globally.

Default locations:

| Purpose       | Path                                              |
| ------------- | ------------------------------------------------- |
| Application   | `~/Applications/CodexWorkPlatform`                |
| Data and logs | `~/Library/Application Support/CodexWorkPlatform` |
| Workspaces    | `~/Documents/CodexWorkspace`                      |
| Backups       | `~/Documents/CodexWorkPlatform Backups`           |

## First workflow

1. Open **Overview** and select **Verify environment**. A real read-only probe
   can take up to two minutes.
2. Create a project and choose a normal workspace directory.
3. Create a workflow, add nodes, and save their order.
4. Dispatch the workflow and handle any high-risk action in **Approvals**.
5. Review live progress, artifacts, events, and resumable conversations in
   **Activity**.

If App Server is unavailable but the CLI is ready, the interface automatically
selects Local Codex CLI so a new task does not use a broken adapter.

## Installed lifecycle commands

### Windows

```powershell
$CwpRoot = Join-Path $env:LOCALAPPDATA 'Programs\CodexWorkPlatform'
$Manager = Join-Path $CwpRoot 'release\bin\platform-manager.mjs'

# Diagnose
node --no-warnings --experimental-sqlite $Manager diagnose --install-root $CwpRoot

# Stop a running supervisor
node --no-warnings --experimental-sqlite $Manager stop --install-root $CwpRoot

# Enable or disable sign-in startup
node --no-warnings --experimental-sqlite $Manager enable-autostart --install-root $CwpRoot
node --no-warnings --experimental-sqlite $Manager disable-autostart --install-root $CwpRoot

# Create a verified backup
node --no-warnings --experimental-sqlite $Manager backup --install-root $CwpRoot --backup-root "$HOME\Documents\CodexWorkPlatform Backups"
```

To upgrade, extract the new Release, open PowerShell in it, and run:

```powershell
$CwpRoot = Join-Path $env:LOCALAPPDATA 'Programs\CodexWorkPlatform'
node --no-warnings --experimental-sqlite .\bin\platform-manager.mjs upgrade --release (Get-Location).Path --install-root $CwpRoot --backup-root "$HOME\Documents\CodexWorkPlatform Backups"
```

Recoverable uninstall:

```powershell
node --no-warnings --experimental-sqlite $Manager uninstall --install-root $CwpRoot --archive-root "$HOME\Documents\CodexWorkPlatform Uninstall Archives"
```

Keep the returned receipt. `restore-uninstall --receipt <receipt-path>` restores
the archived application and data.

### macOS

```bash
CWP_ROOT="$HOME/Applications/CodexWorkPlatform"
MANAGER="$CWP_ROOT/release/bin/platform-manager.mjs"

node --no-warnings --experimental-sqlite "$MANAGER" diagnose --install-root "$CWP_ROOT"
node --no-warnings --experimental-sqlite "$MANAGER" stop --install-root "$CWP_ROOT"
node --no-warnings --experimental-sqlite "$MANAGER" enable-autostart --install-root "$CWP_ROOT"
node --no-warnings --experimental-sqlite "$MANAGER" backup --install-root "$CWP_ROOT" --backup-root "$HOME/Documents/CodexWorkPlatform Backups"
```

## Troubleshooting

- `node` or `codex` is not recognized: install the missing prerequisite, open a
  new terminal, and rerun the version checks.
- Codex is not authenticated: run `codex login`, finish the browser flow, and
  confirm with `codex login status`.
- Environment verification is still running: allow up to two minutes for the
  real read-only CLI probe.
- App Server is unavailable: the UI selects Local Codex CLI automatically. Run
  **Verify environment** again after updating Codex.
- `ERR_CONNECTION_REFUSED`: the supervisor is not running. Start the generated
  launcher and keep its terminal window open.
- Ports 19737/19738 are busy: the supervisor chooses another loopback-only pair
  and prints the actual URL.
- Installation diagnostics: inspect the manager's `diagnose` result and the
  redacted daily logs under the data directory. Never share `auth.json`.
