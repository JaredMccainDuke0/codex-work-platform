# Codex 工作台

Codex 工作台是一套本机优先的 Codex 工作流工具，支持项目、依赖工作流、
高风险审批、实时进度、会话历史、产物、备份和可恢复安装。它不提供云端
多人协作，也不要求第三方 API Key。

## 环境要求

- Windows 10/11、macOS arm64，或用于开发的 Linux；
- Node.js 22.5 或更高版本；
- 当前 Codex CLI；
- 使用 `codex login` 登录的官方 ChatGPT/Codex 账号。

Node 22.5–22.12 可能需要 `--experimental-sqlite`；仓库脚本和启动器会自动
附加该参数。

## 开发启动

```bash
npm ci
npm run dev
```

开发启动器会在被忽略的 `.local/` 中创建本地数据，启动两个内部服务，
等待就绪后打开网页。安装版使用生成的 `start-workbench.cmd` 或
`start-workbench.command`，不需要手动分别启动 19737 和 19738。

构建并校验便携包：

```bash
npm run build -- --output ./output/codex-work-platform-1.0.0-portable
npm run verify-release -- ./output/codex-work-platform-1.0.0-portable
```

启动器优先使用 19737/19738；如果被占用，会选择下一组可用端口并写入
`platform-config.json`。浏览器会等待 `/readyz` 通过后再读取数据。

## 安全和数据

- 文件修改、命令、网络、终止和接管默认需要人工审批；
- 网络搜索默认可用，但网络动作仍须审批；自动批准必须显式开启；
- 工作目录受允许根目录、真实路径和敏感目录检查保护；
- 控制状态使用独立的 `control.sqlite`，兼容层继续使用自己的数据库；
- 旧 `.p10.json` 会导入但不会删除；
- 不会把 `auth.json`、Token、API Key、私人项目或完整聊天记录提交到仓库。

`19737` 是兼容数据服务，`19738` 是网页控制服务。它们由 supervisor 按顺序
自动启动；端口被占用时会选择下一组可用端口。看到
`ERR_CONNECTION_REFUSED` 只表示 supervisor 未运行或仍在启动，没有“启动时间
限制”。重新运行启动器并等待 `/readyz` 就绪即可。

界面默认英文，可切换中文。工作台派发任务后，Codex Desktop 可以实时显示
对应对话，无需重启。

更多说明请阅读英文版 [README.md](README.md)、[贡献指南](CONTRIBUTING.md)
和[安全策略](SECURITY.md)。
