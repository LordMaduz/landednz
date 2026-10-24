import { copyFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { buildBundle } from '../src/content/build.js';
import { DENY_RE } from '../src/content/rules.js';
import { convertKbMaster } from './convert-kb-master.js';

describe('convert-kb-master', () => {
  let dir: string;
  let report: ReturnType<typeof convertKbMaster>;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'kb-convert-'));
    // The committed dimensions.yaml is never generated
    copyFileSync(resolve(import.meta.dirname, '../content/dimensions.yaml'), join(dir, 'dimensions.yaml'));
    report = convertKbMaster(dir);
  });

  test('builds with unverified content allowed: 21 tasks, no denylisted text', () => {
    const r = buildBundle(dir, { now: new Date(), allowUnverified: true });
    if ('errors' in r) throw new Error(r.errors.map((e) => `${e.file}:${e.id} ${e.rule} ${e.message}`).join('\n'));
    expect(r.bundle.tasks).toHaveLength(21);
    const items = r.bundle.tasks.flatMap((t) => [t.name, ...[...t.why, ...t.steps, ...t.documents, ...t.mistakes, ...t.watchOuts].map((i) => i.text)]);
    expect(items.filter((t) => DENY_RE.test(t))).toEqual([]);
    expect(report.dropped).toBeGreaterThan(0);
    expect(readdirSync(join(dir, 'tasks'))).toHaveLength(21);
  });

  test('T08 boosts come from the persona weights', () => {
    const r = buildBundle(dir, { now: new Date(), allowUnverified: true });
    if ('errors' in r) throw new Error('build failed');
    const t08 = r.bundle.tasks.find((t) => t.id === 'T08')!;
    expect(Object.fromEntries(t08.boosts.map((b) => [(b.when as { family: string[] }).family[0], b.by]))).toEqual({
      COUPLE_CONSTRAINED: 20,
      FAMILY_WITH_CHILDREN: 15,
      SOLO: 10,
      COUPLE_DUAL_WORK: 18,
    });
  });

  test('every item is unverified, so a build without allowUnverified fails', () => {
    const r = buildBundle(dir, { now: new Date(), allowUnverified: false });
    expect('errors' in r && r.errors.some((e) => /unverified/.test(e.rule + e.message))).toBe(true);
  });
});
