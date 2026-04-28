"use strict";
// Dependency resolver — pure functions, zero framework imports (constitutional constraint C02)
// resolveBlockedTasks(): computes isBlocked for each task based on HARD dependency completion
// getAffectedTasks(): returns direct dependents of a completed task for targeted recomputation
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBlockedTasks = resolveBlockedTasks;
exports.getAffectedTasks = getAffectedTasks;
// ─── resolveBlockedTasks() ──────────────────────────────────────────────────
function resolveBlockedTasks(input) {
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
function getAffectedTasks(completedTaskId, allDependencies) {
    // Return only direct dependents — not transitive — for targeted recomputation
    return allDependencies
        .filter(edge => edge.prerequisiteId === completedTaskId)
        .map(edge => edge.dependentId);
}
//# sourceMappingURL=resolver.js.map