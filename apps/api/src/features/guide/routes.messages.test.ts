// Guide message routes end to end: real Supabase users, real DB, AI_MODE=mock. app.inject buffers SSE, so this checks event order only.
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

// Live official pages are network calls; one fixed official passage stands in for them
vi.mock('./live.js', () => ({
  liveSources: vi.fn(async () => ({
    passages: [
      {
        id: 'live:https://www.ird.govt.nz/ird-numbers#0',
        title: 'IRD numbers',
        url: 'https://www.ird.govt.nz/ird-numbers',
        origin: 'official',
        content: 'You need an IRD number to work, open KiwiSaver and pay the right tax in New Zealand.',
        similarity: 0.9,
        taskKey: null,
        checkedAt: new Date().toISOString(),
      },
    ],
    unavailable: false,
    searches: 1,
    usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  })),
}));

// Real retrieve by default; tests make it fail or hang
vi.mock('./retrieve.js', async (importOriginal) => {
  const m = await importOriginal<typeof import('./retrieve.js')>();
  return { ...m, retrieve: vi.fn(m.retrieve) };
});

// Real understand by default; tests make Haiku answer late
vi.mock('./understand.js', async (importOriginal) => {
  const m = await importOriginal<typeof import('./understand.js')>();
  return { ...m, understand: vi.fn(m.understand) };
});

// Real remember by default; one test makes it throw
vi.mock('./remember.js', async (importOriginal) => {
  const m = await importOriginal<typeof import('./remember.js')>();
  return { ...m, remember: vi.fn(m.remember) };
});

import type { FastifyInstance } from 'fastify';
import type { GuideCapError, GuideSseEvent, ReplyPart } from '@landednz/types';
import { nextNzMidnight } from '../../shared/nz-day.js';
import { db } from '../../shared/db.js';
import { AIFailureError } from '../../shared/errors.js';
import { setMockAnswer, setMockStructured } from '../../shared/ai/mock.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { buildApp } from '../../server.js';
import { TURN_LIMITS, turnCostCents } from './service.js';
import { remember } from './remember.js';
import { retrieve } from './retrieve.js';
import { liveSources } from './live.js';
import { understand, type UnderstandResult } from './understand.js';
import { GUIDE_CRISIS_TEXT, GUIDE_DISTRESS_CHECKIN, GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY } from '../../core/prompts/registry.js';

let app: FastifyInstance;
let userId: string;
let jwt: string;
let otherId: string;
let otherJwt: string;

const LEAK = /\bT\d{2,3}\b|CHUNK_/;

function parseSse(body: string): GuideSseEvent[] {
  return body
    .split('\n\n')
    .filter(Boolean)
    .map((block) => {
      const event = /^event: (.+)$/m.exec(block)?.[1];
      const data = /^data: (.+)$/m.exec(block)?.[1];
      return { event, data: JSON.parse(data!) } as GuideSseEvent;
    });
}

const parts = (events: GuideSseEvent[]): ReplyPart[] => events.flatMap((e) => (e.event === 'part' ? [e.data] : []));

function ask(text: unknown, token = jwt) {
  return app.inject({
    method: 'POST',
    url: '/guide/messages',
    headers: { Authorization: `Bearer ${token}` },
    payload: { text, screen: { kind: 'home' } },
  });
}

async function conversationId(uid = userId): Promise<string> {
  const c = await db.guideConversation.upsert({ where: { userId: uid }, create: { userId: uid }, update: {} });
  return c.id;
}

beforeAll(async () => {
  const a = await createTestUser('test-guide-routes');
  const b = await createTestUser('test-guide-routes-other');
  ({ userId, jwt } = a);
  ({ userId: otherId, jwt: otherJwt } = b);
  for (const [id, email] of [[userId, a.email], [otherId, b.email]]) {
    await db.user.create({ data: { id, email, name: 'Aroha' } });
    await db.userProfile.create({
      data: { userId: id, visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: new Date(Date.now() - 10 * 86_400_000) },
    });
  }
  app = await buildApp();
}, 60_000);

