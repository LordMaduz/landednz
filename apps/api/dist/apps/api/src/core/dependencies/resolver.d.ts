import { DependencyType } from '@landednz/types';
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
    blockingTaskIds: string[];
}
interface DependencyEdge {
    prerequisiteId: string;
    dependentId: string;
    dependencyType: DependencyType;
}
export declare function resolveBlockedTasks(input: DependencyResolverInput): ResolvedTask[];
export declare function getAffectedTasks(completedTaskId: string, allDependencies: DependencyEdge[]): string[];
export {};
//# sourceMappingURL=resolver.d.ts.map