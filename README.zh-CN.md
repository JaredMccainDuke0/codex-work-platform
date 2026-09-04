# Codex 工作台

[English](README.md) · [下载最新版](https://github.com/VELIR5/codex-work-platform/releases/latest) · [完整用户指南](docs/user-guide.md)

Codex 工作台是一套本机优先的 Codex 工作流工具，支持项目、工作流、审批、
实时进度、会话历史、产物、备份和可恢复安装。

数据保存在你的电脑上，不要求第三方 API Key，也不提供云端多人协作。

## 环境要求

- Windows 10/11 或 macOS arm64；
- [Node.js 22.5 或更高版本](https://nodejs.org/en/download)；
- [当前 Codex CLI](https://learn.chatgpt.com/docs/codex/cli)；
- 使用官方 ChatGPT/Codex 账号完成 `codex login`。

安装前打开 PowerShell 或终端运行：

```text
node --version
codex --version
codex login
codex login status
```

最后一条命令应显示 `Logged in using ChatGPT`。

## 安装并启动

### Windows

1. 从[最新版 Release](https://github.com/VELIR5/codex-work-platform/releases/latest)下载 Windows ZIP。
2. 运行前核对压缩包旁的 `.sha256` 文件并完整解压。
3. 双击 `install-windows.cmd`，或在 PowerShell 中运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\install-windows.ps1 -Start
```

### macOS arm64

从[最新版 Release](https://github.com/VELIR5/codex-work-platform/releases/latest)下载 macOS 压缩包，核对 `.sha256` 后运行：

```bash
tar -xzf codex-work-platform-v1.1.1-macos-arm64.tar.gz
cd <解压后的目录>
chmod +x ./install-macos.command
CWP_START=1 ./install-macos.command
```

服务就绪后浏览器会自动打开。使用期间请保持启动窗口或终端打开；按
`Ctrl+C` 或关闭窗口即可停止服务。

安装程序会将程序、数据、工作目录和备份分开保存。具体位置和生命周期
命令请看[完整用户指南](docs/user-guide.md)。

## 第一次使用

1. 打开“Overview”，点击“Verify environment”。
2. 创建项目并选择普通本机工作目录。
3. 创建工作流并添加步骤。
4. 派发工作流，处理需要审批的操作。
5. 在“Activity”中查看进度、产物、事件和会话。

首次环境检查会进行真实的只读测试，最多可能需要两分钟。如果 App Server
不可用而 Local Codex CLI 可用，工作台会自动选择本地 CLI。

## 停止、备份和升级

安装程序会生成 `start-workbench.cmd` 或 `start-workbench.command`。电脑重启
后可以再次运行它。停止、备份、升级、诊断、自动启动和可恢复卸载等操作，
请按[完整用户指南](docs/user-guide.md)执行。

## 安全提示

- 文件修改、命令、网络、终止和接管默认需要审批；
- 工作目录受允许根目录限制，敏感路径会被拒绝；
- 凭证和完整会话不会写入仓库或 Release；
- 运行安装程序前请核对 Release 哈希。启动脚本目前没有商业 Windows 或
  Apple 开发者证书签名。

## 帮助

安装故障和生命周期操作请查看[完整用户指南](docs/user-guide.md)。安全问题
请按[安全策略](SECURITY.md)私下报告，不要提交公开 Issue。

## 许可证

原始 Codex 工作台代码采用 MIT 许可证。随附依赖保留各自许可证，详见
[NOTICE](NOTICE)。
