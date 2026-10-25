// Integration tests for bulkOverride() — runs against real Docker postgres DB.
// Tests verify bulk task completion, full roadmap recomputation, and correct topThree.
//
// AC-2-09: POST /roadmap/bulk-override marks all specified tasks COMPLETE in a single
// request and returns correct newTopThree.
//
// Uses content task IDs (T08, T09, T08, T02) — fileParallelism: false ensures
// sequential execution so canonical IDs don't conflict between test files.
//
// Database must be running: docker-compose up -d

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db.js';
import { loadContent, useContent } from '../../content/index.js';
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

// Runs fn with the given task marked retired in the loaded content, then restores the real bundle
async function withRetired(taskId: string, fn: () => Promise<void>) {
  const bundle = await loadContent();
  useContent({ ...bundle, tasks: bundle.tasks.map(t => (t.id === taskId ? { ...t, retired: true } : t)) });
  try {
    await fn();
  } finally {
    useContent(bundle);
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('bulkOverride()', () => {

  describe('Single task completion', () => {
    test('Mark T02 only — marked=[T02], skipped=[], T02 COMPLETE in DB', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'OTHER_PROFESSIONAL',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await bulkOverride(TEST_USER_ID, ['T02'], CURRENT_DATE);

      expect(result.marked).toEqual(['T02']);
      expect(result.skipped).toEqual([]);
      expect(result.newTopThree.map(t => t.taskId)).not.toContain('T02');

      const entry = await db.userRoadmapEntry.findUnique({
        where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T02' } },
      });
      expect(entry!.status).toBe('COMPLETE');
      expect(entry!.completionMethod).toBe('BULK_OVERRIDE');
      expect(entry!.completedAt).not.toBeNull();
    });

    test('Mark T08 — T09 unblocked, appears in newTopThree', async () => {
      // T09 is HARD blocked by T08. Completing T08 → full recomputation → T09 unblocked
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'OTHER_PROFESSIONAL',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await bulkOverride(TEST_USER_ID, ['T08'], CURRENT_DATE);

      expect(result.marked).toEqual(['T08']);
      expect(result.skipped).toEqual([]);

      const topThreeIds = result.newTopThree.map(t => t.taskId);
      expect(topThreeIds).toContain('T09');

      const t07 = result.newTopThree.find(t => t.taskId === 'T09');
      expect(t07!.isBlocked).toBe(false);
    });
  });

  describe('Multiple tasks at once', () => {
    test('Mark T02 + T08 together — both marked, T09 unblocked in newTopThree', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'OTHER_PROFESSIONAL',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      const result = await bulkOverride(TEST_USER_ID, ['T02', 'T08'], CURRENT_DATE);

      expect(result.marked).toContain('T02');
      expect(result.marked).toContain('T08');
      expect(result.skipped).toEqual([]);

      // T09 unblocked after T08 completion
      const topThreeIds = result.newTopThree.map(t => t.taskId);
      expect(topThreeIds).toContain('T09');

      // T02 and T08 absent from newTopThree (COMPLETE)
      expect(topThreeIds).not.toContain('T02');
      expect(topThreeIds).not.toContain('T08');
    });
  });

  describe('Already-complete tasks', () => {
    test('Task already COMPLETE — marked=[], skipped=[T08]', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'OTHER_PROFESSIONAL',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      // Mark T08 complete first
      await bulkOverride(TEST_USER_ID, ['T08'], CURRENT_DATE);

      // Second call — T08 already complete
      const result = await bulkOverride(TEST_USER_ID, ['T08'], CURRENT_DATE);

      expect(result.marked).toEqual([]);
      expect(result.skipped).toEqual(['T08']);
    });

    test('Mixed: T02 new + T08 already done — marked=[T02], skipped=[T08]', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'OTHER_PROFESSIONAL',
        arrivalDate: ARRIVAL_DATE,
      }, CURRENT_DATE);

      // Mark T08 complete first
      await bulkOverride(TEST_USER_ID, ['T08'], CURRENT_DATE);

      // Now bulk-override T02 (new) + T08 (already done)
      const result = await bulkOverride(TEST_USER_ID, ['T02', 'T08'], CURRENT_DATE);

      expect(result.marked).toEqual(['T02']);
      expect(result.skipped).toEqual(['T08']);
    });
  });

  describe('Retired tasks', () => {
    test('Retired T02 is skipped, not marked; T08 is marked', async () => {
      await createProfile(TEST_USER_ID, {
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'OTHER_PROFESSIONAL',
      arrivalDate: ARRIVAL_DATE,
    }, CURRENT_DATE);

      await withRetired('T02', async () => {
        const result = await bulkOverride(TEST_USER_ID, ['T02', 'T08'], CURRENT_DATE);
        expect(result.marked).toEqual(['T08']);
        expect(result.skipped).toEqual(['T02']);
      });
      const entry = await db.userRoadmapEntry.findUnique({
        where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T02' } },
      });
      expect(entry!.status).toBe('NOT_STARTED');
    });
  });

  describe('Task not in roadmap', () => {
    test('T_NONEXISTENT silently ignored — not in marked or skipped', async () => {
      await createProfile(TEST_USER_ID, {
        visaType: 'AEWV',
        city: 'AUCKLAND',
        familySituation: 'COUPLE_CONSTRAINED',
        occupation: 'OTHER_PROFESSIONAL',
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
