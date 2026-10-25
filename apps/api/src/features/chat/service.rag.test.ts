// Chat RAG over synced content chunks: a chunk whose `when` excludes the user is never retrieved,
// and the assistant row records the content version and item ids it used.
// Real Supabase auth + real DB; AI_MODE=mock, where identical text embeds identically.
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { buildApp } from '../../server.js';
import { buildChunks } from '../../content/chunks.js';
import { contentVersion, loadContent, useContent } from '../../content/index.js';
import { syncChunks } from '../../../scripts/sync-chunks.js';

const users: Record<'family' | 'solo', { userId: string; jwt: string; sessionId: string }> = {} as never;
let app: FastifyInstance;
let familyChunk: { chunkKey: string; content: string };

beforeAll(async () => {
  // Real bundle plus a family-only item on T08
  const bundle = await loadContent();
  const t08 = bundle.tasks.find((t) => t.id === 'T08')!;
  const item = { ...t08.steps[0]!, id: 'T08.step.test-family', text: 'Apply for an IRD number for each child too.', when: { family: ['FAMILY_WITH_CHILDREN'] } };
  useContent({ ...bundle, tasks: bundle.tasks.map((t) => (t.id === 'T08' ? { ...t, steps: [...t.steps, item] } : t)) });
  await syncChunks();
  familyChunk = buildChunks({ ...bundle, tasks: [{ ...t08, steps: [...t08.steps, item] }] }).find((c) => c.when)!;

  for (const [kind, familySituation] of [['family', 'FAMILY_WITH_CHILDREN'], ['solo', 'SOLO']] as const) {
    const { userId, jwt, email } = await createTestUser(`test-chat-rag-${kind}`);
    await db.user.create({ data: { id: userId, email } });
    await db.subscription.create({ data: { userId, isActive: true } });
    await db.userProfile.create({
      data: { userId, visaType: 'AEWV', city: 'AUCKLAND', familySituation, occupation: 'OTHER_PROFESSIONAL', arrivalDate: new Date('2026-09-01') },
    });
    const session = await db.chatSession.create({ data: { userId, entryPoint: 'NAVIGATION' } });
    users[kind] = { userId, jwt, sessionId: session.id };
  }
  app = await buildApp();
}, 60_000);

afterAll(async () => {
  for (const { userId } of Object.values(users)) {
    await db.user.deleteMany({ where: { id: userId } });
    await deleteTestUser(userId);
  }
  await loadContent();
  await syncChunks();
  await app.close();
  await db.$disconnect();
}, 60_000);

async function ask(kind: 'family' | 'solo') {
  const { jwt, sessionId } = users[kind];
  const res = await app.inject({
    method: 'POST',
    url: `/chat/sessions/${sessionId}/messages`,
    headers: { Authorization: `Bearer ${jwt}` },
    payload: { content: familyChunk.content },
  });
  expect(res.statusCode).toBe(200);
  return db.chatMessage.findFirstOrThrow({ where: { sessionId, role: 'ASSISTANT' } });
}

describe('chat RAG filters chunks by the user’s answers', () => {
  test('a family profile retrieves its family chunk; the assistant row records version and item ids', async () => {
    const message = await ask('family');
    expect(JSON.parse(message.retrievedChunks!)).toContain(familyChunk.chunkKey);
    expect(message.contentVersion).toBe(contentVersion());
    const used = JSON.parse(message.usedItemIds!) as string[];
    expect(used).toContain('T08.step.test-family');
  });

  test('a solo profile never retrieves the family chunk', async () => {
    const message = await ask('solo');
    const keys = JSON.parse(message.retrievedChunks!) as string[];
    expect(keys.length).toBeGreaterThan(0);
    expect(keys).not.toContain(familyChunk.chunkKey);
    expect(JSON.parse(message.usedItemIds!)).not.toContain('T08.step.test-family');
  });
});
