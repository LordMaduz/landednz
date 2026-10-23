// Integration tests for createProfile() — runs against real Docker postgres DB.
// Tests call the service directly (bypassing JWT middleware).
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db.js';
import { createProfile } from './onboarding.service.js';
import { AppError } from '../../shared/errors.js';

// ─── Test fixtures ───────────────────────────────────────────────────────────

const TEST_USER_ID = `test-user-ac205-${Date.now()}`;
const TEST_USER_EMAIL = `test-ac205-${Date.now()}@example.com`;

// Two test tasks — distinct applicability
const TASK_ALL = {
  id: 'T_AC205_ALL',
  name: 'Test Task — All personas',
  phase: 1,
  basePriority: 50,
  estimatedDuration: '10 minutes',
  governmentSourceUrl: 'https://example.com',
  applicableVisaTypes: '["ALL"]',
  applicableFamilySituations: '["ALL"]',
  applicableOccupations: '["ALL"]',
};

const TASK_FAMILY_ONLY = {
  id: 'T_AC205_FAMILY',
  name: 'Test Task — Family only',
  phase: 1,
  basePriority: 40,
  estimatedDuration: '10 minutes',
  governmentSourceUrl: 'https://example.com',
  applicableVisaTypes: '["ALL"]',
  applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]',
  applicableOccupations: '["ALL"]',
};

// Fixed date: 30 days after arrival for deterministic urgency calculation
const ARRIVAL_DATE = '2026-02-12'; // 30 days before 2026-03-14
const FUTURE_ARRIVAL_DATE = '2026-06-01'; // Future — pre-arrival state

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
  // Create test user
  await db.user.create({ data: { id: TEST_USER_ID, email: TEST_USER_EMAIL } });
  // Create test tasks
  await db.task.createMany({ data: [TASK_ALL, TASK_FAMILY_ONLY] });
});

afterAll(async () => {
  // Clean up test tasks (UserRoadmapEntries cascade via afterEach)
  await db.task.deleteMany({ where: { id: { in: [TASK_ALL.id, TASK_FAMILY_ONLY.id] } } });
  // Clean up test user (cascades to profile and roadmap entries)
  await db.user.delete({ where: { id: TEST_USER_ID } });
  await db.$disconnect();
});

afterEach(async () => {
  // Remove profile and roadmap entries between tests so each test starts clean
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('createProfile()', () => {

  describe('UserProfile creation', () => {
    test('creates UserProfile with correct fields', async () => {
      const response = await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'SOLO',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      expect(response.roadmapGenerated).toBe(true);
      expect(response.personaKey).toBe('solo_aewv');
      expect(response.profileId).toBeTruthy();

      const profile = await db.userProfile.findUnique({ where: { userId: TEST_USER_ID } });
      expect(profile).not.toBeNull();
      expect(profile!.visaType).toBe('AEWV');
      expect(profile!.city).toBe('AUCKLAND');
      expect(profile!.familySituation).toBe('SOLO');
      expect(profile!.occupation).toBe('TECHNOLOGY');
      expect(profile!.personaKey).toBe('solo_aewv');
      expect(profile!.arrivalDate).toEqual(new Date(ARRIVAL_DATE));
    });

    test('COUPLE_CONSTRAINED profile → personaKey is constrained_couple', async () => {
      const response = await createProfile(TEST_USER_ID, {
        visaType: 'PARTNER_OF_STUDENT',
        city: 'WELLINGTON',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'FINANCE',
        arrivalDate: ARRIVAL_DATE,
      });

      expect(response.personaKey).toBe('constrained_couple');
    });

    test('FAMILY_WITH_CHILDREN profile → personaKey is family_with_children', async () => {
      const response = await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'FAMILY_WITH_CHILDREN',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      expect(response.personaKey).toBe('family_with_children');
    });
  });

  describe('RoadmapEntry generation — task applicability', () => {
    test('SOLO profile → only ALL-applicable task included (family task excluded)', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'SOLO',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      const entries = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });

      const entryTaskIds = entries.map(e => e.taskId);
      expect(entryTaskIds).toContain(TASK_ALL.id);
      expect(entryTaskIds).not.toContain(TASK_FAMILY_ONLY.id);
    });

    test('FAMILY_WITH_CHILDREN profile → both tasks included', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'FAMILY_WITH_CHILDREN',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      const entries = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });

      const entryTaskIds = entries.map(e => e.taskId);
      expect(entryTaskIds).toContain(TASK_ALL.id);
      expect(entryTaskIds).toContain(TASK_FAMILY_ONLY.id);
    });

    test('entries created with correct initial status', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'SOLO',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      const entries = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });

      for (const entry of entries) {
        expect(entry.status).toBe('NOT_STARTED');
        expect(entry.completedAt).toBeNull();
        expect(typeof entry.priorityScore).toBe('number');
      }
    });
  });

  describe('Future arrivalDate — pre-arrival state', () => {
    test('future arrivalDate → entries created with zero urgency bonuses', async () => {
      const currentDate = new Date('2026-03-14');
      await createProfile(
        TEST_USER_ID,
        {
          visaType: 'AEWV',
          city: 'AUCKLAND',
          familySituation: 'SOLO',
          occupation: 'TECHNOLOGY',
          arrivalDate: FUTURE_ARRIVAL_DATE,
        },
        currentDate,
      );

      const entries = await db.userRoadmapEntry.findMany({
        where: { userId: TEST_USER_ID, taskId: TASK_ALL.id },
      });

      expect(entries).toHaveLength(1);
      // Score = basePriority + personaWeight + 0 (no urgency) - 0 (not blocked)
      // TASK_ALL: basePriority=50, personaWeight=0 (T_AC205_ALL not a special task)
      expect(entries[0].priorityScore).toBe(50);
    });
  });

  describe('Error cases', () => {
    test('duplicate userId → throws PROFILE_EXISTS AppError', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'SOLO',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      await expect(
        createProfile(TEST_USER_ID, {
          visaType: 'AEWV',
          city: 'AUCKLAND',
          familySituation: 'SOLO',
          occupation: 'TECHNOLOGY',
          arrivalDate: ARRIVAL_DATE,
        }),
      ).rejects.toMatchObject({
        code: 'PROFILE_EXISTS',
        statusCode: 409,
      });
    });

    test('invalid arrivalDate string → throws VALIDATION_ERROR AppError', async () => {
      await expect(
        createProfile(TEST_USER_ID, {
          visaType: 'AEWV',
          city: 'AUCKLAND',
          familySituation: 'SOLO',
          occupation: 'TECHNOLOGY',
          arrivalDate: 'not-a-date',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });

    test('empty string arrivalDate → throws VALIDATION_ERROR AppError', async () => {
      await expect(
        createProfile(TEST_USER_ID, {
          visaType: 'AEWV',
          city: 'AUCKLAND',
          familySituation: 'SOLO',
          occupation: 'TECHNOLOGY',
          arrivalDate: '',
        }),
      ).rejects.toMatchObject({
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });
  });
});
