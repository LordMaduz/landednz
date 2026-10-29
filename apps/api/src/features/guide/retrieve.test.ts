import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../../shared/db.js';
import { buildChunks } from '../../content/chunks.js';
import { currentBundle } from '../../content/index.js';
import { matches } from '../../content/matches.js';
import { fusePassages, retrieve } from './retrieve.js';
import type { Passage } from './types.js';

const profile = { visaType: 'SKILLED_MIGRANT_RESIDENT', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL' };
afterAll(() => db.$disconnect());

const p = (id: string, similarity = 0.5): Passage => ({
  id, title: id, url: '', origin: 'guide', content: id, similarity, taskKey: null, checkedAt: '',
});

describe('retrieve', () => {
  it('keyword arm surfaces the chunk whose words match the query', async () => {
    const chunk = buildChunks(currentBundle()).find((c) => c.when === null || matches(c.when, profile))!;
    const row = await db.knowledgeBaseChunk.findUniqueOrThrow({ where: { chunkKey: chunk.chunkKey } });
    const q = row.content.replace(/[^A-Za-z ]+/g, ' ').split(/\s+/).filter((w) => w.length > 4).slice(0, 4).join(' ');
    const { candidates } = await retrieve(q, { profile, taskKey: null });
    expect(candidates.slice(0, 3).map((c) => c.id)).toContain(chunk.chunkKey);
  });

  it('floor above 1 empties passages but keeps candidates', async () => {
    const r = await retrieve('how do I get an IRD number', { profile, taskKey: null, floor: 1.01 });
    expect(r.passages).toEqual([]);
    expect(r.candidates.length).toBeGreaterThan(0);
  });

  it('task boost puts a T08 chunk in passages', async () => {
    const r = await retrieve('anything at all', { profile, taskKey: 'T08', floor: -1 });
    expect(r.passages.some((x) => x.taskKey === 'T08')).toBe(true);
    expect(r.passages.length).toBeLessThanOrEqual(6);
    expect(r.candidates.length).toBeLessThanOrEqual(10);
  });

  it('never returns chunks whose when excludes the profile', async () => {
    const allowed = new Set(buildChunks(currentBundle()).filter((c) => c.when === null || matches(c.when, profile)).map((c) => c.chunkKey));
    const r = await retrieve('visa partner children school', { profile, taskKey: null, floor: -1 });
    for (const c of r.candidates) expect(allowed.has(c.id)).toBe(true);
  });
});

describe('fusePassages', () => {
  it('RRF puts the shared passage first', () => {
    expect(fusePassages([[p('a'), p('b')], [p('b'), p('c')]]).map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });
});
