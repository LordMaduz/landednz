"use strict";
// AC-4-15: ChatMessage persisted both roles — retrievedChunks + guardrailFlags populated
// Verifies DB state after message processing without real Anthropic API calls.
// Real Supabase auth + real DB (auth is never mocked per CLAUDE.md rule).
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
// Module-level mock: streamMessage resolves immediately (no real API call)
vitest_1.vi.mock('../../shared/ai/claude.client', () => ({
    streamMessage: vitest_1.vi.fn().mockResolvedValue(undefined),
}));
const db_1 = require("../../shared/db");
const server_1 = require("../../server");
const TS = Date.now();
const TEST_EMAIL = `test-persistence-${TS}@example.com`;
const TEST_PASSWORD = 'TestPassword123!';
const TEST_TASK_ID = 'TEST-P15'; // Test-specific ID — never conflicts with canonical task IDs
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
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
    await db_1.db.task.deleteMany({ where: { id: TEST_TASK_ID } });
    // Create user in app DB
    await db_1.db.user.create({
        data: {
            id: TEST_USER_ID,
            email: TEST_EMAIL,
            name: 'Test Persistence User',
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
    // Create test task + variant so kbChunks are populated when session fetches task content
    await db_1.db.task.create({
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
    await db_1.db.taskContentVariant.create({
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
    const session = await db_1.db.chatSession.create({
        data: {
            userId: TEST_USER_ID,
            entryPoint: 'TASK_CARD',
            taskContext: TEST_TASK_ID,
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
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: TEST_TASK_ID } });
    await db_1.db.task.deleteMany({ where: { id: TEST_TASK_ID } });
    await deleteSupabaseTestUser();
    await db_1.db.$disconnect();
    await app.close();
});
(0, vitest_1.describe)('AC-4-15: ChatMessage persisted both roles — retrievedChunks + guardrailFlags populated', () => {
    (0, vitest_1.test)('AC-4-15: Both USER and ASSISTANT ChatMessage records persisted after message', async () => {
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        // Query DB — both roles must exist for this session
        const messages = await db_1.db.chatMessage.findMany({
            where: { sessionId: TEST_SESSION_ID },
            orderBy: { createdAt: 'asc' },
        });
        (0, vitest_1.expect)(messages).toHaveLength(2);
        (0, vitest_1.expect)(messages[0].role).toBe('USER');
        (0, vitest_1.expect)(messages[0].content).toBe('What documents do I need for my bank account?');
        (0, vitest_1.expect)(messages[1].role).toBe('ASSISTANT');
    }, 10000);
    (0, vitest_1.test)('AC-4-15: retrievedChunks populated with real KnowledgeBaseChunk keys via RAG', async () => {
        // Query the assistant message from the previous test
        const assistantMessage = await db_1.db.chatMessage.findFirst({
            where: {
                sessionId: TEST_SESSION_ID,
                role: 'ASSISTANT',
            },
        });
        (0, vitest_1.expect)(assistantMessage).not.toBeNull();
        (0, vitest_1.expect)(assistantMessage.retrievedChunks).not.toBeNull();
        // Parse JSON — must be a non-empty array of real KnowledgeBaseChunk chunkKeys from RAG
        const chunks = JSON.parse(assistantMessage.retrievedChunks);
        (0, vitest_1.expect)(Array.isArray(chunks)).toBe(true);
        (0, vitest_1.expect)(chunks.length).toBeGreaterThanOrEqual(3);
        (0, vitest_1.expect)(chunks.length).toBeLessThanOrEqual(5);
        // Phase 5: real CHUNK_<taskId>_<personaKey> format from semantic search (not test task)
        chunks.forEach(key => {
            (0, vitest_1.expect)(key).toMatch(/^CHUNK_T\d+_/);
            (0, vitest_1.expect)(typeof key).toBe('string');
            (0, vitest_1.expect)(key.length).toBeGreaterThan(10);
        });
        // Should contain real KB chunks for "bank account" query — likely T01 or T08
        console.log('Retrieved chunks from RAG:', chunks);
    }, 30000);
    (0, vitest_1.test)('AC-4-15: guardrailFlags populated with CRISIS_SIGNAL when triggered', async () => {
        // Create a fresh session for this test to isolate DB state
        const crisisSession = await db_1.db.chatSession.create({
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
        (0, vitest_1.expect)(response.statusCode).toBe(200);
        const assistantMessage = await db_1.db.chatMessage.findFirst({
            where: {
                sessionId: crisisSession.id,
                role: 'ASSISTANT',
            },
        });
        (0, vitest_1.expect)(assistantMessage).not.toBeNull();
        (0, vitest_1.expect)(assistantMessage.guardrailFlags).not.toBeNull();
        const flags = JSON.parse(assistantMessage.guardrailFlags);
        (0, vitest_1.expect)(flags).toEqual(['CRISIS_SIGNAL']);
        // Clean up crisis session
        await db_1.db.chatMessage.deleteMany({ where: { sessionId: crisisSession.id } });
        await db_1.db.chatSession.delete({ where: { id: crisisSession.id } });
    }, 10000);
    (0, vitest_1.test)('AC-4-15: guardrailFlags is empty array when no Level 1 flag triggers', async () => {
        // Query the assistant message from the first test (neutral message — no flags)
        const assistantMessage = await db_1.db.chatMessage.findFirst({
            where: {
                sessionId: TEST_SESSION_ID,
                role: 'ASSISTANT',
            },
        });
        (0, vitest_1.expect)(assistantMessage).not.toBeNull();
        (0, vitest_1.expect)(assistantMessage.guardrailFlags).not.toBeNull();
        const flags = JSON.parse(assistantMessage.guardrailFlags);
        (0, vitest_1.expect)(flags).toEqual([]);
    }, 10000);
});
//# sourceMappingURL=service.persistence.test.js.map