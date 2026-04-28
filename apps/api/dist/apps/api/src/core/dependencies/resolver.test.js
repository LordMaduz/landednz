"use strict";
// Test file for resolveBlockedTasks() and getAffectedTasks() — written first in TDD approach
// All tests will fail initially — implementation comes after
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resolver_1 = require("./resolver");
// ─── resolveBlockedTasks() ──────────────────────────────────────────────────
(0, vitest_1.describe)('resolveBlockedTasks()', () => {
    (0, vitest_1.describe)('No dependencies', () => {
        (0, vitest_1.test)('task with no dependencies is never blocked', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [{ id: 'T01', dependencies: [] }],
                completedTaskIds: [],
            });
            (0, vitest_1.expect)(result).toHaveLength(1);
            (0, vitest_1.expect)(result[0]).toEqual({ taskId: 'T01', isBlocked: false, blockingTaskIds: [] });
        });
        (0, vitest_1.test)('empty task list returns empty result', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({ tasks: [], completedTaskIds: [] });
            (0, vitest_1.expect)(result).toHaveLength(0);
        });
    });
    (0, vitest_1.describe)('HARD dependencies', () => {
        (0, vitest_1.test)('HARD dep incomplete → task is blocked', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T07', dependencies: [] },
                    { id: 'T11', dependencies: [{ prerequisiteId: 'T07', dependencyType: 'HARD' }] },
                ],
                completedTaskIds: [],
            });
            const t11 = result.find(r => r.taskId === 'T11');
            (0, vitest_1.expect)(t11.isBlocked).toBe(true);
            (0, vitest_1.expect)(t11.blockingTaskIds).toEqual(['T07']);
        });
        (0, vitest_1.test)('HARD dep complete → task is not blocked', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T07', dependencies: [] },
                    { id: 'T11', dependencies: [{ prerequisiteId: 'T07', dependencyType: 'HARD' }] },
                ],
                completedTaskIds: ['T07'],
            });
            const t11 = result.find(r => r.taskId === 'T11');
            (0, vitest_1.expect)(t11.isBlocked).toBe(false);
            (0, vitest_1.expect)(t11.blockingTaskIds).toEqual([]);
        });
        (0, vitest_1.test)('multiple HARD deps — one incomplete → blocked, only unmet dep in blockingTaskIds', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T08', dependencies: [] },
                    { id: 'T10', dependencies: [] },
                    {
                        id: 'T20',
                        dependencies: [
                            { prerequisiteId: 'T08', dependencyType: 'HARD' },
                            { prerequisiteId: 'T10', dependencyType: 'HARD' },
                        ],
                    },
                ],
                completedTaskIds: ['T10'], // T10 complete, T08 not
            });
            const t20 = result.find(r => r.taskId === 'T20');
            (0, vitest_1.expect)(t20.isBlocked).toBe(true);
            (0, vitest_1.expect)(t20.blockingTaskIds).toEqual(['T08']);
        });
        (0, vitest_1.test)('multiple HARD deps — all complete → not blocked', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T08', dependencies: [] },
                    { id: 'T10', dependencies: [] },
                    {
                        id: 'T20',
                        dependencies: [
                            { prerequisiteId: 'T08', dependencyType: 'HARD' },
                            { prerequisiteId: 'T10', dependencyType: 'HARD' },
                        ],
                    },
                ],
                completedTaskIds: ['T08', 'T10'],
            });
            const t20 = result.find(r => r.taskId === 'T20');
            (0, vitest_1.expect)(t20.isBlocked).toBe(false);
            (0, vitest_1.expect)(t20.blockingTaskIds).toEqual([]);
        });
        (0, vitest_1.test)('multiple HARD deps — all incomplete → all listed in blockingTaskIds', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T08', dependencies: [] },
                    { id: 'T10', dependencies: [] },
                    {
                        id: 'T20',
                        dependencies: [
                            { prerequisiteId: 'T08', dependencyType: 'HARD' },
                            { prerequisiteId: 'T10', dependencyType: 'HARD' },
                        ],
                    },
                ],
                completedTaskIds: [],
            });
            const t20 = result.find(r => r.taskId === 'T20');
            (0, vitest_1.expect)(t20.isBlocked).toBe(true);
            (0, vitest_1.expect)(t20.blockingTaskIds).toContain('T08');
            (0, vitest_1.expect)(t20.blockingTaskIds).toContain('T10');
            (0, vitest_1.expect)(t20.blockingTaskIds).toHaveLength(2);
        });
    });
    (0, vitest_1.describe)('SOFT dependencies', () => {
        (0, vitest_1.test)('SOFT dep incomplete → task is NOT blocked', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T07', dependencies: [] },
                    { id: 'T08', dependencies: [{ prerequisiteId: 'T07', dependencyType: 'SOFT' }] },
                ],
                completedTaskIds: [],
            });
            const t08 = result.find(r => r.taskId === 'T08');
            (0, vitest_1.expect)(t08.isBlocked).toBe(false);
            (0, vitest_1.expect)(t08.blockingTaskIds).toEqual([]);
        });
        (0, vitest_1.test)('SOFT dep never appears in blockingTaskIds', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T08', dependencies: [] },
                    { id: 'T10', dependencies: [{ prerequisiteId: 'T08', dependencyType: 'SOFT' }] },
                ],
                completedTaskIds: [],
            });
            const t10 = result.find(r => r.taskId === 'T10');
            (0, vitest_1.expect)(t10.blockingTaskIds).toEqual([]);
        });
        (0, vitest_1.test)('mixed HARD + SOFT deps — only HARD unmet causes blocking', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T07', dependencies: [] },
                    { id: 'T08', dependencies: [] },
                    {
                        id: 'T11',
                        dependencies: [
                            { prerequisiteId: 'T07', dependencyType: 'HARD' },
                            { prerequisiteId: 'T08', dependencyType: 'SOFT' }, // T08 is SOFT → ignored
                        ],
                    },
                ],
                completedTaskIds: [],
            });
            const t11 = result.find(r => r.taskId === 'T11');
            (0, vitest_1.expect)(t11.isBlocked).toBe(true);
            (0, vitest_1.expect)(t11.blockingTaskIds).toEqual(['T07']); // Only T07 (HARD), not T08 (SOFT)
        });
        (0, vitest_1.test)('mixed HARD + SOFT deps — HARD complete, SOFT incomplete → not blocked', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T07', dependencies: [] },
                    { id: 'T01', dependencies: [] },
                    {
                        id: 'T11',
                        dependencies: [
                            { prerequisiteId: 'T07', dependencyType: 'HARD' },
                            { prerequisiteId: 'T01', dependencyType: 'SOFT' },
                        ],
                    },
                ],
                completedTaskIds: ['T07'], // HARD dep complete, SOFT still incomplete
            });
            const t11 = result.find(r => r.taskId === 'T11');
            (0, vitest_1.expect)(t11.isBlocked).toBe(false);
            (0, vitest_1.expect)(t11.blockingTaskIds).toEqual([]);
        });
    });
    (0, vitest_1.describe)('AC-2-02 — T08→T09 HARD dependency (T08 incomplete)', () => {
        // T08 (IRD) → T09 (tax code) is HARD: IRD number literally required for IR330 form
        (0, vitest_1.test)('AC-2-02: T09 is blocked when T08 is not complete', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T08', dependencies: [] },
                    { id: 'T09', dependencies: [{ prerequisiteId: 'T08', dependencyType: 'HARD' }] },
                ],
                completedTaskIds: [], // T08 not complete
            });
            const t09 = result.find(r => r.taskId === 'T09');
            (0, vitest_1.expect)(t09.isBlocked).toBe(true);
            (0, vitest_1.expect)(t09.blockingTaskIds).toEqual(['T08']);
        });
    });
    (0, vitest_1.describe)('AC-2-03 — T08→T09 HARD dependency (T08 complete)', () => {
        (0, vitest_1.test)('AC-2-03: T09 is unblocked when T08 is complete', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T08', dependencies: [] },
                    { id: 'T09', dependencies: [{ prerequisiteId: 'T08', dependencyType: 'HARD' }] },
                ],
                completedTaskIds: ['T08'], // T08 now complete
            });
            const t09 = result.find(r => r.taskId === 'T09');
            (0, vitest_1.expect)(t09.isBlocked).toBe(false);
            (0, vitest_1.expect)(t09.blockingTaskIds).toEqual([]);
        });
    });
    (0, vitest_1.describe)('Return value completeness', () => {
        (0, vitest_1.test)('all tasks are returned, not just blocked ones', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [
                    { id: 'T06', dependencies: [] },
                    { id: 'T07', dependencies: [{ prerequisiteId: 'T06', dependencyType: 'HARD' }] },
                    { id: 'T08', dependencies: [{ prerequisiteId: 'T07', dependencyType: 'SOFT' }] },
                ],
                completedTaskIds: [],
            });
            (0, vitest_1.expect)(result).toHaveLength(3);
            (0, vitest_1.expect)(result.map(r => r.taskId)).toContain('T06');
            (0, vitest_1.expect)(result.map(r => r.taskId)).toContain('T07');
            (0, vitest_1.expect)(result.map(r => r.taskId)).toContain('T08');
        });
        (0, vitest_1.test)('unblocked task has correct shape', () => {
            const result = (0, resolver_1.resolveBlockedTasks)({
                tasks: [{ id: 'T06', dependencies: [] }],
                completedTaskIds: [],
            });
            (0, vitest_1.expect)(result[0]).toEqual({ taskId: 'T06', isBlocked: false, blockingTaskIds: [] });
        });
    });
});
// ─── getAffectedTasks() ─────────────────────────────────────────────────────
(0, vitest_1.describe)('getAffectedTasks()', () => {
    // Full dependency list (from pre-analysis.md Section 3)
    const allDependencies = [
        { prerequisiteId: 'T06', dependentId: 'T07', dependencyType: 'HARD' },
        { prerequisiteId: 'T07', dependentId: 'T08', dependencyType: 'SOFT' },
        { prerequisiteId: 'T07', dependentId: 'T11', dependencyType: 'HARD' },
        { prerequisiteId: 'T07', dependentId: 'T15', dependencyType: 'HARD' },
        { prerequisiteId: 'T07', dependentId: 'T21', dependencyType: 'HARD' },
        { prerequisiteId: 'T08', dependentId: 'T09', dependencyType: 'HARD' },
        { prerequisiteId: 'T08', dependentId: 'T10', dependencyType: 'SOFT' },
        { prerequisiteId: 'T08', dependentId: 'T20', dependencyType: 'HARD' },
        { prerequisiteId: 'T10', dependentId: 'T20', dependencyType: 'HARD' },
        { prerequisiteId: 'T01', dependentId: 'T11', dependencyType: 'SOFT' },
        { prerequisiteId: 'T11', dependentId: 'T21', dependencyType: 'SOFT' },
        { prerequisiteId: 'T14', dependentId: 'T11', dependencyType: 'SOFT' },
    ];
    (0, vitest_1.test)('completing T08 returns all its direct dependents', () => {
        const affected = (0, resolver_1.getAffectedTasks)('T08', allDependencies);
        // T08 has dependents: T09 (HARD), T10 (SOFT), T20 (HARD)
        (0, vitest_1.expect)(affected).toContain('T09');
        (0, vitest_1.expect)(affected).toContain('T10');
        (0, vitest_1.expect)(affected).toContain('T20');
        (0, vitest_1.expect)(affected).toHaveLength(3);
    });
    (0, vitest_1.test)('completing T06 returns only T07', () => {
        const affected = (0, resolver_1.getAffectedTasks)('T06', allDependencies);
        (0, vitest_1.expect)(affected).toEqual(['T07']);
    });
    (0, vitest_1.test)('completing T07 returns its direct dependents', () => {
        const affected = (0, resolver_1.getAffectedTasks)('T07', allDependencies);
        // T07 dependents: T08 (SOFT), T11 (HARD), T15 (HARD), T21 (HARD)
        (0, vitest_1.expect)(affected).toContain('T08');
        (0, vitest_1.expect)(affected).toContain('T11');
        (0, vitest_1.expect)(affected).toContain('T15');
        (0, vitest_1.expect)(affected).toContain('T21');
        (0, vitest_1.expect)(affected).toHaveLength(4);
    });
    (0, vitest_1.test)('task with no dependents returns empty array', () => {
        const affected = (0, resolver_1.getAffectedTasks)('T09', allDependencies); // T09 has no dependents
        (0, vitest_1.expect)(affected).toEqual([]);
    });
    (0, vitest_1.test)('unknown task ID returns empty array', () => {
        const affected = (0, resolver_1.getAffectedTasks)('T99', allDependencies);
        (0, vitest_1.expect)(affected).toEqual([]);
    });
    (0, vitest_1.test)('returns only direct dependents, not transitive', () => {
        // T06 → T07 → T08 (transitive chain)
        // Completing T06 should return only T07, not T08
        const affected = (0, resolver_1.getAffectedTasks)('T06', allDependencies);
        (0, vitest_1.expect)(affected).not.toContain('T08');
        (0, vitest_1.expect)(affected).toEqual(['T07']);
    });
});
//# sourceMappingURL=resolver.test.js.map