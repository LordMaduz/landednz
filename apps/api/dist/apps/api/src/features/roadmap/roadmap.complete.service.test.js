"use strict";
// Integration tests for completeTask() — runs against real Docker postgres DB.
// Tests verify task completion, targeted recomputation, and HARD dep unblocking.
//
// AC-2-07: POST /roadmap/tasks/:taskId/complete marks COMPLETE, returns updated topThree
// AC-2-08: Completing T06 causes T07 to appear in newTopThree (T06→T07 HARD dep resolved)
//
// Canonical tasks T06, T07, T08, T03 used — fileParallelism: false ensures sequential
// test file execution so canonical IDs don't conflict between test files.
//
// Database must be running: docker-compose up -d
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../../shared/db");
const onboarding_service_1 = require("../onboarding/onboarding.service");
const roadmap_service_1 = require("./roadmap.service");
// ─── Test identifiers ─────────────────────────────────────────────────────────
const TS = Date.now();
const TEST_USER_ID = `test-user-ac207-${TS}`;
const TEST_USER_NO_ROADMAP_ID = `test-user-ac207-noroadmap-${TS}`;
// Golden1 scenario: constrained_couple, Day 2
// arrivalDate=2026-03-13, currentDate=2026-03-14 → daysSince=2 (Days 1-3 urgency fires)
const ARRIVAL_DATE = '2026-03-13';
const CURRENT_DATE = new Date('2026-03-14');
const TASK_IDS = ['T06', 'T07', 'T08', 'T03'];
// ─── Setup / teardown ─────────────────────────────────────────────────────────
(0, vitest_1.beforeAll)(async () => {
    // Clean up any leftover data from previous failed runs
    for (const uid of [TEST_USER_ID, TEST_USER_NO_ROADMAP_ID]) {
        await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: uid } });
        await db_1.db.userProfile.deleteMany({ where: { userId: uid } });
        await db_1.db.user.deleteMany({ where: { id: uid } });
    }
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: { in: TASK_IDS } } });
    await db_1.db.taskDependency.deleteMany({
        where: { OR: [{ prerequisiteId: { in: TASK_IDS } }, { dependentId: { in: TASK_IDS } }] },
    });
    await db_1.db.task.deleteMany({ where: { id: { in: TASK_IDS } } });
    // Create test users
    await db_1.db.user.createMany({
        data: [
            { id: TEST_USER_ID, email: `test-ac207-main-${TS}@example.com` },
            { id: TEST_USER_NO_ROADMAP_ID, email: `test-ac207-noroadmap-${TS}@example.com` },
        ],
    });
    // Create canonical test tasks — IDs must match canonical values so scoreTask()
    // applies correct persona weights (T08 → constrained_couple +20) and urgency bonuses
    await db_1.db.task.createMany({
        data: [
            {
                id: 'T06',
                name: 'Get a NZ SIM card',
                phase: 1,
                basePriority: 98,
                estimatedDuration: '30 minutes',
                governmentSourceUrl: 'https://example.com',
                applicableVisaTypes: '["ALL"]',
                applicableFamilySituations: '["ALL"]',
                applicableOccupations: '["ALL"]',
            },
            {
                id: 'T07',
                name: 'Open a NZ bank account',
                phase: 1,
                basePriority: 95,
                estimatedDuration: '1 hour',
                governmentSourceUrl: 'https://example.com',
                applicableVisaTypes: '["ALL"]',
                applicableFamilySituations: '["ALL"]',
                applicableOccupations: '["ALL"]',
            },
            {
                id: 'T08',
                name: 'Apply for your IRD number',
                phase: 1,
                basePriority: 98,
                estimatedDuration: '15 minutes',
                governmentSourceUrl: 'https://ird.govt.nz',
                applicableVisaTypes: '["ALL"]',
                applicableFamilySituations: '["ALL"]',
                applicableOccupations: '["ALL"]',
            },
            {
                id: 'T03',
                name: 'Prepare your overseas bank account',
                phase: 1,
                basePriority: 82,
                estimatedDuration: '1 hour',
                governmentSourceUrl: 'https://example.com',
                applicableVisaTypes: '["ALL"]',
                applicableFamilySituations: '["ALL"]',
                applicableOccupations: '["ALL"]',
            },
        ],
    });
    // HARD dep: T06 → T07
    await db_1.db.taskDependency.create({
        data: { prerequisiteId: 'T06', dependentId: 'T07', dependencyType: 'HARD' },
    });
    // Create profile for no-roadmap user (profile exists but no entries — simulates edge case)
    await db_1.db.userProfile.create({
        data: {
            userId: TEST_USER_NO_ROADMAP_ID,
            visaType: 'AEWV',
            city: 'AUCKLAND',
            familySituation: 'SOLO',
            occupation: 'TECHNOLOGY',
            arrivalDate: new Date(ARRIVAL_DATE),
            personaKey: 'solo_aewv',
        },
    });
});
(0, vitest_1.afterAll)(async () => {
    for (const uid of [TEST_USER_ID, TEST_USER_NO_ROADMAP_ID]) {
        await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: uid } });
        await db_1.db.userProfile.deleteMany({ where: { userId: uid } });
        await db_1.db.user.deleteMany({ where: { id: uid } });
    }
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: { in: TASK_IDS } } });
    await db_1.db.taskDependency.deleteMany({
        where: { OR: [{ prerequisiteId: { in: TASK_IDS } }, { dependentId: { in: TASK_IDS } }] },
    });
    await db_1.db.task.deleteMany({ where: { id: { in: TASK_IDS } } });
    await db_1.db.$disconnect();
});
(0, vitest_1.afterEach)(async () => {
    // Reset roadmap entries and profile between tests so each starts from golden1 state
    await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});
