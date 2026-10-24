// KB seed rules from the approved boards (spec §4.3 amendment): T21 is couples-only,
// LAST_VERIFIED is stored. Runs against the local Supabase DB; re-seeds first because
// other integration tests delete and recreate canonical tasks.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '../src/shared/db.js';
import { createProfile } from '../src/features/onboarding/onboarding.service.js';
import { seedKnowledgeBase } from './seed-knowledge-base.js';

const TS = Date.now();
const SOLO_ID = `test-seed-solo-${TS}`;
const COUPLE_ID = `test-seed-couple-${TS}`;
const ALL_FOUR = ['SOLO', 'COUPLE_DUAL_WORK', 'COUPLE_CONSTRAINED', 'FAMILY_WITH_CHILDREN'];

async function cleanUp() {
  for (const id of [SOLO_ID, COUPLE_ID]) {
    await db.userRoadmapEntry.deleteMany({ where: { userId: id } });
    await db.userProfile.deleteMany({ where: { userId: id } });
    await db.user.deleteMany({ where: { id } });
  }
}

beforeAll(async () => {
  await seedKnowledgeBase();
  await cleanUp();
}, 120_000);

afterAll(async () => {
  await cleanUp();
  await db.$disconnect();
});

describe('seedKnowledgeBase()', () => {
  it('T21 applies to couples and families only; every other task to all four', async () => {
    const tasks = await db.task.findMany({
      where: { id: { startsWith: 'T' } },
      select: { id: true, applicableFamilySituations: true },
    });
    const kb = tasks.filter(t => /^T\d{2}$/.test(t.id));
    expect(kb).toHaveLength(21);
    for (const t of kb) {
      const situations = JSON.parse(t.applicableFamilySituations);
      if (t.id === 'T21') {
        expect(situations).toEqual(['COUPLE_DUAL_WORK', 'COUPLE_CONSTRAINED', 'FAMILY_WITH_CHILDREN']);
      } else {
        expect(situations).toEqual(ALL_FOUR);
      }
    }
  });

  it('stores LAST_VERIFIED as lastVerifiedAt', async () => {
    const t08 = await db.task.findUnique({ where: { id: 'T08' }, select: { lastVerifiedAt: true } });
    expect(t08!.lastVerifiedAt!.toISOString().slice(0, 10)).toBe('2026-03-03');
  });

  it('a solo profile gets 20 tasks without T21; a couple gets 21', async () => {
    const answers = { visaType: 'AEWV', city: 'AUCKLAND', occupation: 'TECHNOLOGY', arrivalDate: '2026-10-21' } as const;
    await db.user.createMany({
      data: [
        { id: SOLO_ID, email: `${SOLO_ID}@example.com` },
        { id: COUPLE_ID, email: `${COUPLE_ID}@example.com` },
      ],
    });
    await createProfile(SOLO_ID, { ...answers, familySituation: 'SOLO' });
    await createProfile(COUPLE_ID, { ...answers, familySituation: 'COUPLE_DUAL_WORK' });

    const solo = await db.userRoadmapEntry.findMany({ where: { userId: SOLO_ID }, select: { taskId: true } });
    const couple = await db.userRoadmapEntry.count({ where: { userId: COUPLE_ID } });
    expect(solo).toHaveLength(20);
    expect(solo.map(e => e.taskId)).not.toContain('T21');
    expect(couple).toBe(21);
  });
});
