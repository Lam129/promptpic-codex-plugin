# PromptPic Codex Plugin

让 Codex 一键打开 PromptPic 画布式 AI 生图工作台，并把生成图片保存到本地项目。

[PromptPic](https://promptpic.ai) 是一个面向 AI 图像创作的画布式工作台。你可以在 PromptPic 里生成图片、使用参考图、重绘 / Remix、对比多张结果，并把视觉资产沉淀到项目里。

这个仓库是 PromptPic 的 **Codex 插件公开版**，只包含插件、Skill、MCP 工具和说明文档，不包含 PromptPic 主站源码或任何私密配置。

## 功能亮点

| 能力 | 说明 |
| --- | --- |
| 打开 PromptPic 画布 | 在 Codex 中打开 `https://promptpic.ai/zh-Hans/chat?source=codex` |
| Codex Skill | 告诉 Codex 什么时候该使用 PromptPic，以及如何组织画布式生图流程 |
| MCP 工具 | 提供打开画布、下载资产、读取本地 manifest、检查插件状态等工具 |
| 本地资产保存 | 把图片保存到 `promptpic-assets/YYYY-MM-DD/` |
| Manifest 记录 | 将保存记录写入 `promptpic-assets/YYYY-MM-DD/manifest.jsonl` |

## 当前版本边界

当前版本是 **本地插件 + MCP v1**，适合验证 Codex 与 PromptPic 的基础联动。

已经支持：

- Codex 打开 PromptPic 网页画布
- 用户在 PromptPic 网页内正常登录
- Codex 保存指定图片 URL 到本地 workspace
- 本地生成 `manifest.jsonl`

暂未支持：

- PromptPic 账号与 Codex 账号绑定
- Codex 直接调用 PromptPic 生图 API
- Codex 自动读取当前 PromptPic 画布内容
- 自动从 PromptPic 云端资产库同步所有图片

这些能力会在后续账号授权版本中支持。

## 安装方式

### 方式一：Clone 仓库

```bash
git clone https://github.com/Lam129/promptpic-codex-plugin.git
cd promptpic-codex-plugin
```

然后在 Codex 中加载这个本地插件目录。插件 manifest 位于：

```text
.codex-plugin/plugin.json
```

### 方式二：下载 ZIP

1. 打开仓库页面：[Lam129/promptpic-codex-plugin](https://github.com/Lam129/promptpic-codex-plugin)
2. 点击 **Code**
3. 点击 **Download ZIP**
4. 解压 ZIP
5. 在 Codex 中加载解压后的插件目录

## 如何使用

安装或加载插件后，可以直接对 Codex 说：

```text
打开 PromptPic 做画布式生图
```

或：

```text
Use PromptPic to open a canvas image generation workspace.
```

Codex 会使用 MCP 工具：

```text
promptpic.open_canvas
```

并打开：

```text
https://promptpic.ai/zh-Hans/chat?source=codex
```

如果页面要求登录，请使用你的 PromptPic 账号正常登录。当前版本中，登录态由 PromptPic 网页自己管理，Codex 不会读取或保存你的账号密码、cookie 或 session。

## 保存生成图片到本地

当你拿到一张 PromptPic 图片 URL 后，可以对 Codex 说：

```text
把这张 PromptPic 图片保存到当前项目：<image-url>
```

Codex 会调用：

```text
promptpic.download_asset
```

图片会被保存到：

```text
promptpic-assets/YYYY-MM-DD/
```

同时写入 manifest：

```text
promptpic-assets/YYYY-MM-DD/manifest.jsonl
```

如果你不通过 Codex MCP，也可以手动运行脚本：

```bash
node scripts/save-asset.mjs "<image-url>"
```

## MCP 工具

| 工具 | 用途 |
| --- | --- |
| `promptpic.open_canvas` | 返回 PromptPic Codex 入口 URL |
| `promptpic.download_asset` | 下载图片 URL 到当前 workspace |
| `promptpic.asset_manifest` | 读取本地保存的资产 manifest |
| `promptpic.plugin_status` | 查看插件版本、工具列表和状态 |

## 目录结构

```text
promptpic-codex-plugin/
  .codex-plugin/plugin.json
  .mcp.json
  README.md
  SECURITY.md
  LICENSE
  mcp/server.mjs
  mcp/README.md
  scripts/save-asset.mjs
  skills/promptpic/SKILL.md
```

## 安全与隐私

这个公开仓库只包含插件侧代码。

不会包含：

- PromptPic 主站源码
- 数据库连接串
- API Key
- 生产环境变量
- 用户数据
- 私有部署配置
- 内部业务逻辑

当前版本不会把 PromptPic 账号绑定到 Codex。用户登录只发生在 PromptPic 网页中。

## 开发者验证

启动 MCP server：

```bash
node mcp/server.mjs
```

该 server 使用 MCP stdio 协议，通常由 Codex 根据 `.mcp.json` 自动启动。

插件 manifest：

```text
.codex-plugin/plugin.json
```

MCP 配置：

```text
.mcp.json
```

## 路线图

- PromptPic 与 Codex 的账号授权 / Connect 流程
- Codex 直接调用 PromptPic 生图 API
- 查询 PromptPic 当前聊天和画布资产
- 导出 PromptPic canvas snapshot
- 从 PromptPic 云端资产自动同步到本地 workspace

## License

MIT
