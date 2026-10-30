// Guide context is built from the database only; real local DB, AI_MODE=mock.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { db } from '../../shared/db.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { loadContent, task } from '../../content/index.js';
import { loadGuideContext } from './context.js';

let userId: string;
let bareUserId: string;

beforeAll(async () => {
  await loadContent();
  const a = await createTestUser('test-guide-context');
  userId = a.userId;
  await db.user.create({ data: { id: userId, email: a.email, name: 'Aroha' } });
  await db.userProfile.create({
    data: { userId, visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: new Date(Date.now() - 10 * 86_400_000) },
  });
  const ids = ['T08', 'T01', 'T02', 'T09'].filter((id) => task(id));
  await db.userRoadmapEntry.createMany({
    data: [
      { userId, taskId: ids[0]!, status: 'COMPLETE', priorityScore: 50 },
      { userId, taskId: ids[1]!, status: 'NOT_STARTED', priorityScore: 10 },
      { userId, taskId: ids[2]!, status: 'NOT_STARTED', priorityScore: 90 },
      { userId, taskId: ids[3]!, status: 'NOT_STARTED', priorityScore: 99 },
    ],
  });
  await db.guideMemory.create({ data: { userId, text: 'Has a dog' } });
  const b = await createTestUser('test-guide-context-bare');
  bareUserId = b.userId;
  await db.user.create({ data: { id: bareUserId, email: b.email } });
}, 60_000);

afterAll(async () => {
  for (const id of [userId, bareUserId]) {
    await db.user.deleteMany({ where: { id } });
    await deleteTestUser(id);
  }
  await db.$disconnect();
}, 60_000);

describe('loadGuideContext', () => {
  test('builds done, next (Home order: phase, then task id), memories and titles', async () => {
    const ctx = await loadGuideContext(userId, { kind: 'home' });
    expect(ctx.userName).toBe('Aroha');
    expect(ctx.daysSinceArrival).toBe(10);
    expect(ctx.doneTasks).toEqual([{ taskKey: 'T08', title: task('T08')!.name }]);
    // Same order as the Home/Roadmap pages (route-view.ts), not score, so "Next up" matches the page
    expect(ctx.nextTasks.map((t) => t.taskKey)).toEqual(['T01', 'T02', 'T09']);
    expect(ctx.totalTasks).toBe(4);
    expect(ctx.currentTask).toBeNull();
    expect(ctx.memories).toHaveLength(1);
    expect(ctx.memories[0]!.text).toBe('Has a dog');
    expect(ctx.taskTitles.get('T08')).toBe(task('T08')!.name);
  });

  test('currentTask resolves from the screen; unknown task is null', async () => {
    const ok = await loadGuideContext(userId, { kind: 'task', taskKey: 'T08' });
    expect(ok.currentTask).toEqual({ taskKey: 'T08', title: task('T08')!.name });
    const unknown = await loadGuideContext(userId, { kind: 'task', taskKey: 'T999' });
    expect(unknown.currentTask).toBeNull();
  });

  test('no profile is a 404 PROFILE_NOT_FOUND', async () => {
    await expect(loadGuideContext(bareUserId, { kind: 'home' })).rejects.toMatchObject({ code: 'PROFILE_NOT_FOUND', statusCode: 404 });
  });
});
