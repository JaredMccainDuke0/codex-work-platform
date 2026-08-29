param(
  [string]$InstallRoot = '',
  [string]$DataRoot = '',
  [string]$WorkspaceRoot = '',
  [string]$CodexCommand = 'codex',
  [int]$CompatPort = 19737,
  [int]$WebPort = 19738,
  [switch]$AutoApproveHighRisk,
  [switch]$Start
)

$ErrorActionPreference = 'Stop'
$manager = Join-Path $PSScriptRoot 'bin\platform-manager.mjs'
if (-not (Test-Path -LiteralPath $manager -PathType Leaf)) {
  throw "找不到平台管理器：$manager"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw '未检测到 Node.js 22.5 或更高版本。请先安装 Node.js，再重新运行。'
}

$common = @(
  '--release', $PSScriptRoot,
  '--codex-command', $CodexCommand,
  '--compat-port', [string]$CompatPort,
  '--web-port', [string]$WebPort,
  '--allow-web-search', 'true'
)
if ($InstallRoot) { $common += @('--install-root', [IO.Path]::GetFullPath($InstallRoot)) }
if ($DataRoot) { $common += @('--data-root', [IO.Path]::GetFullPath($DataRoot)) }
if ($WorkspaceRoot) { $common += @('--workspace-root', [IO.Path]::GetFullPath($WorkspaceRoot)) }
if ($AutoApproveHighRisk) { $common += @('--auto-approve-high-risk', 'true') }

Write-Host '正在检查 Node、Codex CLI、登录状态、磁盘和目标目录……'
& node --experimental-sqlite $manager preflight @common
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host '正在安装 Codex 工作台……'
& node --experimental-sqlite $manager install @common
if ($LASTEXITCODE -ne 0) {
  Write-Host '安装未完成。若提示 Codex 未认证，请先执行 codex login。' -ForegroundColor Yellow
  exit $LASTEXITCODE
}

Write-Host '安装完成。可双击安装目录中的 start-workbench.cmd 启动。' -ForegroundColor Green
if ($Start) {
  $startArgs = @('--open', 'true')
  if ($InstallRoot) { $startArgs += @('--install-root', [IO.Path]::GetFullPath($InstallRoot)) }
  & node --experimental-sqlite $manager start @startArgs
  exit $LASTEXITCODE
}
