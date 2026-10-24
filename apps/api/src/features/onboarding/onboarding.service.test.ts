// Integration tests for createProfile() — runs against real Docker postgres DB.
// Tests call the service directly (bypassing JWT middleware).
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db.js';
import { createProfile, updateProfileAndRegenerateRoadmap } from './onboarding.service.js';
import { contentVersion, task } from '../../content/index.js';

// ─── Test fixtures ───────────────────────────────────────────────────────────

const TEST_USER_ID = `test-user-ac205-${Date.now()}`;
const TEST_USER_EMAIL = `test-ac205-${Date.now()}@example.com`;

// Fixed date: 30 days after arrival for deterministic urgency calculation
const ARRIVAL_DATE = '2026-02-12'; // 30 days before 2026-03-14
const FUTURE_ARRIVAL_DATE = '2026-06-01'; // Future — pre-arrival state

// ─── Setup / teardown ────────────────────────────────────────────────────────

beforeAll(async () => {
  await db.user.create({ data: { id: TEST_USER_ID, email: TEST_USER_EMAIL } });
});

afterAll(async () => {
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
      expect(response.personaKey).toBe(''); // column dropped in Task 8
      expect(response.profileId).toBeTruthy();

      const profile = await db.userProfile.findUnique({ where: { userId: TEST_USER_ID } });
      expect(profile).not.toBeNull();
      expect(profile!.visaType).toBe('AEWV');
      expect(profile!.city).toBe('AUCKLAND');
      expect(profile!.familySituation).toBe('SOLO');
      expect(profile!.occupation).toBe('TECHNOLOGY');
      expect(profile!.personaKey).toBe('');
      expect(profile!.arrivalDate).toEqual(new Date(ARRIVAL_DATE));
    });
  });

  describe('RoadmapEntry generation — task applicability', () => {
    test('SOLO profile → the 20 solo tasks (couples/family-only T21 excluded)', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'SOLO',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      const entries = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });

      const entryTaskIds = entries.map(e => e.taskId);
      expect(entryTaskIds).toHaveLength(20);
      expect(entryTaskIds).toContain('T07');
      expect(entryTaskIds).not.toContain('T21');
    });

    test('FAMILY_WITH_CHILDREN profile → all 21 tasks, T21 included', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'FAMILY_WITH_CHILDREN',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      });

      const entries = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });

      const entryTaskIds = entries.map(e => e.taskId);
      expect(entryTaskIds).toHaveLength(21);
      expect(entryTaskIds).toContain('T21');
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
        expect(entry.contentVersion).toBe(contentVersion());
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
        where: { userId: TEST_USER_ID, taskId: 'T06' },
      });

      expect(entries).toHaveLength(1);
      // T06 has a days-1-3 urgency rule and no boosts: pre-arrival it scores its priority only
      expect(entries[0].priorityScore).toBe(task('T06')!.priority);
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

describe('updateProfileAndRegenerateRoadmap()', () => {
  test('a done task stays done, with its completedAt, after the plan changes', async () => {
    const answers = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY', arrivalDate: ARRIVAL_DATE } as const;
    await createProfile(TEST_USER_ID, answers);
    const completedAt = new Date('2026-02-13T01:00:00.000Z');
    await db.userRoadmapEntry.update({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T07' } },
      data: { status: 'COMPLETE', completedAt },
    });

    await updateProfileAndRegenerateRoadmap(TEST_USER_ID, { ...answers, city: 'WELLINGTON' });

    const entry = await db.userRoadmapEntry.findUnique({ where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T07' } } });
    expect(entry).toMatchObject({ status: 'COMPLETE', completedAt });
  });
});

describe('updateProfileAndRegenerateRoadmap() — Review Focus 2', () => {
  test('family change keeps completions, adds family-only tasks, removes no-longer-applicable ones', async () => {
    const solo = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY', arrivalDate: ARRIVAL_DATE } as const;
    await createProfile(TEST_USER_ID, solo);
    await db.userRoadmapEntry.update({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T07' } },
      data: { status: 'COMPLETE', completedAt: new Date() },
    });

    const res = await updateProfileAndRegenerateRoadmap(TEST_USER_ID, { ...solo, familySituation: 'FAMILY_WITH_CHILDREN' });
    expect(res.entriesCreated).toBe(21);
    const family = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });
    const byId = new Map(family.map(e => [e.taskId, e]));
    expect(byId.get('T07')!.status).toBe('COMPLETE');
    expect(byId.get('T21')).toMatchObject({ status: 'NOT_STARTED', isBlocked: false }); // HARD dep T07 is done
    expect(family.every(e => e.contentVersion === contentVersion())).toBe(true);

    await updateProfileAndRegenerateRoadmap(TEST_USER_ID, solo);
    const back = await db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });
    expect(back.map(e => e.taskId)).not.toContain('T21');
    expect(back.find(e => e.taskId === 'T07')!.status).toBe('COMPLETE');
  });
});
