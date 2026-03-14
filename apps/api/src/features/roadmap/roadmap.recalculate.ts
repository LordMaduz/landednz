// Daily priority recalculation job.
// Re-scores all users' non-COMPLETE roadmap entries using the current date,
// so time-sensitive urgency bonuses (T16 month 10-11, T06/T07 days 1-3, etc.)
// remain accurate as time passes since onboarding.
//
// Triggered manually via POST /admin/recalculate (MVP).
// No cron scheduler — Railway cron or manual trigger at this phase.

import { db } from '../../shared/db';
import { logger } from '../../shared/logger';
import { resolveBlockedTasks } from '../../core/dependencies/resolver';
import { scoreTask } from '../../core/priority/scoring';
import type { PersonaKey } from '../../shared/types';
import type { RecalculateResponse } from './roadmap.types';

export async function recalculateAllRoadmaps(
  currentDate: Date = new Date(),
): Promise<RecalculateResponse> {
  // 1. Find all distinct userIds that have roadmap entries
  const userIdRows = await db.userRoadmapEntry.findMany({
    select: { userId: true },
    distinct: ['userId'],
  });

  const userIds = userIdRows.map(r => r.userId);
  logger.info({ userCount: userIds.length, currentDate }, 'recalculateAllRoadmaps started');

  let entriesUpdated = 0;

  for (const userId of userIds) {
    // 2. Fetch profile — skip users with no profile (shouldn't happen, but be safe)
    const profile = await db.userProfile.findUnique({ where: { userId } });
    if (!profile) {
      logger.warn({ userId }, 'recalculate: no profile found, skipping user');
      continue;
    }

    // 3. Fetch all entries, then fetch tasks using the entry taskIds
    const allEntries = await db.userRoadmapEntry.findMany({ where: { userId } });
    const taskIds = allEntries.map(e => e.taskId);
    const allTasks = await db.task.findMany({
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
    const resolvedTasks = resolveBlockedTasks({
      tasks: allTasks.map(t => ({ id: t.id, dependencies: t.dependencies })),
      completedTaskIds,
    });
    const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));

    // 5. Rescore all non-COMPLETE tasks and update
    const nonCompleteTasks = allTasks.filter(t => !completedTaskIds.includes(t.id));

    for (const task of nonCompleteTasks) {
      const resolved = resolvedMap.get(task.id)!;
      const scored = scoreTask({
        task: { id: task.id, basePriority: task.basePriority, phase: task.phase },
        personaKey: profile.personaKey as PersonaKey,
        arrivalDate: scoringArrivalDate,
        currentDate,
        isBlocked: resolved.isBlocked,
        isComplete: false,
      });

      await db.userRoadmapEntry.update({
        where: { userId_taskId: { userId, taskId: task.id } },
        data: { isBlocked: resolved.isBlocked, priorityScore: scored.finalPriority },
      });

      entriesUpdated++;
    }
  }

  logger.info({ usersProcessed: userIds.length, entriesUpdated }, 'recalculateAllRoadmaps complete');

  return { usersProcessed: userIds.length, entriesUpdated };
}
