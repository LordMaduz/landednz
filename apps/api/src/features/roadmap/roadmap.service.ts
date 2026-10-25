// Roadmap service — reads stored UserRoadmapEntry records and assembles the roadmap response.
// Task names, dependencies and content come from the content bundle (content/index.ts).
// getRoadmap(): reads scores as stored (no recalculation).
// completeTask(): marks a task complete, rescores only directly affected tasks.

import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { AppError } from '../../shared/errors.js';
import { getAffectedTasks } from '../../core/dependencies/resolver.js';
import { contentVersion, itemsFor, source, task as contentTask } from '../../content/index.js';
import { buildRoadmapEntries, dependencyEdges } from './roadmap.build.js';
import type { RoadmapTask, RoadmapPhase, RoadmapResponse, TaskCompleteResponse, TaskReopenResponse, BulkOverrideResponse, TaskDetailResponse } from './roadmap.types.js';

// Retired tasks are served read-only (spec §8.3)
function assertNotRetired(taskId: string) {
  if (contentTask(taskId)?.retired) {
    throw new AppError('TASK_RETIRED', `Task ${taskId} is retired and read-only`, 409);
  }
}

async function findProfile(userId: string) {
  const profile = await db.userProfile.findUnique({ where: { userId } });
  if (!profile) {
    throw new AppError('PROFILE_NOT_FOUND', 'No profile found for this user', 404);
  }
  return profile;
}

// Fresh blocked state and score for the user's applicable content tasks, by task id
async function rescoreAll(userId: string, currentDate: Date) {
  const [profile, entries] = await Promise.all([
    findProfile(userId),
    db.userRoadmapEntry.findMany({ where: { userId } }),
  ]);
  const completedTaskIds = entries.filter(e => e.status === 'COMPLETE').map(e => e.taskId);
  const scores = new Map(
    buildRoadmapEntries(profile, profile.arrivalDate, currentDate, completedTaskIds).map(e => [e.taskId, e]),
  );
  return { entries, scores };
}

