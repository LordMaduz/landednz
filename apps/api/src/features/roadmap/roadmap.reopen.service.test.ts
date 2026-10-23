// Integration tests for reopenTask() and the completedAt / blockingTaskIds roadmap fields
// (spec §4.3 amendment) — real DB, canonical T06 → T07 HARD dependency.

import { describe, expect, test, beforeAll, afterAll, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { buildApp } from '../../server.js';
import { createProfile } from '../onboarding/onboarding.service.js';
import { completeTask, getRoadmap, reopenTask } from './roadmap.service.js';

const TS = Date.now();
const TEST_USER_ID = `test-user-reopen-${TS}`;
const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14T02:00:00.000Z');
const TASK_IDS = ['T06', 'T07'];

async function cleanUp() {
  await db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });
  await db.taskContentVariant.deleteMany({ where: { taskId: { in: TASK_IDS } } });
  await db.taskDependency.deleteMany({
    where: { OR: [{ prerequisiteId: { in: TASK_IDS } }, { dependentId: { in: TASK_IDS } }] },
  });
  await db.task.deleteMany({ where: { id: { in: TASK_IDS } } });
}

const task = (id: string, name: string, basePriority: number) => ({
  id,
  name,
  phase: 1,
  basePriority,
  estimatedDuration: '30 minutes',
  governmentSourceUrl: 'https://example.com',
  applicableVisaTypes: '["ALL"]',
  applicableFamilySituations: '["ALL"]',
  applicableOccupations: '["ALL"]',
});

beforeAll(async () => {
  await cleanUp();
  await db.user.create({ data: { id: TEST_USER_ID, email: `test-reopen-${TS}@example.com` } });
  await db.task.createMany({
    data: [task('T06', 'Get a NZ SIM card', 98), task('T07', 'Open a NZ bank account', 95)],
  });
  await db.taskDependency.create({
    data: { prerequisiteId: 'T06', dependentId: 'T07', dependencyType: 'HARD' },
  });
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
    occupation: 'TECHNOLOGY',
    arrivalDate: ARRIVAL_DATE,
  }, CURRENT_DATE);

const findTask = async (taskId: string) =>
  (await getRoadmap(TEST_USER_ID)).phases.flatMap(p => p.tasks).find(t => t.taskId === taskId)!;

describe('getRoadmap() completedAt and blockingTaskIds', () => {
  test('open task has completedAt null; blocked T07 names T06 by id', async () => {
    await profile();
    const t06 = await findTask('T06');
    const t07 = await findTask('T07');
    expect(t06.completedAt).toBeNull();
    expect(t07.blockingTaskIds).toEqual(['T06']);
    expect(t07.blockingTaskNames).toEqual(['Get a NZ SIM card']);
  });

  test('completed task carries the stored completedAt as ISO', async () => {
    await profile();
    await completeTask(TEST_USER_ID, 'T06', CURRENT_DATE);
    const t06 = await findTask('T06');
    expect(t06.completedAt).toBe(CURRENT_DATE.toISOString());
    expect((await findTask('T07')).blockingTaskIds).toEqual([]);
  });
});

describe('reopenTask()', () => {
  test('reopening done T06 clears completion and blocks T07 again', async () => {
    await profile();
    await completeTask(TEST_USER_ID, 'T06', CURRENT_DATE);

    const result = await reopenTask(TEST_USER_ID, 'T06', CURRENT_DATE);

    expect(result.taskId).toBe('T06');
    expect(result.status).toBe('NOT_STARTED');
    expect(result.reblockedTasks).toEqual(['T07']);
    expect(result.newTopThree.map(t => t.taskId)).toContain('T06');

    const entry = await db.userRoadmapEntry.findUnique({
      where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T06' } },
    });
    expect(entry!.status).toBe('NOT_STARTED');
    expect(entry!.completedAt).toBeNull();
    expect(entry!.completionMethod).toBeNull();
    expect((await findTask('T07')).isBlocked).toBe(true);
  });

  test('reopening a task that is not done changes nothing', async () => {
    await profile();
    const before = await getRoadmap(TEST_USER_ID);

    const result = await reopenTask(TEST_USER_ID, 'T06', CURRENT_DATE);

    expect(result).toMatchObject({ taskId: 'T06', status: 'NOT_STARTED', reblockedTasks: [] });
    const after = await getRoadmap(TEST_USER_ID);
    expect(after.phases).toEqual(before.phases);
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
    const response = await app.inject({ method: 'POST', url: '/roadmap/tasks/T06/reopen' });
    expect(response.statusCode).toBe(401);
  });
});
