#!/usr/bin/env node

import { mkdir, appendFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [, , url, outputRootArg] = process.argv;

if (!url) {
  console.error('Usage: node plugins/promptpic/scripts/save-asset.mjs <image-url> [output-root]');
  process.exit(1);
}

const outputRoot = outputRootArg || process.cwd();
const now = new Date();
const date = now.toISOString().slice(0, 10);
const targetDir = path.join(outputRoot, 'promptpic-assets', date);

function extensionFromUrl(value) {
  try {
    const pathname = new URL(value).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) return ext;
  } catch {
    // Keep fallback below.
  }
  return '.png';
}

function safeName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

const response = await fetch(url);
if (!response.ok) {
  throw new Error(`Failed to download asset: ${response.status} ${response.statusText}`);
}

const ext = extensionFromUrl(url);
const sourceName = safeName(new URL(url).pathname || 'promptpic');
const fileName = `${sourceName || 'promptpic'}-${now.getTime()}${ext}`;
const targetFile = path.join(targetDir, fileName);

await mkdir(targetDir, { recursive: true });
const buffer = Buffer.from(await response.arrayBuffer());
await writeFile(targetFile, buffer);

const manifestFile = path.join(targetDir, 'manifest.jsonl');
const manifestRecord = {
  source: 'promptpic',
  url,
  file: path.relative(outputRoot, targetFile),
  savedAt: now.toISOString(),
};
await appendFile(manifestFile, `${JSON.stringify(manifestRecord)}\n`, 'utf8');

console.log(targetFile);
