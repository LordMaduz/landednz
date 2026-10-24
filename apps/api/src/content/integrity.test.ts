import { afterAll, beforeAll, expect, test } from 'vitest';
import { db } from '../shared/db.js';
import { loadContent, useContent } from './index.js';
import { checkStoredTaskIds } from './integrity.js';

const TS = Date.now();
const USER_ID = `test-integrity-${TS}`;

beforeAll(async () => {
  const bundle = await loadContent();
  const retired = { ...bundle.tasks[0]!, id: 'T98', retired: true };
  useContent({ ...bundle, tasks: [...bundle.tasks, retired] });
  await db.user.create({ data: { id: USER_ID, email: `integrity-${TS}@example.com` } });
  await db.userRoadmapEntry.createMany({
    data: ['T99', 'T98', 'T06'].map(taskId => ({ userId: USER_ID, taskId, priorityScore: 1 })),
  });
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: USER_ID } }); // entries cascade
  await db.$disconnect();
});

test('checkStoredTaskIds reports ids missing from the bundle and ids of retired tasks', async () => {
  const r = await checkStoredTaskIds();
  expect(r.unknown).toContain('T99');
  expect(r.retired).toContain('T98');
  expect(r.unknown).not.toContain('T06');
  expect(r.retired).not.toContain('T06');
});
