// Integration tests for bulkOverride() — runs against real Docker postgres DB.
// Tests verify bulk task completion, full roadmap recomputation, and correct topThree.
//
// AC-2-09: POST /roadmap/bulk-override marks all specified tasks COMPLETE in a single
// request and returns correct newTopThree.
//
// Uses content task IDs (T06, T07, T08, T03) — fileParallelism: false ensures
// sequential execution so canonical IDs don't conflict between test files.
//
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { bulkOverride, getRoadmap } from './roadmap.service.js';

// ─── Test identifiers ─────────────────────────────────────────────────────────

const TS = Date.now();
const TEST_USER_ID = `test-user-ac209-${TS}`;

// Golden1: constrained_couple, Day 2
// arrivalDate=2026-03-13, currentDate=2026-03-14 → daysSince=2 (Days 1-3 urgency fires)
const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14');

// ─── Setup / teardown ─────────────────────────────────────────────────────────

beforeAll(async () => {
  // Clean up any leftover data from previous failed runs
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });

  // Create test user
  await db.user.create({ data: { id: TEST_USER_ID, email: `test-ac209-${TS}@example.com` } });

});

afterAll(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.$disconnect();
});

afterEach(async () => {
  // Reset profile and roadmap entries between tests so each starts from golden1 state
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('bulkOverride()', () => {

  describe('Single task completion', () => {
    test('Mark T03 only — marked=[T03], skipped=[], T03 COMPLETE in DB', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await bulkOverride(TEST_USER_ID, ['T03'], CURRENT_DATE);

      expect(result.marked).toEqual(['T03']);
      expect(result.skipped).toEqual([]);
      expect(result.newTopThree.map(t => t.taskId)).not.toContain('T03');

      const entry = await db.userRoadmapEntry.findUnique({
        where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T03' } },
      });
      expect(entry!.status).toBe('COMPLETE');
      expect(entry!.completionMethod).toBe('BULK_OVERRIDE');
      expect(entry!.completedAt).not.toBeNull();
    });

    test('Mark T06 — T07 unblocked, appears in newTopThree', async () => {
      // T07 is HARD blocked by T06. Completing T06 → full recomputation → T07 unblocked
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await bulkOverride(TEST_USER_ID, ['T06'], CURRENT_DATE);

      expect(result.marked).toEqual(['T06']);
      expect(result.skipped).toEqual([]);

      const topThreeIds = result.newTopThree.map(t => t.taskId);
      expect(topThreeIds).toContain('T07');

      const t07 = result.newTopThree.find(t => t.taskId === 'T07');
      expect(t07!.isBlocked).toBe(false);
    });
  });

  describe('Multiple tasks at once', () => {
    test('Mark T03 + T06 together — both marked, T07 unblocked in newTopThree', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await bulkOverride(TEST_USER_ID, ['T03', 'T06'], CURRENT_DATE);

      expect(result.marked).toContain('T03');
      expect(result.marked).toContain('T06');
      expect(result.skipped).toEqual([]);

      // T07 unblocked after T06 completion
      const topThreeIds = result.newTopThree.map(t => t.taskId);
      expect(topThreeIds).toContain('T07');

      // T03 and T06 absent from newTopThree (COMPLETE)
      expect(topThreeIds).not.toContain('T03');
      expect(topThreeIds).not.toContain('T06');
    });
  });

  describe('Already-complete tasks', () => {
    test('Task already COMPLETE — marked=[], skipped=[T06]', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      // Mark T06 complete first
      await bulkOverride(TEST_USER_ID, ['T06'], CURRENT_DATE);

      // Second call — T06 already complete
      const result = await bulkOverride(TEST_USER_ID, ['T06'], CURRENT_DATE);

      expect(result.marked).toEqual([]);
      expect(result.skipped).toEqual(['T06']);
    });

    test('Mixed: T03 new + T06 already done — marked=[T03], skipped=[T06]', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      // Mark T06 complete first
      await bulkOverride(TEST_USER_ID, ['T06'], CURRENT_DATE);

      // Now bulk-override T03 (new) + T06 (already done)
      const result = await bulkOverride(TEST_USER_ID, ['T03', 'T06'], CURRENT_DATE);

      expect(result.marked).toEqual(['T03']);
      expect(result.skipped).toEqual(['T06']);
    });
  });

  describe('Task not in roadmap', () => {
    test('T_NONEXISTENT silently ignored — not in marked or skipped', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'TECHNOLOGY',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);
      const topThreeBefore = (await getRoadmap(TEST_USER_ID)).topThree.map(t => t.taskId);

      const result = await bulkOverride(TEST_USER_ID, ['T_NONEXISTENT'], CURRENT_DATE);

      expect(result.marked).toEqual([]);
      expect(result.skipped).toEqual([]);
      // topThree unchanged
      expect(result.newTopThree.map(t => t.taskId)).toEqual(topThreeBefore);
    });
  });
});
