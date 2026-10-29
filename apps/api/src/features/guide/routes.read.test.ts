// Guide read routes: history paging, task view, opening, memories. Real Supabase users, real DB, AI_MODE=mock.
import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import type { GuideConversationPage, GuideMemoryDto, GuideMessageDto, GuideOpeningResponse } from '@landednz/types';
import { db } from '../../shared/db.js';
import { tasks } from '../../content/index.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { buildApp } from '../../server.js';

let app: FastifyInstance;
let userId: string;
let jwt: string;
let otherId: string;
let otherJwt: string;
let taskKeys: string[];

const get = (url: string, token = jwt) => app.inject({ method: 'GET', url, headers: { Authorization: `Bearer ${token}` } });

async function seedProfile(id: string, email: string) {
  await db.user.create({ data: { id, email, name: 'Aroha' } });
  await db.userProfile.create({
    data: { userId: id, visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: new Date(Date.now() - 10 * 86_400_000) },
  });
}

// n question/answer pairs, one second apart, answer createdAt = question + 1 ms (as startTurn writes them)
async function seedTurns(n: number, taskKey: string | null = null, start = Date.UTC(2026, 9, 1)) {
  const { id: conversationId } = await db.guideConversation.upsert({ where: { userId }, create: { userId }, update: {} });
  for (let i = 0; i < n; i++) {
    const at = start + i * 1000;
    const screen = { screenKind: taskKey ? 'task' : 'home', taskKey };
    const q = await db.guideMessage.create({ data: { conversationId, role: 'user', text: `Question ${i}`, status: 'complete', createdAt: new Date(at), ...screen } });
    await db.guideMessage.create({
      data: { conversationId, role: 'assistant', text: `Answer ${i}`, parts: [{ type: 'text', text: `Answer ${i}` }], status: 'complete', replyToId: q.id, createdAt: new Date(at + 1), ...screen },
    });
  }
}

beforeAll(async () => {
  const a = await createTestUser('test-guide-read');
  const b = await createTestUser('test-guide-read-other');
  ({ userId, jwt } = a);
  ({ userId: otherId, jwt: otherJwt } = b);
  await seedProfile(userId, a.email);
  await seedProfile(otherId, b.email);
  app = await buildApp();
  taskKeys = tasks().filter((t) => !t.retired).slice(0, 4).map((t) => t.id);
  await db.userRoadmapEntry.createMany({
    data: taskKeys.map((taskId, i) => ({ userId, taskId, status: i === 0 ? 'COMPLETE' : 'NOT_STARTED', priorityScore: 100 - i })),
  });
}, 60_000);

beforeEach(async () => {
  await db.guideConversation.deleteMany({ where: { userId: { in: [userId, otherId] } } });
  await db.guideMemory.deleteMany({ where: { userId: { in: [userId, otherId] } } });
});

afterAll(async () => {
  for (const id of [userId, otherId]) {
    await db.user.deleteMany({ where: { id } });
    await deleteTestUser(id);
  }
  await app.close();
  await db.$disconnect();
}, 60_000);

describe('GET /guide/conversation', () => {
  test('pages newest first with nextBefore and no overlap', async () => {
    await seedTurns(3);
    const first = await get('/guide/conversation?limit=4');
    expect(first.statusCode).toBe(200);
    const p1 = first.json<GuideConversationPage>();
    expect(p1.messages.map((m) => m.text)).toEqual(['Answer 2', 'Question 2', 'Answer 1', 'Question 1']);
    expect(p1.nextBefore).toBe(p1.messages[3]!.id);

    const p2 = (await get(`/guide/conversation?limit=4&before=${p1.nextBefore}`)).json<GuideConversationPage>();
    expect(p2.messages.map((m) => m.text)).toEqual(['Answer 0', 'Question 0']);
    expect(p2.nextBefore).toBeNull();
    expect(p2.messages[0]).toMatchObject({ role: 'assistant', status: 'complete', parts: [{ type: 'text', text: 'Answer 0' }], screen: { kind: 'home' } });
  });

  test('empty for a user with no conversation; limit outside 1–50 → 400', async () => {
    expect((await get('/guide/conversation')).json()).toEqual({ messages: [], nextBefore: null });
    expect((await get('/guide/conversation?limit=0')).statusCode).toBe(400);
    expect((await get('/guide/conversation?limit=51')).statusCode).toBe(400);
  });

  test("another user's message id as cursor → 400", async () => {
    await seedTurns(1);
    const [m] = (await get('/guide/conversation')).json<GuideConversationPage>().messages;
    expect((await get(`/guide/conversation?before=${m!.id}`, otherJwt)).statusCode).toBe(400);
  });
});

