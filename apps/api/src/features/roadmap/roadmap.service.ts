// Roadmap service — reads stored UserRoadmapEntry records and assembles the roadmap response.
// getRoadmap(): reads scores as stored (no recalculation).
// completeTask(): marks a task complete, rescores only directly affected tasks via core/ functions.

import { db } from '../../shared/db';
import { logger } from '../../shared/logger';
import { AppError } from '../../shared/errors';
import { getAffectedTasks, resolveBlockedTasks } from '../../core/dependencies/resolver';
import { scoreTask } from '../../core/priority/scoring';
import type { PersonaKey } from '../../shared/types';
import type { RoadmapTask, RoadmapPhase, RoadmapResponse, TaskCompleteResponse } from './roadmap.types';

export async function getRoadmap(userId: string): Promise<RoadmapResponse> {
  // 1. Look up UserProfile — need personaKey for consequenceLine resolution
  const profile = await db.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
  }

  // 2. Fetch all UserRoadmapEntry records with deep includes in a single query
  const entries = await db.userRoadmapEntry.findMany({
    where: { userId },
    include: {
      task: {
        include: {
          // All content variants — filtered to personaKey in mapping step
          contentVariants: true,
          // HARD dependencies only — these are the tasks blocking this one
          dependencies: {
            where: { dependencyType: 'HARD' },
            include: {
              prerequisite: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (entries.length === 0) {
    throw new AppError('ROADMAP_NOT_FOUND', 'No roadmap entries found for this user', 404);
  }

  logger.info({ userId, entryCount: entries.length }, 'getRoadmap fetched entries');

  // 3. Build completedTaskIds set — used to determine which HARD deps are unmet
  const completedTaskIds = new Set(
    entries.filter(e => e.status === 'COMPLETE').map(e => e.taskId),
  );

  // 4. Map each entry to RoadmapTask
  const roadmapTasks: RoadmapTask[] = entries.map(entry => {
    const { task } = entry;

    // Resolve consequenceLine: personaKey match → fallback to solo_aewv → ''
    const variant =
      task.contentVariants.find(v => v.personaKey === profile.personaKey) ??
      task.contentVariants.find(v => v.personaKey === 'solo_aewv');
    const consequenceLine = variant?.consequenceLine ?? '';

    // Resolve blockingTaskNames: HARD deps where prerequisite is not yet complete
    const blockingTaskNames = task.dependencies
      .filter(dep => !completedTaskIds.has(dep.prerequisiteId))
      .map(dep => dep.prerequisite.name);

    return {
      taskId: task.id,
      name: task.name,
      phase: task.phase,
      status: entry.status,
      priorityScore: entry.priorityScore,
      isBlocked: entry.isBlocked,
      blockingTaskNames,
      estimatedDuration: task.estimatedDuration,
      taskType: task.taskType,
      consequenceLine,
    };
  });

  // 5. topThree: non-complete, non-blocked; sorted by priorityScore DESC; take 3
  const topThree = roadmapTasks
    .filter(t => t.status !== 'COMPLETE' && !t.isBlocked)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  // 6. phases: group all tasks by task.phase; sort tasks by priorityScore DESC within phase
  const phaseMap = new Map<number, RoadmapTask[]>();
  for (const task of roadmapTasks) {
    const existing = phaseMap.get(task.phase) ?? [];
    phaseMap.set(task.phase, [...existing, task]);
  }
  const phases: RoadmapPhase[] = Array.from(phaseMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([phase, tasks]) => ({
      phase,
      tasks: tasks.sort((a, b) => b.priorityScore - a.priorityScore),
    }));

  // 7. lastComputedAt: most recent UserRoadmapEntry.updatedAt as ISO string
  const lastComputedAt = entries
    .reduce((latest, entry) => (entry.updatedAt > latest ? entry.updatedAt : latest), entries[0].updatedAt)
    .toISOString();

  return { topThree, phases, lastComputedAt };
}

// ─── completeTask() ───────────────────────────────────────────────────────────

export async function completeTask(
  userId: string,
  taskId: string,
  currentDate: Date = new Date(),
): Promise<TaskCompleteResponse> {
  // 1. Verify the task is in the user's roadmap
  const entry = await db.userRoadmapEntry.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });
  if (!entry) {
    throw new AppError('TASK_NOT_FOUND', `Task ${taskId} not found in user roadmap`, 404);
  }
  if (entry.status === 'COMPLETE') {
    throw new AppError('TASK_ALREADY_COMPLETE', `Task ${taskId} is already complete`, 409);
  }

  // 2. Mark task COMPLETE
  await db.userRoadmapEntry.update({
    where: { userId_taskId: { userId, taskId } },
    data: {
      status: 'COMPLETE',
      completedAt: currentDate,
      completionMethod: 'USER_MARKED',
    },
  });

  // 3. Fetch profile, all entries (reflecting new completion), all deps — in parallel
  const [profile, allEntries, allDeps] = await Promise.all([
    db.userProfile.findUnique({ where: { userId } }),
    db.userRoadmapEntry.findMany({ where: { userId } }),
    db.taskDependency.findMany(),
  ]);

  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
  }

  // Build updated completedTaskIds including the task just completed
  const completedTaskIds = allEntries
    .filter(e => e.status === 'COMPLETE')
    .map(e => e.taskId);

  // 4. Find tasks directly dependent on the completed task (any dep type)
  const affectedTaskIds = getAffectedTasks(
    taskId,
    allDeps.map(d => ({
      prerequisiteId: d.prerequisiteId,
      dependentId: d.dependentId,
      dependencyType: d.dependencyType,
    })),
  );

  // Only recompute tasks that are in this user's roadmap
  const userTaskIds = new Set(allEntries.map(e => e.taskId));
  const relevantAffectedIds = affectedTaskIds.filter(id => userTaskIds.has(id));

  const unlockedTasks: string[] = [];

  if (relevantAffectedIds.length > 0) {
    // 5. Fetch affected tasks with their HARD deps for resolveBlockedTasks
    const affectedTasks = await db.task.findMany({
      where: { id: { in: relevantAffectedIds } },
      include: {
        dependencies: {
          select: { prerequisiteId: true, dependencyType: true },
        },
      },
    });

    // Pre-arrival: future arrivalDate means urgency bonuses should be 0
    const isPreArrival = profile.arrivalDate > currentDate;
    const scoringArrivalDate = isPreArrival ? null : profile.arrivalDate;

    // 6. Recompute isBlocked and priorityScore for each affected task
    for (const affectedTask of affectedTasks) {
      const prevEntry = allEntries.find(e => e.taskId === affectedTask.id);
      const prevIsBlocked = prevEntry?.isBlocked ?? false;

      const [resolved] = resolveBlockedTasks({
        tasks: [{ id: affectedTask.id, dependencies: affectedTask.dependencies }],
        completedTaskIds,
      });
      const newIsBlocked = resolved.isBlocked;

      const scored = scoreTask({
        task: { id: affectedTask.id, basePriority: affectedTask.basePriority, phase: affectedTask.phase },
        personaKey: profile.personaKey as PersonaKey,
        arrivalDate: scoringArrivalDate,
        currentDate,
        isBlocked: newIsBlocked,
        isComplete: false,
      });

      await db.userRoadmapEntry.update({
        where: { userId_taskId: { userId, taskId: affectedTask.id } },
        data: { isBlocked: newIsBlocked, priorityScore: scored.finalPriority },
      });

      // Track which tasks transitioned from blocked to unblocked
      if (prevIsBlocked && !newIsBlocked) {
        unlockedTasks.push(affectedTask.id);
      }
    }
  }

  logger.info({ userId, taskId, affectedCount: relevantAffectedIds.length, unlockedTasks }, 'Task complete, affected tasks recomputed');

  // 7. Get updated topThree — reuses getRoadmap's proven assembly logic
  const roadmap = await getRoadmap(userId);

  return {
    taskId,
    status: 'COMPLETE',
    newTopThree: roadmap.topThree,
    unlockedTasks,
  };
}