beforeEach(async () => {
  await db.guideConversation.deleteMany({ where: { userId: { in: [userId, otherId] } } });
  await db.guideMemory.deleteMany({ where: { userId: { in: [userId, otherId] } } });
});

afterEach(() => {
  setMockStructured(null);
  setMockAnswer(null);
});

afterAll(async () => {
  for (const id of [userId, otherId]) {
    await db.user.deleteMany({ where: { id } });
    await deleteTestUser(id);
  }
  await app.close();
  await db.$disconnect();
}, 60_000);

describe('POST /guide/messages', () => {
  test('streams start, notices, sources before cited text, memory_saved, then done', async () => {
    setMockStructured(() => ({
      searchQuery: 'partner starts work in March',
      scope: 'in',
      redirectAgency: null,
      needsLive: false,
      distress: false,
      memoryCandidates: [{ text: 'Partner starts work in March', sensitive: false, explicit: true }],
    }));
    const res = await ask('Remember that my partner starts work in March');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toBe('text/event-stream');

    const events = parseSse(res.body);
    expect(events[0]).toEqual({ event: 'start', data: { userMessageId: expect.any(String), assistantMessageId: expect.any(String) } });
    expect(events[1]).toEqual({ event: 'part', data: { type: 'notice', kind: 'checking_guide' } });
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });

    const ps = parts(events);
    const firstSource = ps.findIndex((p) => p.type === 'source');
    const firstCited = ps.findIndex((p) => p.type === 'text' && p.citations.length > 0);
    expect(firstSource).toBeGreaterThanOrEqual(0);
    expect(firstCited).toBeGreaterThan(firstSource);
    expect(ps.findIndex((p) => p.type === 'memory_saved')).toBeGreaterThan(firstCited);

    for (const p of ps) {
      const visible = p.type === 'task_link' ? { ...p, taskKey: '' } : p;
      expect(JSON.stringify(visible)).not.toMatch(LEAK);
    }

    const start = events[0]!.data as { assistantMessageId: string };
    const row = await db.guideMessage.findUniqueOrThrow({ where: { id: start.assistantMessageId } });
    expect(row.status).toBe('complete');
    expect(row.parts).toEqual(ps);
    // Mock calls use no tokens, so the cost is the one web search the live step reported
    expect(row.meta).toMatchObject({ ms: { total: expect.any(Number) }, steps: expect.arrayContaining(['answer']), costCents: 1 });
    // Each released sentence with the passage text it cited, for the accuracy judge
    const claims = (row.meta as { claims: { text: string; cited: string[] }[] }).claims;
    expect(claims.map((c) => c.text)).toEqual(ps.flatMap((p) => (p.type === 'text' ? [p.text] : [])));
    expect(claims.some((c) => c.cited.length === 1 && c.cited[0]!.length > 0)).toBe(true);
    expect(await db.guideMemory.count({ where: { userId } })).toBe(1);
  });

  test.each([[''], ['   '], ['x'.repeat(2001)]])('rejects text %# with 400 and writes nothing', async (text) => {
    const res = await ask(text);
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toBe('VALIDATION_ERROR');
    expect(await db.guideMessage.count({ where: { conversation: { userId } } })).toBe(0);
  });

  test('a second question while one is streaming gets 409 GUIDE_BUSY', async () => {
    const conv = await conversationId();
    const q = await db.guideMessage.create({ data: { conversationId: conv, role: 'user', text: 'q', screenKind: 'home', status: 'complete' } });
    await db.guideMessage.create({ data: { conversationId: conv, role: 'assistant', text: '', screenKind: 'home', status: 'streaming', replyToId: q.id } });
    const res = await ask('How do I get an IRD number?');
    expect(res.statusCode).toBe(409);
    expect(res.json().error).toBe('GUIDE_BUSY');
  });

  test('the 21st question of the day gets 429 CHAT_DAILY_CAP_REACHED', async () => {
    const conv = await conversationId();
    await db.guideMessage.createMany({
      data: Array.from({ length: 20 }, () => ({ conversationId: conv, role: 'user', text: 'q', screenKind: 'home', status: 'complete' })),
    });
    const res = await ask('How do I get an IRD number?');
    expect(res.statusCode).toBe(429);
    const body = res.json() as GuideCapError;
    expect(body.error).toBe('CHAT_DAILY_CAP_REACHED');
    expect(body.resetAt).toBe(nextNzMidnight(new Date()).toISOString());
  });

  test('answer failure before text: error part, failed, not counting; retry completes and counts', async () => {
    setMockAnswer(async () => {
      throw new AIFailureError('boom');
    });
    const events = parseSse((await ask('How do I get an IRD number?')).body);
    expect(parts(events)).toContainEqual({ type: 'error', code: 'AI_FAILURE', retryable: true });
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'failed' } });
    const { userMessageId, assistantMessageId } = events[0]!.data as { userMessageId: string; assistantMessageId: string };
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(false);

    setMockAnswer(null);
    const retry = await app.inject({
      method: 'POST',
      url: `/guide/messages/${assistantMessageId}/retry`,
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const again = parseSse(retry.body);
    expect(again[0]).toEqual({ event: 'start', data: { userMessageId, assistantMessageId } });
    expect(again.at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });
    expect(parts(again).some((p) => p.type === 'text')).toBe(true);
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(true);
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: assistantMessageId } })).status).toBe('complete');
  });

  test('distress then answer failure before answer text: failed, crisis text kept, question not counting', async () => {
    setMockAnswer(async () => {
      throw new AIFailureError('boom');
    });
    const events = parseSse((await ask("I can't go on, I don't know how to get an IRD number")).body);
    expect((parts(events).find((p) => p.type === 'text') as { text: string }).text).toMatch(/^Lifeline NZ/);
    expect(parts(events)).toContainEqual({ type: 'error', code: 'AI_FAILURE', retryable: true });
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'failed' } });
    const { userMessageId } = events[0]!.data as { userMessageId: string };
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(false);
  });

  test('answer failure after answer text: interrupted notice, text kept, question counts', async () => {
    setMockAnswer(async (_req, onEvent) => {
      onEvent({ type: 'text', text: 'First sentence is here. ' });
      onEvent({ type: 'block_end' });
      throw new AIFailureError('boom');
    });
    const events = parseSse((await ask('How do I get an IRD number?')).body);
    expect(parts(events)).toContainEqual({ type: 'notice', kind: 'interrupted' });
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'interrupted' } });
    const { userMessageId } = events[0]!.data as { userMessageId: string };
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(true);
  });

  test('an answer aborted by its own timeout (not by the user) ends failed, not complete', async () => {
    setMockAnswer(async () => ({ stopReason: 'aborted', usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } }));
    const events = parseSse((await ask('How do I get an IRD number?')).body);
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'failed' } });
  });

  test('a pre-answer step that never resolves ends the turn failed before the sweep', async () => {
    const turnMs = TURN_LIMITS.turnMs;
    TURN_LIMITS.turnMs = 300;
    try {
      vi.mocked(retrieve).mockImplementationOnce(() => new Promise(() => {}));
      const events = parseSse((await ask('How do I get an IRD number?')).body);
      expect(parts(events)).toContainEqual({ type: 'error', code: 'AI_FAILURE', retryable: true });
      expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'failed' } });
      const { userMessageId, assistantMessageId } = events[0]!.data as { userMessageId: string; assistantMessageId: string };
      expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(false);

      const retry = await app.inject({
        method: 'POST',
        url: `/guide/messages/${assistantMessageId}/retry`,
        headers: { Authorization: `Bearer ${jwt}` },
      });
      expect(parseSse(retry.body).at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });
    } finally {
      TURN_LIMITS.turnMs = turnMs;
    }
  });

  test('a memory save error after a full answer still completes', async () => {
    vi.mocked(remember).mockRejectedValueOnce(new Error('db down'));
    const events = parseSse((await ask('How do I get an IRD number?')).body);
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });
    expect(parts(events).some((p) => p.type === 'notice' && p.kind === 'interrupted')).toBe(false);
  });

  test('a screen taskKey over 16 characters is 400 and writes nothing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/guide/messages',
      headers: { Authorization: `Bearer ${jwt}` },
      payload: { text: 'hi', screen: { kind: 'task', taskKey: 'x'.repeat(17) } },
    });
    expect(res.statusCode).toBe(400);
    expect(await db.guideMessage.count({ where: { conversation: { userId } } })).toBe(0);
  });

  test('distress: the first text part is the Lifeline crisis text', async () => {
    const ps = parts(parseSse((await ask("I can't go on, I don't know how to get an IRD number")).body));
    const firstText = ps.find((p) => p.type === 'text') as { text: string };
    expect(firstText.text.startsWith('Lifeline NZ: 0800 543 354')).toBe(true);
  });

  test('keyword crisis text is sent before retrieve finishes, so a retrieve failure still shows it', async () => {
    vi.mocked(retrieve).mockRejectedValueOnce(new Error('embedding down'));
    const events = parseSse((await ask('Nothing is working out and I want to end my life')).body);
    expect(parts(events)).toEqual([
      { type: 'notice', kind: 'checking_guide' },
      { type: 'text', text: GUIDE_CRISIS_TEXT, citations: [] },
      { type: 'error', code: 'AI_FAILURE', retryable: true },
    ]);
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'failed' } });
    const { userMessageId } = events[0]!.data as { userMessageId: string };
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(false);
  });

  test('crisis text appears once when Haiku and the keyword check both fire', async () => {
    setMockStructured(() => ({ searchQuery: 'want to end my life', scope: 'in', redirectAgency: null, needsLive: false, distress: true, memoryCandidates: [] }));
    const ps = parts(parseSse((await ask('Nothing is working out and I want to end my life')).body));
    expect(ps.filter((p) => p.type === 'text' && p.text === GUIDE_CRISIS_TEXT)).toHaveLength(1);
  });

  test('distress out of scope gets crisis text then fixed warm copy, no answer call (spec §6.4)', async () => {
    const answer = vi.fn(async () => {
      throw new Error('answer must not be called');
    });
    setMockAnswer(answer);
    for (const agency of ['health', null] as const) {
      await db.guideConversation.deleteMany({ where: { userId } });
      setMockStructured(() => ({ searchQuery: 'feeling hopeless', scope: 'out', redirectAgency: agency, needsLive: false, distress: true, memoryCandidates: [] }));
      const events = parseSse((await ask("I feel hopeless since moving and I can't stop crying")).body);
      expect(parts(events)).toEqual([
        { type: 'notice', kind: 'checking_guide' },
        { type: 'text', text: GUIDE_CRISIS_TEXT, citations: [] },
        { type: 'text', text: GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY(agency), citations: [] },
      ]);
      expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });
      const { userMessageId } = events[0]!.data as { userMessageId: string };
      expect((await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId } })).countsTowardCap).toBe(true);
    }
    expect(answer).not.toHaveBeenCalled();
  });

  // Understand timed out: the fallback, with Haiku's distress still on its way
  const timedOut = (question: string, lateDistress: Promise<boolean>): UnderstandResult => ({
    searchQuery: question,
    scope: 'in',
    redirectAgency: null,
    needsLive: false,
    distress: false,
    memoryCandidates: [],
    usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
    lateDistress,
  });
  const isText = (text: string) => (p: ReplyPart) => p.type === 'text' && p.text === text;

  test('late distress before the answer starts sends the crisis text then', async () => {
    vi.mocked(understand).mockImplementationOnce(async (q) => timedOut(q, Promise.resolve(true)));
    const ps = parts(parseSse((await ask('How do I get an IRD number?')).body));
    const crisis = ps.findIndex(isText(GUIDE_CRISIS_TEXT));
    const firstAnswer = ps.findIndex((p) => p.type === 'text' && p.text !== GUIDE_CRISIS_TEXT);
    expect(crisis).toBeGreaterThanOrEqual(0);
    expect(firstAnswer).toBeGreaterThan(crisis);
    expect(ps.filter(isText(GUIDE_CRISIS_TEXT))).toHaveLength(1);
    expect(ps.some(isText(GUIDE_DISTRESS_CHECKIN))).toBe(false);
  });

  test('late distress with nothing found still sends the crisis text before the reply', async () => {
    vi.mocked(understand).mockImplementationOnce(async (q) => timedOut(q, Promise.resolve(true)));
    vi.mocked(retrieve).mockResolvedValueOnce({ passages: [], candidates: [] });
    vi.mocked(liveSources).mockResolvedValueOnce({ passages: [], unavailable: true, searches: 0, usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } });
    const texts = parts(parseSse((await ask('How do I get an IRD number?')).body)).flatMap((p) => (p.type === 'text' ? [p.text] : []));
    expect(texts[0]).toBe(GUIDE_CRISIS_TEXT);
    expect(texts[1]).toMatch(/^I couldn't find this in checked sources/);
  });

  test('late distress after the answer started ends the reply with the 1737 check-in', async () => {
    let resolveLate!: (d: boolean) => void;
    const late = new Promise<boolean>((resolve) => (resolveLate = resolve));
    vi.mocked(understand).mockImplementationOnce(async (q) => timedOut(q, late));
    setMockAnswer(async (_req, onEvent) => {
      onEvent({ type: 'text', text: 'You can apply for an IRD number online. ' });
      onEvent({ type: 'block_end' });
      resolveLate(true);
      await new Promise((r) => setTimeout(r, 0));
      return { stopReason: 'end_turn', usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };
    });
    const events = parseSse((await ask('How do I get an IRD number?')).body);
    const texts = parts(events).filter((p) => p.type === 'text');
    expect(texts.at(-1)).toMatchObject({ text: GUIDE_DISTRESS_CHECKIN });
    expect(texts.some(isText(GUIDE_CRISIS_TEXT))).toBe(false);
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });
  });

  test('out of scope: a fixed redirect and no answer call', async () => {
    setMockStructured(() => ({ searchQuery: 'visa appeal', scope: 'out', redirectAgency: 'immigration', needsLive: false, distress: false, memoryCandidates: [] }));
    setMockAnswer(async () => {
      throw new Error('answer must not be called');
    });
    const events = parseSse((await ask('Should I appeal my visa decision?')).body);
    const texts = parts(events).filter((p) => p.type === 'text');
    expect(texts).toHaveLength(1);
    expect((texts[0] as { text: string }).text).toContain('iaa.govt.nz');
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'complete' } });
  });
});

