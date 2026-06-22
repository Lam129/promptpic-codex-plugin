# PromptPic Codex Plugin

PromptPic Codex Plugin lets Codex open PromptPic as a canvas-based AI image workspace and save generated image assets into the user's local project.

PromptPic is an AI image generation product with a persistent creative canvas. Use it for image generation, remixing, reference-image workflows, visual comparison, annotation, and project asset organization.

## What This Plugin Does

- Opens PromptPic in Codex with the Codex-friendly entry URL:
  `https://promptpic.ai/zh-Hans/chat?source=codex`
- Provides a Codex Skill that teaches Codex when and how to use PromptPic.
- Provides a local MCP server with tools for opening the canvas and saving image assets.
- Saves downloaded assets to:
  `promptpic-assets/YYYY-MM-DD/`
- Writes a local manifest:
  `promptpic-assets/YYYY-MM-DD/manifest.jsonl`

## What This Plugin Does Not Do Yet

- It does not include PromptPic source code.
- It does not include PromptPic database schema, private business logic, environment variables, credentials, or API keys.
- It does not link a PromptPic account to Codex yet.
- It does not call authenticated PromptPic generation APIs yet.

Users still sign in through the PromptPic website. Codex opens the PromptPic web app; PromptPic itself handles login.

## Included MCP Tools

| Tool | Purpose |
| --- | --- |
| `promptpic.open_canvas` | Returns the PromptPic Codex canvas URL. |
| `promptpic.download_asset` | Downloads a direct image URL into the local workspace. |
| `promptpic.asset_manifest` | Reads saved local asset manifest entries. |
| `promptpic.plugin_status` | Shows plugin and MCP status. |

## Installation

### Option 1: Clone This Repository

```bash
git clone https://github.com/Lam129/promptpic-codex-plugin.git
cd promptpic-codex-plugin
```

Load this folder as a local Codex plugin. The plugin manifest is:

```text
.codex-plugin/plugin.json
```

### Option 2: Download ZIP

1. Open the GitHub repository page.
2. Click **Code**.
3. Click **Download ZIP**.
4. Unzip the file.
5. Load the unzipped folder as a local Codex plugin.

## Usage

After loading the plugin, ask Codex:

```text
Use PromptPic to open a canvas image generation workspace.
```

or:

```text
打开 PromptPic 做画布式生图。
```

Codex should use `promptpic.open_canvas` and open:

```text
https://promptpic.ai/zh-Hans/chat?source=codex
```

If PromptPic asks for login, sign in with a normal PromptPic account.

## Save A Generated Image Locally

When you have a direct image URL from PromptPic, ask Codex to save it with PromptPic:

```text
Save this PromptPic image to my local workspace: <image-url>
```

The MCP tool `promptpic.download_asset` saves it under:

```text
promptpic-assets/YYYY-MM-DD/
```

and appends metadata to:

```text
promptpic-assets/YYYY-MM-DD/manifest.jsonl
```

Fallback script:

```bash
node scripts/save-asset.mjs "<image-url>"
```

## Development

Run a quick MCP smoke test:

```bash
node mcp/server.mjs
```

The server uses MCP over stdio. Codex starts it through `.mcp.json`.

## Privacy And Security

This public plugin repository intentionally contains only plugin-side code:

- No PromptPic production secrets
- No database URLs
- No API keys
- No PromptPic server source code
- No private deployment configuration
- No user data

PromptPic account linking is planned for a future version using short-lived tokens. Until then, authentication happens only in the PromptPic web app.

## Roadmap

- PromptPic account linking for Codex
- Authenticated image generation API tools
- Canvas session listing
- Canvas snapshot export
- Direct asset sync from PromptPic R2 to local workspace

## License

MIT
