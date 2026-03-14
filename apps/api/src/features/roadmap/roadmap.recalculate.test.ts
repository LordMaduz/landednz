// Integration tests for recalculateAllRoadmaps() — runs against real Docker postgres DB.
//
// AC-2-11: Daily priority recalculation job runs and updates priorityScore for
// time-sensitive tasks. Test: T16 score increases when arrivalDate set to 10 months ago.
//
// Uses a non-canonical task ID (unique per test run) to avoid conflicts with
// other test files running the same canonical T16. fileParallelism: false ensures
// sequential execution anyway, but unique IDs make teardown reliable.
//
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db';
import { createProfile } from '../onboarding/onboarding.service';
import { recalculateAllRoadmaps } from './roadmap.recalculate';

// ─── Test identifiers ─────────────────────────────────────────────────────────

const TS = Date.now();
const TEST_USER_ID = `test-user-ac211-${TS}`;
// Must use canonical T16 — scoreTask() checks task ID by exact string for persona weights + urgency
const T16_ID = 'T16';

// Anchor dates:
// currentDate = today used for recalculation
// recentArrivalDate = today → no month 10-11 urgency for T16
// oldArrivalDate = 285 days ago → month 10-11 urgency fires (+30)
const CURRENT_DATE = new Date('2026-03-15');
const RECENT_ARRIVAL_DATE = '2026-03-14'; // 1 day ago — no urgency
const OLD_ARRIVAL_DATE = new Date(CURRENT_DATE.getTime() - 285 * 24 * 60 * 60 * 1000); // 285 days ago

// T16 expected scores:
// No urgency: 65 (base) + 5 (constrained_couple) + 0 = 70
// With urgency: 65 + 5 + 30 = 100
const T16_BASE = 65;
const T16_PERSONA_WEIGHT = 5;  // constrained_couple
const T16_SCORE_NO_URGENCY = T16_BASE + T16_PERSONA_WEIGHT;         // 70
const T16_SCORE_WITH_URGENCY = T16_BASE + T16_PERSONA_WEIGHT + 30;  // 100

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.taskContentVariant.deleteMany({ where: { taskId: T16_ID } });
  await db.task.deleteMany({ where: { id: T16_ID } });

  await db.user.create({ data: { id: TEST_USER_ID, email: `test-ac211-${TS}@example.com` } });

  // Create canonical T16 — NZ driving licence. basePriority=65, no deps.
  // Canonical ID required: scoreTask() checks taskId === 'T16' for persona weights + urgency.
  await db.task.create({
    data: {
      id: T16_ID,
      name: 'Convert your overseas driving licence to NZ',
      phase: 2,
      basePriority: T16_BASE,
      estimatedDuration: '1 hour',
      governmentSourceUrl: 'https://nzta.govt.nz',
      applicableVisaTypes: '["ALL"]',
      applicableFamilySituations: '["ALL"]',
      applicableOccupations: '["ALL"]',
    },
  });
});

afterAll(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.taskContentVariant.deleteMany({ where: { taskId: T16_ID } });
  await db.task.deleteMany({ where: { id: T16_ID } });
  await db.$disconnect();
});

afterEach(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('recalculateAllRoadmaps()', () => {

  test('T16 score increases from 70 to 100 when arrivalDate set to 10 months ago', async () => {
    // 1. Create profile with recent arrivalDate — T16 has no urgency
    await createProfile(TEST_USER_ID, {
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'TECHNOLOGY',
      arrivalDate: RECENT_ARRIVAL_DATE,
    }, CURRENT_DATE);

    // Verify initial score — no urgency
    const entryBefore = await db.userRoadmapEntry.findUnique({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: T16_ID } },
    });
    expect(entryBefore!.priorityScore).toBe(T16_SCORE_NO_URGENCY); // 70

    // 2. Update arrivalDate to 285 days ago — month 10-11 urgency fires
    await db.userProfile.update({
      where: { userId: TEST_USER_ID },
      data: { arrivalDate: OLD_ARRIVAL_DATE },
    });

    // 3. Run recalculation
    const result = await recalculateAllRoadmaps(CURRENT_DATE);

    // 4. Assert T16 score updated to 100
    const entryAfter = await db.userRoadmapEntry.findUnique({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: T16_ID } },
    });
    expect(entryAfter!.priorityScore).toBe(T16_SCORE_WITH_URGENCY); // 100

    // 5. Assert return values
    expect(result.usersProcessed).toBeGreaterThanOrEqual(1);
    expect(result.entriesUpdated).toBeGreaterThanOrEqual(1);
  });

  test('Pre-arrival user (arrivalDate in future) — T16 keeps 0 urgency after recalculate', async () => {
    // arrivalDate in the future → isPreArrival=true → scoringArrivalDate=null → no urgency
    const futureArrival = new Date(CURRENT_DATE.getTime() + 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0]!;

    await createProfile(TEST_USER_ID, {
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'TECHNOLOGY',
      arrivalDate: futureArrival,
    }, CURRENT_DATE);

    await recalculateAllRoadmaps(CURRENT_DATE);

    const entry = await db.userRoadmapEntry.findUnique({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: T16_ID } },
    });
    // Pre-arrival: no urgency bonus — score stays at base + persona = 70
    expect(entry!.priorityScore).toBe(T16_SCORE_NO_URGENCY);
  });

  test('Returns correct usersProcessed and entriesUpdated counts', async () => {
    await createProfile(TEST_USER_ID, {
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'TECHNOLOGY',
      arrivalDate: RECENT_ARRIVAL_DATE,
    }, CURRENT_DATE);

    const entryCount = await db.userRoadmapEntry.count({
      where: { userId: TEST_USER_ID, status: { not: 'COMPLETE' } },
    });

    const result = await recalculateAllRoadmaps(CURRENT_DATE);

    expect(result.usersProcessed).toBeGreaterThanOrEqual(1);
    expect(result.entriesUpdated).toBeGreaterThanOrEqual(entryCount);
  });
});
