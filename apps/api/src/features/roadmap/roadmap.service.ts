// Roadmap service — reads stored UserRoadmapEntry records and assembles the roadmap response.
// getRoadmap(): reads scores as stored (no recalculation).
// completeTask(): marks a task complete, rescores only directly affected tasks via core/ functions.

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { config } from '../../shared/config.js';
import { getAffectedTasks, resolveBlockedTasks } from '../../core/dependencies/resolver.js';
import { scoreTask } from '../../core/priority/scoring.js';
import type { PersonaKey } from '../../shared/types.js';
import type { RoadmapTask, RoadmapPhase, RoadmapResponse, TaskCompleteResponse, TaskReopenResponse, BulkOverrideResponse, TaskDetailResponse } from './roadmap.types.js';

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

    // Resolve blockers: HARD deps where prerequisite is not yet complete
    const blockers = task.dependencies.filter(dep => !completedTaskIds.has(dep.prerequisiteId));

    return {
      taskId: task.id,
      name: task.name,
      phase: task.phase,
      status: entry.status,
      priorityScore: entry.priorityScore,
      isBlocked: entry.isBlocked,
      blockingTaskNames: blockers.map(dep => dep.prerequisite.name),
      blockingTaskIds: blockers.map(dep => dep.prerequisiteId),
      completedAt: entry.completedAt?.toISOString() ?? null,
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

// ─── reopenTask() ─────────────────────────────────────────────────────────────

// Marks a done task not done ("Mark as not done", toast Undo) and re-blocks its
// direct dependents — completeTask's targeted recomputation in reverse.
export async function reopenTask(
  userId: string,
  taskId: string,
  currentDate: Date = new Date(),
): Promise<TaskReopenResponse> {
  const entry = await db.userRoadmapEntry.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });
  if (!entry) {
    throw new AppError('TASK_NOT_FOUND', `Task ${taskId} not found in user roadmap`, 404);
  }

  const reblockedTasks: string[] = [];

  if (entry.status === 'COMPLETE') {
    await db.userRoadmapEntry.update({
      where: { userId_taskId: { userId, taskId } },
      data: { status: 'NOT_STARTED', completedAt: null, completionMethod: null },
    });

    const [profile, allEntries, allDeps] = await Promise.all([
      db.userProfile.findUnique({ where: { userId } }),
      db.userRoadmapEntry.findMany({ where: { userId } }),
      db.taskDependency.findMany(),
    ]);
    if (!profile) {
      throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
    }

    const completedTaskIds = allEntries.filter(e => e.status === 'COMPLETE').map(e => e.taskId);

    // The reopened task itself plus its open direct dependents; done dependents stay done
    const openEntries = new Map(
      allEntries.filter(e => e.status !== 'COMPLETE').map(e => [e.taskId, e]),
    );
    const dependentIds = getAffectedTasks(
      taskId,
      allDeps.map(d => ({
        prerequisiteId: d.prerequisiteId,
        dependentId: d.dependentId,
        dependencyType: d.dependencyType,
      })),
    );
    const recomputeIds = [taskId, ...dependentIds].filter(id => openEntries.has(id));

    const tasks = await db.task.findMany({
      where: { id: { in: recomputeIds } },
      include: { dependencies: { select: { prerequisiteId: true, dependencyType: true } } },
    });

    const isPreArrival = profile.arrivalDate > currentDate;
    const scoringArrivalDate = isPreArrival ? null : profile.arrivalDate;

    for (const task of tasks) {
      const [resolved] = resolveBlockedTasks({
        tasks: [{ id: task.id, dependencies: task.dependencies }],
        completedTaskIds,
      });
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

      if (task.id !== taskId && !openEntries.get(task.id)!.isBlocked && resolved.isBlocked) {
        reblockedTasks.push(task.id);
      }
    }

    logger.info({ userId, taskId, reblockedTasks }, 'Task reopened, affected tasks recomputed');
  }

  const roadmap = await getRoadmap(userId);

  return { taskId, status: 'NOT_STARTED', newTopThree: roadmap.topThree, reblockedTasks };
}

// ─── bulkOverride() ───────────────────────────────────────────────────────────

