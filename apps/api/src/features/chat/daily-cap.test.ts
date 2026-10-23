import { describe, expect, test, beforeEach, afterAll } from 'vitest';
import { db } from '../../shared/db.js';
import { config } from '../../shared/config.js';
import { AppError } from '../../shared/errors.js';
import { assertUnderDailyCap } from './daily-cap.js';

const USER_ID = `test-daily-cap-${Date.now()}`;
let sessionId: string;

// 2026-10-24T10:30:00Z is 23:30 NZDT on 24 Oct; 11:05Z is 00:05 NZDT on 25 Oct.
const NZ_2330_24_OCT = new Date('2026-10-24T10:30:00Z');

async function seedUserMessages(count: number, createdAt: Date) {
  await db.chatMessage.createMany({
    data: Array.from({ length: count }, (_, i) => ({ sessionId, role: 'USER' as const, content: `m${i}`, createdAt })),
  });
}

beforeEach(async () => {
  await db.user.deleteMany({ where: { id: USER_ID } });
  await db.user.create({ data: { id: USER_ID, email: `${USER_ID}@example.com` } });
  sessionId = (await db.chatSession.create({ data: { userId: USER_ID, entryPoint: 'NAVIGATION' } })).id;
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: USER_ID } });
  await db.$disconnect();
});

describe('assertUnderDailyCap', () => {
  test('user below cap can send', async () => {
    await seedUserMessages(config.chatDailyCap - 1, NZ_2330_24_OCT);
    await expect(assertUnderDailyCap(USER_ID, new Date('2026-10-24T10:45:00Z'))).resolves.toBeUndefined();
  });

  test('user at cap gets 429 CHAT_DAILY_CAP_REACHED', async () => {
    await seedUserMessages(config.chatDailyCap, NZ_2330_24_OCT);
    const error = await assertUnderDailyCap(USER_ID, new Date('2026-10-24T10:45:00Z')).catch(e => e);
    expect(error).toBeInstanceOf(AppError);
    expect(error.code).toBe('CHAT_DAILY_CAP_REACHED');
    expect(error.statusCode).toBe(429);
    expect(error.message).toBe('Daily message limit reached. It resets at midnight NZ time.');
  });

  test('assistant messages do not count toward the cap', async () => {
    await db.chatMessage.createMany({
      data: Array.from({ length: config.chatDailyCap }, () => ({ sessionId, role: 'ASSISTANT' as const, content: 'a', createdAt: NZ_2330_24_OCT })),
    });
    await expect(assertUnderDailyCap(USER_ID, new Date('2026-10-24T10:45:00Z'))).resolves.toBeUndefined();
  });

  test('cap counts NZ day: messages from 23:30 NZ yesterday do not count at 00:05 NZ today', async () => {
    await seedUserMessages(config.chatDailyCap, NZ_2330_24_OCT);
    await expect(assertUnderDailyCap(USER_ID, new Date('2026-10-24T11:05:00Z'))).resolves.toBeUndefined();
  });

  test('messages at 23:30 NZ count toward the same NZ day at 23:45', async () => {
    await seedUserMessages(config.chatDailyCap, NZ_2330_24_OCT);
    await expect(assertUnderDailyCap(USER_ID, new Date('2026-10-24T10:45:00Z'))).rejects.toMatchObject({
      code: 'CHAT_DAILY_CAP_REACHED',
    });
  });
});
