// Turn start/finish/restart and the daily cap; real local DB (service-level, no auth involved).
import { randomUUID } from 'node:crypto';
import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { db } from '../../shared/db.js';
import { startOfNzDay } from '../../shared/nz-day.js';
import { finishTurn, restartTurn, startTurn } from './turns.js';

const userId = randomUUID();
const otherId = randomUUID();
const home = { kind: 'home' } as const;
const rejects409 = { code: 'GUIDE_BUSY', statusCode: 409 };

async function userRows(n: number, createdAt: Date, countsTowardCap = true) {
  const c = await db.guideConversation.upsert({ where: { userId }, create: { userId }, update: {} });
  await db.guideMessage.createMany({
    data: Array.from({ length: n }, () => ({
      conversationId: c.id, role: 'user', text: 'q', screenKind: 'home', status: 'complete', countsTowardCap, createdAt,
    })),
  });
}

beforeEach(async () => {
  for (const id of [userId, otherId]) {
    await db.user.upsert({ where: { id }, create: { id, email: `${id}@test.local` }, update: {} });
  }
  await db.guideConversation.deleteMany({ where: { userId: { in: [userId, otherId] } } });
});

afterAll(async () => {
  await db.user.deleteMany({ where: { id: { in: [userId, otherId] } } });
  await db.$disconnect();
});

describe('startTurn', () => {
  test('creates user and streaming assistant rows', async () => {
    const r = await startTurn(userId, 'hello', { kind: 'task', taskKey: 'ird' });
    const a = await db.guideMessage.findUniqueOrThrow({ where: { id: r.assistantMessageId } });
    expect(a).toMatchObject({ role: 'assistant', status: 'streaming', replyToId: r.userMessageId, screenKind: 'task', taskKey: 'ird' });
  });

  test('two concurrent starts: one wins, one gets 409 GUIDE_BUSY', async () => {
    const res = await Promise.allSettled([startTurn(userId, 'a', home), startTurn(userId, 'b', home)]);
    expect(res.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    const lost = res.find(r => r.status === 'rejected') as PromiseRejectedResult;
    expect(lost.reason).toMatchObject(rejects409);
  });

  test('second start while streaming is 409', async () => {
    await startTurn(userId, 'a', home);
    await expect(startTurn(userId, 'b', home)).rejects.toMatchObject(rejects409);
  });

  test('19 counting questions today is ok, 20 is 429', async () => {
    await userRows(19, new Date());
    await expect(startTurn(userId, 'q', home)).resolves.toBeDefined();
    const a = await db.guideMessage.findFirstOrThrow({ where: { role: 'assistant', conversation: { userId } } });
    await finishTurn(a.id, { status: 'complete', parts: [], text: 'x', meta: {}, textSent: true });
    await expect(startTurn(userId, 'q', home)).rejects.toMatchObject({ code: 'CHAT_DAILY_CAP_REACHED', statusCode: 429 });
  });

  test('25 non-counting rows do not block', async () => {
    await userRows(25, new Date(), false);
    await expect(startTurn(userId, 'q', home)).resolves.toBeDefined();
  });

  test("yesterday's NZ-day questions do not count", async () => {
    const now = new Date();
    await userRows(25, new Date(startOfNzDay(now).getTime() - 60_000));
    await expect(startTurn(userId, 'q', home, now)).resolves.toBeDefined();
  });
});

describe('finishTurn', () => {
  const finish = (id: string, status: 'failed' | 'cancelled', textSent: boolean) =>
    finishTurn(id, { status, parts: [], text: textSent ? 'partial' : '', meta: {}, textSent });

  test('failed without text releases the cap slot', async () => {
    const r = await startTurn(userId, 'q', home);
    await finish(r.assistantMessageId, 'failed', false);
    const u = await db.guideMessage.findUniqueOrThrow({ where: { id: r.userMessageId } });
    expect(u.countsTowardCap).toBe(false);
  });

  test('cancelled with text still counts', async () => {
    const r = await startTurn(userId, 'q', home);
    await finish(r.assistantMessageId, 'cancelled', true);
    const u = await db.guideMessage.findUniqueOrThrow({ where: { id: r.userMessageId } });
    const a = await db.guideMessage.findUniqueOrThrow({ where: { id: r.assistantMessageId } });
    expect(u.countsTowardCap).toBe(true);
    expect(a).toMatchObject({ status: 'cancelled', text: 'partial' });
  });
});

describe('restartTurn', () => {
  test('restarts a failed row, re-counting it', async () => {
    const r = await startTurn(userId, 'again?', { kind: 'roadmap' });
    await finishTurn(r.assistantMessageId, { status: 'failed', parts: [], text: '', meta: {}, textSent: false });
    const out = await restartTurn(userId, r.assistantMessageId);
    expect(out).toEqual({ userMessageId: r.userMessageId, question: 'again?', screen: { kind: 'roadmap' } });
    const a = await db.guideMessage.findUniqueOrThrow({ where: { id: r.assistantMessageId } });
    const u = await db.guideMessage.findUniqueOrThrow({ where: { id: r.userMessageId } });
    expect(a.status).toBe('streaming');
    expect(a.parts).toBeNull();
    expect(u.countsTowardCap).toBe(true);
  });

  test('complete row is 409 NOT_RETRYABLE', async () => {
    const r = await startTurn(userId, 'q', home);
    await finishTurn(r.assistantMessageId, { status: 'complete', parts: [], text: 'x', meta: {}, textSent: true });
    await expect(restartTurn(userId, r.assistantMessageId)).rejects.toMatchObject({ code: 'NOT_RETRYABLE', statusCode: 409 });
  });

  test("another user's row is 404 MESSAGE_NOT_FOUND", async () => {
    const r = await startTurn(userId, 'q', home);
    await finishTurn(r.assistantMessageId, { status: 'failed', parts: [], text: '', meta: {}, textSent: false });
    await expect(restartTurn(otherId, r.assistantMessageId)).rejects.toMatchObject({ code: 'MESSAGE_NOT_FOUND', statusCode: 404 });
  });
});
