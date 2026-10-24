import { cpSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildBundle, type Bundle } from './build.js';

const FIXTURE = resolve(import.meta.dirname, '__fixtures__/valid');
const opts = { now: new Date('2026-10-24T00:00:00Z'), allowUnverified: false };

function copy(): string {
  const dir = mkdtempSync(join(tmpdir(), 'content-'));
  cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}
function edit(dir: string, file: string, from: string, to: string) {
  const p = join(dir, file);
  writeFileSync(p, readFileSync(p, 'utf8').replace(from, to));
}
function build(dir = FIXTURE): Bundle {
  const r = buildBundle(dir, opts);
  if ('errors' in r) throw new Error(JSON.stringify(r.errors));
  return r.bundle;
}

describe('buildBundle', () => {
  test('valid fixture builds', () => {
    const b = build();
    expect(b.tasks.map((t) => t.id)).toEqual(['T01', 'T02']);
    expect(Object.keys(b.sources)).toContain('ird-apply');
    expect(b.dimensions.city?.values[0]).toEqual(['AUCKLAND', 'Auckland']);
    expect(b.builtAt).toBe('2026-10-24T00:00:00.000Z');
    expect(b.version).toMatch(/^[0-9a-f]{12}$/);
  });

  test('substitutes facts and records their ids', () => {
    const t1 = build().tasks[0]!;
    expect(t1.why[0]!.text).toBe('Without an IRD number your employer deducts tax at 45%.');
    expect(t1.why[0]!.factIds).toEqual(['ird.non-declaration-rate']);
    expect(t1.steps[0]!.factIds).toEqual([]);
  });

  test('checkedAt is the oldest date across items and their facts', () => {
    const [t1, t2] = build().tasks;
    expect(t1!.checkedAt).toBe('2026-09-01'); // from the fact
    expect(t2!.checkedAt).toBe('2026-08-15'); // from an item
  });

  test('version is stable for the same input and changes with one character', () => {
    expect(build().version).toBe(build().version);
    const dir = copy();
    edit(dir, 'tasks/T02.yaml', 'bank of your choice.', 'bank of your choice!');
    expect(build(dir).version).not.toBe(build().version);
  });

  test('collects all errors rather than stopping at the first', () => {
    const dir = copy();
    edit(dir, 'tasks/T01.yaml', 'form IR595', 'Priya');
    edit(dir, 'tasks/T02.yaml', 'task: T01', 'task: T99');
    edit(dir, 'facts/core.yaml', 'source: bank-fees', 'source: nope');
    const r = buildBundle(dir, opts);
    expect('errors' in r && r.errors.map((e) => `${e.file}:${e.rule}`).sort()).toEqual([
      'facts/core.yaml:missing-source',
      'tasks/T01.yaml:denylist',
      'tasks/T02.yaml:missing-dependency',
    ]);
  });

  test('reports schema errors per file', () => {
    const dir = copy();
    edit(dir, 'tasks/T01.yaml', 'phase: 2', 'phase: 9');
    const r = buildBundle(dir, opts);
    expect('errors' in r && r.errors.map((e) => `${e.file}:${e.rule}`)).toContain('tasks/T01.yaml:schema');
  });
});
