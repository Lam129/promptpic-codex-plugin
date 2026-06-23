# PromptPic Codex Plugin

PromptPic Codex Plugin 让 Codex 可以直接连接 PromptPic 的远程画布、生图 API 和用户素材工作流。它的目标不是把 PromptPic 私有系统搬到本地，而是让用户在 Codex 里打开线上 PromptPic 画布，并通过安全 token 让 Codex 读取当前画布选区、触发生图、保存图片资产。

## 能做什么

- 在 Codex 中打开 PromptPic 线上画布。
- 通过 PromptPic 账号创建 Codex Token 完成账号绑定。
- 读取当前画布选中的图片资产。
- 调用 PromptPic API 创建图片生成任务。
- 查询生成任务状态和生成结果。
- 把图片 URL 下载到当前 Codex 工作区的 `promptpic-assets/` 目录。

## 当前版本

当前版本是第一版远程画布集成，重点是打通账号绑定、选区读取和生图 API。

已支持：

- `promptpic.open_canvas`
- `promptpic.connect_account`
- `promptpic.get_account`
- `promptpic.get_selection`
- `promptpic.create_image`
- `promptpic.get_generation`
- `promptpic.download_asset`
- `promptpic.asset_manifest`
- `promptpic.plugin_status`

后续会继续补齐画布写入能力，例如把生成结果插入指定位置、导出画布快照、读取更完整的画布结构。

## 目录结构

```text
promptpic-codex-plugin/
  .codex-plugin/plugin.json
  .mcp.json
  README.md
  SECURITY.md
  LICENSE
  skills/promptpic/SKILL.md
  scripts/save-asset.mjs
  mcp/README.md
  mcp/server.mjs
```

## 安装方式

### 方式一：Clone 仓库

```bash
git clone https://github.com/Lam129/promptpic-codex-plugin.git
cd promptpic-codex-plugin
```

然后在 Codex 中加载这个插件目录。插件 manifest 位于：

```text
.codex-plugin/plugin.json
```

### 方式二：下载 ZIP

1. 打开 [Lam129/promptpic-codex-plugin](https://github.com/Lam129/promptpic-codex-plugin)。
2. 点击 **Code**。
3. 点击 **Download ZIP**。
4. 解压 ZIP。
5. 在 Codex 中加载解压后的插件目录。

插件本身不包含数据库、R2、模型供应商等私密配置。

如果要给朋友分发，推荐只分发这个插件目录或独立插件仓库，不要分发 PromptPic 主站源码。

## 账号绑定

1. 在 Codex 里让插件执行：

   ```text
   连接 PromptPic 账号
   ```

2. 插件会打开：

   ```text
   https://promptpic.ai/zh-Hans/codex/connect?source=codex
   ```

3. 用户登录 PromptPic 后创建 Codex Token。

4. 将生成的 token 配到插件环境变量：

   ```text
   PROMPTPIC_CODEX_TOKEN=ppc_codex_xxx
   ```

5. Codex 之后就可以通过 MCP 工具访问该用户授权范围内的 PromptPic 能力。

## 打开画布

在 Codex 中输入：

```text
打开 PromptPic 做画布式生图
```

插件会打开：

```text
https://promptpic.ai/zh-Hans/chat?source=codex
```

用户可以在 PromptPic 页面中操作画布；Codex 可以通过工具读取当前选区，并基于选区继续生成、改图或保存素材。

## 生图示例

可以让 Codex 调用：

```text
promptpic.create_image
```

典型参数：

```json
{
  "prompt": "生成一张赛博朋克风格的产品海报",
  "aspectRatio": "1:1",
  "modelId": "gpt-image-2",
  "insertIntoCanvas": true
}
```

实际扣费、模型路由、任务创建、R2 存储和生成状态仍由 PromptPic 后端处理。

## 本地资产

从 PromptPic 下载到 Codex 工作区的素材会保存到：

```text
promptpic-assets/YYYY-MM-DD/
```

素材索引会追加到：

```text
promptpic-assets/YYYY-MM-DD/manifest.jsonl
```

R2 仍然是 PromptPic 的云端主存储，本地文件只是为了方便 Codex 在当前项目里继续使用。

## 安全边界

插件只需要 PromptPic Codex Token。

不要把以下内容放进插件：

- 数据库连接串
- R2 Access Key / Secret
- OpenAI、Midjourney、APIMart 等 provider key
- PromptPic 用户密码
- 浏览器 Cookie
- Stripe、邮箱、后台管理密钥

PromptPic 后端只保存 token hash，不保存明文 token。用户可以在后续账号设置页撤销 Codex 授权。

## 下一阶段

- 支持 Codex 写回画布指定位置。
- 支持导出当前画布快照。
- 支持列出当前聊天/画布的生成资产。
- 支持更完整的账号授权和撤销入口。
- 支持在 Codex 插件市场中更标准地安装和配置。
