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
$utf8 = New-Object System.Text.UTF8Encoding($false)
[Console]::OutputEncoding = $utf8
$OutputEncoding = $utf8
$manager = Join-Path $PSScriptRoot 'bin\platform-manager.mjs'
$zh = '{"managerMissing":"\u627e\u4e0d\u5230\u5e73\u53f0\u7ba1\u7406\u5668","nodeRequired":"\u8bf7\u5148\u5b89\u88c5 Node.js 22.5 \u6216\u66f4\u9ad8\u7248\u672c\u3002","checking":"\u6b63\u5728\u68c0\u67e5 Node.js\u3001Codex CLI\u3001ChatGPT \u767b\u5f55\u3001\u78c1\u76d8\u548c\u76ee\u6807\u76ee\u5f55\u2026\u2026","installing":"\u6b63\u5728\u5b89\u88c5 Codex \u5de5\u4f5c\u53f0\u2026\u2026","completed":"\u5b89\u88c5\u5b8c\u6210","installRoot":"\u5b89\u88c5\u76ee\u5f55","launcher":"\u542f\u52a8\u5165\u53e3","failed":"\u5b89\u88c5\u672a\u5b8c\u6210\u3002\u8bf7\u786e\u8ba4 Node.js 22.5+\uff0c\u6267\u884c codex login \u540e\u91cd\u8bd5\u3002","starting":"\u6b63\u5728\u542f\u52a8\u5de5\u4f5c\u53f0\u3002\u8bf7\u4fdd\u6301\u6b64\u7a97\u53e3\u6253\u5f00\uff1b\u6309 Ctrl+C \u53ef\u505c\u6b62\u670d\u52a1\u3002"}' | ConvertFrom-Json

function Write-Step([string]$English, [string]$Chinese) {
  Write-Host "$English / $Chinese"
}

function Invoke-PlatformManager([string]$Command, [string[]]$Arguments) {
  $output = @(& node --no-warnings --experimental-sqlite $manager $Command @Arguments)
  $exitCode = $LASTEXITCODE
  $text = ($output -join [Environment]::NewLine).Trim()
  if ($exitCode -ne 0) {
    if ($text) { Write-Host $text -ForegroundColor DarkGray }
    throw "Platform manager command failed: $Command (exit $exitCode)"
  }
  try {
    $payload = $text | ConvertFrom-Json -ErrorAction Stop
  }
  catch {
    throw "Platform manager returned an unreadable response for $Command."
  }
  if (-not $payload.ok) {
    throw "Platform manager rejected $Command`: $($payload.code) $($payload.detail)"
  }
  return $payload
}

if (-not (Test-Path -LiteralPath $manager -PathType Leaf)) {
  throw "Platform manager was not found / $($zh.managerMissing): $manager"
}
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw "Node.js 22.5 or newer is required / $($zh.nodeRequired)"
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

try {
  Write-Step 'Checking Node.js, Codex CLI, ChatGPT sign-in, disk space, and target folders...' $zh.checking
  $preflight = Invoke-PlatformManager 'preflight' $common
  if (-not $preflight.result.ready) {
    throw "Preflight did not pass: $($preflight.result | ConvertTo-Json -Compress)"
  }

  Write-Step 'Installing Codex Work Platform...' $zh.installing
  $installed = Invoke-PlatformManager 'install' $common
  $installedRoot = [string]$installed.result.installation.installRoot
  Write-Host "Installation completed / $($zh.completed)" -ForegroundColor Green
  Write-Host "Install root / $($zh.installRoot): $installedRoot"
  Write-Host "Launcher / $($zh.launcher): $(Join-Path $installedRoot 'start-workbench.cmd')"
}
catch {
  Write-Host 'Installation did not complete. Confirm Node.js 22.5+, run `codex login`, and retry.' -ForegroundColor Yellow
  Write-Host $zh.failed -ForegroundColor Yellow
  Write-Host $_.Exception.Message -ForegroundColor Red
  exit 3
}

if ($Start) {
  Write-Step 'Starting the workbench. Keep this window open; press Ctrl+C to stop.' $zh.starting
  $startArgs = @('--open', 'true')
  if ($InstallRoot) { $startArgs += @('--install-root', [IO.Path]::GetFullPath($InstallRoot)) }
  & node --no-warnings --experimental-sqlite $manager start @startArgs
  exit $LASTEXITCODE
}
