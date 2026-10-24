// Runs against the local Supabase DB. Swaps in fixture bundles, so it restores the real
// bundle's chunks afterwards for the rest of the suite.
import { resolve } from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../src/shared/ai/embeddings.client.js', async () => {
  const { mockEmbedding } = await import('../src/shared/ai/mock.js');
  return { generateEmbedding: vi.fn(async (text: string) => mockEmbedding(text)) };
});

import { db } from '../src/shared/db.js';
import { config } from '../src/shared/config.js';
import { generateEmbedding } from '../src/shared/ai/embeddings.client.js';
import { buildBundle, type Bundle } from '../src/content/build.js';
import { buildChunks } from '../src/content/chunks.js';
import { loadContent, useContent } from '../src/content/index.js';
import { syncChunks } from './sync-chunks.js';

const embed = vi.mocked(generateEmbedding);
const r = buildBundle(resolve(import.meta.dirname, '../src/content/__fixtures__/valid'), { now: new Date('2026-10-24T00:00:00Z'), allowUnverified: false });
if ('errors' in r) throw new Error(JSON.stringify(r.errors));
const fixture: Bundle = r.bundle; // T01 (general + one condition), T02 (general) → 3 chunks
const keys = buildChunks(fixture).map((c) => c.chunkKey);

const rows = () => db.knowledgeBaseChunk.findMany({ orderBy: { chunkKey: 'asc' } });

// Embeddings are mocked here, so under AI_MODE=live the file would label mock vectors 'live'
// and its restore would overwrite a live-synced DB with mock embeddings: skip it.
describe.skipIf(config.aiMode === 'live')('syncChunks', () => {
  beforeAll(() => {
    useContent(fixture);
  });

  afterAll(async () => {
    config.aiMode = 'mock';
    await loadContent();
    await syncChunks();
    await db.$disconnect();
  }, 60_000);

  it('first sync embeds every chunk, deletes chunks not in the bundle and records the release', async () => {
    await db.knowledgeBaseChunk.updateMany({ data: { contentHash: null } }); // any rows left by other runs re-embed
    const result = await syncChunks();
    expect(result.embedded).toBe(keys.length);
    expect((await rows()).map((c) => c.chunkKey)).toEqual([...keys].sort());
    expect(await db.contentRelease.findUnique({ where: { version: fixture.version } })).not.toBeNull();
    const [{ missing }] = await db.$queryRaw<Array<{ missing: bigint }>>`
      SELECT count(*) AS missing FROM "KnowledgeBaseChunk" WHERE embedding IS NULL`;
    expect(Number(missing)).toBe(0);
  });

  it('second sync embeds nothing', async () => {
    expect(await syncChunks()).toEqual({ embedded: 0, deleted: 0, unchanged: keys.length });
  });

  it('editing one item re-embeds only its chunk; a removed task loses its chunks', async () => {
    const [t01, t02] = fixture.tasks;
    useContent({ ...fixture, tasks: [{ ...t01!, steps: [{ ...t01!.steps[0]!, text: 'Edited.' }, t01!.steps[1]!] }] });
    embed.mockClear();
    expect(await syncChunks()).toEqual({ embedded: 1, deleted: 1, unchanged: 1 });
    expect(embed).toHaveBeenCalledTimes(1);
    expect(await db.knowledgeBaseChunk.count({ where: { taskId: t02!.id } })).toBe(0);
    useContent(fixture);
    await syncChunks();
  });

  it('an embedding failure leaves that chunk unhashed and the next sync retries it', async () => {
    const before = await rows();
    useContent({ ...fixture, tasks: fixture.tasks.map((t) => ({ ...t, name: `${t.name} (renamed)` })) });
    embed.mockImplementationOnce(async (text) => (await import('../src/shared/ai/mock.js')).mockEmbedding(text));
    embed.mockRejectedValueOnce(new Error('OpenAI down'));
    await expect(syncChunks()).rejects.toThrow('OpenAI down');

    const after = await rows();
    const changed = after.filter((c, i) => c.contentHash !== before[i]!.contentHash);
    expect(changed).toHaveLength(1); // only the chunk embedded before the failure
    expect((await syncChunks()).embedded).toBe(keys.length - 1);
    useContent(fixture);
    await syncChunks();
  });

  it('switching AI_MODE mock → live re-embeds every chunk', async () => {
    config.aiMode = 'live';
    expect((await syncChunks()).embedded).toBe(keys.length);
    expect((await rows()).every((c) => c.embeddingMode === 'live')).toBe(true);
    expect((await syncChunks()).embedded).toBe(0);
    config.aiMode = 'mock';
    expect((await syncChunks()).embedded).toBe(keys.length);
  });
});
