// Integration tests for getRoadmap() — runs against real Docker postgres DB.
// Tests verify golden1 scenario: constrained_couple, Day 2, no completions.
// Scenario tasks must rank ["T06", "T08", "T03"] — T07 is HARD blocked by T06.
//
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import { db } from '../../shared/db.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { getRoadmap } from './roadmap.service.js';
import { AppError } from '../../shared/errors.js';
import type { RoadmapResponse } from './roadmap.types.js';

// ─── Test identifiers ─────────────────────────────────────────────────────────

const TS = Date.now();
const TEST_USER_ID = `test-user-ac206-main-${TS}`;
const TEST_USER_NO_PROFILE_ID = `test-user-ac206-noprofile-${TS}`;
const TEST_USER_NO_ENTRIES_ID = `test-user-ac206-noentries-${TS}`;

// Golden1: constrained_couple, Day 2 (arrivalDate=2026-03-13, currentDate=2026-03-14)
// daysSince = floor(1 day) + 1 = 2 → Days 1-3 urgency fires for T06/T07
// T06=128, T07=75 (HARD blocked), T08=118 (no urgency on Day 2), T03=82
const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14');

// Canonical task IDs — required so scoreTask() applies correct persona weights + urgency bonuses
const TASK_IDS = ['T06', 'T07', 'T08', 'T03'];

// ─── Setup / teardown ─────────────────────────────────────────────────────────

let golden1Response: RoadmapResponse;

beforeAll(async () => {
  // Clean up any leftover data from previous failed runs
  for (const uid of [TEST_USER_ID, TEST_USER_NO_PROFILE_ID, TEST_USER_NO_ENTRIES_ID]) {
    await db.userRoadmapEntry.deleteMany({ where: { userId: uid } });
    await db.userProfile.deleteMany({ where: { userId: uid } });
    await db.user.deleteMany({ where: { id: uid } });
  }
  await db.taskContentVariant.deleteMany({ where: { taskId: { in: TASK_IDS } } });
  await db.taskDependency.deleteMany({
    where: { OR: [{ prerequisiteId: { in: TASK_IDS } }, { dependentId: { in: TASK_IDS } }] },
  });
  await db.task.deleteMany({ where: { id: { in: TASK_IDS } } });

  // Create test users
  await db.user.createMany({
    data: [
      { id: TEST_USER_ID, email: `test-ac206-main-${TS}@example.com` },
      { id: TEST_USER_NO_PROFILE_ID, email: `test-ac206-noprofile-${TS}@example.com` },
      { id: TEST_USER_NO_ENTRIES_ID, email: `test-ac206-noentries-${TS}@example.com` },
    ],
  });

  // Create canonical test tasks — scoring function uses IDs to apply weights
  // Exact basePriority values from pre-analysis Section 1 (authoritative)
  await db.task.createMany({
    data: [
      {
        id: 'T06',
        name: 'Get a NZ SIM card',
        phase: 1,
        basePriority: 98,
        estimatedDuration: '30 minutes',
        governmentSourceUrl: 'https://example.com',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      },
      {
        id: 'T07',
        name: 'Open a NZ bank account',
        phase: 1,
        basePriority: 95,
        estimatedDuration: '1 hour',
        governmentSourceUrl: 'https://example.com',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      },
      {
        id: 'T08',
        name: 'Apply for your IRD number',
        phase: 1,
        basePriority: 98,
        estimatedDuration: '15 minutes',
        governmentSourceUrl: 'https://ird.govt.nz',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      },
      {
        id: 'T03',
        name: 'Prepare your overseas bank account',
        phase: 1,
        basePriority: 82,
        estimatedDuration: '1 hour',
        governmentSourceUrl: 'https://example.com',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      },
    ],
  });

  // HARD dep: T06 → T07 (T07 is blocked until T06 is complete)
  await db.taskDependency.create({
    data: { prerequisiteId: 'T06', dependentId: 'T07', dependencyType: 'HARD' },
  });

  // TaskContentVariant for T06 (constrained_couple) — tests consequenceLine resolution
  // T07, T08, T03 have no variants — tests graceful fallback to ''
  await db.taskContentVariant.create({
    data: {
      taskId: 'T06',
      personaKey: 'constrained_couple',
      consequenceLine: 'Without a SIM card, coordinating with your bank and IRD is difficult.',
      steps: '[]',
      documentsRequired: '[]',
      commonMistakes: '[]',
      sourceUrl: 'https://example.com',
    },
  });

  // Run createProfile() to generate UserRoadmapEntry records (golden1 scenario)
  await createProfile(
    TEST_USER_ID,
    {
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'TECHNOLOGY',
      arrivalDate: ARRIVAL_DATE,
    },
    CURRENT_DATE,
  );

  // Create a UserProfile for the no-entries user (no roadmap entries — bypasses createProfile)
  await db.userProfile.create({
    data: {
      userId: TEST_USER_NO_ENTRIES_ID,
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'SOLO',
      occupation: 'TECHNOLOGY',
      arrivalDate: new Date(ARRIVAL_DATE),
      personaKey: 'solo_aewv',
    },
  });

  // Call getRoadmap() once — shared across all golden1 scenario tests
  golden1Response = await getRoadmap(TEST_USER_ID);
});