// ─── Tests ────────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('completeTask()', () => {
    (0, vitest_1.describe)('Successful completion', () => {
        (0, vitest_1.test)('Complete T03 (no deps) — status COMPLETE, T03 absent from newTopThree, unlockedTasks=[]', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'COUPLE_CONSTRAINED',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            }, CURRENT_DATE);
            const result = await (0, roadmap_service_1.completeTask)(TEST_USER_ID, 'T03', CURRENT_DATE);
            (0, vitest_1.expect)(result.taskId).toBe('T03');
            (0, vitest_1.expect)(result.status).toBe('COMPLETE');
            (0, vitest_1.expect)(result.unlockedTasks).toEqual([]);
            (0, vitest_1.expect)(result.newTopThree.map(t => t.taskId)).not.toContain('T03');
            // Verify DB updated
            const entry = await db_1.db.userRoadmapEntry.findUnique({
                where: { userId_taskId: { userId: TEST_USER_ID, taskId: 'T03' } },
            });
            (0, vitest_1.expect)(entry.status).toBe('COMPLETE');
            (0, vitest_1.expect)(entry.completedAt).not.toBeNull();
            (0, vitest_1.expect)(entry.completionMethod).toBe('USER_MARKED');
        });
        (0, vitest_1.test)('AC-2-08: Complete T06 → T07 appears in newTopThree (HARD dep resolved)', async () => {
            // Golden1: T07 is HARD blocked by T06 (score 75, not in topThree)
            // After completing T06: T07 unblocked, score=125, appears in newTopThree
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'COUPLE_CONSTRAINED',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            }, CURRENT_DATE);
            const result = await (0, roadmap_service_1.completeTask)(TEST_USER_ID, 'T06', CURRENT_DATE);
            (0, vitest_1.expect)(result.taskId).toBe('T06');
            (0, vitest_1.expect)(result.status).toBe('COMPLETE');
            // T07 must be in newTopThree — it was HARD blocked, now unblocked (score 125)
            const newTopThreeIds = result.newTopThree.map(t => t.taskId);
            (0, vitest_1.expect)(newTopThreeIds).toContain('T07');
            // T07 must be marked as unblocked in newTopThree
            const t07 = result.newTopThree.find(t => t.taskId === 'T07');
            (0, vitest_1.expect)(t07.isBlocked).toBe(false);
            // T07 must appear in unlockedTasks
            (0, vitest_1.expect)(result.unlockedTasks).toContain('T07');
        });
        (0, vitest_1.test)('Complete T06 — T06 absent from newTopThree', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'COUPLE_CONSTRAINED',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            }, CURRENT_DATE);
            const result = await (0, roadmap_service_1.completeTask)(TEST_USER_ID, 'T06', CURRENT_DATE);
            (0, vitest_1.expect)(result.newTopThree.map(t => t.taskId)).not.toContain('T06');
        });
    });
    (0, vitest_1.describe)('Error cases', () => {
        (0, vitest_1.test)('Task not in user roadmap → AppError TASK_NOT_FOUND (404)', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'COUPLE_CONSTRAINED',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            }, CURRENT_DATE);
            await (0, vitest_1.expect)((0, roadmap_service_1.completeTask)(TEST_USER_ID, 'T_NONEXISTENT', CURRENT_DATE)).rejects.toMatchObject({
                code: 'TASK_NOT_FOUND',
                statusCode: 404,
            });
        });
        (0, vitest_1.test)('Task already COMPLETE → AppError TASK_ALREADY_COMPLETE (409)', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'COUPLE_CONSTRAINED',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            }, CURRENT_DATE);
            // First completion succeeds
            await (0, roadmap_service_1.completeTask)(TEST_USER_ID, 'T03', CURRENT_DATE);
            // Second completion throws 409
            await (0, vitest_1.expect)((0, roadmap_service_1.completeTask)(TEST_USER_ID, 'T03', CURRENT_DATE)).rejects.toMatchObject({
                code: 'TASK_ALREADY_COMPLETE',
                statusCode: 409,
            });
        });
    });
});
//# sourceMappingURL=roadmap.complete.service.test.js.map