"use strict";
// AC-4-11: AIFailureError → SSE error event, not 500 crash
// Mocks streamMessage to throw AIFailureError deterministically.
// Real Supabase auth + real DB (auth is never mocked per CLAUDE.md rule).
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const errors_1 = require("../../shared/errors");
// Module-level mock: force streamMessage to always throw AIFailureError
vitest_1.vi.mock('../../shared/ai/claude.client', () => ({
    streamMessage: vitest_1.vi.fn().mockRejectedValue(new errors_1.AIFailureError('Anthropic API failed: 401 Unauthorized')),
}));
const db_1 = require("../../shared/db");
const server_1 = require("../../server");
const TS = Date.now();
const TEST_EMAIL = `test-ai-failure-${TS}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
let TEST_USER_ID;
let TEST_JWT_TOKEN;
let TEST_SESSION_ID;
let app;
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
    }
    catch (error) {
        console.warn('Failed to delete Supabase test user:', error);
    }
}
(0, vitest_1.beforeAll)(async () => {
    await createSupabaseTestUser();
    // Clean up any leftover data
    await db_1.db.chatMessage.deleteMany({ where: { session: { userId: TEST_USER_ID } } });
    await db_1.db.chatSession.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.user.deleteMany({ where: { id: TEST_USER_ID } });
    // Create user in app DB
    await db_1.db.user.create({
        data: {
            id: TEST_USER_ID,
            email: TEST_EMAIL,
            name: 'Test AI Failure User',
        },
    });
    // Active subscription (chat is premium)
    await db_1.db.subscription.create({
        data: {
            userId: TEST_USER_ID,
            isActive: true,
        },
    });
    // User profile (required by sendMessage for system prompt construction)
    await db_1.db.userProfile.create({
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
    const session = await db_1.db.chatSession.create({
        data: {
            userId: TEST_USER_ID,
            entryPoint: 'TASK_CARD',
            taskContext: 'T08',
        },
    });
    TEST_SESSION_ID = session.id;
    app = (0, server_1.buildApp)();
});
(0, vitest_1.afterAll)(async () => {
    await db_1.db.chatMessage.deleteMany({ where: { session: { userId: TEST_USER_ID } } });
    await db_1.db.chatSession.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.subscription.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.user.deleteMany({ where: { id: TEST_USER_ID } });
    await deleteSupabaseTestUser();
    await db_1.db.$disconnect();
    await app.close();
});
(0, vitest_1.describe)('AC-4-11: AIFailureError → SSE error event (streamMessage mocked to throw)', () => {
    (0, vitest_1.test)('AC-4-11: AIFailureError produces SSE error event — not a 500 crash', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.headers['content-type']).toBe('text/event-stream');
        // Parse SSE events
        const events = response.body
            .split('\n\n')
            .filter((chunk) => chunk.startsWith('data: ') && chunk.trim() !== 'data: ')
            .map((chunk) => JSON.parse(chunk.substring(6)));
        // Exactly one event — the error event
        (0, vitest_1.expect)(events).toHaveLength(1);
        // Event matches the spec exactly: {"type":"error","message":"AI service unavailable"}
        (0, vitest_1.expect)(events[0]).toEqual({ type: 'error', message: 'AI service unavailable' });
    }, 10000);
    (0, vitest_1.test)('AC-4-11: Error event is in-stream — not a raw SDK error or unhandled rejection', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const events = response.body
            .split('\n\n')
            .filter((chunk) => chunk.startsWith('data: ') && chunk.trim() !== 'data: ')
            .map((chunk) => JSON.parse(chunk.substring(6)));
        // No raw SDK error, no 500, no unhandled event type — only the typed error event
        events.forEach((event) => {
            (0, vitest_1.expect)(['chunk', 'done', 'error']).toContain(event.type);
        });
        const errorEvents = events.filter((e) => e.type === 'error');
        (0, vitest_1.expect)(errorEvents).toHaveLength(1);
        (0, vitest_1.expect)(errorEvents[0].message).toBe('AI service unavailable');
    }, 10000);
});
//# sourceMappingURL=service.ai-failure.test.js.map