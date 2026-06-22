---
name: promptpic
description: Open and use PromptPic from Codex for canvas-based AI image generation, reference-image iteration, and workspace asset organization. Use when the user asks to generate images with PromptPic, open PromptPic in Codex, design on a canvas, remix/reference generated images, or save PromptPic assets locally.
---

# PromptPic

PromptPic is a canvas-based AI image generation workspace. Use it when the user wants to create, remix, compare, or organize visual assets inside a persistent design canvas rather than only receiving a single generated file.

## Core Workflow

1. Clarify the visual goal only when the request is ambiguous.
2. Prefer the MCP tool `promptpic.open_canvas` to get the PromptPic Codex URL.
3. Open PromptPic in the Codex browser when the user wants interactive image generation or canvas editing:

   `https://promptpic.ai/zh-Hans/chat?source=codex`

4. Ask the user to sign in if PromptPic is not already authenticated.
5. Use PromptPic's chat panel to generate images.
6. Use the canvas as the working area for comparison, annotation, remixing, and reference-image selection.
7. When the user wants local project assets, use `promptpic.download_asset` with the current workspace path.
8. Saved assets should appear under:

   `promptpic-assets/YYYY-MM-DD/`

9. Maintain a lightweight manifest when possible:

   `promptpic-assets/YYYY-MM-DD/manifest.jsonl`

## When To Open PromptPic

Open PromptPic when the user says things like:

- "用 PromptPic 生成"
- "打开 PromptPic"
- "做一版画布设计"
- "把这张作为参考图"
- "重绘 / remix / variation"
- "生成图片并保存到本地项目"

If the request is only asking for a static explanation or code change, do not open PromptPic unless the user explicitly asks.

## PromptPic Canvas Conventions

- Treat the canvas as the source of visual iteration, not as a passive gallery.
- Generated images should stay visible in the canvas.
- Use "作为参考图" for passing an existing image into the next prompt.
- Use "重绘" / "Remix" when the user wants a new image derived from the selected image.
- Keep the user's visual intent in the prompt, but avoid over-specifying irrelevant style details.

## Local Asset Convention

When the user asks to keep generated images locally:

- Create `promptpic-assets/` at the workspace root if it does not exist.
- Use a date folder: `promptpic-assets/YYYY-MM-DD/`.
- Use stable filenames when the prompt or job id is known:
  - `promptpic-<job-id>-<index>.<ext>`
  - otherwise `promptpic-<timestamp>.<ext>`
- Keep one JSON line per saved asset in `manifest.jsonl`:

```json
{"source":"promptpic","url":"https://...","file":"promptpic-assets/2026-06-22/promptpic-example.png","savedAt":"2026-06-22T12:00:00.000Z","prompt":"..."}
```

Use the MCP tool `promptpic.download_asset` if available. Use `plugins/promptpic/scripts/save-asset.mjs` only as a fallback.

## Codex Behavior

- Prefer `promptpic.open_canvas` for constructing the PromptPic URL.
- Prefer the Browser plugin for opening the URL inside Codex.
- If browser automation is not available, provide the URL as a Markdown link.
- Do not claim that local saving is complete unless `promptpic.download_asset` or the fallback script has actually saved the file.
- If PromptPic returns a generated image in chat and the user wants it in the repository, download it into `promptpic-assets/` and update the manifest.
- Do not expose API keys or session cookies.

## MCP Tools

Available in the standard plugin v1:

- `promptpic.open_canvas`
- `promptpic.download_asset`
- `promptpic.asset_manifest`
- `promptpic.plugin_status`

Planned for an authenticated future version:

- `promptpic.create_image`
- `promptpic.list_assets`
- `promptpic.save_canvas_snapshot`
- `promptpic.export_canvas`