export async function bulkOverride(
  userId: string,
  taskIds: string[],
  currentDate: Date = new Date(),
): Promise<BulkOverrideResponse> {
  // 1. Fetch all current entries to classify the requested task IDs
  const allEntries = await db.userRoadmapEntry.findMany({ where: { userId } });
  const entryMap = new Map(allEntries.map(e => [e.taskId, e]));

  // 2. Split requested IDs — silently ignore any not in user's roadmap
  const toMark: string[] = [];
  const skipped: string[] = [];
  for (const taskId of taskIds) {
    const entry = entryMap.get(taskId);
    if (!entry) continue; // not in roadmap — silently ignore per design decision
    if (entry.status === 'COMPLETE') {
      skipped.push(taskId);
    } else {
      toMark.push(taskId);
    }
  }

  // 3. Bulk mark toMark entries COMPLETE with BULK_OVERRIDE in one query
  if (toMark.length > 0) {
    await db.userRoadmapEntry.updateMany({
      where: { userId, taskId: { in: toMark } },
      data: {
        status: 'COMPLETE',
        completedAt: currentDate,
        completionMethod: 'BULK_OVERRIDE',
      },
    });
  }

  // 4. Fetch profile and fresh entries (reflecting new completions) in parallel
  const [profile, freshEntries] = await Promise.all([
    db.userProfile.findUnique({ where: { userId } }),
    db.userRoadmapEntry.findMany({ where: { userId } }),
  ]);

  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
  }

  // 5. Build updated completedTaskIds set
  const completedTaskIds = freshEntries
    .filter(e => e.status === 'COMPLETE')
    .map(e => e.taskId);

  // 6. Full recomputation — all non-COMPLETE tasks rescored
  // Multiple simultaneous completions can cascade through the dependency graph
  // in ways that targeted per-task recomputation would miss.
  const roadmapTaskIds = allEntries.map(e => e.taskId);
  const allTasks = await db.task.findMany({
    where: { id: { in: roadmapTaskIds } },
    include: {
      dependencies: {
        select: { prerequisiteId: true, dependencyType: true },
      },
    },
  });

  const isPreArrival = profile.arrivalDate > currentDate;
  const scoringArrivalDate = isPreArrival ? null : profile.arrivalDate;

  // Resolve blocked status for all tasks at once (efficient — single pass)
  const resolvedTasks = resolveBlockedTasks({
    tasks: allTasks.map(t => ({ id: t.id, dependencies: t.dependencies })),
    completedTaskIds,
  });
  const resolvedMap = new Map(resolvedTasks.map(r => [r.taskId, r]));

  // Rescore and update each non-COMPLETE task
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
  }

  logger.info(
    { userId, marked: toMark.length, skipped: skipped.length, recomputed: nonCompleteTasks.length },
    'Bulk override complete, full recomputation done',
  );

  // 7. Get updated topThree
  const roadmap = await getRoadmap(userId);

  return {
    marked: toMark,
    skipped,
    newTopThree: roadmap.topThree,
  };
}

// ─── getTaskDetail() ──────────────────────────────────────────────────────────

export async function getTaskDetail(
  userId: string,
  taskId: string,
): Promise<TaskDetailResponse> {
  // 1. Fetch UserRoadmapEntry with Task + content variants in one query
  const entry = await db.userRoadmapEntry.findUnique({
    where: { userId_taskId: { userId, taskId } },
    include: {
      task: {
        include: { contentVariants: true },
      },
    },
  });

  if (!entry) {
    throw new AppError('TASK_NOT_FOUND', `Task ${taskId} not found in user roadmap`, 404);
  }

  const { task } = entry;

  // 2. PREMIUM gate — check subscription before returning any detail
  // During beta, all users have premium access
  if (task.taskType === 'PREMIUM' && !config.betaMode) {
    const sub = await db.subscription.findUnique({ where: { userId } });
    if (!sub || !sub.isActive) {
      throw new AppError('PREMIUM_REQUIRED', 'An active subscription is required to view this task', 403);
    }
  }

  // 3. Resolve content variant: personaKey match → fallback to solo_aewv
  const profile = await db.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
  }

  const variant =
    task.contentVariants.find(v => v.personaKey === profile.personaKey) ??
    task.contentVariants.find(v => v.personaKey === 'solo_aewv');

  // 4. Parse JSON array fields; fall back to empty arrays if no variant exists
  const parseJsonArray = (raw: string | undefined): string[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  };

  logger.info({ userId, taskId, taskType: task.taskType }, 'getTaskDetail fetched');

  return {
    taskId: task.id,
    name: task.name,
    status: entry.status,
    isBlocked: entry.isBlocked,
    estimatedDuration: task.estimatedDuration,
    processingTime: task.processingTime ?? null,
    governmentSourceUrl: task.governmentSourceUrl,
    taskType: task.taskType,
    consequenceLine: variant?.consequenceLine ?? '',
    steps: parseJsonArray(variant?.steps),
    documentsRequired: parseJsonArray(variant?.documentsRequired),
    commonMistakes: parseJsonArray(variant?.commonMistakes),
    watchOuts: parseJsonArray(variant?.watchOuts),
    cost: variant?.cost ?? null,
    relatedTasks: [],  // no join model in MVP — deferred to v2
    professionalAdviceRequired: variant?.professionalAdviceRequired ?? false,
    professionalAdviceNote: variant?.professionalAdviceNote ?? null,
  };
}
