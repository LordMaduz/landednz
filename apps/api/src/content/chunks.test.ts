import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildBundle, type Bundle } from './build.js';
import { buildChunks } from './chunks.js';

const r = buildBundle(resolve(import.meta.dirname, '__fixtures__/valid'), { now: new Date('2026-10-24T00:00:00Z'), allowUnverified: false });
if ('errors' in r) throw new Error(JSON.stringify(r.errors));
const base = r.bundle;

// T01 has one general step and a conditional one; add a family-only mistake for a second condition.
const t01 = base.tasks[0]!;
const family = { family: ['FAMILY_WITH_CHILDREN'] };
const bundle: Bundle = {
  ...base,
  tasks: [{ ...t01, mistakes: [{ ...t01.steps[0]!, id: 'T01.mistake.family', text: 'Forgetting the children.', when: family }] }],
};

describe('buildChunks', () => {
  test('one general chunk plus one per distinct condition', () => {
    const chunks = buildChunks(bundle);
    expect(chunks.map((c) => c.chunkKey)).toEqual([
      'CHUNK_T01_general',
      expect.stringMatching(/^CHUNK_T01_[0-9a-f]{8}$/),
      expect.stringMatching(/^CHUNK_T01_[0-9a-f]{8}$/),
    ]);
    const [general, children, fam] = chunks;
    expect(general!.when).toBeNull();
    expect(general!.itemIds).toEqual(['T01.why.tax-rate', 'T01.step.apply-online']);
    expect(children!.itemIds).toEqual(['T01.step.children']);
    expect(fam).toMatchObject({ taskId: 'T01', when: family, itemIds: ['T01.mistake.family'] });
  });

  test('content has the task name, section headings, item texts and cited sources', () => {
    const [general] = buildChunks(bundle);
    expect(general!.content).toContain('Get your IRD number');
    expect(general!.content).toContain('Steps:');
    expect(general!.content).toContain('Apply online with form IR595');
    expect(general!.content).toContain('Sources:');
    expect(general!.content).toContain(base.sources['ird-apply']!.url);
    expect(general!.content).toContain(base.sources['ird-tax-codes']!.url);
    expect(general!.sourceIds).toEqual(['ird-tax-codes', 'ird-apply']);
  });

  test('hashes are stable and follow the content', () => {
    const a = buildChunks(bundle);
    expect(buildChunks(bundle)).toEqual(a);
    expect(a[0]!.contentHash).toMatch(/^[0-9a-f]{64}$/);
    const edited = { ...bundle, tasks: [{ ...bundle.tasks[0]!, steps: [{ ...t01.steps[0]!, text: 'Changed.' }, t01.steps[1]!] }] };
    const b = buildChunks(edited);
    expect(b[0]!.contentHash).not.toBe(a[0]!.contentHash);
    expect(b.slice(1)).toEqual(a.slice(1));
  });

  test('retired tasks have no chunks', () => {
    expect(buildChunks({ ...bundle, tasks: [{ ...bundle.tasks[0]!, retired: true }] })).toEqual([]);
  });
});
