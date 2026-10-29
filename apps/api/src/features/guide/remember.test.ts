// Memory saving rules; real local DB (service-level, no auth involved).
import { randomUUID } from 'node:crypto';
import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { db } from '../../shared/db.js';
import { remember } from './remember.js';

const userId = randomUUID();
const messageId = randomUUID();
const fact = (text: string, sensitive = false, explicit = false) => ({ text, sensitive, explicit });

beforeEach(async () => {
  await db.user.upsert({ where: { id: userId }, create: { id: userId, email: `${userId}@test.local` }, update: {} });
  await db.guideMemory.deleteMany({ where: { userId } });
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: userId } });
  await db.$disconnect();
});

describe('remember', () => {
  test('saves a candidate with its source message and returns a memory_saved part', async () => {
    const parts = await remember({ userId, messageId, candidates: [fact('Has a dog')], skip: false });
    const rows = await db.guideMemory.findMany({ where: { userId } });
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ text: 'Has a dog', sourceMessageId: messageId });
    expect(parts).toEqual([{ type: 'memory_saved', memoryId: rows[0]!.id, text: 'Has a dog' }]);
  });

  test('skip saves nothing', async () => {
    expect(await remember({ userId, messageId, candidates: [fact('Has a dog')], skip: true })).toEqual([]);
    expect(await db.guideMemory.count({ where: { userId } })).toBe(0);
  });

  test('drops sensitive facts unless the user asked to remember them', async () => {
    const parts = await remember({
      userId,
      messageId,
      candidates: [fact('Has a heart condition', true, false), fact('Is pregnant', true, true)],
      skip: false,
    });
    expect(parts.map(p => p.type === 'memory_saved' && p.text)).toEqual(['Is pregnant']);
  });

  test('drops case-insensitive duplicates of existing memories and within the batch', async () => {
    await db.guideMemory.create({ data: { userId, text: 'Has a dog' } });
    const parts = await remember({ userId, messageId, candidates: [fact('has a DOG'), fact('Rents'), fact('rents')], skip: false });
    expect(parts.map(p => p.type === 'memory_saved' && p.text)).toEqual(['Rents']);
  });

  test('stops at 50 memories per user', async () => {
    await db.guideMemory.createMany({ data: Array.from({ length: 49 }, (_, i) => ({ userId, text: `Fact ${i}` })) });
    const parts = await remember({ userId, messageId, candidates: [fact('One more'), fact('Too many')], skip: false });
    expect(parts).toHaveLength(1);
    expect(await db.guideMemory.count({ where: { userId } })).toBe(50);
    expect(await remember({ userId, messageId, candidates: [fact('Another')], skip: false })).toEqual([]);
  });
});
