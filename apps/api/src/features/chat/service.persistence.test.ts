// AC-4-15: ChatMessage persisted both roles — retrievedChunks + guardrailFlags populated
// Verifies DB state after message processing without real Anthropic API calls.
// Real Supabase auth + real DB (auth is never mocked per CLAUDE.md rule).

import { describe, expect, test, beforeAll, afterAll, vi } from 'vitest';

// Module-level mock: streamMessage resolves immediately (no real API call)
vi.mock('../../shared/ai/claude.client', () => ({
  streamMessage: vi.fn().mockResolvedValue(undefined),
}));

import { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { buildApp } from '../../server.js';

const TS = Date.now();
let TEST_EMAIL: string;
const TEST_TASK_ID = 'TEST-P15'; // Test-specific ID — never conflicts with canonical task IDs
let TEST_USER_ID: string;
let TEST_JWT_TOKEN: string;
let TEST_SESSION_ID: string;
let app: FastifyInstance;

async function createSupabaseTestUser() {
  const user = await createTestUser('test-persistence');
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
  await db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
  await db.task.deleteMany({ where: { id: TEST_TASK_ID } });

  // Create user in app DB
  await db.user.create({
    data: {
      id: TEST_USER_ID,
      email: TEST_EMAIL,
      name: 'Test Persistence User',
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

  // Create test task + variant so kbChunks are populated when session fetches task content
  await db.task.create({
    data: {
      id: TEST_TASK_ID,
      name: 'Test Task for AC-4-15 Persistence',
      phase: 1,
      basePriority: 50,
      estimatedDuration: '15 minutes',
      governmentSourceUrl: 'https://example.govt.nz',
      applicableVisaTypes: '["ALL"]',
      applicableFamilySituations: '["ALL"]',
      applicableOccupations: '["ALL"]',
    },
  });

  await db.taskContentVariant.create({
    data: {
      taskId: TEST_TASK_ID,
      personaKey: 'constrained_couple',
      consequenceLine: 'Without this, you cannot proceed.',
      steps: '["Step 1", "Step 2"]',
      documentsRequired: '["Passport"]',
      commonMistakes: '["Missing signature"]',
      sourceUrl: 'https://example.govt.nz',
    },
  });

  // Chat session with test task context so kbChunks are populated from TaskContentVariants
  const session = await db.chatSession.create({
    data: {
      userId: TEST_USER_ID,
      entryPoint: 'TASK_CARD',
      taskContext: TEST_TASK_ID,
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
  await db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
  await db.task.deleteMany({ where: { id: TEST_TASK_ID } });

  await deleteSupabaseTestUser();

  await db.$disconnect();
  await app.close();
});

describe('AC-4-15: ChatMessage persisted both roles — retrievedChunks + guardrailFlags populated', () => {
  test('AC-4-15: Both USER and ASSISTANT ChatMessage records persisted after message', async () => {
    const response = await app.inject({
      method: 'POST',
      url: `/chat/sessions/${TEST_SESSION_ID}/messages`,
      headers: {
        Authorization: `Bearer ${TEST_JWT_TOKEN}`,
      },
      payload: {
        content: 'What documents do I need for my bank account?',
      },
    });

    expect(response.statusCode).toBe(200);

    // Query DB — both roles must exist for this session
    const messages = await db.chatMessage.findMany({
      where: { sessionId: TEST_SESSION_ID },
      orderBy: { createdAt: 'asc' },
    });

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('USER');
    expect(messages[0].content).toBe('What documents do I need for my bank account?');
    expect(messages[1].role).toBe('ASSISTANT');
  }, 10000);

  test('AC-4-15: retrievedChunks populated with real KnowledgeBaseChunk keys via RAG', async () => {
    // Query the assistant message from the previous test
    const assistantMessage = await db.chatMessage.findFirst({
      where: {
        sessionId: TEST_SESSION_ID,
        role: 'ASSISTANT',
      },
    });

    expect(assistantMessage).not.toBeNull();
    expect(assistantMessage!.retrievedChunks).not.toBeNull();

    // Parse JSON — must be a non-empty array of real KnowledgeBaseChunk chunkKeys from RAG
    const chunks = JSON.parse(assistantMessage!.retrievedChunks as string) as string[];
    expect(Array.isArray(chunks)).toBe(true);
    expect(chunks.length).toBeGreaterThanOrEqual(3);
    expect(chunks.length).toBeLessThanOrEqual(5);

    // Phase 5: real CHUNK_<taskId>_<personaKey> format from semantic search (not test task)
    chunks.forEach(key => {
      expect(key).toMatch(/^CHUNK_T\d+_/);
      expect(typeof key).toBe('string');
      expect(key.length).toBeGreaterThan(10);
    });

    // Should contain real KB chunks for "bank account" query — likely T01 or T08
    console.log('Retrieved chunks from RAG:', chunks);
  }, 30000);

  test('AC-4-15: guardrailFlags populated with CRISIS_SIGNAL when triggered', async () => {
    // Create a fresh session for this test to isolate DB state
    const crisisSession = await db.chatSession.create({
      data: {
        userId: TEST_USER_ID,
        entryPoint: 'TASK_CARD',
        taskContext: TEST_TASK_ID,
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: `/chat/sessions/${crisisSession.id}/messages`,
      headers: {
        Authorization: `Bearer ${TEST_JWT_TOKEN}`,
      },
      payload: {
        content: "I can't cope with all this",
      },
    });

    expect(response.statusCode).toBe(200);

    const assistantMessage = await db.chatMessage.findFirst({
      where: {
        sessionId: crisisSession.id,
        role: 'ASSISTANT',
      },
    });

    expect(assistantMessage).not.toBeNull();
    expect(assistantMessage!.guardrailFlags).not.toBeNull();

    const flags = JSON.parse(assistantMessage!.guardrailFlags as string) as string[];
    expect(flags).toEqual(['CRISIS_SIGNAL']);

    // Clean up crisis session
    await db.chatMessage.deleteMany({ where: { sessionId: crisisSession.id } });
    await db.chatSession.delete({ where: { id: crisisSession.id } });
  }, 10000);

  test('AC-4-15: guardrailFlags is empty array when no Level 1 flag triggers', async () => {
    // Query the assistant message from the first test (neutral message — no flags)
    const assistantMessage = await db.chatMessage.findFirst({
      where: {
        sessionId: TEST_SESSION_ID,
        role: 'ASSISTANT',
      },
    });

    expect(assistantMessage).not.toBeNull();
    expect(assistantMessage!.guardrailFlags).not.toBeNull();

    const flags = JSON.parse(assistantMessage!.guardrailFlags as string) as string[];
    expect(flags).toEqual([]);
  }, 10000);
});
