// scoreTask(): priority + matching boosts + urgency rules − dependency penalty.
// Boosts and urgency come from the real content bundle, so these cases also prove the
// YAML carries the numbers the old persona/urgency tables had.

import { beforeAll, describe, expect, test } from 'vitest';
import { loadContent, task as contentTask } from '../../content/index.js';
import type { Profile } from '../../content/types.js';
import { scoreTask } from './scoring.js';

type Input = Parameters<typeof scoreTask>[0];

const profile = (familySituation: string): Profile => ({ visaType: 'AEWV', city: 'AUCKLAND', familySituation, occupation: 'TECHNOLOGY' });
// A content task's boosts + urgency with the priority the case needs
const def = (id: string, priority: number): Input['task'] => {
  const t = contentTask(id);
  if (!t) throw new Error(`no content task ${id}`);
  return { id, priority, boosts: t.boosts, urgency: t.urgency };
};

let baseInput: Input;

beforeAll(async () => {
  await loadContent();
  baseInput = {
    task: def('T08', 98),
    profile: profile('COUPLE_CONSTRAINED'),
    arrivalDate: new Date('2026-03-01'),
    currentDate: new Date('2026-03-03'), // Day 3
    isBlocked: false,
  };
});

describe('scoreTask()', () => {
  describe('Dependency penalty', () => {
    test('applies -50 penalty when isBlocked=true', () => {
      const result = scoreTask({ ...baseInput, isBlocked: true });
      expect(result.breakdown.dependencyPenalty).toBe(50);
      expect(result.finalPriority).toBe(98 + 20 + 0 - 50);
    });

    test('no penalty when isBlocked=false', () => {
      const result = scoreTask(baseInput);
      expect(result.breakdown.dependencyPenalty).toBe(0);
      expect(result.finalPriority).toBe(98 + 20 + 0);
    });
  });

  describe('Condition boosts (family)', () => {
    const cases: Record<string, [string, number, number][]> = {
      COUPLE_CONSTRAINED: [['T08', 98, 20], ['T09', 97, 20], ['T10', 90, 15], ['T11', 88, 10], ['T12', 85, 10], ['T16', 65, 5], ['T01', 90, 0]],
      FAMILY_WITH_CHILDREN: [['T08', 98, 15], ['T09', 97, 15], ['T10', 90, 10], ['T11', 88, 15], ['T12', 85, 20], ['T16', 65, 15], ['T01', 90, 20]],
      SOLO: [['T08', 98, 10], ['T09', 97, 10], ['T10', 90, 5], ['T11', 88, 5], ['T12', 85, 5], ['T16', 65, 5], ['T01', 90, 0]],
      COUPLE_DUAL_WORK: [['T08', 98, 18], ['T09', 97, 18], ['T10', 90, 12], ['T11', 88, 8], ['T12', 85, 8], ['T16', 65, 10], ['T01', 90, 5]],
    };
    for (const [family, rows] of Object.entries(cases)) {
      test(`${family} boosts`, () => {
        for (const [id, priority, boost] of rows) {
          const result = scoreTask({ ...baseInput, profile: profile(family), task: def(id, priority) });
          expect(result.breakdown.conditionBoost, id).toBe(boost);
        }
      });
    }

    test('a task with no boosts or urgency scores its priority only', () => {
      const bare = { id: 'T99', priority: 50, boosts: [], urgency: [] };
      for (const family of Object.keys(cases)) {
        const result = scoreTask({ ...baseInput, profile: profile(family), task: bare });
        expect(result.finalPriority).toBe(50);
      }
    });

    test('unknown familySituation matches no boost', () => {
      const result = scoreTask({ ...baseInput, profile: profile('UNKNOWN') });
      expect(result.breakdown.conditionBoost).toBe(0);
    });

    test('boosts sum when several match', () => {
      const t = { id: 'TX', priority: 10, boosts: [{ when: { family: ['SOLO'] }, by: 3 }, { when: { city: ['AUCKLAND'] }, by: 4 }], urgency: [] };
      expect(scoreTask({ ...baseInput, profile: profile('SOLO'), task: t }).breakdown.conditionBoost).toBe(7);
    });
  });

  describe('Time urgency (from urgency rules)', () => {
    test('Days 1-3 T06 SIM (+30)', () => {
      for (const d of ['2026-03-01', '2026-03-02', '2026-03-03']) {
        expect(scoreTask({ ...baseInput, task: def('T06', 98), currentDate: new Date(d) }).breakdown.timeUrgencyBonus).toBe(30);
      }
      expect(scoreTask({ ...baseInput, task: def('T06', 98), currentDate: new Date('2026-03-04') }).breakdown.timeUrgencyBonus).toBe(0);
    });

    test('Days 1-3 T07 bank (+30)', () => {
      expect(scoreTask({ ...baseInput, task: def('T07', 95), currentDate: new Date('2026-03-02') }).breakdown.timeUrgencyBonus).toBe(30);
      expect(scoreTask({ ...baseInput, task: def('T07', 95), currentDate: new Date('2026-03-04') }).breakdown.timeUrgencyBonus).toBe(0);
    });

    test('Days 4-14 T08 IRD (+25)', () => {
      for (const d of ['2026-03-04', '2026-03-14']) {
        expect(scoreTask({ ...baseInput, currentDate: new Date(d) }).breakdown.timeUrgencyBonus).toBe(25);
      }
      expect(scoreTask({ ...baseInput, currentDate: new Date('2026-03-15') }).breakdown.timeUrgencyBonus).toBe(0);
    });

    test('Month 10-11 T16 foreign licence (+30)', () => {
      for (const d of ['2026-12-01', '2027-01-01']) {
        expect(scoreTask({ ...baseInput, task: def('T16', 65), currentDate: new Date(d) }).breakdown.timeUrgencyBonus).toBe(30);
      }
      expect(scoreTask({ ...baseInput, task: def('T16', 65), currentDate: new Date('2027-02-01') }).breakdown.timeUrgencyBonus).toBe(0);
    });

    test('February-March tax tasks after the first year (+25)', () => {
      for (const id of ['T08', 'T09']) {
        for (const d of ['2027-02-15', '2027-03-15']) {
          expect(scoreTask({ ...baseInput, task: def(id, 95), currentDate: new Date(d) }).breakdown.timeUrgencyBonus).toBe(25);
        }
        expect(scoreTask({ ...baseInput, task: def(id, 95), currentDate: new Date('2027-04-15') }).breakdown.timeUrgencyBonus).toBe(0);
        // arrival year: no tax-season bonus
        expect(scoreTask({ ...baseInput, task: def(id, 95), arrivalDate: new Date('2026-01-10'), currentDate: new Date('2026-03-15') }).breakdown.timeUrgencyBonus).toBe(0);
      }
    });

    test('null arrivalDate sets urgency to 0', () => {
      const result = scoreTask({ ...baseInput, arrivalDate: null, task: def('T06', 98), currentDate: new Date('2026-03-02') });
      expect(result.breakdown.timeUrgencyBonus).toBe(0);
    });
  });

  describe('Golden examples', () => {
    const scores = (family: string, currentDate: string, rows: [string, number, boolean?][]) =>
      Object.fromEntries(rows.map(([id, priority, isBlocked = false]) => [
        id,
        scoreTask({ task: def(id, priority), profile: profile(family), arrivalDate: new Date('2026-03-01'), currentDate: new Date(currentDate), isBlocked }).finalPriority,
      ]));

    test('GOLDEN 1: constrained couple, Day 3, no completions', () => {
      expect(scores('COUPLE_CONSTRAINED', '2026-03-03', [['T06', 98], ['T07', 95], ['T08', 98], ['T03', 82]]))
        .toEqual({ T06: 128, T07: 125, T08: 118, T03: 82 });
    });

    test('GOLDEN 2: constrained couple, Day 3, T06+T07 complete', () => {
      expect(scores('COUPLE_CONSTRAINED', '2026-03-03', [['T08', 98], ['T10', 90], ['T11', 88], ['T09', 97, true]]))
        .toEqual({ T08: 118, T10: 105, T11: 98, T09: 67 });
    });

    test('GOLDEN 3: constrained couple, month 11', () => {
      expect(scores('COUPLE_CONSTRAINED', '2027-01-15', [['T16', 65]])).toEqual({ T16: 100 });
    });

    test('GOLDEN 4: solo, Day 6', () => {
      expect(scores('SOLO', '2026-03-06', [['T08', 98], ['T06', 98], ['T10', 90], ['T07', 95, true], ['T09', 97, true]]))
        .toEqual({ T08: 133, T06: 98, T10: 95, T07: 45, T09: 57 });
    });
  });

  test('breakdown adds up to finalPriority', () => {
    const r = scoreTask({ ...baseInput, isBlocked: true, currentDate: new Date('2026-03-05') });
    expect(r).toEqual({ taskId: 'T08', finalPriority: 98 + 20 + 25 - 50, breakdown: { basePriority: 98, conditionBoost: 20, timeUrgencyBonus: 25, dependencyPenalty: 50 } });
  });
});