describe('GET /guide/conversation/task/:taskKey', () => {
  test("returns only that task's messages, oldest first", async () => {
    await seedTurns(1);
    await seedTurns(2, taskKeys[1]!, Date.UTC(2026, 9, 2));
    const res = await get(`/guide/conversation/task/${taskKeys[1]}`);
    expect(res.statusCode).toBe(200);
    const msgs = res.json<GuideMessageDto[]>();
    expect(msgs.map((m) => m.text)).toEqual(['Question 0', 'Answer 0', 'Question 1', 'Answer 1']);
    expect(msgs.every((m) => m.screen.taskKey === taskKeys[1])).toBe(true);
  });
});

describe('GET /guide/opening', () => {
  test('home: where you are plus at most 3 starters, no task keys', async () => {
    const res = await get('/guide/opening?screen=home');
    expect(res.statusCode).toBe(200);
    const body = res.json<GuideOpeningResponse>();
    expect(body.whereYouAre).toMatch(/^You've done 1 of 4 tasks\. Next up: /);
    expect(body.starters.length).toBeGreaterThan(0);
    expect(body.starters.length).toBeLessThanOrEqual(3);
    expect(JSON.stringify(body)).not.toMatch(/\bT\d{2,3}\b/);
  });

  test('task screen: starters about that task; unknown task key → no starters, not an error', async () => {
    const task = (await get(`/guide/opening?screen=task&taskKey=${taskKeys[2]}`)).json<GuideOpeningResponse>();
    expect(task.starters).toHaveLength(3);
    expect(JSON.stringify(task)).not.toMatch(/\bT\d{2,3}\b/);

    const unknown = await get('/guide/opening?screen=task&taskKey=T999');
    expect(unknown.statusCode).toBe(200);
    expect(unknown.json<GuideOpeningResponse>().starters).toEqual([]);
  });

  test('bad screen → 400', async () => {
    expect((await get('/guide/opening?screen=chat')).statusCode).toBe(400);
  });
});

describe('/guide/memories', () => {
  test('list, patch, delete; another user gets 404', async () => {
    const m = await db.guideMemory.create({ data: { userId, text: 'Has a dog' } });

    const list = (await get('/guide/memories')).json<GuideMemoryDto[]>();
    expect(list.map((x) => x.text)).toEqual(['Has a dog']);

    const patch = (token: string, text: unknown) =>
      app.inject({ method: 'PATCH', url: `/guide/memories/${m.id}`, headers: { Authorization: `Bearer ${token}` }, payload: { text } });
    const del = (token: string) => app.inject({ method: 'DELETE', url: `/guide/memories/${m.id}`, headers: { Authorization: `Bearer ${token}` } });

    expect((await patch(otherJwt, 'Has two dogs')).statusCode).toBe(404);
    expect((await del(otherJwt)).statusCode).toBe(404);
    expect((await patch(jwt, 42)).statusCode).toBe(400);

    const patched = await patch(jwt, 'Has two dogs');
    expect(patched.statusCode).toBe(200);
    expect(patched.json<GuideMemoryDto>().text).toBe('Has two dogs');

    expect((await del(jwt)).statusCode).toBe(204);
    expect((await get('/guide/memories')).json()).toEqual([]);
  });

  test('no Authorization header → 401', async () => {
    expect((await app.inject({ method: 'GET', url: '/guide/memories' })).statusCode).toBe(401);
  });
});

describe('DELETE /account', () => {
  test('leaves no guide rows for that user', async () => {
    const u = await createTestUser('test-guide-read-delete');
    await seedProfile(u.userId, u.email);
    const { id: conversationId } = await db.guideConversation.create({ data: { userId: u.userId } });
    await db.guideMessage.create({ data: { conversationId, role: 'user', text: 'Hi', status: 'complete', screenKind: 'home' } });
    await db.guideMemory.create({ data: { userId: u.userId, text: 'Has a dog' } });

    const res = await app.inject({ method: 'DELETE', url: '/account', headers: { Authorization: `Bearer ${u.jwt}` } });
    expect(res.statusCode).toBe(204);
    expect(await db.guideConversation.count({ where: { userId: u.userId } })).toBe(0);
    expect(await db.guideMessage.count({ where: { conversationId } })).toBe(0);
    expect(await db.guideMemory.count({ where: { userId: u.userId } })).toBe(0);
  });
});
