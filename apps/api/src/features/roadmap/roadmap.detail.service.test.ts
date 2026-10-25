// Integration tests for getTaskDetail() — real local DB, task content from the content bundle.

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import { db } from '../../shared/db.js';
import { contentVersion, loadContent, source, task, useContent } from '../../content/index.js';
import type { Bundle } from '../../content/build.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { getTaskDetail } from './roadmap.service.js';

// ─── Test identifiers ─────────────────────────────────────────────────────────

const TS = Date.now();
const TEST_USER_ID = `test-user-ac210-${TS}`;

const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14');

const answers = (familySituation: string) => ({
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation,
  occupation: 'OTHER_PROFESSIONAL',
  arrivalDate: ARRIVAL_DATE,
}) as Parameters<typeof createProfile>[1];

// ─── Setup / teardown ─────────────────────────────────────────────────────────

let bundle: Bundle;

beforeAll(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.user.create({ data: { id: TEST_USER_ID, email: `test-ac210-${TS}@example.com` } });

  // Real bundle plus a family-only step on T01 (the converted content has no conditional items yet),
  // and retired T05's advice item on live T06 (no live task has advice yet)
  bundle = await loadContent();
  const t01 = task('T01')!;
  const familyStep = { ...t01.steps[0]!, id: 'T01.steps.family', text: 'Family-only step', when: { family: ['FAMILY_WITH_CHILDREN'] } };
  const advice = task('T05')!.advice;
  useContent({
    ...bundle,
    tasks: bundle.tasks.map(t => (t.id === 'T01' ? { ...t, steps: [...t.steps, familyStep] } : t.id === 'T06' ? { ...t, advice } : t)),
  });
});

afterAll(async () => {
  useContent(bundle);
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.$disconnect();
});

afterEach(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getTaskDetail()', () => {
  test('returns the task content for the user, with sources and content version', async () => {
    await createProfile(TEST_USER_ID, answers('COUPLE_CONSTRAINED'), CURRENT_DATE);
    const t02 = task('T02')!;

    const result = await getTaskDetail(TEST_USER_ID, 'T02');

    expect(result.taskId).toBe('T02');
    expect(result.name).toBe(t02.name);
    expect(result.taskType).toBe('FREE');
    expect(result.estimatedDuration).toBe(t02.duration);
    expect(result.processingTime).toBe(t02.processingTime ?? null);
    expect(result.consequenceLine).toBe(t02.why[0]!.text);
    expect(result.steps).toEqual(t02.steps.map(i => i.text));
    expect(result.documentsRequired).toEqual(t02.documents.map(i => i.text));
    expect(result.commonMistakes).toEqual(t02.mistakes.map(i => i.text));
    expect(result.watchOuts).toEqual(t02.watchOuts.map(i => i.text));
    expect(result.cost).toBe(t02.cost!.text);
    expect(result.professionalAdviceRequired).toBe(false);
    expect(result.professionalAdviceNote).toBeNull();
    expect(result.relatedTasks).toEqual([]);
    expect(result.governmentSourceUrl).toBe(source(t02.why[0]!.source).url);
    expect(result.lastVerified).toBe(t02.checkedAt);
    expect(result.contentVersion).toBe(contentVersion());

    const step = t02.steps[0]!;
    const { title, url } = source(step.source);
    expect(result.sources.steps[0]).toEqual({ itemId: step.id, title, url, checked: step.checked });
    expect(result.sources.steps).toHaveLength(t02.steps.length);
    expect(result.sources.cost.map(s => s.itemId)).toEqual([t02.cost!.id]);
    expect(result.sources.advice).toEqual([]);
  });

  test('advice item sets professionalAdviceRequired and its note', async () => {
    await createProfile(TEST_USER_ID, answers('SOLO'), CURRENT_DATE);
    const advice = task('T06')!.advice!;

    const result = await getTaskDetail(TEST_USER_ID, 'T06');

    expect(result.professionalAdviceRequired).toBe(advice.required);
    expect(result.professionalAdviceNote).toBe(advice.text);
  });

  test('a family profile sees the family-only step; a solo profile does not', async () => {
    await createProfile(TEST_USER_ID, answers('FAMILY_WITH_CHILDREN'), CURRENT_DATE);
    const family = await getTaskDetail(TEST_USER_ID, 'T01');
    expect(family.steps).toContain('Family-only step');
    expect(family.sources.steps.map(s => s.itemId)).toContain('T01.steps.family');

    await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
    await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
    await createProfile(TEST_USER_ID, answers('SOLO'), CURRENT_DATE);
    const solo = await getTaskDetail(TEST_USER_ID, 'T01');
    expect(solo.steps).not.toContain('Family-only step');
    expect(solo.steps).toHaveLength(family.steps.length - 1);
  });

  test('Task not in user roadmap → 404 TASK_NOT_FOUND', async () => {
    await createProfile(TEST_USER_ID, answers('COUPLE_CONSTRAINED'), CURRENT_DATE);

    await expect(getTaskDetail(TEST_USER_ID, 'T-NONEXISTENT')).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
    });
  });

  test('entry for a task id the content does not know → 404 TASK_NOT_FOUND', async () => {
    await createProfile(TEST_USER_ID, answers('COUPLE_CONSTRAINED'), CURRENT_DATE);
    await db.userRoadmapEntry.create({ data: { userId: TEST_USER_ID, taskId: 'T99', priorityScore: 0 } });

    await expect(getTaskDetail(TEST_USER_ID, 'T99')).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
    });
  });
});