describe('turnCostCents', () => {
  test('prices understand on Haiku, answer and search tokens on the configured model, plus 1 cent per search', () => {
    const million = { input: 1e6, output: 1e6, cacheRead: 1e6, cacheWrite: 0 };
    const none = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    expect(turnCostCents({ understand: million, model: none, searches: 0 }, 'claude-sonnet-5-5')).toBeCloseTo(61);
    expect(turnCostCents({ understand: none, model: million, searches: 2 }, 'claude-sonnet-5-5')).toBeCloseTo(1222);
    expect(turnCostCents({ understand: none, model: million, searches: 0 }, 'claude-haiku-5-5')).toBeCloseTo(61);
  });

  test('prices cache-write tokens at 1.25x input (5-minute cache)', () => {
    const none = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
    const written = { ...none, cacheWrite: 1e6 };
    expect(turnCostCents({ understand: none, model: written, searches: 0 }, 'claude-sonnet-5-5')).toBeCloseTo(250);
    expect(turnCostCents({ understand: written, model: none, searches: 0 }, 'claude-sonnet-5-5')).toBeCloseTo(12.5);
  });
});

describe('POST /guide/messages/:id/cancel', () => {
  test("another user's message is 404", async () => {
    const conv = await conversationId();
    const q = await db.guideMessage.create({ data: { conversationId: conv, role: 'user', text: 'q', screenKind: 'home', status: 'complete' } });
    const a = await db.guideMessage.create({ data: { conversationId: conv, role: 'assistant', text: '', screenKind: 'home', status: 'streaming', replyToId: q.id } });
    const res = await app.inject({ method: 'POST', url: `/guide/messages/${a.id}/cancel`, headers: { Authorization: `Bearer ${otherJwt}` } });
    expect(res.statusCode).toBe(404);
    expect(res.json().error).toBe('MESSAGE_NOT_FOUND');
  });

  test('cancel of a streaming row with no running stream (after a restart) marks it cancelled and frees the user', async () => {
    const conv = await conversationId();
    const q = await db.guideMessage.create({ data: { conversationId: conv, role: 'user', text: 'q', screenKind: 'home', status: 'complete' } });
    const a = await db.guideMessage.create({ data: { conversationId: conv, role: 'assistant', text: '', screenKind: 'home', status: 'streaming', replyToId: q.id } });
    const res = await app.inject({ method: 'POST', url: `/guide/messages/${a.id}/cancel`, headers: { Authorization: `Bearer ${jwt}` } });
    expect(res.statusCode).toBe(204);
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: a.id } })).status).toBe('cancelled');
    expect((await ask('How do I get an IRD number?')).statusCode).toBe(200);
  });

  test('distress then cancel before answer text: cancelled, question not counting (crisis text is free)', async () => {
    let reached!: () => void;
    const atAnswer = new Promise<void>((resolve) => (reached = resolve));
    setMockAnswer(async (_req, _onEvent, signal) => {
      reached();
      await new Promise((resolve) => signal!.addEventListener('abort', resolve));
      return { stopReason: 'aborted', usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };
    });
    const pending = ask("I can't go on, I don't know how to get an IRD number");
    await atAnswer;
    const row = await db.guideMessage.findFirstOrThrow({ where: { conversation: { userId }, role: 'assistant', status: 'streaming' } });
    await app.inject({ method: 'POST', url: `/guide/messages/${row.id}/cancel`, headers: { Authorization: `Bearer ${jwt}` } });
    expect(parseSse((await pending).body).at(-1)).toMatchObject({ event: 'done', data: { status: 'cancelled' } });
    expect((await db.guideMessage.findUniqueOrThrow({ where: { id: row.replyToId! } })).countsTowardCap).toBe(false);
  });

  test('cancel mid-answer ends the stream as cancelled and keeps sent text', async () => {
    let reached!: () => void;
    const atAnswer = new Promise<void>((resolve) => (reached = resolve));
    setMockAnswer(async (_req, onEvent, signal) => {
      onEvent({ type: 'text', text: 'First sentence is here. ' });
      onEvent({ type: 'block_end' });
      reached();
      await new Promise((resolve) => signal!.addEventListener('abort', resolve));
      return { stopReason: 'aborted', usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 } };
    });
    const pending = ask('How do I get an IRD number?');
    await atAnswer;
    const row = await db.guideMessage.findFirst({ where: { conversation: { userId }, role: 'assistant', status: 'streaming' } });
    const cancel = await app.inject({ method: 'POST', url: `/guide/messages/${row!.id}/cancel`, headers: { Authorization: `Bearer ${jwt}` } });
    expect(cancel.statusCode).toBe(204);
    const events = parseSse((await pending).body);
    expect(events.at(-1)).toMatchObject({ event: 'done', data: { status: 'cancelled' } });
    const saved = await db.guideMessage.findUniqueOrThrow({ where: { id: row!.id } });
    expect(saved.status).toBe('cancelled');
    expect(saved.text).toBe('First sentence is here.');
  });
});
