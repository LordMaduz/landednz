"use strict";
// Daily priority recalculation job.
// Re-scores all users' non-COMPLETE roadmap entries using the current date,
// so time-sensitive urgency bonuses (T16 month 10-11, T06/T07 days 1-3, etc.)
// remain accurate as time passes since onboarding.
//
// Triggered manually via POST /admin/recalculate (MVP).
// No cron scheduler — Railway cron or manual trigger at this phase.
Object.defineProperty(exports, "__esModule", { value: true });
exports.recalculateAllRoadmaps = recalculateAllRoadmaps;
const db_1 = require("../../shared/db");
const logger_1 = require("../../shared/logger");
const resolver_1 = require("../../core/dependencies/resolver");
const scoring_1 = require("../../core/priority/scoring");
async function recalculateAllRoadmaps(currentDate = new Date()) {
    // 1. Find all distinct userIds that have roadmap entries
    const userIdRows = await db_1.db.userRoadmapEntry.findMany({
        select: { userId: true },
        distinct: ['userId'],
    });
    const userIds = userIdRows.map(r => r.userId);
    logger_1.logger.info({ userCount: userIds.length, currentDate }, 'recalculateAllRoadmaps started');
    let entriesUpdated = 0;
    for (const userId of userIds) {
        // 2. Fetch profile — skip users with no profile (shouldn't happen, but be safe)
        const profile = await db_1.db.userProfile.findUnique({ where: { userId } });
        if (!profile) {
            logger_1.logger.warn({ userId }, 'recalculate: no profile found, skipping user');
            continue;
        }
        // 3. Fetch all entries, then fetch tasks using the entry taskIds
        const allEntries = await db_1.db.userRoadmapEntry.findMany({ where: { userId } });
        const taskIds = allEntries.map(e => e.taskId);
        const allTasks = await db_1.db.task.findMany({
            where: { id: { in: taskIds } },
            include: {
                dependencies: { select: { prerequisiteId: true, dependencyType: true } },
            },
        });
        const completedTaskIds = allEntries
            .filter(e => e.status === 'COMPLETE')
            .map(e => e.taskId);
        // PRE_ARRIVAL: if arrivalDate is in the future, all time urgency bonuses = 0
        const isPreArrival = profile.arrivalDate > currentDate;
        const scoringArrivalDate = isPreArrival ? null : profile.arrivalDate;
        // 4. Resolve blocked status for all tasks in one pass
        const resolvedTasks = (0, resolver_1.resolveBlockedTasks)({
            tasks: allTasks.map(t => ({ id: t.id, dependencies: t.dependencies })),
            completedTaskIds,
        });
        const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));
        // 5. Rescore all non-COMPLETE tasks and update
        const nonCompleteTasks = allTasks.filter(t => !completedTaskIds.includes(t.id));
        for (const task of nonCompleteTasks) {
            const resolved = resolvedMap.get(task.id);
            const scored = (0, scoring_1.scoreTask)({
                task: { id: task.id, basePriority: task.basePriority, phase: task.phase },
                personaKey: profile.personaKey,
                arrivalDate: scoringArrivalDate,
                currentDate,
                isBlocked: resolved.isBlocked,
                isComplete: false,
            });
            await db_1.db.userRoadmapEntry.update({
                where: { userId_taskId: { userId, taskId: task.id } },
                data: { isBlocked: resolved.isBlocked, priorityScore: scored.finalPriority },
            });
            entriesUpdated++;
        }
    }
    logger_1.logger.info({ usersProcessed: userIds.length, entriesUpdated }, 'recalculateAllRoadmaps complete');
    return { usersProcessed: userIds.length, entriesUpdated };
}
//# sourceMappingURL=roadmap.recalculate.js.map