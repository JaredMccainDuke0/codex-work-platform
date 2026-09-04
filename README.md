# Codex Work Platform

[![CI](https://github.com/VELIR5/codex-work-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/VELIR5/codex-work-platform/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Release](https://img.shields.io/github/v/release/VELIR5/codex-work-platform?include_prereleases)](https://github.com/VELIR5/codex-work-platform/releases)

[简体中文](README.zh-CN.md) · [Latest Release](https://github.com/VELIR5/codex-work-platform/releases/latest) · [User guide](docs/user-guide.md)

Codex Work Platform is a local-first desktop workbench for planning and running
Codex workflows. It provides projects, workflows, approvals, live progress,
conversation history, artifacts, backups, and recoverable installation.

Your data stays on your computer. The workbench does not require a third-party
API key or cloud collaboration account.

## Requirements

- Windows 10/11 or macOS arm64;
- [Node.js 22.5 or newer](https://nodejs.org/en/download);
- the [current Codex CLI](https://learn.chatgpt.com/docs/codex/cli);
- an official ChatGPT/Codex account signed in with `codex login`.

Before installing, run `node --version`, `codex --version`, `codex login`, and
`codex login status`. The last command should report `Logged in using ChatGPT`.

## Install And Start

### Windows

1. Download the Windows ZIP from the [latest release](https://github.com/VELIR5/codex-work-platform/releases/latest).
2. Verify its neighboring `.sha256` file, then extract the ZIP completely.
3. Double-click `install-windows.cmd`, or run this in PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install-windows.ps1 -Start
```

### macOS arm64

Download and verify the macOS archive from the [latest release](https://github.com/VELIR5/codex-work-platform/releases/latest), then run:

```bash
tar -xzf codex-work-platform-v1.1.1-macos-arm64.tar.gz
cd <extracted-directory>
chmod +x ./install-macos.command
CWP_START=1 ./install-macos.command
```

The browser opens when the workbench is ready. Keep the launcher window open
while using it; press `Ctrl+C` or close that window to stop the service.

The installer keeps the application, data, workspace, and backups separate.
See the [user guide](docs/user-guide.md) for exact locations and lifecycle
commands.

## First Use

1. Open **Overview** and select **Verify environment**.
2. Create a project and choose a normal workspace directory.
3. Create a workflow and add its steps.
4. Dispatch the workflow and handle any approval requests.
5. Review progress, artifacts, events, and conversations in **Activity**.

The first environment check performs a real read-only test and may take up to
two minutes. If App Server is unavailable but Local Codex CLI is ready, the
workbench selects the local CLI automatically.

## Stop, Backup, And Upgrade

Run the generated `start-workbench.cmd` or `start-workbench.command` launcher
again after a restart. For stopping, backup, upgrade, diagnostics, autostart,
or recoverable uninstall, follow the [user guide](docs/user-guide.md).

## Safety

- File changes, commands, network access, termination, and takeover require
  approval by default.
- Workspaces are restricted to allowed roots and sensitive paths are rejected.
- Credentials and complete conversations are not written to the repository or
  release packages.
- Verify release checksums before running an installer. The launchers are not
  signed with commercial Windows or Apple developer certificates.

## Help

Read the [complete user guide](docs/user-guide.md) for troubleshooting and
lifecycle operations. Report vulnerabilities through the [security policy](SECURITY.md),
not a public issue.

## License

The original Codex Work Platform code is released under the MIT license.
Vendored dependencies retain their own licenses; see [NOTICE](NOTICE).
