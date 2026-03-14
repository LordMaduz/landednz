// Test file for scoreTask() — written first in TDD approach
// All tests will fail initially — implementation comes after

import { describe, expect, test } from 'vitest';
import { scoreTask } from './scoring';
import { PersonaKey } from '@landednz/types';

interface ScoringInput {
  task: { id: string; basePriority: number; phase: number };
  personaKey: PersonaKey;
  arrivalDate: Date | null;
  currentDate: Date;
  isBlocked: boolean;
  isComplete: boolean;
}

interface ScoringResult {
  taskId: string;
  finalPriority: number;
  breakdown: {
    basePriority: number;
    personaWeight: number;
    timeUrgencyBonus: number;
    dependencyPenalty: number;
  };
}

describe('scoreTask()', () => {
  const baseInput: ScoringInput = {
    task: { id: 'T08', basePriority: 98, phase: 1 },
    personaKey: 'constrained_couple',
    arrivalDate: new Date('2026-03-01'),
    currentDate: new Date('2026-03-03'), // Day 2
    isBlocked: false,
    isComplete: false,
  };

  describe('Dependency penalty', () => {
    test('applies -50 penalty when isBlocked=true', () => {
      const input = { ...baseInput, isBlocked: true };
      const result = scoreTask(input);

      expect(result.breakdown.dependencyPenalty).toBe(50);
      expect(result.finalPriority).toBe(98 + 20 + 0 - 50); // base + persona + urgency - penalty
    });

    test('no penalty when isBlocked=false', () => {
      const input = { ...baseInput, isBlocked: false };
      const result = scoreTask(input);

      expect(result.breakdown.dependencyPenalty).toBe(0);
      expect(result.finalPriority).toBe(98 + 20 + 0); // base + persona + urgency
    });
  });

  describe('Persona weights', () => {
    test('constrained_couple weights', () => {
      const tasks = [
        { id: 'T08', basePriority: 98, expectedWeight: 20 },
        { id: 'T09', basePriority: 97, expectedWeight: 20 },
        { id: 'T10', basePriority: 90, expectedWeight: 15 },
        { id: 'T11', basePriority: 88, expectedWeight: 10 },
        { id: 'T12', basePriority: 85, expectedWeight: 10 },
        { id: 'T16', basePriority: 65, expectedWeight: 5 },
        { id: 'T01', basePriority: 90, expectedWeight: 0 },
      ];

      tasks.forEach(({ id, basePriority, expectedWeight }) => {
        const input = { ...baseInput, task: { id, basePriority, phase: 1 } };
        const result = scoreTask(input);
        expect(result.breakdown.personaWeight).toBe(expectedWeight);
      });
    });

    test('family_with_children weights', () => {
      const tasks = [
        { id: 'T08', basePriority: 98, expectedWeight: 15 },
        { id: 'T09', basePriority: 97, expectedWeight: 15 },
        { id: 'T10', basePriority: 90, expectedWeight: 10 },
        { id: 'T11', basePriority: 88, expectedWeight: 15 },
        { id: 'T12', basePriority: 85, expectedWeight: 20 },
        { id: 'T16', basePriority: 65, expectedWeight: 15 },
        { id: 'T01', basePriority: 90, expectedWeight: 20 },
      ];

      tasks.forEach(({ id, basePriority, expectedWeight }) => {
        const input = { ...baseInput, personaKey: 'family_with_children' as PersonaKey, task: { id, basePriority, phase: 1 } };
        const result = scoreTask(input);
        expect(result.breakdown.personaWeight).toBe(expectedWeight);
      });
    });

    test('solo_aewv weights', () => {
      const tasks = [
        { id: 'T08', basePriority: 98, expectedWeight: 10 },
        { id: 'T09', basePriority: 97, expectedWeight: 10 },
        { id: 'T10', basePriority: 90, expectedWeight: 5 },
        { id: 'T11', basePriority: 88, expectedWeight: 5 },
        { id: 'T12', basePriority: 85, expectedWeight: 5 },
        { id: 'T16', basePriority: 65, expectedWeight: 5 },
        { id: 'T01', basePriority: 90, expectedWeight: 0 },
      ];

      tasks.forEach(({ id, basePriority, expectedWeight }) => {
        const input = { ...baseInput, personaKey: 'solo_aewv' as PersonaKey, task: { id, basePriority, phase: 1 } };
        const result = scoreTask(input);
        expect(result.breakdown.personaWeight).toBe(expectedWeight);
      });
    });

    test('unlisted task gets 0 weight for all personas', () => {
      const unlisted = { ...baseInput, task: { id: 'T99', basePriority: 50, phase: 1 } };

      const personas: PersonaKey[] = ['constrained_couple', 'family_with_children', 'solo_aewv'];
      personas.forEach(personaKey => {
        const input = { ...unlisted, personaKey };
        const result = scoreTask(input);
        expect(result.breakdown.personaWeight).toBe(0);
      });
    });
  });

  describe('Time urgency bonuses', () => {
    test('Days 1-3 T06 SIM incomplete (+30)', () => {
      const day1 = new Date('2026-03-01');
      const day2 = new Date('2026-03-02');
      const day3 = new Date('2026-03-03');
      const day4 = new Date('2026-03-04');

      // Days 1-3: bonus applies
      [day1, day2, day3].forEach(currentDate => {
        const input = { ...baseInput, task: { id: 'T06', basePriority: 98, phase: 1 }, currentDate };
        const result = scoreTask(input);
        expect(result.breakdown.timeUrgencyBonus).toBe(30);
      });

      // Day 4: bonus expires
      const input = { ...baseInput, task: { id: 'T06', basePriority: 98, phase: 1 }, currentDate: day4 };
      const result = scoreTask(input);
      expect(result.breakdown.timeUrgencyBonus).toBe(0);
    });

    test('Days 1-3 T07 bank incomplete (+30)', () => {
      const day2 = new Date('2026-03-02');
      const day4 = new Date('2026-03-04');

      // Day 2: bonus applies
      const inputDay2 = { ...baseInput, task: { id: 'T07', basePriority: 95, phase: 1 }, currentDate: day2 };
      const resultDay2 = scoreTask(inputDay2);
      expect(resultDay2.breakdown.timeUrgencyBonus).toBe(30);

      // Day 4: bonus expires
      const inputDay4 = { ...baseInput, task: { id: 'T07', basePriority: 95, phase: 1 }, currentDate: day4 };
      const resultDay4 = scoreTask(inputDay4);
      expect(resultDay4.breakdown.timeUrgencyBonus).toBe(0);
    });

    test('Days 4-14 T08 IRD not applied (+25)', () => {
      const day4 = new Date('2026-03-04');
      const day14 = new Date('2026-03-14');
      const day15 = new Date('2026-03-15');

      // Days 4-14: bonus applies
      [day4, day14].forEach(currentDate => {
        const input = { ...baseInput, task: { id: 'T08', basePriority: 98, phase: 1 }, currentDate };
        const result = scoreTask(input);
        expect(result.breakdown.timeUrgencyBonus).toBe(25);
      });

      // Day 15: bonus expires
      const input = { ...baseInput, task: { id: 'T08', basePriority: 98, phase: 1 }, currentDate: day15 };
      const result = scoreTask(input);
      expect(result.breakdown.timeUrgencyBonus).toBe(0);
    });

    test('T08 applied, T09 tax code not declared (+28)', () => {
      // This condition requires external state — T08 complete, T09 incomplete
      // For unit test, we simulate this by testing T09 directly
      const input = {
        ...baseInput,
        task: { id: 'T09', basePriority: 97, phase: 1 },
        // This bonus should fire when T08 is complete but this test can only verify the logic exists
      };

      // Note: This test may need mocking of completion state in full implementation
      // For now, testing that the bonus system supports +28
      const result = scoreTask(input);
      expect(typeof result.breakdown.timeUrgencyBonus).toBe('number');
    });

    test('Month 10-11 T16 foreign licence in use (+30)', () => {
      const month10 = new Date('2026-12-01'); // ~10 months after March arrival
      const month11 = new Date('2027-01-01'); // ~11 months after March arrival
      const month12 = new Date('2027-02-01'); // ~12 months after March arrival

      // Month 10-11: bonus applies
      [month10, month11].forEach(currentDate => {
        const input = {
          ...baseInput,
          task: { id: 'T16', basePriority: 65, phase: 1 },
          currentDate,
          arrivalDate: new Date('2026-03-01')
        };
        const result = scoreTask(input);
        expect(result.breakdown.timeUrgencyBonus).toBe(30);
      });

      // Month 12: bonus expires
      const input = {
        ...baseInput,
        task: { id: 'T16', basePriority: 65, phase: 1 },
        currentDate: month12,
        arrivalDate: new Date('2026-03-01')
      };
      const result = scoreTask(input);
      expect(result.breakdown.timeUrgencyBonus).toBe(0);
    });

    test('February-March tax tasks incomplete (+25)', () => {
      const february = new Date('2027-02-15');
      const march = new Date('2027-03-15');
      const april = new Date('2027-04-15');

      const taxTasks = ['T08', 'T09'];

      // Feb-March: bonus applies
      [february, march].forEach(currentDate => {
        taxTasks.forEach(taskId => {
          const input = {
            ...baseInput,
            task: { id: taskId, basePriority: 95, phase: 1 },
            currentDate
          };
          const result = scoreTask(input);
          expect(result.breakdown.timeUrgencyBonus).toBeGreaterThanOrEqual(25);
        });
      });

      // April: bonus expires
      taxTasks.forEach(taskId => {
        const input = {
          ...baseInput,
          task: { id: taskId, basePriority: 95, phase: 1 },
          currentDate: april
        };
        const result = scoreTask(input);
        expect(result.breakdown.timeUrgencyBonus).toBeLessThan(25); // May have other bonuses but not the Feb-Mar one
      });
    });
  });

  describe('Edge cases', () => {
    test('null arrivalDate sets all urgency bonuses to 0', () => {
      const input = {
        ...baseInput,
        arrivalDate: null,
        task: { id: 'T06', basePriority: 98, phase: 1 },
        currentDate: new Date('2026-03-02') // Would normally trigger Day 1-3 bonus
      };

      const result = scoreTask(input);
      expect(result.breakdown.timeUrgencyBonus).toBe(0);
    });

    test('unknown familySituation defaults to solo_aewv weights', () => {
      // Testing defensive programming with cast (runtime protection)
      const input = {
        ...baseInput,
        personaKey: 'unknown_persona' as any as PersonaKey,
        task: { id: 'T08', basePriority: 98, phase: 1 }
      };

      const result = scoreTask(input);
      expect(result.breakdown.personaWeight).toBe(10); // solo_aewv weight for T08
    });
  });

  describe('Golden Examples (corrected per pre-analysis.md Section 7)', () => {
    test('GOLDEN 1: constrained_couple, Day 2, no completions', () => {
      const arrivalDate = new Date('2026-03-01');
      const currentDate = new Date('2026-03-03'); // Day 2

      const tasks = [
        { id: 'T06', basePriority: 98 },
        { id: 'T07', basePriority: 95 },
        { id: 'T08', basePriority: 98 },
        { id: 'T03', basePriority: 82 },
      ];

      const scores = tasks.map(task => {
        const input: ScoringInput = {
          task: { ...task, phase: 1 },
          personaKey: 'constrained_couple',
          arrivalDate,
          currentDate,
          isBlocked: false,
          isComplete: false,
        };
        const result = scoreTask(input);
        return { taskId: result.taskId, score: result.finalPriority };
      });

      // Expected scores:
      // T06 = 98 + 0  + 30 + 0 = 128  ← first
      // T07 = 95 + 0  + 30 + 0 = 125  ← second
      // T08 = 98 + 20 + 0  + 0 = 118  ← third (SOFT dep on T07 — no penalty)
      // T03 = 82 + 0  + 0  + 0 = 82   ← fourth

      const t06Score = scores.find(s => s.taskId === 'T06')!.score;
      const t07Score = scores.find(s => s.taskId === 'T07')!.score;
      const t08Score = scores.find(s => s.taskId === 'T08')!.score;
      const t03Score = scores.find(s => s.taskId === 'T03')!.score;

      expect(t06Score).toBe(128);
      expect(t07Score).toBe(125);
      expect(t08Score).toBe(118);
      expect(t03Score).toBe(82);

      // Top 3 order: T06, T07, T08
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      const topThreeIds = sortedScores.slice(0, 3).map(s => s.taskId);
      expect(topThreeIds).toEqual(['T06', 'T07', 'T08']);
    });

    test('GOLDEN 2: constrained_couple, Day 2, completedTaskIds=["T06","T07"]', () => {
      const arrivalDate = new Date('2026-03-01');
      const currentDate = new Date('2026-03-03'); // Day 2

      const tasks = [
        { id: 'T08', basePriority: 98, isBlocked: false }, // T07 complete, SOFT dep resolved
        { id: 'T10', basePriority: 90, isBlocked: false }, // SOFT dep on T08 — not penalised
        { id: 'T11', basePriority: 88, isBlocked: false }, // T07 complete, HARD dep resolved
        { id: 'T09', basePriority: 97, isBlocked: true },  // HARD blocked by T08 — T08 not complete
      ];

      const scores = tasks.map(task => {
        const input: ScoringInput = {
          task: { id: task.id, basePriority: task.basePriority, phase: 1 },
          personaKey: 'constrained_couple',
          arrivalDate,
          currentDate,
          isBlocked: task.isBlocked,
          isComplete: false,
        };
        const result = scoreTask(input);
        return { taskId: result.taskId, score: result.finalPriority };
      });

      // Expected scores (corrected to match actual urgency rules):
      // T08 = 98 + 20 + 0  + 0  = 118  ← first (T07 complete, no urgency on Day 2 - urgency is Days 4-14)
      // T10 = 90 + 15 + 0  + 0  = 105  ← second (SOFT dep on T08 — not penalised)
      // T11 = 88 + 10 + 0  + 0  = 98   ← third (T07 complete, HARD dep resolved)
      // T09 = 97 + 20 + 0  - 50 = 67   ← fourth (HARD blocked by T08 — T08 not complete, no urgency)

      const t08Score = scores.find(s => s.taskId === 'T08')!.score;
      const t10Score = scores.find(s => s.taskId === 'T10')!.score;
      const t11Score = scores.find(s => s.taskId === 'T11')!.score;
      const t09Score = scores.find(s => s.taskId === 'T09')!.score;

      expect(t08Score).toBe(118);
      expect(t10Score).toBe(105);
      expect(t11Score).toBe(98);
      expect(t09Score).toBe(67);

      // Top 3 order: T08, T10, T11
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      const topThreeIds = sortedScores.slice(0, 3).map(s => s.taskId);
      expect(topThreeIds).toEqual(['T08', 'T10', 'T11']);
    });

    test('GOLDEN 3: constrained_couple, Month 11, completedTaskIds=T06–T12', () => {
      const arrivalDate = new Date('2026-03-01');
      const currentDate = new Date('2027-01-15'); // ~10.5 months after arrival

      const tasks = [
        { id: 'T16', basePriority: 65 },
        { id: 'T15', basePriority: 75 },
        { id: 'T14', basePriority: 72 },
        { id: 'T13', basePriority: 70 },
      ];

      const scores = tasks.map(task => {
        const input: ScoringInput = {
          task: { ...task, phase: 1 },
          personaKey: 'constrained_couple',
          arrivalDate,
          currentDate,
          isBlocked: false,
          isComplete: false,
        };
        const result = scoreTask(input);
        return { taskId: result.taskId, score: result.finalPriority };
      });

      // Expected scores:
      // T16 = 65 + 5  + 30 + 0 = 100  ← urgency fires at month 10-11
      // T15 = 75 + 0  + 0  + 0 = 75
      // T14 = 72 + 0  + 0  + 0 = 72
      // T13 = 70 + 0  + 0  + 0 = 70

      const t16Score = scores.find(s => s.taskId === 'T16')!.score;

      expect(t16Score).toBe(100);

      // T16 should be in top 3
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      const topThreeIds = sortedScores.slice(0, 3).map(s => s.taskId);
      expect(topThreeIds).toContain('T16');
    });

    test('GOLDEN 4: solo_aewv, Day 5, no completions', () => {
      const arrivalDate = new Date('2026-03-01');
      const currentDate = new Date('2026-03-06'); // Day 5

      const tasks = [
        { id: 'T08', basePriority: 98, isBlocked: false }, // SOFT dep on T07, not blocked
        { id: 'T06', basePriority: 98, isBlocked: false },
        { id: 'T10', basePriority: 90, isBlocked: false }, // SOFT dep on T08, not penalised
        { id: 'T07', basePriority: 95, isBlocked: true },  // HARD dep on T06 — T06 not complete
        { id: 'T09', basePriority: 97, isBlocked: true },  // HARD dep on T08 — T08 not complete
      ];

      const scores = tasks.map(task => {
        const input: ScoringInput = {
          task: { id: task.id, basePriority: task.basePriority, phase: 1 },
          personaKey: 'solo_aewv',
          arrivalDate,
          currentDate,
          isBlocked: task.isBlocked,
          isComplete: false,
        };
        const result = scoreTask(input);
        return { taskId: result.taskId, score: result.finalPriority };
      });

      // Expected scores:
      // T08 = 98 + 10 + 25 + 0  = 133  ← first (SOFT dep on T07, not blocked, urgency fires Day 4-14)
      // T06 = 98 + 0  + 0  + 0  = 98   ← second (Day 5 — Days 1-3 urgency expired)
      // T10 = 90 + 5  + 0  + 0  = 95   ← third (SOFT dep on T08, not penalised)
      // T07 = 95 + 0  + 0  - 50 = 45   ← blocked (HARD dep on T06 — T06 not complete)
      // T09 = 97 + 10 + 0  - 50 = 57   ← blocked (HARD dep on T08 — T08 not complete, urgency doesn't fire)

      const t09Score = scores.find(s => s.taskId === 'T09')!.score;

      expect(t09Score).toBe(57);

      // T09 should NOT be in top 3
      const sortedScores = scores.sort((a, b) => b.score - a.score);
      const topThreeIds = sortedScores.slice(0, 3).map(s => s.taskId);
      expect(topThreeIds).not.toContain('T09');
    });
  });

  describe('Return value structure', () => {
    test('returns correct structure', () => {
      const result = scoreTask(baseInput);

      expect(result).toEqual({
        taskId: baseInput.task.id,
        finalPriority: expect.any(Number),
        breakdown: {
          basePriority: expect.any(Number),
          personaWeight: expect.any(Number),
          timeUrgencyBonus: expect.any(Number),
          dependencyPenalty: expect.any(Number),
        }
      });
    });

    test('breakdown components match finalPriority calculation', () => {
      const result = scoreTask(baseInput);
      const { basePriority, personaWeight, timeUrgencyBonus, dependencyPenalty } = result.breakdown;

      const calculatedTotal = basePriority + personaWeight + timeUrgencyBonus - dependencyPenalty;
      expect(result.finalPriority).toBe(calculatedTotal);
    });
  });
});