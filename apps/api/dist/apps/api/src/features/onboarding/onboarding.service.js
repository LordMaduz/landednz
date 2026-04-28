"use strict";
// Onboarding service — orchestrates profile creation and roadmap generation.
// Calls core/ pure functions for task filtering, dependency resolution, and scoring.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProfile = createProfile;
exports.updateProfileAndRegenerateRoadmap = updateProfileAndRegenerateRoadmap;
exports.getUserProfile = getUserProfile;
const db_1 = require("../../shared/db");
const logger_1 = require("../../shared/logger");
const errors_1 = require("../../shared/errors");
const filter_1 = require("../../core/priority/filter");
const filter_2 = require("../../core/priority/filter");
const resolver_1 = require("../../core/dependencies/resolver");
const scoring_1 = require("../../core/priority/scoring");
// ─── Helpers ─────────────────────────────────────────────────────────────────
function isValidISODate(dateStr) {
    if (!dateStr || !dateStr.includes('-'))
        return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}
// ─── createProfile() ─────────────────────────────────────────────────────────
async function createProfile(userId, request, currentDate = new Date()) {
    // Validate arrivalDate
    if (!isValidISODate(request.arrivalDate)) {
        throw new errors_1.AppError('VALIDATION_ERROR', 'arrivalDate must be a valid ISO date string (e.g. 2024-03-15)', 400);
    }
    // Check for duplicate profile — 409 if already exists
    const existing = await db_1.db.userProfile.findUnique({ where: { userId } });
    if (existing) {
        throw new errors_1.AppError('PROFILE_EXISTS', 'A profile already exists for this user', 409);
    }
    const arrivalDate = new Date(request.arrivalDate);
    const personaKey = (0, filter_2.derivePersonaKey)(request.familySituation);
    // Create UserProfile
    const profile = await db_1.db.userProfile.create({
        data: {
            userId,
            visaType: request.visaType,
            city: request.city,
            familySituation: request.familySituation,
            occupation: request.occupation,
            arrivalDate,
            personaKey,
        },
    });
    logger_1.logger.info({ userId, personaKey }, 'UserProfile created');
    // Fetch all Tasks with dependencies for pipeline
    const allTasks = await db_1.db.task.findMany({
        include: {
            dependencies: {
                select: { prerequisiteId: true, dependencyType: true },
            },
        },
    });
    // Step 1: filter to tasks applicable to this profile
    const applicableTasks = (0, filter_1.filterApplicableTasks)({
        tasks: allTasks,
        profile: {
            visaType: request.visaType,
            familySituation: request.familySituation,
            occupation: request.occupation,
        },
    });
    // Build a lookup map to access full task data (basePriority, phase) for scoring
    const taskMap = new Map(allTasks.map(t => [t.id, t]));
    // Step 2: resolve blocked tasks — new profile has no completions
    const resolvedTasks = (0, resolver_1.resolveBlockedTasks)({
        tasks: applicableTasks.map(t => {
            const full = taskMap.get(t.id);
            return { id: t.id, dependencies: full.dependencies };
        }),
        completedTaskIds: [],
    });
    const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));
    // Pre-arrival: future arrivalDate means urgency bonuses should be 0
    const isPreArrival = arrivalDate > currentDate;
    const scoringArrivalDate = isPreArrival ? null : arrivalDate;
    // Step 3: score each applicable task
    const roadmapEntries = applicableTasks.map(t => {
        const full = taskMap.get(t.id);
        const resolved = resolvedMap.get(t.id);
        const scored = (0, scoring_1.scoreTask)({
            task: { id: full.id, basePriority: full.basePriority, phase: full.phase },
            personaKey,
            arrivalDate: scoringArrivalDate,
            currentDate,
            isBlocked: resolved.isBlocked,
            isComplete: false,
        });
        return {
            userId,
            taskId: full.id,
            priorityScore: scored.finalPriority,
            isBlocked: resolved.isBlocked,
        };
    });
    // Step 4: bulk create all roadmap entries in one DB call
    await db_1.db.userRoadmapEntry.createMany({ data: roadmapEntries });
    logger_1.logger.info({ userId, entryCount: roadmapEntries.length }, 'UserRoadmapEntry records created');
    return {
        profileId: profile.id,
        personaKey,
        roadmapGenerated: true,
    };
}
// ─── updateProfileAndRegenerateRoadmap() ─────────────────────────────────────
async function updateProfileAndRegenerateRoadmap(userId, request, currentDate = new Date()) {
    // Validate arrivalDate
    if (!isValidISODate(request.arrivalDate)) {
        throw new errors_1.AppError('VALIDATION_ERROR', 'arrivalDate must be a valid ISO date string (e.g. 2024-03-15)', 400);
    }
    const arrivalDate = new Date(request.arrivalDate);
    const personaKey = (0, filter_2.derivePersonaKey)(request.familySituation);
    // Use transaction to ensure atomicity
    return await db_1.db.$transaction(async (tx) => {
        // Step 1: Update existing profile
        const updatedProfile = await tx.userProfile.update({
            where: { userId },
            data: {
                visaType: request.visaType,
                city: request.city,
                familySituation: request.familySituation,
                occupation: request.occupation,
                arrivalDate,
                personaKey,
                updatedAt: new Date()
            }
        });
        logger_1.logger.info({ userId, personaKey }, 'UserProfile updated');
        // Step 2: Delete all existing roadmap entries for this user
        await tx.userRoadmapEntry.deleteMany({
            where: { userId }
        });
        logger_1.logger.info({ userId }, 'Existing roadmap entries deleted');
        // Step 3: Fetch all Tasks with dependencies for pipeline (same as createProfile)
        const allTasks = await tx.task.findMany({
            include: {
                dependencies: {
                    select: { prerequisiteId: true, dependencyType: true },
                },
            },
        });
        // Step 4: filter to tasks applicable to this profile
        const applicableTasks = (0, filter_1.filterApplicableTasks)({
            tasks: allTasks,
            profile: {
                visaType: request.visaType,
                familySituation: request.familySituation,
                occupation: request.occupation,
            },
        });
        // Build a lookup map to access full task data
        const taskMap = new Map(allTasks.map(t => [t.id, t]));
        // Step 5: resolve blocked tasks — updated profile preserves existing completions
        // Get existing completed tasks for this user
        const existingCompletions = await tx.userRoadmapEntry.findMany({
            where: {
                userId,
                status: 'COMPLETE'
            },
            select: { taskId: true }
        });
        const completedTaskIds = existingCompletions.map(e => e.taskId);
        const resolvedTasks = (0, resolver_1.resolveBlockedTasks)({
            tasks: applicableTasks.map(t => {
                const full = taskMap.get(t.id);
                return { id: t.id, dependencies: full.dependencies };
            }),
            completedTaskIds,
        });
        const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));
        // Pre-arrival: future arrivalDate means urgency bonuses should be 0
        const isPreArrival = arrivalDate > currentDate;
        const scoringArrivalDate = isPreArrival ? null : arrivalDate;
        // Step 6: score each applicable task
        const roadmapEntries = applicableTasks.map(t => {
            const full = taskMap.get(t.id);
            const resolved = resolvedMap.get(t.id);
            const wasCompleted = completedTaskIds.includes(t.id);
            const scored = (0, scoring_1.scoreTask)({
                task: { id: full.id, basePriority: full.basePriority, phase: full.phase },
                personaKey,
                arrivalDate: scoringArrivalDate,
                currentDate,
                isBlocked: resolved.isBlocked,
                isComplete: wasCompleted,
            });
            return {
                userId,
                taskId: full.id,
                priorityScore: scored.finalPriority,
                isBlocked: resolved.isBlocked,
                status: wasCompleted ? 'COMPLETE' : 'NOT_STARTED'
            };
        });
        // Step 7: bulk create all new roadmap entries
        await tx.userRoadmapEntry.createMany({ data: roadmapEntries });
        logger_1.logger.info({ userId, entryCount: roadmapEntries.length }, 'New roadmap entries created');
        return {
            profileId: updatedProfile.id,
            personaKey,
            roadmapGenerated: true,
            entriesCreated: roadmapEntries.length
        };
    });
}
// ─── getUserProfile() ────────────────────────────────────────────────────────
async function getUserProfile(userId) {
    const profile = await db_1.db.userProfile.findUnique({
        where: { userId }
    });
    if (!profile) {
        throw new errors_1.AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
    }
    return {
        profileId: profile.id,
        visaType: profile.visaType,
        city: profile.city,
        familySituation: profile.familySituation,
        occupation: profile.occupation,
        arrivalDate: profile.arrivalDate.toISOString().split('T')[0], // Convert to ISO date string
        personaKey: profile.personaKey
    };
}
//# sourceMappingURL=onboarding.service.js.map