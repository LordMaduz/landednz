import { existsSync, readFileSync } from 'node:fs';
import { beforeAll, describe, expect, test } from 'vitest';
import { applicableTasks, itemsFor, loadContent, FileContentSource } from './index.js';
import { matches } from './matches.js';
import type { Bundle } from './build.js';
import type { Profile } from './types.js';

const path = new FileContentSource().path;
const populated = existsSync(path) && (JSON.parse(readFileSync(path, 'utf8')) as Bundle).tasks.length > 0;
if (!populated) console.warn('bundle.test.ts skipped: apps/api/content-bundle.json has no tasks yet (content arrives in Task 4)');

describe.skipIf(!populated)('real content bundle', () => {
  let bundle: Bundle;
  let profiles: Profile[];
  beforeAll(async () => {
    bundle = await loadContent();
    const v = (k: keyof Bundle['dimensions']) => bundle.dimensions[k]!.values.map(([x]) => x);
    profiles = v('visa').flatMap((visaType) =>
      v('city').flatMap((city) =>
        v('family').flatMap((familySituation) => v('occupation').map((occupation) => ({ visaType, city, familySituation, occupation }))),
      ),
    );
  });

  test('every profile has applicable tasks and no hard dependency is left non-applicable', () => {
    for (const p of profiles) {
      const applicable = applicableTasks(p);
      expect(applicable, JSON.stringify(p)).not.toHaveLength(0);
      const ids = new Set(applicable.map((t) => t.id));
      for (const t of applicable)
        for (const d of t.dependsOn.filter((d) => d.type === 'hard'))
          expect(ids.has(d.task), `${t.id} hard-depends on ${d.task} for ${JSON.stringify(p)}`).toBe(true);
    }
  });

  // Legacy tasks without a why item and a step for every answer combination. Each content task removes its id;
  // a listed task that now passes fails the test, so the list only shrinks.
  const KNOWN_GAPS: string[] = [];
  test('every applicable task has a why item and a step for every answer combination', () => {
    const failing = new Set<string>();
    for (const t of bundle.tasks.filter((t) => !t.retired))
      for (const p of profiles.filter((p) => matches(t.appliesTo, p))) {
        const i = itemsFor(t, p);
        if (!i.why || i.steps.length === 0) failing.add(t.id);
      }
    expect([...failing].sort()).toEqual([...KNOWN_GAPS].sort());
  });

  test('no item text contains {{ and every item source exists', () => {
    for (const t of bundle.tasks)
      for (const i of [...t.why, ...t.steps, ...t.documents, ...t.mistakes, ...t.watchOuts, ...(t.cost ? [t.cost] : []), ...(t.advice ? [t.advice] : [])]) {
        expect(i.text, i.id).not.toContain('{{');
        expect(bundle.sources[i.source], i.id).toBeDefined();
      }
  });
});
