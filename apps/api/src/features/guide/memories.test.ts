// Memory CRUD; real local DB (service-level, no auth involved).
import { randomUUID } from 'node:crypto';
import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { db } from '../../shared/db.js';
import { deleteMemory, listMemories, updateMemory } from './memories.js';

const userId = randomUUID();
const otherId = randomUUID();

beforeEach(async () => {
  for (const id of [userId, otherId]) {
    await db.user.upsert({ where: { id }, create: { id, email: `${id}@test.local` }, update: {} });
    await db.guideMemory.deleteMany({ where: { userId: id } });
  }
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await db.$disconnect();
});

describe('memories', () => {
  test('lists the user\'s memories newest first as DTOs', async () => {
    await db.guideMemory.create({ data: { userId, text: 'Old', createdAt: new Date('2026-01-01') } });
    await db.guideMemory.create({ data: { userId, text: 'New', createdAt: new Date('2026-02-01') } });
    await db.guideMemory.create({ data: { userId: otherId, text: 'Not mine' } });
    const list = await listMemories(userId);
    expect(list.map(m => m.text)).toEqual(['New', 'Old']);
    expect(list[0]).toEqual({ id: expect.any(String), text: 'New', createdAt: expect.any(String), updatedAt: expect.any(String) });
  });

  test('edit trims the text and marks it edited by the user', async () => {
    const m = await db.guideMemory.create({ data: { userId, text: 'Has a dog' } });
    const dto = await updateMemory(userId, m.id, '  Has two dogs ');
    expect(dto.text).toBe('Has two dogs');
    expect((await db.guideMemory.findUnique({ where: { id: m.id } }))?.editedByUser).toBe(true);
  });

  test('edit rejects empty and over-200-character text with 400 VALIDATION_ERROR', async () => {
    const m = await db.guideMemory.create({ data: { userId, text: 'Has a dog' } });
    for (const text of ['   ', 'x'.repeat(201)]) {
      await expect(updateMemory(userId, m.id, text)).rejects.toMatchObject({ code: 'VALIDATION_ERROR', statusCode: 400 });
    }
  });

  test('another user\'s or a missing memory is 404 MEMORY_NOT_FOUND for update and delete', async () => {
    const theirs = await db.guideMemory.create({ data: { userId: otherId, text: 'Theirs' } });
    for (const id of [theirs.id, randomUUID()]) {
      await expect(updateMemory(userId, id, 'Mine now')).rejects.toMatchObject({ code: 'MEMORY_NOT_FOUND', statusCode: 404 });
      await expect(deleteMemory(userId, id)).rejects.toMatchObject({ code: 'MEMORY_NOT_FOUND', statusCode: 404 });
    }
    expect((await db.guideMemory.findUnique({ where: { id: theirs.id } }))?.text).toBe('Theirs');
  });

  test('delete removes the user\'s memory', async () => {
    const m = await db.guideMemory.create({ data: { userId, text: 'Has a dog' } });
    await deleteMemory(userId, m.id);
    expect(await db.guideMemory.count({ where: { userId } })).toBe(0);
  });
});
