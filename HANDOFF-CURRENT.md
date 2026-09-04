# Codex Work Platform 当前交接文档

更新时间：2026-09-02  
适用版本：`1.1.1`  
仓库：[VELIR5/codex-work-platform](https://github.com/VELIR5/codex-work-platform)

## 1. 当前结论

项目已经合并到 `main`，并发布了 `v1.1.1`。本版本重点修复了 Windows
App Server 启动、环境验证超时、首次使用引导、安装脚本、Windows ZIP 发布和
Windows 路径绑定问题。

当前本机服务保持停止状态，19737 和 19738 均未监听。正式数据库和历史状态
文件没有被本轮测试修改。

## 2. GitHub 与版本

- 当前主分支提交：`ad8a31e0cbde3fd1ed3c7875fc954f7f1949bd13`
- `main` 与远端同步，工作区应保持干净。
- 已合并 PR：[PR #4](https://github.com/VELIR5/codex-work-platform/pull/4)
- 当前 Release：[v1.1.1](https://github.com/VELIR5/codex-work-platform/releases/tag/v1.1.1)
- 应用版本：`1.1.1`
- compat-runtime 组件版本：`1.0.0`（独立版本，不与应用版本强制同步）

## 3. 目录与数据边界

源码仓库的主要目录：

```text
server/                         控制服务基础模块
web/                            独立亮色 Web UI
installer/                      跨平台安装、启动、备份和升级逻辑
release/compat-runtime/         兼容运行时发布副本
vendor/compat-runtime/          来源、许可证、恢复证据和替换合同
tests/                          单元、集成、安装器和浏览器回归测试
docs/user-guide.md              面向最终用户的生命周期指南
output/                         本机生成物，不得提交到 Git
```

本机生成物目前只应保留：

```text
output/codex-work-platform-1.1.1-portable/
output/playwright/
```

正式数据位于 `output/playwright/` 下的本机测试数据目录中。不得删除、重写或
迁移正式 SQLite、历史事件、认证文件和用户项目目录。

## 4. 运行架构

```text
Browser
   │
   ▼
supervisor
   ├── 19738  Web control service (P10)
   └── 19737  compat-runtime data/MCP service
```

- `19738` 是网页控制服务。
- `19737` 是兼容数据和 MCP 服务。
- 两个端口都是本机回环端口，不是两个用户界面。
- supervisor 会按顺序启动两个服务；端口冲突时会选择下一组可用端口并持久化。
- `/healthz` 表示进程存活。
- `/readyz` 表示兼容层、控制数据库和配置均已可用。
- 用户不需要分别启动两个端口。

控制服务的基础模块位于 `server/`，业务编排仍由
`p10-control-server.mjs` 作为组合根负责。

## 5. 新用户安装流程

### Windows 10/11

1. 安装 Node.js 22.5 或更高版本。
2. 安装当前 Codex CLI。
3. 执行：

   ```text
   codex login
   codex login status
   ```

   应显示 `Logged in using ChatGPT`。

4. 从 Release 下载 `windows-x64.zip`，先核对相邻 `.sha256` 文件。
5. 完整解压后双击 `install-windows.cmd`，或执行：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\install-windows.ps1 -Start
   ```

6. 浏览器会在 `/readyz` 通过后打开。使用期间保持启动窗口打开；按 `Ctrl+C`
   或关闭窗口会停止前台服务。

默认目录：

```text
程序：%LOCALAPPDATA%\Programs\CodexWorkPlatform
数据：%LOCALAPPDATA%\CodexWorkPlatform\data
工作区：%USERPROFILE%\Documents\CodexWorkspace
备份：%USERPROFILE%\Documents\CodexWorkPlatform Backups
```

### macOS arm64

```bash
tar -xzf codex-work-platform-v1.1.1-macos-arm64.tar.gz
cd <extracted-directory>
chmod +x ./install-macos.command
CWP_START=1 ./install-macos.command
```

默认目录：

```text
程序：~/Applications/CodexWorkPlatform
数据：~/Library/Application Support/CodexWorkPlatform
工作区：~/Documents/CodexWorkspace
备份：~/Documents/CodexWorkPlatform Backups
```

### 首次使用顺序

1. Overview → Verify environment。
2. Projects → 创建项目并选择普通工作区。
3. Workflows → 创建工作流、添加节点、保存节点顺序。
4. Dispatch → 派发任务。
5. Approvals → 处理高风险动作。
6. Activity → 查看进度、事件、产物和 Codex 会话。

真实环境探针是只读执行，冷启动最多可能需要两分钟。

## 6. 适配器策略

- App Server 是首选会话适配器，用于实时对话、会话历史和继续提示。
- Local Codex CLI 是独立的本机执行适配器。
- 如果 App Server 不可用但 CLI 已验证，UI 会禁用 App Server 并自动选择 CLI。
- 不得把不可用的 App Server 静默降级为 mock 执行。
- 高风险动作默认人工审批；网络搜索可以开启，但网络动作仍需要审批。

## 7. 常用生命周期命令

完整命令和平台差异见 [`docs/user-guide.md`](docs/user-guide.md)。核心操作包括：

```text
diagnose             检查安装、配置、数据库和服务状态
start                启动 supervisor 和两个内部服务
stop                 停止服务
backup               创建经过校验的应用/数据备份
verify-backup        验证备份清单和哈希
upgrade              从新 Release 受控升级
enable-autostart     配置登录后自动启动
disable-autostart    关闭自动启动
uninstall            归档后卸载，可用 receipt 恢复
restore-uninstall    根据 receipt 恢复卸载归档
```

## 8. 发布完整性

所有平台便携目录的共同身份：

- 文件数：`58`
- 字节数：`2,874,877`
- manifest SHA-256：
  `b20331fc061cb75b80decb7ec67ae6f75dac984f06ea6e68e4b883ea1e40eb04`
- tree SHA-256：
  `e83a0b576606c438866ee0c25ff7c294f32617c0c7f0e7453fd5fc01e51a7756`

Release 压缩包 SHA-256：

| 文件               | SHA-256                                                            |
| ------------------ | ------------------------------------------------------------------ |
| Linux x64 tar.gz   | `cd36db5695fdcfa06764463a882c876bf8ca6e61cba35a6fc78f2a460013e73b` |
| macOS arm64 tar.gz | `2d3a2fd56c27bbd2216f2efdc871113a488e8fe1d9340bb06c7ef56b694b7d04` |
| Windows x64 tar.gz | `086c86a335d682601e4bd1405c77dfabd2b1d15199c94e398e77c811b0795939` |
| Windows x64 zip    | `9ea78c4b15e50581ad7cab2924aef4b6ec4aff5014334d029787a46e268b46cc` |

## 9. 已验证事项

- `npm run check` 通过。
- `npm run format:check` 通过。
- `npm audit --audit-level=high` 无高危漏洞。
- 80 个测试被发现；Windows 本机 79 个通过、1 个 POSIX-only 用例跳过。
- 核心覆盖率：99.23% 行、82.66% 分支、100% 函数。
- 真实 Windows App Server PATH/`.cmd` 启动和带空格路径测试通过。
- 真实 Codex CLI `0.149.1` 的 ChatGPT 登录、App Server 启动和模型列表通过。
- 浏览器回归覆盖 16 秒延迟探针、适配器回退、首次清单和 390px 亮色布局。
- Windows、macOS arm64、Ubuntu Node 22/24 的 GitHub CI 全部通过。
- CodeQL 和公开内容审计全部通过。
- Release 的 4 个压缩包均已下载、哈希比对、解压并独立验证。

## 10. 尚未宣称完成的事项

- 全新实体 Windows 电脑的完整首次安装和重启验收。
- 全新实体 macOS arm64 电脑的完整首次安装和重启验收。
- 新用户使用自己的 ChatGPT 账号完成首次登录的真实验收。
- Windows SmartScreen 和 macOS Gatekeeper 的受信任代码签名体验。
- compat-runtime 原始 TypeScript checkout、上游 commit 和原始 lockfile 尚未恢复。

这些事项必须继续标记为“CI 已验证、实体机未验证”，不能仅凭 README 或历史
测试摘要宣称绝对兼容。

## 11. 安全与维护规则

- 不要把 `auth.json`、Token、API Key 或完整聊天记录写入日志、仓库或 Release。
- 不要把 `output/`、SQLite、`.p10.json`、浏览器缓存或私人项目提交到 Git。
- 不要删除正式数据库、历史审计、备份 receipt 或用户工作区。
- 删除或迁移文件前先做只读盘点、哈希记录和可恢复备份。
- compat-runtime 是当前仍在使用的组件，不能按“历史文件”删除。
- 修改发布内容后必须重新构建并重新计算 manifest/tree SHA-256。
- 新代理接手时先检查当前磁盘、Git、端口、Release 包和数据库哈希，不要只相信旧对话。

## 12. 建议的后续工作

1. 在一台全新 Windows 用户环境中完成 ZIP → 安装 → 登录 → 启动 → 停止 →
   备份 → 恢复流程。
2. 在一台 macOS arm64 实机中完成同等流程。
3. 如要达到普通用户“无安全警告”体验，配置受信任的 Windows Authenticode
   和 Apple Developer ID 签名，再更新 Release 说明。
4. 持续将 App Server 协议回归测试绑定到真实 Codex CLI 版本变化。
