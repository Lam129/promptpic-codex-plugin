#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const PROTOCOL_VERSION = '2024-11-05';
const PLUGIN_VERSION = '0.1.0';
const DEFAULT_BASE_URL = 'https://promptpic.ai';
const baseUrl = (process.env.PROMPTPIC_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');

let inputBuffer = Buffer.alloc(0);

const tools = [
  {
    name: 'promptpic.open_canvas',
    description: 'Return the PromptPic Codex canvas URL for opening in the Codex browser.',
    inputSchema: {
      type: 'object',
      properties: {
        locale: {
          type: 'string',
          description: 'PromptPic locale path segment.',
          enum: ['zh-Hans', 'zh-Hant', 'en'],
          default: 'zh-Hans',
        },
        path: {
          type: 'string',
          description: 'PromptPic path to open.',
          default: '/chat',
        },
      },
    },
  },
  {
    name: 'promptpic.download_asset',
    description: 'Download a direct PromptPic image URL into promptpic-assets/YYYY-MM-DD and append manifest.jsonl.',
    inputSchema: {
      type: 'object',
      required: ['url'],
      properties: {
        url: {
          type: 'string',
          description: 'Direct image URL to download.',
        },
        workspacePath: {
          type: 'string',
          description: 'Workspace root for promptpic-assets. Defaults to the MCP server current working directory.',
        },
        prompt: {
          type: 'string',
          description: 'Optional source prompt to record in the manifest.',
        },
        jobId: {
          type: 'string',
          description: 'Optional PromptPic job id for stable file naming.',
        },
      },
    },
  },
  {
    name: 'promptpic.asset_manifest',
    description: 'Read local PromptPic asset manifest entries from promptpic-assets.',
    inputSchema: {
      type: 'object',
      properties: {
        workspacePath: {
          type: 'string',
          description: 'Workspace root containing promptpic-assets.',
        },
        date: {
          type: 'string',
          description: 'Date folder in YYYY-MM-DD format. Defaults to today.',
        },
      },
    },
  },
  {
    name: 'promptpic.plugin_status',
    description: 'Return PromptPic plugin and MCP capability status.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function textContent(text) {
  return { content: [{ type: 'text', text }] };
}

function jsonContent(value) {
  return textContent(JSON.stringify(value, null, 2));
}

function safeSegment(value, fallback = 'promptpic') {
  const cleaned = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return cleaned || fallback;
}

function extensionFromUrl(value, contentType) {
  try {
    const ext = path.extname(new URL(value).pathname).toLowerCase();
    if (['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext)) return ext;
  } catch {
    // Use content type fallback below.
  }
  if (contentType?.includes('jpeg')) return '.jpg';
  if (contentType?.includes('webp')) return '.webp';
  if (contentType?.includes('gif')) return '.gif';
  return '.png';
}

function workspaceRoot(input = {}) {
  return path.resolve(input.workspacePath || process.env.PROMPTPIC_WORKSPACE_DIR || process.cwd());
}

async function openCanvas(input = {}) {
  const locale = typeof input.locale === 'string' ? input.locale : 'zh-Hans';
  const rawPath = typeof input.path === 'string' ? input.path : '/chat';
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  const url = new URL(`${baseUrl}/${locale}${cleanPath}`);
  url.searchParams.set('source', 'codex');
  return jsonContent({ url: url.toString(), instructions: 'Open this URL in the Codex browser.' });
}

async function downloadAsset(input = {}) {
  if (typeof input.url !== 'string' || input.url.length === 0) {
    throw new Error('promptpic.download_asset requires url');
  }

  const root = workspaceRoot(input);
  const date = today();
  const targetDir = path.join(root, 'promptpic-assets', date);
  await mkdir(targetDir, { recursive: true });

  const response = await fetch(input.url);
  if (!response.ok) {
    throw new Error(`Failed to download asset: ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const ext = extensionFromUrl(input.url, contentType);
  const nameBase = input.jobId ? `promptpic-${safeSegment(input.jobId)}` : safeSegment(new URL(input.url).pathname);
  const fileName = `${nameBase}-${Date.now()}${ext}`;
  const targetFile = path.join(targetDir, fileName);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(targetFile, buffer);

  const record = {
    source: 'promptpic',
    url: input.url,
    file: path.relative(root, targetFile),
    savedAt: new Date().toISOString(),
    ...(typeof input.prompt === 'string' && input.prompt.length > 0 ? { prompt: input.prompt } : {}),
    ...(typeof input.jobId === 'string' && input.jobId.length > 0 ? { jobId: input.jobId } : {}),
  };
  const manifestFile = path.join(targetDir, 'manifest.jsonl');
  await appendFile(manifestFile, `${JSON.stringify(record)}\n`, 'utf8');

  return jsonContent({ file: targetFile, manifest: manifestFile, record });
}

async function assetManifest(input = {}) {
  const root = workspaceRoot(input);
  const date = typeof input.date === 'string' && input.date.length > 0 ? input.date : today();
  const manifestFile = path.join(root, 'promptpic-assets', date, 'manifest.jsonl');
  try {
    const text = await readFile(manifestFile, 'utf8');
    const entries = text
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    return jsonContent({ manifest: manifestFile, entries });
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return jsonContent({ manifest: manifestFile, entries: [] });
    }
    throw error;
  }
}

async function pluginStatus() {
  return jsonContent({
    name: 'promptpic',
    version: PLUGIN_VERSION,
    baseUrl,
    tools: tools.map((tool) => tool.name),
    auth: {
      mode: 'web-session',
      accountLinking: 'planned',
    },
  });
}

async function callTool(name, input) {
  switch (name) {
    case 'promptpic.open_canvas':
      return openCanvas(input);
    case 'promptpic.download_asset':
      return downloadAsset(input);
    case 'promptpic.asset_manifest':
      return assetManifest(input);
    case 'promptpic.plugin_status':
      return pluginStatus(input);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function makeResponse(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function makeError(id, error) {
  return {
    jsonrpc: '2.0',
    id,
    error: {
      code: -32000,
      message: error instanceof Error ? error.message : String(error),
    },
  };
}

function send(message) {
  const body = Buffer.from(JSON.stringify(message), 'utf8');
  process.stdout.write(`Content-Length: ${body.length}\r\n\r\n`);
  process.stdout.write(body);
}

async function handleMessage(message) {
  if (!message || typeof message !== 'object') return;
  const { id, method, params } = message;
  if (id === undefined || id === null) return;

  try {
    if (method === 'initialize') {
      send(makeResponse(id, {
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: { name: 'promptpic', version: PLUGIN_VERSION },
        capabilities: { tools: {} },
      }));
      return;
    }

    if (method === 'tools/list') {
      send(makeResponse(id, { tools }));
      return;
    }

    if (method === 'tools/call') {
      const name = params?.name;
      const input = params?.arguments ?? {};
      const result = await callTool(name, input);
      send(makeResponse(id, result));
      return;
    }

    send(makeError(id, new Error(`Unsupported method: ${method}`)));
  } catch (error) {
    send(makeError(id, error));
  }
}

function parseMessages() {
  while (true) {
    const headerEnd = inputBuffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) return;

    const header = inputBuffer.slice(0, headerEnd).toString('utf8');
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      inputBuffer = Buffer.alloc(0);
      return;
    }

    const length = Number(match[1]);
    const bodyStart = headerEnd + 4;
    const bodyEnd = bodyStart + length;
    if (inputBuffer.length < bodyEnd) return;

    const body = inputBuffer.slice(bodyStart, bodyEnd).toString('utf8');
    inputBuffer = inputBuffer.slice(bodyEnd);
    void handleMessage(JSON.parse(body));
  }
}

process.stdin.on('data', (chunk) => {
  inputBuffer = Buffer.concat([inputBuffer, chunk]);
  parseMessages();
});

process.stdin.resume();
