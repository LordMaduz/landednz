// Stale-row sweeper and cost warning; real local DB.
import { randomUUID } from 'node:crypto';
import { afterAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { warnOnCost, sweepStale } from './sweeper.js';

const userId = randomUUID();
const url = `https://sweeper-test.invalid/${userId}`;
let conversationId: string;

const assistant = (createdAt: Date, status: string, meta?: object) =>
  db.guideMessage.create({
    data: { conversationId, role: 'assistant', text: '', screenKind: 'home', status, createdAt, streamStartedAt: createdAt, meta },
  });

beforeEach(async () => {
  await db.user.upsert({ where: { id: userId }, create: { id: userId, email: `${userId}@test.local` }, update: {} });
  await db.guideConversation.deleteMany({ where: { userId } });
  conversationId = (await db.guideConversation.create({ data: { userId } })).id;
  await db.liveSourceCache.deleteMany({ where: { url } });
  vi.restoreAllMocks();
});

afterAll(async () => {
  await db.liveSourceCache.deleteMany({ where: { url } });
  await db.user.deleteMany({ where: { id: userId } });
  await db.$disconnect();
});

describe('sweepStale', () => {
  test('interrupts a 3-min-old streaming row, leaves a 1-min-old one', async () => {
    const now = new Date();
    const old = await assistant(new Date(now.getTime() - 3 * 60_000), 'streaming');
    const res = await sweepStale(now);
    expect(res.interrupted).toBeGreaterThanOrEqual(1);
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: old.id } })).status).toBe('interrupted');
    const fresh = await assistant(new Date(now.getTime() - 60_000), 'streaming');
    await sweepStale(now);
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: fresh.id } })).status).toBe('streaming');
  });

  test('deletes cache rows older than 30 days only', async () => {
    const now = new Date();
    await db.liveSourceCache.deleteMany({ where: { url } });
    await db.liveSourceCache.create({ data: { url, fetchedAt: new Date(now.getTime() - 31 * 86_400_000), title: 't', content: 't' } });
    const res = await sweepStale(now);
    expect(res.cacheDeleted).toBeGreaterThanOrEqual(1);
    expect(await db.liveSourceCache.count({ where: { url } })).toBe(0);
  });
});

describe('warnOnCost', () => {
  // A 2031 "now" keeps real test data out of the yesterday window.
  const now = new Date('2031-03-10T02:00:00Z');
  const yesterday = new Date('2031-03-09T02:00:00Z');

  test('warns once when yesterday averages 6 cents', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    await assistant(yesterday, 'complete', { costCents: 7 });
    await assistant(yesterday, 'complete', { costCents: 5 });
    await assistant(yesterday, 'complete');
    await warnOnCost(now);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]!.at(-1)).toBe('guide cost above budget');
  });

  test('stays quiet at 4 cents or with no rows', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined);
    await warnOnCost(now);
    await assistant(yesterday, 'complete', { costCents: 4 });
    await warnOnCost(now);
    expect(warn).not.toHaveBeenCalled();
  });
});
