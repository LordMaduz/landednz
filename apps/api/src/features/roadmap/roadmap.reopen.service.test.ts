// Integration tests for reopenTask() and the completedAt / blockingTaskIds roadmap fields
// (spec §4.3 amendment) — real DB, canonical T08 → T09 HARD dependency.

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { buildApp } from '../../server.js';
import { loadContent, task as contentTask, useContent } from '../../content/index.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { completeTask, getRoadmap, reopenTask } from './roadmap.service.js';

const TS = Date.now();
const TEST_USER_ID = `test-user-reopen-${TS}`;
const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14T02:00:00.000Z');

async function cleanUp() {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
}

beforeAll(async () => {
  await cleanUp();
  await db.user.create({ data: { id: TEST_USER_ID, email: `test-reopen-${TS}@example.com` } });
});

afterAll(async () => {
  await cleanUp();
  await db.$disconnect();
});

afterEach(async () => {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});

const profile = () =>
  createProfile(TEST_USER_ID, {
    visaType: 'AEWV',
    city: 'AUCKLAND',
    familySituation: 'SOLO',
    occupation: 'OTHER_PROFESSIONAL',
    arrivalDate: ARRIVAL_DATE,
  }, CURRENT_DATE);

const findTask = async (taskId: string) =>
  (await getRoadmap(TEST_USER_ID)).phases.flatMap(p => p.tasks).find(t => t.taskId === taskId)!;

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

describe('getRoadmap() completedAt and blockingTaskIds', () => {
  test('open task has completedAt null; blocked T09 names T08 by id', async () => {
    await profile();
    const t08 = await findTask('T08');
    const t07 = await findTask('T09');
    expect(t08.completedAt).toBeNull();
    expect(t07.blockingTaskIds).toEqual(['T08']);
    expect(t07.blockingTaskNames).toEqual([contentTask('T08')!.name]);
  });

  test('completed task carries the stored completedAt as ISO', async () => {
    await profile();
    await completeTask(TEST_USER_ID, 'T08', CURRENT_DATE);
    const t08 = await findTask('T08');
    expect(t08.completedAt).toBe(CURRENT_DATE.toISOString());
    expect((await findTask('T09')).blockingTaskIds).toEqual([]);
  });
});

describe('reopenTask()', () => {
  test('reopening done T08 clears completion and blocks T09 again', async () => {
    await profile();
    await completeTask(TEST_USER_ID, 'T08', CURRENT_DATE);

    const result = await reopenTask(TEST_USER_ID, 'T08', CURRENT_DATE);

    expect(result.taskId).toBe('T08');
    expect(result.status).toBe('NOT_STARTED');
    expect(result.reblockedTasks).toEqual(['T09']);
    expect(result.newTopThree.map(t => t.taskId)).toContain('T08');

    const entry = await db.userRoadmapEntry.findUnique({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T08' } },
    });
    expect(entry!.status).toBe('NOT_STARTED');
    expect(entry!.completedAt).toBeNull();
    expect(entry!.completionMethod).toBeNull();
    expect((await findTask('T09')).isBlocked).toBe(true);
  });

  test('reopening a task that is not done changes nothing', async () => {
    await profile();
    const before = await getRoadmap(TEST_USER_ID);

    const result = await reopenTask(TEST_USER_ID, 'T08', CURRENT_DATE);

    expect(result).toMatchObject({ taskId: 'T08', status: 'NOT_STARTED', reblockedTasks: [] });
    const after = await getRoadmap(TEST_USER_ID);
    expect(after.phases).toEqual(before.phases);
  });

  test('retired done task → AppError TASK_RETIRED (409), stays COMPLETE', async () => {
    await profile();
    await completeTask(TEST_USER_ID, 'T08', CURRENT_DATE);

    await withRetired('T08', async () => {
      await expect(reopenTask(TEST_USER_ID, 'T08', CURRENT_DATE)).rejects.toMatchObject({
        code: 'TASK_RETIRED',
        statusCode: 409,
      });
    });
    const entry = await db.userRoadmapEntry.findUnique({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T08' } },
    });
    expect(entry!.status).toBe('COMPLETE');
  });

  test('task not in the roadmap → AppError TASK_NOT_FOUND (404)', async () => {
    await profile();
    await expect(reopenTask(TEST_USER_ID, 'T_NONEXISTENT', CURRENT_DATE)).rejects.toMatchObject({
      code: 'TASK_NOT_FOUND',
      statusCode: 404,
    });
  });
});

describe('POST /roadmap/tasks/:taskId/reopen', () => {
  let app: FastifyInstance;
  beforeAll(async () => {
    app = await buildApp();
  });
  afterAll(async () => {
    await app.close();
  });

  test('no Authorization header → 401', async () => {
    const response = await app.inject({ method: 'POST', url: '/roadmap/tasks/T08/reopen' });
    expect(response.statusCode).toBe(401);
  });
});
