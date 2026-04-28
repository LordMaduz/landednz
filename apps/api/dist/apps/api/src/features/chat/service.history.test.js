"use strict";
// AC-4-14: Conversation history included on subsequent turns
// Verifies that streamMessage() receives full conversation history (prior exchanges + current user message)
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Module-level mock: capture messages argument passed to streamMessage
vitest_1.vi.mock('../../shared/ai/claude.client', () => ({
    streamMessage: vitest_1.vi.fn(),
}));
const db_1 = require("../../shared/db");
const server_1 = require("../../server");
const claude_client_1 = require("../../shared/ai/claude.client");
// Get reference to the mocked function
const mockStreamMessage = vitest_1.vi.mocked(claude_client_1.streamMessage);
const TS = Date.now();
const TEST_EMAIL = `test-history-${TS}@example.com`;
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
            name: 'Test History User',
        },
    });
    // Active subscription (chat is premium)
    await db_1.db.subscription.create({
        data: {
            userId: TEST_USER_ID,
            isActive: true,
        },
    });
    // User profile (required for system prompt)
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
(0, vitest_1.describe)('AC-4-14: Conversation history included on subsequent turns', () => {
    (0, vitest_1.test)('AC-4-14: Full conversation history passed to streamMessage on turn 2', async () => {
        // Pre-seed DB with a prior exchange (simulates completed turn 1)
        // Use timestamps that are definitely before the current request
        const baseTime = new Date(Date.now() - 60000); // 1 minute ago
        await db_1.db.chatMessage.createMany({
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(response.headers['content-type']).toBe('text/event-stream');
        // streamMessage should have been called once
        (0, vitest_1.expect)(mockStreamMessage).toHaveBeenCalledTimes(1);
        // Extract the messages argument (second parameter)
        const callArgs = mockStreamMessage.mock.calls[0];
        (0, vitest_1.expect)(callArgs).toHaveLength(3); // systemPrompt, messages, onChunk
        const systemPrompt = callArgs[0];
        const messages = callArgs[1];
        // Verify system prompt is a string (not testing its content here)
        (0, vitest_1.expect)(typeof systemPrompt).toBe('string');
        (0, vitest_1.expect)(systemPrompt.length).toBeGreaterThan(0);
        // AC-4-14 assertion: messages array contains full conversation history
        (0, vitest_1.expect)(messages).toHaveLength(3);
        // Verify correct chronological order and content:
        // Turn 1 user message (pre-seeded)
        (0, vitest_1.expect)(messages[0]).toEqual({
            role: 'user',
            content: 'What is an IRD number?',
        });
        // Turn 1 assistant message (pre-seeded)
        (0, vitest_1.expect)(messages[1]).toEqual({
            role: 'assistant',
            content: 'An IRD number is your tax identifier in New Zealand. It\'s issued by Inland Revenue.',
        });
        // Turn 2 user message (current request)
        (0, vitest_1.expect)(messages[2]).toEqual({
            role: 'user',
            content: 'How do I apply for one?',
        });
        // Verify conversation flows correctly: user → assistant → user
        (0, vitest_1.expect)(messages[0].role).toBe('user');
        (0, vitest_1.expect)(messages[1].role).toBe('assistant');
        (0, vitest_1.expect)(messages[2].role).toBe('user');
    }, 10000);
    (0, vitest_1.test)('AC-4-14: Empty session (first turn) has only current user message', async () => {
        // Create a new session for this test (clean slate)
        const newSession = await db_1.db.chatSession.create({
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        (0, vitest_1.expect)(mockStreamMessage).toHaveBeenCalledTimes(2); // This is the second call total
        // Check the latest call (index 1)
        const callArgs = mockStreamMessage.mock.calls[1];
        const messages = callArgs[1];
        // First turn: only the current user message
        (0, vitest_1.expect)(messages).toHaveLength(1);
        (0, vitest_1.expect)(messages[0]).toEqual({
            role: 'user',
            content: 'Hello, I need help with my settlement.',
        });
        // Clean up the new session
        await db_1.db.chatMessage.deleteMany({ where: { sessionId: newSession.id } });
        await db_1.db.chatSession.delete({ where: { id: newSession.id } });
    }, 10000);
});
//# sourceMappingURL=service.history.test.js.map