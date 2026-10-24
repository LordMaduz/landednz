import { resolve } from 'node:path';
import { beforeAll, describe, expect, test } from 'vitest';
import { buildBundle } from './build.js';
import { applicableTasks, ContentLoadError, fact, FileContentSource, itemsFor, loadContent, source, task, tasks, useContent, contentVersion } from './index.js';
import type { Profile } from './types.js';

const FIXTURE = resolve(import.meta.dirname, '__fixtures__/valid');
const profile: Profile = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY' };

beforeAll(() => {
  const r = buildBundle(FIXTURE, { now: new Date('2026-10-24T00:00:00Z'), allowUnverified: false });
  if ('errors' in r) throw new Error(JSON.stringify(r.errors));
  const retired = { ...r.bundle.tasks[1]!, id: 'T99', retired: true };
  useContent({ ...r.bundle, tasks: [...r.bundle.tasks, retired] });
});

describe('content module', () => {
  test('itemsFor returns general items plus matching conditional ones, in YAML order', () => {
    const t1 = task('T01')!;
    expect(itemsFor(t1, profile).steps.map((i) => i.id)).toEqual(['T01.step.apply-online']); // Auckland solo: conditional step off
    const wellington = { ...profile, city: 'WELLINGTON' };
    expect(itemsFor(t1, wellington).steps.map((i) => i.id)).toEqual(['T01.step.apply-online', 'T01.step.children']);
  });

  test('why is the first matching item, null when none match', () => {
    const t1 = task('T01')!;
    expect(itemsFor(t1, profile).why?.id).toBe('T01.why.tax-rate');
    const noWhy = { ...t1, why: t1.why.map((i) => ({ ...i, when: { city: ['WELLINGTON'] } })) };
    expect(itemsFor(noWhy, profile).why).toBeNull();
    expect(itemsFor(t1, profile).advice).toBeNull();
    expect(itemsFor(task('T02')!, profile).cost?.text).toContain('$');
  });

  test('retired tasks are absent from tasks() and applicableTasks() but present via task()', () => {
    expect(tasks().map((t) => t.id)).toEqual(['T01', 'T02']);
    expect(task('T99')?.retired).toBe(true);
    expect(applicableTasks(profile).map((t) => t.id)).toEqual(['T01', 'T02']);
    expect(applicableTasks({ ...profile, visaType: 'OTHER' }).map((t) => t.id)).toEqual(['T01']);
  });

  test('lookups', () => {
    expect(source('ird-apply').title).toBeTruthy();
    expect(fact('bank.account-fee').value).toContain('$');
    expect(contentVersion()).toMatch(/^[0-9a-f]{12}$/);
  });

  test('loadContent rejects a missing file and an invalid bundle with ContentLoadError', async () => {
    const missing = loadContent(new FileContentSource('/nonexistent/content-bundle.json'));
    await expect(missing).rejects.toBeInstanceOf(ContentLoadError);
    await expect(missing).rejects.toThrow(/content:build/);
    const invalid = loadContent({ load: async () => ({ version: 1 }) as never });
    await expect(invalid).rejects.toBeInstanceOf(ContentLoadError);
    await expect(invalid).rejects.toThrow(/content:build/);
  });
});
