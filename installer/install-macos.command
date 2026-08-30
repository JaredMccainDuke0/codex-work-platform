#!/bin/sh
set -eu

RELEASE_ROOT="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
MANAGER="$RELEASE_ROOT/bin/platform-manager.mjs"

step() {
  printf '%s / %s\n' "$1" "$2"
}

if ! command -v node >/dev/null 2>&1; then
  echo 'Node.js 22.5 or newer is required / 请先安装 Node.js 22.5 或更高版本。' >&2
  exit 1
fi

set -- --release "$RELEASE_ROOT" --codex-command "${CWP_CODEX_COMMAND:-codex}" --compat-port "${CWP_COMPAT_PORT:-19737}" --web-port "${CWP_WEB_PORT:-19738}" --allow-web-search true
if [ -n "${CWP_INSTALL_ROOT:-}" ]; then set -- "$@" --install-root "$CWP_INSTALL_ROOT"; fi
if [ -n "${CWP_DATA_ROOT:-}" ]; then set -- "$@" --data-root "$CWP_DATA_ROOT"; fi
if [ -n "${CWP_WORKSPACE_ROOT:-}" ]; then set -- "$@" --workspace-root "$CWP_WORKSPACE_ROOT"; fi
if [ "${CWP_AUTO_APPROVE_HIGH_RISK:-0}" = '1' ]; then set -- "$@" --auto-approve-high-risk true; fi

step 'Checking Node.js, Codex CLI, ChatGPT sign-in, disk space, and target folders…' '正在检查 Node.js、Codex CLI、ChatGPT 登录、磁盘和目标目录……'
preflight_json="$(node --no-warnings --experimental-sqlite "$MANAGER" preflight "$@")" || {
  code=$?
  printf '%s\n' "$preflight_json" >&2
  echo 'Preflight failed. Run codex login and retry / 预检查失败，请执行 codex login 后重试。' >&2
  exit "$code"
}
preflight_ready="$(printf '%s' "$preflight_json" | node -e 'let value="";process.stdin.on("data",chunk=>value+=chunk);process.stdin.on("end",()=>process.stdout.write(JSON.parse(value).result.ready?"1":"0"));')"
if [ "$preflight_ready" != '1' ]; then
  printf '%s\n' "$preflight_json" >&2
  echo 'Preflight did not pass. Run codex login and retry / 预检查未通过，请执行 codex login 后重试。' >&2
  exit 3
fi

step 'Installing Codex Work Platform…' '正在安装 Codex 工作台……'
install_json="$(node --no-warnings --experimental-sqlite "$MANAGER" install "$@")" || {
  code=$?
  printf '%s\n' "$install_json" >&2
  echo 'Installation did not complete / 安装未完成。' >&2
  exit "$code"
}
install_root="$(printf '%s' "$install_json" | node -e 'let value="";process.stdin.on("data",chunk=>value+=chunk);process.stdin.on("end",()=>process.stdout.write(JSON.parse(value).result.installation.installRoot));')"
step 'Installation completed' '安装完成'
printf 'Install root / 安装目录: %s\n' "$install_root"
printf 'Launcher / 启动入口: %s/start-workbench.command\n' "$install_root"

if [ "${CWP_START:-0}" = '1' ]; then
  step 'Starting the workbench. Keep this Terminal window open; press Control-C to stop.' '正在启动工作台。请保持终端窗口打开；按 Control-C 可停止服务。'
  if [ -n "${CWP_INSTALL_ROOT:-}" ]; then
    exec node --no-warnings --experimental-sqlite "$MANAGER" start --install-root "$CWP_INSTALL_ROOT" --open true
  fi
  exec node --no-warnings --experimental-sqlite "$MANAGER" start --open true
fi
