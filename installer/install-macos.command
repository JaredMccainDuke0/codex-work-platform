#!/bin/sh
set -eu

RELEASE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
MANAGER="$RELEASE_ROOT/bin/platform-manager.mjs"

if ! command -v node >/dev/null 2>&1; then
  echo '未检测到 Node.js 22.5 或更高版本。请先安装 Node.js，再重新运行。' >&2
  exit 1
fi

set -- --release "$RELEASE_ROOT" --codex-command "${CWP_CODEX_COMMAND:-codex}" --compat-port "${CWP_COMPAT_PORT:-19737}" --web-port "${CWP_WEB_PORT:-19738}" --allow-web-search true
if [ -n "${CWP_INSTALL_ROOT:-}" ]; then set -- "$@" --install-root "$CWP_INSTALL_ROOT"; fi
if [ -n "${CWP_DATA_ROOT:-}" ]; then set -- "$@" --data-root "$CWP_DATA_ROOT"; fi
if [ -n "${CWP_WORKSPACE_ROOT:-}" ]; then set -- "$@" --workspace-root "$CWP_WORKSPACE_ROOT"; fi
if [ "${CWP_AUTO_APPROVE_HIGH_RISK:-0}" = '1' ]; then set -- "$@" --auto-approve-high-risk true; fi

echo '正在检查 Node、Codex CLI、登录状态、磁盘和目标目录……'
node --experimental-sqlite "$MANAGER" preflight "$@"
echo '正在安装 Codex 工作台……'
node --experimental-sqlite "$MANAGER" install "$@"
echo '安装完成。可双击安装目录中的 start-workbench.command 启动。'

if [ "${CWP_START:-0}" = '1' ]; then
  if [ -n "${CWP_INSTALL_ROOT:-}" ]; then
    exec node --experimental-sqlite "$MANAGER" start --install-root "$CWP_INSTALL_ROOT" --open true
  fi
  exec node --experimental-sqlite "$MANAGER" start --open true
fi
