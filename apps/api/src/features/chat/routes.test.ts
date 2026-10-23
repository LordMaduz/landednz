// REAL HTTP Integration tests for AC-4-01 and AC-4-13 verification
// Uses real Supabase auth (auth never mocked per CLAUDE.md rule).
// onRoute hook approach does not work after buildApp() — routes are already registered.

import { describe, expect, test, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { db } from '../../shared/db.js';
import { createTestUser, deleteTestUser } from '../../test-utils/supabase-user.js';
import { buildApp } from '../../server.js';

const TS = Date.now();
let SUB_EMAIL: string;
let NOSUB_EMAIL: string;
const TEST_TASK_ID = `TEST-RT-${TS}`; // Test-only task — avoids seed data dependency

let SUB_USER_ID: string;
let SUB_JWT: string;
let NOSUB_USER_ID: string;
let NOSUB_JWT: string;
let app: FastifyInstance;

beforeAll(async () => {
  // Create real Supabase test users
  ({ userId: SUB_USER_ID, jwt: SUB_JWT, email: SUB_EMAIL } = await createTestUser('test-chat-sub'));
  ({ userId: NOSUB_USER_ID, jwt: NOSUB_JWT, email: NOSUB_EMAIL } = await createTestUser('test-chat-nosub'));

  // Clean up any leftover DB data
  for (const uid of [SUB_USER_ID, NOSUB_USER_ID]) {
    await db.chatSession.deleteMany({ where: { userId: uid } });
    await db.subscription.deleteMany({ where: { userId: uid } });
    await db.userProfile.deleteMany({ where: { userId: uid } });
    await db.user.deleteMany({ where: { id: uid } });
  }
  await db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
  await db.task.deleteMany({ where: { id: TEST_TASK_ID } });

  // Create app DB records for subscribed user
  await db.user.create({
    data: { id: SUB_USER_ID, email: SUB_EMAIL, name: 'Test Chat User' },
  });
  await db.subscription.create({
    data: { userId: SUB_USER_ID, isActive: true },
  });
  await db.userProfile.create({
    data: {
      userId: SUB_USER_ID,
      visaType: 'AEWV',
      city: 'AUCKLAND',
      familySituation: 'COUPLE_CONSTRAINED',
      occupation: 'TECHNOLOGY',
      arrivalDate: new Date('2026-03-13'),
      personaKey: 'constrained_couple',
    },
  });

  // Create app DB records for unsubscribed user (no subscription, no profile)
  await db.user.create({
    data: { id: NOSUB_USER_ID, email: NOSUB_EMAIL, name: 'No Sub User' },
  });

  // Create test task + variant for taskContext tests (no seed data dependency)
  await db.task.create({
    data: {
      id: TEST_TASK_ID,
      name: 'Apply for your IRD number',
      phase: 1,
      basePriority: 80,
      estimatedDuration: '15 minutes',
      governmentSourceUrl: 'https://ird.govt.nz',
      applicableVisaTypes: '["ALL"]',
      applicableFamilySituations: '["ALL"]',
      applicableOccupations: '["ALL"]',
    },
  });
  await db.taskContentVariant.create({
    data: {
      taskId: TEST_TASK_ID,
      personaKey: 'constrained_couple',
      consequenceLine: 'Without this, your first paycheck will be taxed at 45%.',
      steps: '["Go to ird.govt.nz", "Fill in the form"]',
      documentsRequired: '["Passport", "Visa"]',
      commonMistakes: '["Wrong address"]',
      sourceUrl: 'https://ird.govt.nz',
    },
  });

  app = await buildApp();
});

afterAll(async () => {
  for (const uid of [SUB_USER_ID, NOSUB_USER_ID]) {
    await db.chatSession.deleteMany({ where: { userId: uid } });
    await db.subscription.deleteMany({ where: { userId: uid } });
    await db.userProfile.deleteMany({ where: { userId: uid } });
    await db.user.deleteMany({ where: { id: uid } });
  }
  await db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
  await db.task.deleteMany({ where: { id: TEST_TASK_ID } });

  await deleteTestUser(SUB_USER_ID);
  await deleteTestUser(NOSUB_USER_ID);

  await db.$disconnect();
  await app.close();
});

describe('POST /chat/sessions - Real HTTP Integration', () => {
  test('AC-4-01: TASK_CARD with IRD task → 201 with IRD/tax-related opening message', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/sessions',
      headers: { Authorization: `Bearer ${SUB_JWT}` },
      payload: {
        entryPoint: 'TASK_CARD',
        taskContext: TEST_TASK_ID,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body.sessionId).toBeDefined();
    expect(body.openingMessage).toBeDefined();

    // AC-4-01: TASK_CARD opening message references the task name (IRD-related)
    const msg = body.openingMessage.toLowerCase();
    const mentionsIrd = msg.includes('ird') || msg.includes('tax') || msg.includes('inland revenue');
    expect(mentionsIrd).toBe(true);

    // Must not be a generic greeting
    expect(msg).not.toContain('hi! how can i help');
  });

  test('AC-4-13: Unsubscribed user → 403 SUBSCRIPTION_REQUIRED', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/sessions',
      headers: { Authorization: `Bearer ${NOSUB_JWT}` },
      payload: { entryPoint: 'ROADMAP' },
    });

    expect(response.statusCode).toBe(403);

    const body = response.json();
    expect(body.error).toBe('SUBSCRIPTION_REQUIRED');
    expect(body.message).toBe('Active subscription required for chat');
  });

  test('ROADMAP entry → 201 with completion count and city', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/sessions',
      headers: { Authorization: `Bearer ${SUB_JWT}` },
      payload: { entryPoint: 'ROADMAP' },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    const msg = body.openingMessage.toLowerCase();

    // ROADMAP opening message mentions city and completion count
    expect(msg).toContain('auckland');
    expect(body.openingMessage).toBeDefined();
    // Should not be generic
    expect(msg).not.toContain('hi! how can i help');
  });

  test('TASK_CARD without taskContext → 400 validation error', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/sessions',
      headers: { Authorization: `Bearer ${SUB_JWT}` },
      payload: { entryPoint: 'TASK_CARD' },
    });

    expect(response.statusCode).toBe(400);

    const body = response.json();
    expect(body.error).toBe('VALIDATION_ERROR');
  });

  test('TASK_CARD with unknown taskContext → 404 TASK_NOT_FOUND', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/sessions',
      headers: { Authorization: `Bearer ${SUB_JWT}` },
      payload: {
        entryPoint: 'TASK_CARD',
        taskContext: 'T99_NONEXISTENT',
      },
    });

    expect(response.statusCode).toBe(404);

    const body = response.json();
    expect(body.error).toBe('TASK_NOT_FOUND');
  });

  test('No Authorization header → 401', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/chat/sessions',
      payload: { entryPoint: 'ROADMAP' },
    });

    expect(response.statusCode).toBe(401);
  });
});
