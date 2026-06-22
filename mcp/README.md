# PromptPic MCP Server

This directory contains the PromptPic MCP server used by the Codex plugin.

The current server is intentionally local-first and does not require PromptPic account linking. It can open the PromptPic web canvas and save direct image URLs into the current workspace.

## Available Tools

| Tool | Purpose |
| --- | --- |
| `promptpic.open_canvas` | Open PromptPic canvas in Codex with `source=codex`. |
| `promptpic.download_asset` | Download an asset to `promptpic-assets/`. |
| `promptpic.asset_manifest` | Read local saved asset manifest entries. |
| `promptpic.plugin_status` | Show plugin status and configured tools. |

## Planned Authenticated Tools

| Tool | Purpose |
| --- | --- |
| `promptpic.create_image` | Submit an image generation request through PromptPic APIs. |
| `promptpic.list_assets` | List assets for a PromptPic chat/canvas session. |
| `promptpic.save_canvas_snapshot` | Persist or export a canvas snapshot. |
| `promptpic.export_canvas` | Export canvas data or a visual preview. |

## Design Notes

- Authentication should not require exposing user cookies to Codex.
- Prefer a short-lived PromptPic token or OAuth-style handoff for API access.
- Local downloads should write inside the current workspace only.
- R2 remains the canonical cloud asset store; local files are a Codex convenience copy.
