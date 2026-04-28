"use strict";
// Integration tests for recalculateAllRoadmaps() — runs against real Docker postgres DB.
//
// AC-2-11: Daily priority recalculation job runs and updates priorityScore for
// time-sensitive tasks. Test: T16 score increases when arrivalDate set to 10 months ago.
//
// Uses a non-canonical task ID (unique per test run) to avoid conflicts with
// other test files running the same canonical T16. fileParallelism: false ensures
// sequential execution anyway, but unique IDs make teardown reliable.
//
// Database must be running: docker-compose up -d
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../../shared/db");
const onboarding_service_1 = require("../onboarding/onboarding.service");
const roadmap_recalculate_1 = require("./roadmap.recalculate");
// ─── Test identifiers ─────────────────────────────────────────────────────────
const TS = Date.now();
const TEST_USER_ID = `test-user-ac211-${TS}`;
// Must use canonical T16 — scoreTask() checks task ID by exact string for persona weights + urgency
const T16_ID = 'T16';
// Anchor dates:
// currentDate = today used for recalculation
// recentArrivalDate = today → no month 10-11 urgency for T16
// oldArrivalDate = 285 days ago → month 10-11 urgency fires (+30)
const CURRENT_DATE = new Date('2026-03-15');
const RECENT_ARRIVAL_DATE = '2026-03-14'; // 1 day ago — no urgency
const OLD_ARRIVAL_DATE = new Date(CURRENT_DATE.getTime() - 285 * 24 * 60 * 60 * 1000); // 285 days ago
// T16 expected scores:
// No urgency: 65 (base) + 5 (constrained_couple) + 0 = 70
// With urgency: 65 + 5 + 30 = 100
const T16_BASE = 65;
const T16_PERSONA_WEIGHT = 5; // constrained_couple
const T16_SCORE_NO_URGENCY = T16_BASE + T16_PERSONA_WEIGHT; // 70
const T16_SCORE_WITH_URGENCY = T16_BASE + T16_PERSONA_WEIGHT + 30; // 100
// ─── Setup / teardown ─────────────────────────────────────────────────────────
(0, vitest_1.beforeAll)(async () => {
    await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.user.deleteMany({ where: { id: TEST_USER_ID } });
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: T16_ID } });
    await db_1.db.task.deleteMany({ where: { id: T16_ID } });
    await db_1.db.user.create({ data: { id: TEST_USER_ID, email: `test-ac211-${TS}@example.com` } });
    // Create canonical T16 — NZ driving licence. basePriority=65, no deps.
    // Canonical ID required: scoreTask() checks taskId === 'T16' for persona weights + urgency.
    await db_1.db.task.create({
        data: {
            id: T16_ID,
            name: 'Convert your overseas driving licence to NZ',
            phase: 2,
            basePriority: T16_BASE,
            estimatedDuration: '1 hour',
            governmentSourceUrl: 'https://nzta.govt.nz',
            applicableVisaTypes: '["ALL"]',
            applicableFamilySituations: '["ALL"]',
            applicableOccupations: '["ALL"]',
        },
    });
});
(0, vitest_1.afterAll)(async () => {
    await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.user.deleteMany({ where: { id: TEST_USER_ID } });
    await db_1.db.taskContentVariant.deleteMany({ where: { taskId: T16_ID } });
    await db_1.db.task.deleteMany({ where: { id: T16_ID } });
    await db_1.db.$disconnect();
});
(0, vitest_1.afterEach)(async () => {
    await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});
// ─── Tests ────────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('recalculateAllRoadmaps()', () => {
    (0, vitest_1.test)('T16 score increases from 70 to 100 when arrivalDate set to 10 months ago', async () => {
        // 1. Create profile with recent arrivalDate — T16 has no urgency
        await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
            visaType: 'AEWV',
            city: 'AUCKLAND',
            familySituation: 'COUPLE_CONSTRAINED',
            occupation: 'TECHNOLOGY',
            arrivalDate: RECENT_ARRIVAL_DATE,
        }, CURRENT_DATE);
        // Verify initial score — no urgency
        const entryBefore = await db_1.db.userRoadmapEntry.findUnique({
            where: { userId_taskId: { userId: TEST_USER_ID, taskId: T16_ID } },
        });
        (0, vitest_1.expect)(entryBefore.priorityScore).toBe(T16_SCORE_NO_URGENCY); // 70
        // 2. Update arrivalDate to 285 days ago — month 10-11 urgency fires
        await db_1.db.userProfile.update({
            where: { userId: TEST_USER_ID },
            data: { arrivalDate: OLD_ARRIVAL_DATE },
        });
        // 3. Run recalculation
        const result = await (0, roadmap_recalculate_1.recalculateAllRoadmaps)(CURRENT_DATE);
        // 4. Assert T16 score updated to 100
        const entryAfter = await db_1.db.userRoadmapEntry.findUnique({
            where: { userId_taskId: { userId: TEST_USER_ID, taskId: T16_ID } },
        });
        (0, vitest_1.expect)(entryAfter.priorityScore).toBe(T16_SCORE_WITH_URGENCY); // 100
        // 5. Assert return values
        (0, vitest_1.expect)(result.usersProcessed).toBeGreaterThanOrEqual(1);
        (0, vitest_1.expect)(result.entriesUpdated).toBeGreaterThanOrEqual(1);
    });
    (0, vitest_1.test)('Pre-arrival user (arrivalDate in future) — T16 keeps 0 urgency after recalculate', async () => {
        // arrivalDate in the future → isPreArrival=true → scoringArrivalDate=null → no urgency
        const futureArrival = new Date(CURRENT_DATE.getTime() + 30 * 24 * 60 * 60 * 1000)
            .toISOString().split('T')[0];
        await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
            visaType: 'AEWV',
            city: 'AUCKLAND',
            familySituation: 'COUPLE_CONSTRAINED',
            occupation: 'TECHNOLOGY',
            arrivalDate: futureArrival,
        }, CURRENT_DATE);
        await (0, roadmap_recalculate_1.recalculateAllRoadmaps)(CURRENT_DATE);
        const entry = await db_1.db.userRoadmapEntry.findUnique({
            where: { userId_taskId: { userId: TEST_USER_ID, taskId: T16_ID } },
        });
        // Pre-arrival: no urgency bonus — score stays at base + persona = 70
        (0, vitest_1.expect)(entry.priorityScore).toBe(T16_SCORE_NO_URGENCY);
    });
    (0, vitest_1.test)('Returns correct usersProcessed and entriesUpdated counts', async () => {
        await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
            visaType: 'AEWV',
            city: 'AUCKLAND',
            familySituation: 'COUPLE_CONSTRAINED',
            occupation: 'TECHNOLOGY',
            arrivalDate: RECENT_ARRIVAL_DATE,
        }, CURRENT_DATE);
        const entryCount = await db_1.db.userRoadmapEntry.count({
            where: { userId: TEST_USER_ID, status: { not: 'COMPLETE' } },
        });
        const result = await (0, roadmap_recalculate_1.recalculateAllRoadmaps)(CURRENT_DATE);
        (0, vitest_1.expect)(result.usersProcessed).toBeGreaterThanOrEqual(1);
        (0, vitest_1.expect)(result.entriesUpdated).toBeGreaterThanOrEqual(entryCount);
    });
});
//# sourceMappingURL=roadmap.recalculate.test.js.map