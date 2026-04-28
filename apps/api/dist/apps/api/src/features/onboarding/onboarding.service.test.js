"use strict";
// Integration tests for createProfile() — runs against real Docker postgres DB.
// Tests call the service directly (bypassing JWT middleware).
// Database must be running: docker-compose up -d
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const db_1 = require("../../shared/db");
const onboarding_service_1 = require("./onboarding.service");
// ─── Test fixtures ───────────────────────────────────────────────────────────
const TEST_USER_ID = `test-user-ac205-${Date.now()}`;
const TEST_USER_EMAIL = `test-ac205-${Date.now()}@example.com`;
// Two test tasks — distinct applicability
const TASK_ALL = {
    id: 'T_AC205_ALL',
    name: 'Test Task — All personas',
    phase: 1,
    basePriority: 50,
    estimatedDuration: '10 minutes',
    governmentSourceUrl: 'https://example.com',
    applicableVisaTypes: '["ALL"]',
    applicableFamilySituations: '["ALL"]',
    applicableOccupations: '["ALL"]',
};
const TASK_FAMILY_ONLY = {
    id: 'T_AC205_FAMILY',
    name: 'Test Task — Family only',
    phase: 1,
    basePriority: 40,
    estimatedDuration: '10 minutes',
    governmentSourceUrl: 'https://example.com',
    applicableVisaTypes: '["ALL"]',
    applicableFamilySituations: '["FAMILY_WITH_CHILDREN"]',
    applicableOccupations: '["ALL"]',
};
// Fixed date: 30 days after arrival for deterministic urgency calculation
const ARRIVAL_DATE = '2026-02-12'; // 30 days before 2026-03-14
const FUTURE_ARRIVAL_DATE = '2026-06-01'; // Future — pre-arrival state
// ─── Setup / teardown ────────────────────────────────────────────────────────
(0, vitest_1.beforeAll)(async () => {
    // Create test user
    await db_1.db.user.create({ data: { id: TEST_USER_ID, email: TEST_USER_EMAIL } });
    // Create test tasks
    await db_1.db.task.createMany({ data: [TASK_ALL, TASK_FAMILY_ONLY] });
});
(0, vitest_1.afterAll)(async () => {
    // Clean up test tasks (UserRoadmapEntries cascade via afterEach)
    await db_1.db.task.deleteMany({ where: { id: { in: [TASK_ALL.id, TASK_FAMILY_ONLY.id] } } });
    // Clean up test user (cascades to profile and roadmap entries)
    await db_1.db.user.delete({ where: { id: TEST_USER_ID } });
    await db_1.db.$disconnect();
});
(0, vitest_1.afterEach)(async () => {
    // Remove profile and roadmap entries between tests so each test starts clean
    await db_1.db.userRoadmapEntry.deleteMany({ where: { userId: TEST_USER_ID } });
    await db_1.db.userProfile.deleteMany({ where: { userId: TEST_USER_ID } });
});
// ─── Tests ───────────────────────────────────────────────────────────────────
(0, vitest_1.describe)('createProfile()', () => {
    (0, vitest_1.describe)('UserProfile creation', () => {
        (0, vitest_1.test)('creates UserProfile with correct fields', async () => {
            const response = await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            });
            (0, vitest_1.expect)(response.roadmapGenerated).toBe(true);
            (0, vitest_1.expect)(response.personaKey).toBe('solo_aewv');
            (0, vitest_1.expect)(response.profileId).toBeTruthy();
            const profile = await db_1.db.userProfile.findUnique({ where: { userId: TEST_USER_ID } });
            (0, vitest_1.expect)(profile).not.toBeNull();
            (0, vitest_1.expect)(profile.visaType).toBe('AEWV');
            (0, vitest_1.expect)(profile.city).toBe('AUCKLAND');
            (0, vitest_1.expect)(profile.familySituation).toBe('SOLO');
            (0, vitest_1.expect)(profile.occupation).toBe('TECHNOLOGY');
            (0, vitest_1.expect)(profile.personaKey).toBe('solo_aewv');
            (0, vitest_1.expect)(profile.arrivalDate).toEqual(new Date(ARRIVAL_DATE));
        });
        (0, vitest_1.test)('COUPLE_CONSTRAINED profile → personaKey is constrained_couple', async () => {
            const response = await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'PARTNER_OF_STUDENT',
                city: 'WELLINGTON',
                familySituation: 'COUPLE_CONSTRAINED',
                occupation: 'FINANCE',
                arrivalDate: ARRIVAL_DATE,
            });
            (0, vitest_1.expect)(response.personaKey).toBe('constrained_couple');
        });
        (0, vitest_1.test)('FAMILY_WITH_CHILDREN profile → personaKey is family_with_children', async () => {
            const response = await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'FAMILY_WITH_CHILDREN',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            });
            (0, vitest_1.expect)(response.personaKey).toBe('family_with_children');
        });
    });
    (0, vitest_1.describe)('RoadmapEntry generation — task applicability', () => {
        (0, vitest_1.test)('SOLO profile → only ALL-applicable task included (family task excluded)', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            });
            const entries = await db_1.db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });
            const entryTaskIds = entries.map(e => e.taskId);
            (0, vitest_1.expect)(entryTaskIds).toContain(TASK_ALL.id);
            (0, vitest_1.expect)(entryTaskIds).not.toContain(TASK_FAMILY_ONLY.id);
        });
        (0, vitest_1.test)('FAMILY_WITH_CHILDREN profile → both tasks included', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'FAMILY_WITH_CHILDREN',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            });
            const entries = await db_1.db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });
            const entryTaskIds = entries.map(e => e.taskId);
            (0, vitest_1.expect)(entryTaskIds).toContain(TASK_ALL.id);
            (0, vitest_1.expect)(entryTaskIds).toContain(TASK_FAMILY_ONLY.id);
        });
        (0, vitest_1.test)('entries created with correct initial status', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            });
            const entries = await db_1.db.userRoadmapEntry.findMany({ where: { userId: TEST_USER_ID } });
            for (const entry of entries) {
                (0, vitest_1.expect)(entry.status).toBe('NOT_STARTED');
                (0, vitest_1.expect)(entry.completedAt).toBeNull();
                (0, vitest_1.expect)(typeof entry.priorityScore).toBe('number');
            }
        });
    });
    (0, vitest_1.describe)('Future arrivalDate — pre-arrival state', () => {
        (0, vitest_1.test)('future arrivalDate → entries created with zero urgency bonuses', async () => {
            const currentDate = new Date('2026-03-14');
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: FUTURE_ARRIVAL_DATE,
            }, currentDate);
            const entries = await db_1.db.userRoadmapEntry.findMany({
                where: { userId: TEST_USER_ID, taskId: TASK_ALL.id },
            });
            (0, vitest_1.expect)(entries).toHaveLength(1);
            // Score = basePriority + personaWeight + 0 (no urgency) - 0 (not blocked)
            // TASK_ALL: basePriority=50, personaWeight=0 (T_AC205_ALL not a special task)
            (0, vitest_1.expect)(entries[0].priorityScore).toBe(50);
        });
    });
    (0, vitest_1.describe)('Error cases', () => {
        (0, vitest_1.test)('duplicate userId → throws PROFILE_EXISTS AppError', async () => {
            await (0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            });
            await (0, vitest_1.expect)((0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: ARRIVAL_DATE,
            })).rejects.toMatchObject({
                code: 'PROFILE_EXISTS',
                statusCode: 409,
            });
        });
        (0, vitest_1.test)('invalid arrivalDate string → throws VALIDATION_ERROR AppError', async () => {
            await (0, vitest_1.expect)((0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: 'not-a-date',
            })).rejects.toMatchObject({
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            });
        });
        (0, vitest_1.test)('empty string arrivalDate → throws VALIDATION_ERROR AppError', async () => {
            await (0, vitest_1.expect)((0, onboarding_service_1.createProfile)(TEST_USER_ID, {
                visaType: 'AEWV',
                city: 'AUCKLAND',
                familySituation: 'SOLO',
                occupation: 'TECHNOLOGY',
                arrivalDate: '',
            })).rejects.toMatchObject({
                code: 'VALIDATION_ERROR',
                statusCode: 400,
            });
        });
    });
});
//# sourceMappingURL=onboarding.service.test.js.map