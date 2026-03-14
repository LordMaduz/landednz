// Roadmap service — reads stored UserRoadmapEntry records and assembles the roadmap response.
// No score recalculation occurs here — scores are read as stored from onboarding.
// Recalculation is handled by the daily job (AC-2-11).

import { db } from '../../shared/db';
import { logger } from '../../shared/logger';
import { AppError } from '../../shared/errors';
import type { RoadmapTask, RoadmapPhase, RoadmapResponse } from './roadmap.types';

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
