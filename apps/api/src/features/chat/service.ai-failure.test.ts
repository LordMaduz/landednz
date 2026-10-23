// AC-4-11: AIFailureError → SSE error event, not 500 crash
// Mocks streamMessage to throw AIFailureError deterministically.
// Real Supabase auth + real DB (auth is never mocked per CLAUDE.md rule).

import { describe, expect, test, beforeAll, afterAll, vi } from 'vitest';
import { AIFailureError } from '../../shared/errors.js';

// Module-level mock: force streamMessage to always throw AIFailureError
vi.mock('../../shared/ai/claude.client', () => ({
  streamMessage: vi.fn().mockRejectedValue(
    new AIFailureError('Anthropic API failed: 401 Unauthorized'),
  ),
}));

import { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { buildApp } from '../../server.js';

const TS = Date.now();
let TEST_EMAIL: string;
let TEST_USER_ID: string;
let TEST_JWT_TOKEN: string;
let TEST_SESSION_ID: string;
let app: FastifyInstance;

async function createSupabaseTestUser() {
  const user = await createTestUser('test-ai-failure');
  TEST_USER_ID = user.userId;
  TEST_JWT_TOKEN = user.jwt;
  TEST_EMAIL = user.email;
}

async function deleteSupabaseTestUser() {
  await deleteTestUser(TEST_USER_ID);
}

beforeAll(async () => {
  await createSupabaseTestUser();

  // Clean up any leftover data
  await db.chatMessage.deleteMany({ where: { session: { userId: TEST_USER_ID } } });
  await db.chatSession.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });

  // Create user in app DB
  await db.user.create({
    data: {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: 'Test AI Failure User',
    },
  });

  // Active subscription (chat is premium)
  await db.subscription.create({
    data: {
      userId: TEST_USER_ID,
      isActive: true,
    },
  });

  // User profile (required by sendMessage for system prompt construction)
  await db.userProfile.create({
    data: {
      userId: TEST_USER_ID,
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'TECHNOLOGY',
      arrivalDate: new Date('2026-02-01'),
      personaKey: 'constrained_couple',
    },
  });

  // Chat session
  const session = await db.chatSession.create({
    data: {
      userId: TEST_USER_ID,
      entryPoint: 'TASK_CARD',
      taskContext: 'T08',
    },
  });
  TEST_SESSION_ID = session.id;

  app = await buildApp();
});

afterAll(async () => {
  await db.chatMessage.deleteMany({ where: { session: { userId: TEST_USER_ID } } });
  await db.chatSession.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
  await db.user.deleteMany({ where: { id: TEST_USER_ID } });

  await deleteSupabaseTestUser();

  await db.$disconnect();
  await app.close();
});

describe('AC-4-11: AIFailureError → SSE error event (streamMessage mocked to throw)', () => {
  test('AC-4-11: AIFailureError produces SSE error event — not a 500 crash', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/chat/sessions/${TEST_SESSION_ID}/messages`,
      headers: {
        Authorization: `Bearer ${TEST_JWT_TOKEN}`,
      },
      payload: {
        content: 'What documents do I need for my IRD application?',
      },
    });

    // SSE stream established — status must be 200, not 500
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('text/event-stream');

    // Parse SSE events
    const events = response.body
      .split('\n\n')
      .filter((chunk: string) => chunk.startsWith('data: ') && chunk.trim() !== 'data: ')
      .map((chunk: string) => JSON.parse(chunk.substring(6)));

    // Exactly one event — the error event
    expect(events).toHaveLength(1);

    // Event matches the spec exactly: {"type":"error","message":"AI service unavailable"}
    expect(events[0]).toEqual({ type: 'error', message: 'AI service unavailable' });
  }, 10000);

  test('AC-4-11: Error event is in-stream — not a raw SDK error or unhandled rejection', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/chat/sessions/${TEST_SESSION_ID}/messages`,
      headers: {
        Authorization: `Bearer ${TEST_JWT_TOKEN}`,
      },
      payload: {
        content: 'Test second request also gets SSE error',
      },
    });

    // Status 200 on both calls — AIFailureError never escapes to global handler
    expect(response.statusCode).toBe(200);

    const events = response.body
      .split('\n\n')
      .filter((chunk: string) => chunk.startsWith('data: ') && chunk.trim() !== 'data: ')
      .map((chunk: string) => JSON.parse(chunk.substring(6)));

    // No raw SDK error, no 500, no unhandled event type — only the typed error event
    events.forEach((event: { type: string }) => {
      expect(['chunk', 'done', 'error']).toContain(event.type);
    });

    const errorEvents = events.filter((e: { type: string }) => e.type === 'error');
    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0].message).toBe('AI service unavailable');
  }, 10000);
});
