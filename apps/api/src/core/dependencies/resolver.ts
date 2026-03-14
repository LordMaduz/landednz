// Dependency resolver — pure functions, zero framework imports (constitutional constraint C02)
// resolveBlockedTasks(): computes isBlocked for each task based on HARD dependency completion
// getAffectedTasks(): returns direct dependents of a completed task for targeted recomputation

import { DependencyType } from '@landednz/types';

// ─── Types ──────────────────────────────────────────────────────────────────

interface TaskDependency {
  prerequisiteId: string;
  dependencyType: DependencyType;
}

interface DependencyResolverInput {
  tasks: {
    id: string;
    dependencies: TaskDependency[];
  }[];
  completedTaskIds: string[];
}

interface ResolvedTask {
  taskId: string;
  isBlocked: boolean;
  blockingTaskIds: string[];  // only unmet HARD dep IDs — SOFT deps never appear here
}

interface DependencyEdge {
  prerequisiteId: string;
  dependentId: string;
  dependencyType: DependencyType;
}

// ─── resolveBlockedTasks() ──────────────────────────────────────────────────

export function resolveBlockedTasks(input: DependencyResolverInput): ResolvedTask[] {
  const { tasks, completedTaskIds } = input;
  const completedSet = new Set(completedTaskIds);

  return tasks.map(task => {
    // Only HARD deps can block — SOFT deps are ignored entirely
    const unmetHardDeps = task.dependencies
      .filter(dep => dep.dependencyType === 'HARD')
      .filter(dep => !completedSet.has(dep.prerequisiteId))
      .map(dep => dep.prerequisiteId);

    return {
      taskId: task.id,
      isBlocked: unmetHardDeps.length > 0,
      blockingTaskIds: unmetHardDeps,
    };
  });
}

// ─── getAffectedTasks() ─────────────────────────────────────────────────────

export function getAffectedTasks(
  completedTaskId: string,
  allDependencies: DependencyEdge[],
): string[] {
  // Return only direct dependents — not transitive — for targeted recomputation
  return allDependencies
    .filter(edge => edge.prerequisiteId === completedTaskId)
    .map(edge => edge.dependentId);
}
