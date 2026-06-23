# PromptPic MCP Server

这个目录包含 PromptPic Codex Plugin 使用的 MCP Server。它负责把 Codex 的自然语言请求转换成结构化工具调用，例如打开 PromptPic 画布、绑定账号、读取画布选区、调用 PromptPic 生图 API、下载图片资产。

## 可用工具

| 工具 | 用途 |
| --- | --- |
| `promptpic.open_canvas` | 在 Codex 中打开 PromptPic 远程画布。 |
| `promptpic.connect_account` | 返回 PromptPic 账号绑定地址，或校验已配置 token。 |
| `promptpic.get_account` | 读取当前绑定的 PromptPic 账号信息。 |
| `promptpic.get_selection` | 读取当前 PromptPic 画布选中的元素和图片资产。 |
| `promptpic.create_image` | 通过 PromptPic API 提交生图任务。 |
| `promptpic.get_generation` | 查询生图任务状态和生成结果。 |
| `promptpic.download_asset` | 将图片 URL 下载到当前工作区的 `promptpic-assets/`。 |
| `promptpic.asset_manifest` | 读取本地已保存素材的 manifest 记录。 |
| `promptpic.plugin_status` | 查看插件状态、API 地址和 token 配置状态。 |

## Token 配置

MCP Server 通过环境变量读取 PromptPic Codex Token：

```text
PROMPTPIC_CODEX_TOKEN=ppc_codex_xxx
```

Token 由用户在 PromptPic 连接页创建：

```text
https://promptpic.ai/zh-Hans/codex/connect?source=codex
```

插件不应该保存 PromptPic 用户密码、浏览器 Cookie、数据库连接串、R2 密钥或模型供应商密钥。

## 本地素材规则

下载的图片会进入当前工作区：

```text
promptpic-assets/YYYY-MM-DD/
```

每次下载会追加一条记录：

```text
promptpic-assets/YYYY-MM-DD/manifest.jsonl
```

这些文件只是 Codex 本地协作副本，PromptPic 云端资产仍以 R2 和数据库为准。

## 设计原则

- Codex 通过 MCP 工具读写结构化状态，不依赖截图识别业务数据。
- 账号绑定使用 scoped token，不暴露用户 Cookie。
- 所有生图、扣费、模型路由、R2 保存仍由 PromptPic 后端完成。
- 本地下载只能写入当前工作区，不能写入任意系统目录。

## 计划中的画布写入工具

| 工具 | 用途 |
| --- | --- |
| `promptpic.list_assets` | 列出当前聊天/画布下的 PromptPic 资产。 |
| `promptpic.save_canvas_snapshot` | 保存或导出当前画布快照。 |
| `promptpic.export_canvas` | 导出画布数据或视觉预览。 |
| `promptpic.insert_image_to_canvas` | 将已有图片资产插入画布指定位置。 |