export async function getRoadmap(userId: string): Promise<RoadmapResponse> {
  const profile = await findProfile(userId);
  const entries = await db.userRoadmapEntry.findMany({ where: { userId } });

  if (entries.length === 0) {
    throw new AppError('ROADMAP_NOT_FOUND', 'No roadmap entries found for this user', 404);
  }

  logger.info({ userId, entryCount: entries.length }, 'getRoadmap fetched entries');

  const completedTaskIds = new Set(
    entries.filter(e => e.status === 'COMPLETE').map(e => e.taskId),
  );

  // Map each entry to RoadmapTask; entries for task ids the content does not know are hidden
  const roadmapTasks: RoadmapTask[] = entries.flatMap(entry => {
    const task = contentTask(entry.taskId);
    if (!task) {
      logger.warn({ userId, taskId: entry.taskId }, 'Roadmap entry for unknown task');
      return [];
    }

    // Blockers: HARD deps whose prerequisite is not yet complete
    const blockers = task.dependsOn.filter(d => d.type === 'hard' && !completedTaskIds.has(d.task));

    return [{
      taskId: task.id,
      name: task.name,
      phase: task.phase,
      status: entry.status,
      priorityScore: entry.priorityScore,
      isBlocked: entry.isBlocked,
      blockingTaskNames: blockers.map(d => contentTask(d.task)?.name ?? d.task),
      blockingTaskIds: blockers.map(d => d.task),
      completedAt: entry.completedAt?.toISOString() ?? null,
      estimatedDuration: task.duration,
      taskType: 'FREE' as const,
      consequenceLine: itemsFor(task, profile).why?.text ?? '',
      retired: task.retired,
    }];
  });

  // topThree: open, unblocked, not retired; sorted by priorityScore DESC; take 3
  const topThree = roadmapTasks
    .filter(t => t.status !== 'COMPLETE' && !t.isBlocked && !t.retired)
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 3);

  // phases: group all tasks by phase; sort tasks by priorityScore DESC within phase
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

  // lastComputedAt: most recent UserRoadmapEntry.updatedAt as ISO string
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
  assertNotRetired(taskId);
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

  // 3. Rescore from content with the new completion
  const { entries: allEntries, scores } = await rescoreAll(userId, currentDate);

  // 4. Only the task's direct dependents (any dep type) that are in this user's roadmap
  const userTaskIds = new Set(allEntries.map(e => e.taskId));
  const relevantAffectedIds = getAffectedTasks(taskId, dependencyEdges()).filter(id => userTaskIds.has(id));

  const unlockedTasks: string[] = [];

  for (const id of relevantAffectedIds) {
    const scored = scores.get(id);
    if (!scored) continue; // no longer applies to this profile
    const prevIsBlocked = allEntries.find(e => e.taskId === id)?.isBlocked ?? false;

    await db.userRoadmapEntry.update({
      where: { userId_taskId: { userId, taskId: id } },
      data: { isBlocked: scored.isBlocked, priorityScore: scored.priorityScore },
    });

    // Track which tasks transitioned from blocked to unblocked
    if (prevIsBlocked && !scored.isBlocked) {
      unlockedTasks.push(id);
    }
  }

  logger.info({ userId, taskId, affectedCount: relevantAffectedIds.length, unlockedTasks }, 'Task complete, affected tasks recomputed');

  // 5. Get updated topThree — reuses getRoadmap's proven assembly logic
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

  assertNotRetired(taskId);

  const reblockedTasks: string[] = [];

  if (entry.status === 'COMPLETE') {
    await db.userRoadmapEntry.update({
      where: { userId_taskId: { userId, taskId } },
      data: { status: 'NOT_STARTED', completedAt: null, completionMethod: null },
    });

    const { entries: allEntries, scores } = await rescoreAll(userId, currentDate);

    // The reopened task itself plus its open direct dependents; done dependents stay done
    const openEntries = new Map(
      allEntries.filter(e => e.status !== 'COMPLETE').map(e => [e.taskId, e]),
    );
    const recomputeIds = [taskId, ...getAffectedTasks(taskId, dependencyEdges())].filter(id => openEntries.has(id));

    for (const id of recomputeIds) {
      const scored = scores.get(id);
      if (!scored) continue; // retired or no longer applies to this profile

      await db.userRoadmapEntry.update({
        where: { userId_taskId: { userId, taskId: id } },
        data: { isBlocked: scored.isBlocked, priorityScore: scored.priorityScore },
      });

      if (id !== taskId && !openEntries.get(id)!.isBlocked && scored.isBlocked) {
        reblockedTasks.push(id);
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
    if (entry.status === 'COMPLETE' || contentTask(taskId)?.retired) {
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

  // 4. Full recomputation — all non-COMPLETE entries rescored from content.
  // Multiple simultaneous completions can cascade through the dependency graph
  // in ways that targeted per-task recomputation would miss.
  const { entries: freshEntries, scores } = await rescoreAll(userId, currentDate);
  const nonCompleteTasks = freshEntries.filter(e => e.status !== 'COMPLETE' && scores.has(e.taskId));
  for (const entry of nonCompleteTasks) {
    const scored = scores.get(entry.taskId)!;
    await db.userRoadmapEntry.update({
      where: { userId_taskId: { userId, taskId: entry.taskId } },
      data: { isBlocked: scored.isBlocked, priorityScore: scored.priorityScore },
    });
  }

  logger.info(
    { userId, marked: toMark.length, skipped: skipped.length, recomputed: nonCompleteTasks.length },
    'Bulk override complete, full recomputation done',
  );

  // 5. Get updated topThree
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
  const entry = await db.userRoadmapEntry.findUnique({
    where: { userId_taskId: { userId, taskId } },
  });
  // Retired tasks are still served (read-only); ids the content does not know are not
  const task = entry && contentTask(taskId);
  if (!entry || !task) {
    throw new AppError('TASK_NOT_FOUND', `Task ${taskId} not found in user roadmap`, 404);
  }

  const profile = await findProfile(userId);
  const items = itemsFor(task, profile);
  const texts = (list: { text: string }[]) => list.map(i => i.text);
  const sourcesOf = (list: ({ id: string; source: string; checked: string } | null)[]) =>
    list.flatMap(i => {
      if (!i) return [];
      const { title, url } = source(i.source);
      return [{ itemId: i.id, title, url, checked: i.checked }];
    });
  const primary = items.steps[0] ?? items.why;  // the action link opens where the task starts

  logger.info({ userId, taskId }, 'getTaskDetail fetched');

  return {
    taskId: task.id,
    name: task.name,
    status: entry.status,
    isBlocked: entry.isBlocked,
    estimatedDuration: task.duration,
    processingTime: task.processingTime ?? null,
    governmentSourceUrl: primary ? source(primary.source).url : '',
    lastVerified: task.checkedAt,
    taskType: 'FREE',
    consequenceLine: items.why?.text ?? '',
    steps: texts(items.steps),
    documentsRequired: texts(items.documents),
    commonMistakes: texts(items.mistakes),
    watchOuts: texts(items.watchOuts),
    cost: items.cost?.text ?? null,
    relatedTasks: [],  // no join model in MVP — deferred to v2
    professionalAdviceRequired: items.advice?.required ?? false,
    professionalAdviceNote: items.advice?.text ?? null,
    contentVersion: contentVersion(),
    sources: {
      why: sourcesOf([items.why]),
      steps: sourcesOf(items.steps),
      documents: sourcesOf(items.documents),
      mistakes: sourcesOf(items.mistakes),
      watchOuts: sourcesOf(items.watchOuts),
      cost: sourcesOf([items.cost]),
      advice: sourcesOf([items.advice]),
    },
  };
}
