// AC-4-14: Conversation history included on subsequent turns
// Verifies that streamMessage() receives full conversation history (prior exchanges + current user message)

import { describe, expect, test, beforeAll, afterAll, vi } from 'vitest';

// Module-level mock: capture messages argument passed to streamMessage
vi.mock('../../shared/ai/claude.client', () => ({
  streamMessage: vi.fn(),
}));

import { FastifyInstance } from 'fastify';
import { db } from '../../shared/db';
import { buildApp } from '../../server';
import { streamMessage } from '../../shared/ai/claude.client';

// Get reference to the mocked function
const mockStreamMessage = vi.mocked(streamMessage);

const TS = Date.now();
const TEST_EMAIL = `test-history-${TS}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
let TEST_USER_ID: string;
let TEST_JWT_TOKEN: string;
let TEST_SESSION_ID: string;
let app: FastifyInstance;

async function createSupabaseTestUser() {
  const signUpResponse = await fetch('http://127.0.0.1:54321/auth/v1/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });

  if (!signUpResponse.ok) {
    throw new Error(`Failed to create test user: ${signUpResponse.status}`);
  }

  const signUpData = await signUpResponse.json();
  TEST_USER_ID = signUpData.user.id;
  TEST_JWT_TOKEN = signUpData.access_token;
}

async function deleteSupabaseTestUser() {
  try {
    await fetch(`http://127.0.0.1:54321/auth/v1/admin/users/${TEST_USER_ID}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${TEST_JWT_TOKEN}`,
        'apikey': 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
      },
    });
  } catch (error) {
    console.warn('Failed to delete Supabase test user:', error);
  }
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
      name: 'Test History User',
    },
  });

  // Active subscription (chat is premium)
  await db.subscription.create({
    data: {
      userId: TEST_USER_ID,
      isActive: true,
    },
  });

  // User profile (required for system prompt)
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

  app = buildApp();
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

describe('AC-4-14: Conversation history included on subsequent turns', () => {
  test('AC-4-14: Full conversation history passed to streamMessage on turn 2', async () => {
    // Pre-seed DB with a prior exchange (simulates completed turn 1)
    // Use timestamps that are definitely before the current request
    const baseTime = new Date(Date.now() - 60000); // 1 minute ago
    await db.chatMessage.createMany({
      data: [
        {
          sessionId: TEST_SESSION_ID,
          role: 'USER',
          content: 'What is an IRD number?',
          createdAt: new Date(baseTime.getTime()),
        },
        {
          sessionId: TEST_SESSION_ID,
          role: 'ASSISTANT',
          content: 'An IRD number is your tax identifier in New Zealand. It\'s issued by Inland Revenue.',
          createdAt: new Date(baseTime.getTime() + 1000),
        },
      ],
    });

    // Mock streamMessage to resolve successfully and capture arguments
    mockStreamMessage.mockResolvedValueOnce(undefined);

    // Send turn 2 message
    const response = await app.inject({
      method: 'POST',
      url: `/chat/sessions/${TEST_SESSION_ID}/messages`,
      headers: {
        Authorization: `Bearer ${TEST_JWT_TOKEN}`,
      },
      payload: {
        content: 'How do I apply for one?',
      },
    });

    // Should receive SSE response (test focuses on backend processing)
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toBe('text/event-stream');

    // streamMessage should have been called once
    expect(mockStreamMessage).toHaveBeenCalledTimes(1);

    // Extract the messages argument (second parameter)
    const callArgs = mockStreamMessage.mock.calls[0];
    expect(callArgs).toHaveLength(3); // systemPrompt, messages, onChunk

    const systemPrompt = callArgs[0] as string;
    const messages = callArgs[1] as Array<{ role: string; content: string }>;

    // Verify system prompt is a string (not testing its content here)
    expect(typeof systemPrompt).toBe('string');
    expect(systemPrompt.length).toBeGreaterThan(0);

    // AC-4-14 assertion: messages array contains full conversation history
    expect(messages).toHaveLength(3);

    // Verify correct chronological order and content:

    // Turn 1 user message (pre-seeded)
    expect(messages[0]).toEqual({
      role: 'user',
      content: 'What is an IRD number?',
    });

    // Turn 1 assistant message (pre-seeded)
    expect(messages[1]).toEqual({
      role: 'assistant',
      content: 'An IRD number is your tax identifier in New Zealand. It\'s issued by Inland Revenue.',
    });

    // Turn 2 user message (current request)
    expect(messages[2]).toEqual({
      role: 'user',
      content: 'How do I apply for one?',
    });

    // Verify conversation flows correctly: user → assistant → user
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('assistant');
    expect(messages[2].role).toBe('user');
  }, 10000);

  test('AC-4-14: Empty session (first turn) has only current user message', async () => {
    // Create a new session for this test (clean slate)
    const newSession = await db.chatSession.create({
      data: {
        userId: TEST_USER_ID,
        entryPoint: 'NAVIGATION',
      },
    });

    mockStreamMessage.mockResolvedValueOnce(undefined);

    const response = await app.inject({
      method: 'POST',
      url: `/chat/sessions/${newSession.id}/messages`,
      headers: {
        Authorization: `Bearer ${TEST_JWT_TOKEN}`,
      },
      payload: {
        content: 'Hello, I need help with my settlement.',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(mockStreamMessage).toHaveBeenCalledTimes(2); // This is the second call total

    // Check the latest call (index 1)
    const callArgs = mockStreamMessage.mock.calls[1];
    const messages = callArgs[1] as Array<{ role: string; content: string }>;

    // First turn: only the current user message
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({
      role: 'user',
      content: 'Hello, I need help with my settlement.',
    });

    // Clean up the new session
    await db.chatMessage.deleteMany({ where: { sessionId: newSession.id } });
    await db.chatSession.delete({ where: { id: newSession.id } });
  }, 10000);
});