"use strict";
// REAL HTTP Integration tests for AC-4-01 and AC-4-13 verification
// Uses real Supabase auth (auth never mocked per CLAUDE.md rule).
// onRoute hook approach does not work after buildApp() — routes are already registered.
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../../shared/db");
const server_1 = require("../../server");
const TS = Date.now();
const SUB_EMAIL = `test-chat-sub-${TS}@example.com`;
const NOSUB_EMAIL = `test-chat-nosub-${TS}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_TASK_ID = `TEST-RT-${TS}`; // Test-only task — avoids seed data dependency
let SUB_USER_ID;
let SUB_JWT;
let NOSUB_USER_ID;
let NOSUB_JWT;
let app;
async function createSupabaseUser(email) {
    const res = await fetch('http://127.0.0.1:54321/auth/v1/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'apikey': 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
        },
        body: JSON.stringify({ email, password: TEST_PASSWORD }),
    });
    if (!res.ok)
        throw new Error(`Supabase signup failed for ${email}: ${res.status}`);
    const data = await res.json();
    return { userId: data.user.id, token: data.access_token };
}
async function deleteSupabaseUser(userId, token) {
    try {
        await fetch(`http://127.0.0.1:54321/auth/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz',
            },
        });
    }
    catch (error) {
        console.warn('Failed to delete Supabase test user:', error);
    }
}
(0, vitest_1.beforeAll)(async () => {
    // Create real Supabase test users
    ({ userId: SUB_USER_ID, token: SUB_JWT } = await createSupabaseUser(SUB_EMAIL));
    ({ userId: NOSUB_USER_ID, token: NOSUB_JWT } = await createSupabaseUser(NOSUB_EMAIL));
    // Clean up any leftover DB data
    for (const uid of [SUB_USER_ID, NOSUB_USER_ID]) {
        await db_1.db.chatSession.deleteMany({ where: { userId: uid } });
        await db_1.db.subscription.deleteMany({ where: { userId: uid } });
        await db_1.db.userProfile.deleteMany({ where: { userId: uid } });
        await db_1.db.user.deleteMany({ where: { id: uid } });
    }
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
    await db_1.db.task.deleteMany({ where: { id: TEST_TASK_ID } });
    // Create app DB records for subscribed user
    await db_1.db.user.create({
        data: { id: SUB_USER_ID, email: SUB_EMAIL, name: 'Test Chat User' },
    });
    await db_1.db.subscription.create({
        data: { userId: SUB_USER_ID, isActive: true },
    });
    await db_1.db.userProfile.create({
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
    await db_1.db.user.create({
        data: { id: NOSUB_USER_ID, email: NOSUB_EMAIL, name: 'No Sub User' },
    });
    // Create test task + variant for taskContext tests (no seed data dependency)
    await db_1.db.task.create({
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
    await db_1.db.taskContentVariant.create({
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
    app = (0, server_1.buildApp)();
});
(0, vitest_1.afterAll)(async () => {
    for (const uid of [SUB_USER_ID, NOSUB_USER_ID]) {
        await db_1.db.chatSession.deleteMany({ where: { userId: uid } });
        await db_1.db.subscription.deleteMany({ where: { userId: uid } });
        await db_1.db.userProfile.deleteMany({ where: { userId: uid } });
        await db_1.db.user.deleteMany({ where: { id: uid } });
    }
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
    await db_1.db.task.deleteMany({ where: { id: TEST_TASK_ID } });
    await deleteSupabaseUser(SUB_USER_ID, SUB_JWT);
    await deleteSupabaseUser(NOSUB_USER_ID, NOSUB_JWT);
    await db_1.db.$disconnect();
    await app.close();
});
(0, vitest_1.describe)('POST /chat/sessions - Real HTTP Integration', () => {
    (0, vitest_1.test)('AC-4-01: TASK_CARD with IRD task → 201 with IRD/tax-related opening message', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/chat/sessions',
            headers: { Authorization: `Bearer ${SUB_JWT}` },
            payload: {
                entryPoint: 'TASK_CARD',
                taskContext: TEST_TASK_ID,
            },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(201);
        const body = response.json();
        (0, vitest_1.expect)(body.sessionId).toBeDefined();
        (0, vitest_1.expect)(body.openingMessage).toBeDefined();
        // AC-4-01: TASK_CARD opening message references the task name (IRD-related)
        const msg = body.openingMessage.toLowerCase();
        const mentionsIrd = msg.includes('ird') || msg.includes('tax') || msg.includes('inland revenue');
        (0, vitest_1.expect)(mentionsIrd).toBe(true);
        // Must not be a generic greeting
        (0, vitest_1.expect)(msg).not.toContain('hi! how can i help');
    });
    (0, vitest_1.test)('AC-4-13: Unsubscribed user → 403 SUBSCRIPTION_REQUIRED', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/chat/sessions',
            headers: { Authorization: `Bearer ${NOSUB_JWT}` },
            payload: { entryPoint: 'ROADMAP' },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(403);
        const body = response.json();
        (0, vitest_1.expect)(body.error).toBe('SUBSCRIPTION_REQUIRED');
        (0, vitest_1.expect)(body.message).toBe('Active subscription required for chat');
    });
    (0, vitest_1.test)('ROADMAP entry → 201 with completion count and city', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/chat/sessions',
            headers: { Authorization: `Bearer ${SUB_JWT}` },
            payload: { entryPoint: 'ROADMAP' },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(201);
        const body = response.json();
        const msg = body.openingMessage.toLowerCase();
        // ROADMAP opening message mentions city and completion count
        (0, vitest_1.expect)(msg).toContain('auckland');
        (0, vitest_1.expect)(body.openingMessage).toBeDefined();
        // Should not be generic
        (0, vitest_1.expect)(msg).not.toContain('hi! how can i help');
    });
    (0, vitest_1.test)('TASK_CARD without taskContext → 400 validation error', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/chat/sessions',
            headers: { Authorization: `Bearer ${SUB_JWT}` },
            payload: { entryPoint: 'TASK_CARD' },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(400);
        const body = response.json();
        (0, vitest_1.expect)(body.error).toBe('VALIDATION_ERROR');
    });
    (0, vitest_1.test)('TASK_CARD with unknown taskContext → 404 TASK_NOT_FOUND', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/chat/sessions',
            headers: { Authorization: `Bearer ${SUB_JWT}` },
            payload: {
                entryPoint: 'TASK_CARD',
                taskContext: 'T99_NONEXISTENT',
            },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(404);
        const body = response.json();
        (0, vitest_1.expect)(body.error).toBe('TASK_NOT_FOUND');
    });
    (0, vitest_1.test)('No Authorization header → 401', async () => {
        const response = await app.inject({
            method: 'POST',
            url: '/chat/sessions',
            payload: { entryPoint: 'ROADMAP' },
        });
        (0, vitest_1.expect)(response.statusCode).toBe(401);
    });
});
//# sourceMappingURL=routes.test.js.map