afterAll(async () => {
  for (const uid of [TEST_USER_ID, TEST_USER_NO_PROFILE_ID, TEST_USER_NO_ENTRIES_ID]) {
    await db.userRoadmapEntry.deleteMany({ where: { userId: uid } });
    await db.userProfile.deleteMany({ where: { userId: uid } });
    await db.user.deleteMany({ where: { id: uid } });
  }
  await db.taskContentVariant.deleteMany({ where: { taskId: { in: TASK_IDS } } });
  await db.taskDependency.deleteMany({
    where: { OR: [{ prerequisiteId: { in: TASK_IDS } }, { dependentId: { in: TASK_IDS } }] },
  });
  await db.task.deleteMany({ where: { id: { in: TASK_IDS } } });
  await db.$disconnect();
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getRoadmap()', () => {

  describe('Golden1 scenario — constrained_couple, Day 2, no completions', () => {
    // The DB also holds the seeded KB tasks, so rank only this scenario's tasks.
    const scenarioRanking = () =>
      golden1Response.phases
        .flatMap(p => p.tasks)
        .filter(t => TASK_IDS.includes(t.taskId) && !t.isBlocked)
        .sort((a, b) => b.priorityScore - a.priorityScore);

    test('scenario tasks rank ["T06", "T08", "T03"] — T07 excluded (HARD blocked)', () => {
      expect(scenarioRanking().map(t => t.taskId)).toEqual(['T06', 'T08', 'T03']);
    });

    test('scenario tasks ordered by priorityScore DESC — T06(128) > T08(118) > T03(82)', () => {
      const [first, second, third] = scenarioRanking();
      expect(first.priorityScore).toBe(128);
      expect(second.priorityScore).toBe(118);
      expect(third.priorityScore).toBe(82);
      expect(first.priorityScore).toBeGreaterThan(second.priorityScore);
      expect(second.priorityScore).toBeGreaterThan(third.priorityScore);
    });

    test('T07 appears in phases with isBlocked=true, absent from topThree', () => {
      // T07 must NOT be in topThree
      const topThreeIds = golden1Response.topThree.map(t => t.taskId);
      expect(topThreeIds).not.toContain('T07');

      // T07 must be in phases with isBlocked=true
      const allPhaseTasks = golden1Response.phases.flatMap(p => p.tasks);
      const t07 = allPhaseTasks.find(t => t.taskId === 'T07');
      expect(t07).toBeDefined();
      expect(t07!.isBlocked).toBe(true);
      expect(t07!.blockingTaskNames).toContain('Get a NZ SIM card');
    });

    test('lastComputedAt is a truthy valid ISO date string', () => {
      const { lastComputedAt } = golden1Response;
      expect(lastComputedAt).toBeTruthy();
      const parsed = new Date(lastComputedAt);
      expect(parsed.toISOString()).toBe(lastComputedAt);
    });

    test('consequenceLine from variant for T06, empty string fallback for T07 (no variant)', () => {
      const allTasks = golden1Response.phases.flatMap(p => p.tasks);

      const t06 = allTasks.find(t => t.taskId === 'T06');
      expect(t06?.consequenceLine).toBe(
        'Without a SIM card, coordinating with your bank and IRD is difficult.',
      );

      const t07 = allTasks.find(t => t.taskId === 'T07');
      expect(t07?.consequenceLine).toBe('');
    });
  });

  describe('Error cases', () => {
    test('no UserProfile → throws PROFILE_NOT_FOUND AppError (404)', async () => {
      await expect(getRoadmap(TEST_USER_NO_PROFILE_ID)).rejects.toMatchObject({
        code: 'PROFILE_NOT_FOUND',
        statusCode: 404,
      });
    });

    test('no UserRoadmapEntry records → throws ROADMAP_NOT_FOUND AppError (404)', async () => {
      await expect(getRoadmap(TEST_USER_NO_ENTRIES_ID)).rejects.toMatchObject({
        code: 'ROADMAP_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
