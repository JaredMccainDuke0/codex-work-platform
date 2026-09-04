# Codex 工作台

[English](README.md) · [下载最新版](https://github.com/VELIR5/codex-work-platform/releases/latest) · [完整用户指南](docs/user-guide.md)

Codex 工作台是一套本机优先的 Codex 工作流工具，支持项目、依赖工作流、
高风险审批、实时进度、会话历史、产物、备份和可恢复安装。它不提供云端
多人协作，也不要求第三方 API Key。

网页和服务只绑定到本机回环地址。supervisor 会自动启动内部两个服务，
用户不需要分别启动 19737 和 19738。

## 环境要求

- Windows 10/11 或 macOS arm64；Linux 目前定位为开发环境；
- [Node.js 22.5 或更高版本](https://nodejs.org/en/download)；
- [当前 Codex CLI](https://learn.chatgpt.com/docs/codex/cli)；
- 使用本人官方 ChatGPT/Codex 账号完成 `codex login`。

安装前打开 PowerShell 或终端检查：

```text
node --version
codex --version
codex login
codex login status
```

`codex login status` 应显示 `Logged in using ChatGPT`。工作台不会复制或
记录 `auth.json`、API Key 和 Token。

## 五分钟安装

### 1. 下载正确的 Release

打开 [GitHub 最新 Release](https://github.com/VELIR5/codex-work-platform/releases/latest)：

| 系统           | 推荐下载文件                                    |
| -------------- | ----------------------------------------------- |
| Windows x64    | `codex-work-platform-v1.1.1-windows-x64.zip`    |
| macOS arm64    | `codex-work-platform-v1.1.1-macos-arm64.tar.gz` |
| Linux x64 开发 | `codex-work-platform-v1.1.1-linux-x64.tar.gz`   |

每个压缩包旁都有 `.sha256` 文件。运行安装脚本前应先核对 SHA-256；具体
命令见[用户指南](docs/user-guide.md#verify-the-download)。

### 2. Windows 安装并启动

完整解压 ZIP，然后双击 `install-windows.cmd`。也可以在解压目录中运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install-windows.ps1 -Start
```

安装成功后浏览器会在服务就绪时自动打开。使用期间请保持启动窗口打开；
按 `Ctrl+C` 或关闭窗口会停止前台服务。

默认目录：

- 程序：`%LOCALAPPDATA%\Programs\CodexWorkPlatform`
- 数据和日志：`%LOCALAPPDATA%\CodexWorkPlatform\data`
- 工作目录：`%USERPROFILE%\Documents\CodexWorkspace`
- 备份：`%USERPROFILE%\Documents\CodexWorkPlatform Backups`

### 3. macOS 安装并启动

```bash
tar -xzf codex-work-platform-v1.1.1-macos-arm64.tar.gz
cd <解压后的目录>
chmod +x ./install-macos.command
CWP_START=1 ./install-macos.command
```

使用期间请保持终端窗口打开。若 Finder 显示 Gatekeeper 警告，请先核对
SHA-256，再使用“按住 Control 点击 → 打开”或从终端执行；不要全局关闭
Gatekeeper。

默认目录：

- 程序：`~/Applications/CodexWorkPlatform`
- 数据和日志：`~/Library/Application Support/CodexWorkPlatform`
- 工作目录：`~/Documents/CodexWorkspace`
- 备份：`~/Documents/CodexWorkPlatform Backups`

便携目录的文件树可复现并经过 CI 验证；每个实际压缩包都有自己发布的
SHA-256。启动脚本目前没有商业 Windows Authenticode 证书或 Apple Developer
ID 签名。请核对 Release 哈希，不要通过全局降低系统安全设置来运行未知文件。

## 第一次使用

总览页面会显示四步上手清单：

1. 点击“验证执行环境”。它会进行一次真实只读探针，冷启动最多可能需要
   两分钟。
2. 创建项目并选择普通本机工作目录。
3. 创建工作流、添加节点并保存执行顺序。
4. 派发运行，在“审批”和“活动”页面检查过程与结果。

App Server 是首选会话执行器；如果它不可用而 Local Codex CLI 可用，页面会
自动禁用 App Server 并切换到 CLI，不再把任务派发给失效的默认执行器。

## 启动、停止、备份和升级

安装版会生成 `start-workbench.cmd` 或 `start-workbench.command`。电脑重启后
可以再次运行它；如果需要登录后自动启动，请按[用户指南中的生命周期命令](docs/user-guide.md#installed-lifecycle-commands)
启用 autostart。

用户指南还包含：

- 停止与诊断；
- 经过校验的备份；
- 从新 Release 升级；
- 可恢复卸载和恢复；
- 常见安装、登录、端口与 App Server 故障处理。

## 开发启动

```bash
npm ci
npm run dev
```

开发启动器会在被忽略的 `.local/` 中创建临时数据，启动两个内部服务，
等待 `/readyz` 后打开网页。使用 `Ctrl+C` 可以优雅停止。

构建并校验便携包：

```bash
npm run build -- -- --output ./output/codex-work-platform-1.1.1-portable
npm run verify-release -- ./output/codex-work-platform-1.1.1-portable
```

## 安全和数据

- 文件修改、命令、网络、终止和接管默认需要人工审批；
- 网络搜索默认可用，但网络动作仍须审批；自动批准必须显式开启；
- 工作目录受允许根目录、真实路径和敏感目录检查保护；
- 控制状态使用独立的 `control.sqlite`，兼容层继续使用自己的数据库；
- 旧 `.p10.json` 会导入但不会删除；
- 不会把凭证、私人项目或完整聊天记录放入仓库或 Release。

界面采用明亮浅色主题，默认英文并可切换中文；工作台派发的 App Server
会话可以实时显示，无需重启 Codex Desktop。

## 验证边界

Windows、macOS arm64 和 Linux 已进入 CI；全新 Windows 实体机、Windows
重启验收、macOS arm64 实体机和新用户首次 ChatGPT 登录仍会诚实标记为
“实体机未验证”。

内置 compat-runtime 当前是独立的 1.0.0 组件版本。原始 TypeScript checkout
和 lockfile 尚未恢复；仓库只记录可验证的[恢复证据](vendor/compat-runtime/RECOVERY.md)
和[替换契约](vendor/compat-runtime/CONTRACT.md)，不会把生成 bundle 冒充源码。

更多开发与安全信息见[贡献指南](CONTRIBUTING.md)、[安全策略](SECURITY.md)和
[变更记录](CHANGELOG.md)。
