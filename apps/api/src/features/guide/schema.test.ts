import { describe, expect, test, afterAll } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { db } from '../../shared/db.js';

const USER_ID = `test-guide-schema-${Date.now()}`;

afterAll(async () => {
  await db.user.deleteMany({ where: { id: USER_ID } });
  await db.$disconnect();
});

const message = (conversationId: string, status: string) => ({
  conversationId, role: 'assistant', text: '', screenKind: 'home', status,
});

describe('guide schema', () => {
  test('one streaming row per conversation; complete rows are not limited', async () => {
    await db.user.create({ data: { id: USER_ID, email: `${USER_ID}@example.com` } });
    const conversation = await db.guideConversation.create({ data: { userId: USER_ID } });

    await db.guideMessage.create({ data: message(conversation.id, 'streaming') });
    const error = await db.guideMessage.create({ data: message(conversation.id, 'streaming') }).catch(e => e);
    expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
    expect(error.code).toBe('P2002');

    await expect(db.guideMessage.create({ data: message(conversation.id, 'complete') })).resolves.toBeDefined();
  });

  test('keyword search column matches chunk text', async () => {
    const rows = await db.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) FROM "KnowledgeBaseChunk" WHERE "searchText" @@ plainto_tsquery('english', 'IRD number')`;
    const [{ count }] = JSON.parse(JSON.stringify(rows, (_, v) => (typeof v === 'bigint' ? Number(v) : v)));
    expect(count).toBeGreaterThan(0);
  });

  test('deleting the user removes the conversation, messages and memories', async () => {
    await db.guideMemory.create({ data: { userId: USER_ID, text: 'My partner starts work in March' } });
    await db.user.delete({ where: { id: USER_ID } });

    expect(await db.guideConversation.count({ where: { userId: USER_ID } })).toBe(0);
    expect(await db.guideMessage.count({ where: { conversation: { userId: USER_ID } } })).toBe(0);
    expect(await db.guideMemory.count({ where: { userId: USER_ID } })).toBe(0);
  });
});
