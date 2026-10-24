// Integration tests for getTaskDetail() — runs against real Docker postgres DB.
//
// AC-2-10: GET /roadmap/tasks/:taskId for a PREMIUM task when user has no
// subscription returns 403 with PREMIUM_REQUIRED error code.
//
// Also verifies: FREE task returns 200, PREMIUM + isActive:true returns 200,
// task not in roadmap returns 404.
//
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { getTaskDetail } from './roadmap.service.js';

// ─── Test identifiers ─────────────────────────────────────────────────────────

const TS = Date.now();
const TEST_USER_ID = `test-user-ac210-${TS}`;

const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14');

const FREE_TASK_ID = `T-AC210-FREE-${TS}`;
const PREMIUM_TASK_ID = `T-AC210-PREM-${TS}`;

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // Clean previous runs
  await db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.taskContentVariant.deleteMany({ where: { taskId: { in: [FREE_TASK_ID, PREMIUM_TASK_ID] } } });
  await db.task.deleteMany({ where: { id: { in: [FREE_TASK_ID, PREMIUM_TASK_ID] } } });

  await db.user.create({ data: { id: TEST_USER_ID, email: `test-ac210-${TS}@example.com` } });

  // Create one FREE task and one PREMIUM task
  await db.task.createMany({
    data: [
      {
        id: FREE_TASK_ID,
        name: 'Free task AC-2-10',
        phase: 1,
        basePriority: 50,
        estimatedDuration: '10 minutes',
        lastVerifiedAt: new Date('2026-03-03'),
        governmentSourceUrl: 'https://example.com',
        taskType: 'FREE',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      },
      {
        id: PREMIUM_TASK_ID,
        name: 'Premium task AC-2-10',
        phase: 2,
        basePriority: 60,
        estimatedDuration: '20 minutes',
        governmentSourceUrl: 'https://example.com',
        taskType: 'PREMIUM',
        applicableVisaTypes: '["ALL"]',
        applicableFamilySituations: '["ALL"]',
        applicableOccupations: '["ALL"]',
      },
    ],
  });

  // Add content variants for both tasks
  await db.taskContentVariant.createMany({
    data: [
      {
        taskId: FREE_TASK_ID,
        personaKey: 'solo_aewv',
        consequenceLine: 'Free task consequence',
        steps: '["Step 1","Step 2"]',
        documentsRequired: '["Doc A"]',
        commonMistakes: '["Mistake 1"]',
        watchOuts: '["Watch out 1"]',
        professionalAdviceRequired: false,
        sourceUrl: 'https://example.com',
      },
      {
        taskId: PREMIUM_TASK_ID,
        personaKey: 'solo_aewv',
        consequenceLine: 'Premium task consequence',
        steps: '["Step 1"]',
        documentsRequired: '[]',
        commonMistakes: '[]',
        watchOuts: '["Premium watch out"]',
        professionalAdviceRequired: true,
        professionalAdviceNote: 'Consult an advisor',
        sourceUrl: 'https://example.com',
      },
    ],
  });
});

afterAll(async () => {
  await db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.taskContentVariant.deleteMany({ where: { taskId: { in: [FREE_TASK_ID, PREMIUM_TASK_ID] } } });
  await db.task.deleteMany({ where: { id: { in: [FREE_TASK_ID, PREMIUM_TASK_ID] } } });
  await db.$disconnect();
});

afterEach(async () => {
  // Reset roadmap entries and subscription between tests
  await db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getTaskDetail()', () => {

  describe('FREE task', () => {
    test('FREE task, no subscription → 200 with full TaskDetailResponse', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await getTaskDetail(TEST_USER_ID, FREE_TASK_ID);

      expect(result.taskId).toBe(FREE_TASK_ID);
      expect(result.taskType).toBe('FREE');
      expect(result.name).toBe('Free task AC-2-10');
      expect(result.steps).toEqual(['Step 1', 'Step 2']);
      expect(result.watchOuts).toEqual(['Watch out 1']);
      expect(result.professionalAdviceRequired).toBe(false);
      expect(result.relatedTasks).toEqual([]);
      expect(result.lastVerified).toBe('2026-03-03');
    });
  });

  describe('PREMIUM task — gate checks', () => {
    test('PREMIUM task, no subscription record → 403 PREMIUM_REQUIRED', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      await expect(getTaskDetail(TEST_USER_ID, PREMIUM_TASK_ID)).rejects.toMatchObject({
        code: 'PREMIUM_REQUIRED',
        statusCode: 403,
      });
    });

    test('PREMIUM task, subscription isActive: false → 403 PREMIUM_REQUIRED', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      await db.subscription.create({
        data: { userId: TEST_USER_ID, isActive: false },
      });

      await expect(getTaskDetail(TEST_USER_ID, PREMIUM_TASK_ID)).rejects.toMatchObject({
        code: 'PREMIUM_REQUIRED',
        statusCode: 403,
      });
    });

    test('PREMIUM task, subscription isActive: true → 200 with full detail', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      await db.subscription.create({
        data: { userId: TEST_USER_ID, isActive: true },
      });

      const result = await getTaskDetail(TEST_USER_ID, PREMIUM_TASK_ID);

      expect(result.taskId).toBe(PREMIUM_TASK_ID);
      expect(result.taskType).toBe('PREMIUM');
      expect(result.watchOuts).toEqual(['Premium watch out']);
      expect(result.professionalAdviceRequired).toBe(true);
      expect(result.professionalAdviceNote).toBe('Consult an advisor');
      expect(result.lastVerified).toBeNull();
    });
  });

  describe('Task not in roadmap', () => {
    test('Task not in user roadmap → 404 TASK_NOT_FOUND', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      await expect(getTaskDetail(TEST_USER_ID, 'T-NONEXISTENT')).rejects.toMatchObject({
        code: 'TASK_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});
