// Step 5 of the guide pipeline: read allowlisted official pages (24 h cache, 7 d stale fallback).

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { generateEmbedding } from '../../shared/ai/embeddings.client.js';
import { noUsage, searchOfficialUrls, type TokenUsage } from '../../shared/ai/claude.client.js';
import { OFFICIAL_ALLOWLIST, isAllowedHost } from './allowlist.js';
import type { Passage } from './types.js';

export type LiveDeps = {
  fetchPage(url: string, signal: AbortSignal): Promise<{ finalUrl: string; status?: number; contentType: string; body: string }>;
  searchUrls(query: string): Promise<{ urls: string[]; usage: TokenUsage }>;
  now(): Date;
};

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_PASSAGES_PER_PAGE = 20;
const STEP_MS = 5000;
const HOUR = 3600_000;
const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function htmlToText(html: string): { title: string; text: string } {
  const decode = (s: string) => s.replace(/&(amp|lt|gt|quot|apos|nbsp|#39);/g, (_, e: string) => ENTITIES[e]);
  const title = decode(/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '').replace(/\s+/g, ' ').trim();
  const text = html
    .replace(/<(script|style|nav|header|footer|title)\b[\s\S]*?<\/\1>/gi, '')
    .replace(/<\/?(p|div|li|ul|ol|br|h[1-6]|tr|table|section|article|main)\b[^>]*>/gi, '\0')
    .replace(/<[^>]*>/g, '')
    .split('\0')
    .map((para) => decode(para).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
  return { title, text: text.slice(0, 100_000) };
}

// ~800-char passages on paragraph boundaries
function split(text: string): string[] {
  const out: string[] = [];
  let cur = '';
  for (const para of text.split('\n\n')) {
    if (cur && cur.length + para.length > 800) { out.push(cur); cur = ''; }
    cur = cur ? `${cur}\n\n${para}` : para;
    // hard-cut: keeps every passage under the embedding model's input limit
    while (cur.length > 800) { out.push(cur.slice(0, 800)); cur = cur.slice(800); }
  }
  if (cur) out.push(cur);
  return out;
}

function cosine(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export const defaultDeps: LiveDeps = {
  async fetchPage(url, signal) {
    const res = await fetch(url, { redirect: 'follow', signal });
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.length;
      if (size > MAX_BYTES) { await reader.cancel(); break; }
    }
    return { finalUrl: res.url, status: res.status, contentType: res.headers.get('content-type') ?? '', body: Buffer.concat(chunks).toString('utf8') };
  },
  searchUrls: (q) => searchOfficialUrls(q, [...OFFICIAL_ALLOWLIST]),
  now: () => new Date(),
};

type Page = { url: string; title: string; content: string; fetchedAt: Date };

async function loadPage(url: string, d: LiveDeps, signal: AbortSignal): Promise<Page | null> {
  const now = d.now().getTime();
  const row = await db.liveSourceCache.findUnique({ where: { url } });
  if (row && now - row.fetchedAt.getTime() < 24 * HOUR) return row;
  try {
    const r = await d.fetchPage(url, signal);
    if (r.status !== undefined && (r.status < 200 || r.status > 299)) throw new Error(`HTTP ${r.status}`);
    if (!isAllowedHost(r.finalUrl) || !/^text\/html\b/i.test(r.contentType) || r.body.length > MAX_BYTES) return null;
    const { title, text } = htmlToText(r.body);
    const page = { url, title, content: text, fetchedAt: d.now() };
    if (!signal.aborted) await db.liveSourceCache.upsert({ where: { url }, create: page, update: page }).catch(() => {});
    return page;
  } catch (err) {
    logger.warn({ err, url }, 'guide live fetch failed');
    return row && now - row.fetchedAt.getTime() < 7 * 24 * HOUR ? row : null;
  }
}

type Spent = { searches: number; usage: TokenUsage };

async function run(query: string, candidates: Passage[], d: LiveDeps, signal: AbortSignal, spent: Spent): Promise<Passage[]> {
  let urls = [...new Set(candidates.map((c) => c.url))].filter(isAllowedHost).slice(0, 2);
  if (!urls.length) {
    // One search per call (max_uses 1), counted up front so a failed call is still costed
    spent.searches++;
    const found = await d.searchUrls(query);
    spent.usage = found.usage;
    urls = [...new Set(found.urls)].filter(isAllowedHost).slice(0, 2);
  }
  const pages = (await Promise.all(urls.map((u) => loadPage(u, d, signal)))).filter((p): p is Page => !!p);
  if (!pages.length) return [];
  const q = await generateEmbedding(query);
  // shortcut: only the first 20 passages per page are embedded, later sections are never considered; upgrade to a batched embedding call if accuracy runs show misses; embeddings already started finish after a timeout (generateEmbedding takes no signal)
  const all = (await Promise.all(pages.flatMap((p) => split(p.content).slice(0, MAX_PASSAGES_PER_PAGE).map(async (content, i): Promise<Passage> => {
    return {
      id: `live:${p.url}#${i}`, title: p.title, url: p.url, origin: 'official', content,
      similarity: cosine(q, await generateEmbedding(content)), taskKey: null, checkedAt: p.fetchedAt.toISOString(),
    };
  }))));
  return all.sort((a, b) => b.similarity - a.similarity).slice(0, 3);
}

export async function liveSources(
  query: string, candidates: Passage[], deps: LiveDeps = defaultDeps,
): Promise<{ passages: Passage[]; unavailable: boolean } & Spent> {
  const ctl = new AbortController();
  const spent: Spent = { searches: 0, usage: noUsage() };
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<Passage[]>((resolve) => { timer = setTimeout(() => { ctl.abort(); resolve([]); }, STEP_MS); });
  try {
    // a search still running at timeout is abandoned; its rejection is swallowed
    const passages = await Promise.race([run(query, candidates, deps, ctl.signal, spent).catch((err) => { logger.warn({ err }, 'guide live step failed'); return []; }), timeout]);
    // shortcut: a search still running at timeout has its tokens uncounted, upgrade if staging cost drifts from meta
    return { passages, unavailable: passages.length === 0, ...spent };
  } finally {
    clearTimeout(timer);
  }
}
