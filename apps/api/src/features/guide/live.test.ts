import { afterAll, afterEach, describe, expect, it, vi } from 'vitest';
import * as embeddings from '../../shared/ai/embeddings.client.js';
import { db } from '../../shared/db.js';
import { isAllowedHost } from './allowlist.js';
import { htmlToText, liveSources, type LiveDeps } from './live.js';
import type { Passage } from './types.js';

vi.mock('../../shared/ai/embeddings.client.js', async (orig) => {
  const m = await orig<typeof import('../../shared/ai/embeddings.client.js')>();
  return { ...m, generateEmbedding: vi.fn(m.generateEmbedding) };
});

const run = Math.random().toString(36).slice(2);
const u = (n: string) => `https://www.ird.govt.nz/t8-${run}-${n}`;
const cand = (url: string): Passage => ({ id: url, title: 't', url, origin: 'guide', content: '', similarity: 0.5, taskKey: null, checkedAt: '' });
const html = (body = '<p>Your IRD number is needed to work.</p>') => `<html><head><title>IRD</title></head><body>${body}</body></html>`;
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);

const deps = (over: Partial<LiveDeps> = {}): LiveDeps & { fetchPage: ReturnType<typeof vi.fn>; searchUrls: ReturnType<typeof vi.fn> } => ({
  fetchPage: vi.fn(async (url: string) => ({ finalUrl: url, contentType: 'text/html; charset=utf-8', body: html() })),
  searchUrls: vi.fn(async () => []),
  now: () => new Date(),
  ...over,
}) as never;

afterEach(() => db.liveSourceCache.deleteMany({ where: { url: { contains: `t8-${run}` } } }));
afterAll(() => db.$disconnect());

describe('allowlist and htmlToText', () => {
  it('matches exact host and subdomains over https only', () => {
    expect(isAllowedHost('https://www.ird.govt.nz/x')).toBe(true);
    expect(isAllowedHost('https://example.com')).toBe(false);
    expect(isAllowedHost('http://www.ird.govt.nz/x')).toBe(false);
    expect(isAllowedHost('https://evilgovt.nz')).toBe(false);
    expect(isAllowedHost('not a url')).toBe(false);
  });

  it('drops chrome, decodes entities, collapses whitespace', () => {
    const r = htmlToText('<title>A &amp; B</title><nav>menu</nav><script>x()</script><p>Tom &amp;\n  Jerry</p><footer>f</footer>');
    expect(r.title).toBe('A & B');
    expect(r.text).toBe('Tom & Jerry');
  });
});

describe('liveSources', () => {
  it('fetches allowlisted candidates only', async () => {
    const d = deps();
    const r = await liveSources('ird number', [cand(u('a')), cand('https://example.com/x')], d);
    expect(d.fetchPage).toHaveBeenCalledTimes(1);
    expect(r.unavailable).toBe(false);
    expect(r.passages[0]).toMatchObject({ origin: 'official', url: u('a'), title: 'IRD' });
  });

  it('skips off-allowlist redirect, non-HTML and oversize pages', async () => {
    const mk = (o: object) => deps({ fetchPage: vi.fn(async (url: string) => ({ finalUrl: url, contentType: 'text/html', body: html(), ...o })) });
    for (const o of [{ finalUrl: 'https://evil.example/x' }, { contentType: 'application/pdf' }, { body: 'x'.repeat(3 * 1024 * 1024) }]) {
      expect(await liveSources('q', [cand(u('b'))], mk(o))).toEqual({ passages: [], unavailable: true });
    }
  });

  it('uses a fresh cache without fetching', async () => {
    await db.liveSourceCache.create({ data: { url: u('c'), title: 'Cached', content: 'Cached IRD text.', fetchedAt: hoursAgo(2) } });
    const d = deps();
    const r = await liveSources('q', [cand(u('c'))], d);
    expect(d.fetchPage).not.toHaveBeenCalled();
    expect(r.passages[0].content).toContain('Cached IRD');
  });

  it('falls back to a 3-day cache with its real date, not a 10-day one', async () => {
    const fail = { fetchPage: vi.fn(async () => { throw new Error('down'); }) };
    const old = hoursAgo(72);
    await db.liveSourceCache.create({ data: { url: u('d'), title: 'Old', content: 'Old text.', fetchedAt: old } });
    const r = await liveSources('q', [cand(u('d'))], deps(fail));
    expect(r.passages[0].checkedAt).toBe(old.toISOString());
    await db.liveSourceCache.update({ where: { url: u('d') }, data: { fetchedAt: hoursAgo(240) } });
    expect(await liveSources('q', [cand(u('d'))], deps(fail))).toEqual({ passages: [], unavailable: true });
  });

  it('searches once when there are no allowed candidates', async () => {
    const d = deps({ searchUrls: vi.fn(async () => [u('e'), 'https://example.com/x']) });
    const r = await liveSources('q', [], d);
    expect(d.searchUrls).toHaveBeenCalledTimes(1);
    expect(d.fetchPage).toHaveBeenCalledTimes(1);
    expect(r.unavailable).toBe(false);
  });

  it('returns at most 3 passages', async () => {
    const body = html(Array.from({ length: 12 }, (_, i) => `<p>${`para ${i} `.repeat(60)}</p>`).join(''));
    const r = await liveSources('q', [cand(u('f'))], deps({ fetchPage: vi.fn(async (url: string) => ({ finalUrl: url, contentType: 'text/html', body })) }));
    expect(r.passages.length).toBe(3);
  });

  it('embeds at most 20 passages per page plus the query', async () => {
    const body = html(Array.from({ length: 50 }, (_, i) => `<p>${`para ${i} `.repeat(150)}</p>`).join(''));
    vi.mocked(embeddings.generateEmbedding).mockClear();
    await liveSources('q', [cand(u('h'))], deps({ fetchPage: vi.fn(async (url: string) => ({ finalUrl: url, contentType: 'text/html', body })) }));
    expect(vi.mocked(embeddings.generateEmbedding).mock.calls.length).toBe(21);
  });

  it('gives up on a 6 s fetch within 5.5 s', async () => {
    const slow = vi.fn(() => new Promise<never>(() => {}));
    const t0 = Date.now();
    const r = await liveSources('q', [cand(u('g'))], deps({ fetchPage: slow }));
    expect(r).toEqual({ passages: [], unavailable: true });
    expect(Date.now() - t0).toBeLessThan(5500);
  }, 8000);
});
