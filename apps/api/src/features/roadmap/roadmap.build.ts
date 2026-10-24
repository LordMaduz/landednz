// The one roadmap pipeline: applicable content tasks → blocked state → score.
// createProfile, updateProfileAndRegenerateRoadmap and recalculateAllRoadmaps all call it.

import { applicableTasks, tasks as contentTasks } from '../../content/index.js';
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
