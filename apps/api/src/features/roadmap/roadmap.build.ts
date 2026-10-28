// The one roadmap pipeline: applicable content tasks → blocked state → score.
// createProfile calls buildRoadmapEntries; updateProfileAndRegenerateRoadmap and
// recalculateAllRoadmaps call reconcileRoadmap, which applies it to stored entries.

import type { TransactionClient } from '../../generated/prisma/internal/prismaNamespace.js';
import { applicableTasks, contentVersion, tasks as contentTasks } from '../../content/index.js';
import type { ResolvedTask } from '../../content/build.js';
import type { Profile } from '../../content/types.js';
import { resolveBlockedTasks } from '../../core/dependencies/resolver.js';
import { scoreTask } from '../../core/priority/scoring.js';

export const dependenciesOf = (t: ResolvedTask) =>
  t.dependsOn.map(d => ({ prerequisiteId: d.task, dependencyType: d.type === 'hard' ? 'HARD' as const : 'SOFT' as const }));

// Every dependency edge across the live content tasks
export const dependencyEdges = () =>
  contentTasks().flatMap(t => dependenciesOf(t).map(d => ({ ...d, dependentId: t.id })));

export function buildRoadmapEntries(
  profile: Profile,
  arrivalDate: Date,
  currentDate: Date,
  completedTaskIds: string[],
): { taskId: string; priorityScore: number; isBlocked: boolean }[] {
  const tasks = applicableTasks(profile);
  const resolved = new Map(
    resolveBlockedTasks({
      tasks: tasks.map(t => ({
        id: t.id,
        dependencies: dependenciesOf(t),
      })),
      completedTaskIds,
    }).map(r => [r.taskId, r.isBlocked]),
  );
  // Pre-arrival (future arrivalDate): no urgency
  const scoringArrivalDate = arrivalDate > currentDate ? null : arrivalDate;

  return tasks.map(t => {
    const isBlocked = resolved.get(t.id)!;
    const { finalPriority } = scoreTask({ task: t, profile, arrivalDate: scoringArrivalDate, currentDate, isBlocked });
    return { taskId: t.id, priorityScore: finalPriority, isBlocked };
  });
}

// Brings a user's stored entries in line with the current content and profile:
// adds newly applicable tasks, removes NOT_STARTED entries whose task no longer applies
// (or is retired), keeps every started entry, and rescores the rest.
export async function reconcileRoadmap(
  tx: TransactionClient,
  userId: string,
  profile: Profile,
  arrivalDate: Date,
  currentDate: Date,
): Promise<{ added: number; removed: number; updated: number; applicable: number }> {
  const existing = await tx.userRoadmapEntry.findMany({ where: { userId } });
  const stored = new Map(existing.map(e => [e.taskId, e]));
  const completedTaskIds = existing.filter(e => e.status === 'COMPLETE').map(e => e.taskId);
  const built = buildRoadmapEntries(profile, arrivalDate, currentDate, completedTaskIds);
  const builtIds = new Set(built.map(e => e.taskId));
  const contentVer = contentVersion();

  const stale = existing.filter(e => e.status === 'NOT_STARTED' && !builtIds.has(e.taskId)).map(e => e.taskId);
  if (stale.length) await tx.userRoadmapEntry.deleteMany({ where: { userId, taskId: { in: stale } } });

  const fresh = built.filter(e => !stored.has(e.taskId));
  if (fresh.length) await tx.userRoadmapEntry.createMany({ data: fresh.map(e => ({ ...e, userId, contentVersion: contentVer })) });

  const kept = built.filter(e => stored.has(e.taskId));
  for (const e of kept) {
    await tx.userRoadmapEntry.update({
      where: { userId_taskId: { userId, taskId: e.taskId } },
      data: { isBlocked: e.isBlocked, priorityScore: e.priorityScore, contentVersion: contentVer },
    });
  }

  return { added: fresh.length, removed: stale.length, updated: kept.length, applicable: built.length };
}

// The date a task's earliest day window closes (arrival is day 1), as YYYY-MM-DD; null without a window or arrival date
export function bestByDate(urgency: ResolvedTask['urgency'], arrivalDate: Date | null): string | null {
  const toDays = urgency.flatMap(r => ('toDay' in r ? [r.toDay] : []));
  if (!arrivalDate || toDays.length === 0) return null;
  const d = new Date(arrivalDate);
  d.setUTCDate(d.getUTCDate() + Math.min(...toDays) - 1);
  return d.toISOString().slice(0, 10);
}
