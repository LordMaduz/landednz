import type { TaskStatus, TaskType } from '@prisma/client';
export interface RoadmapTask {
    taskId: string;
    name: string;
    phase: number;
    status: TaskStatus;
    priorityScore: number;
    isBlocked: boolean;
    blockingTaskNames: string[];
    estimatedDuration: string;
    taskType: TaskType;
    consequenceLine: string;
}
export interface RoadmapPhase {
    phase: number;
    tasks: RoadmapTask[];
}
export interface RoadmapResponse {
    topThree: RoadmapTask[];
    phases: RoadmapPhase[];
    lastComputedAt: string;
}
export interface TaskCompleteResponse {
    taskId: string;
    status: 'COMPLETE';
    newTopThree: RoadmapTask[];
    unlockedTasks: string[];
}
export interface BulkOverrideRequest {
    completedTaskIds: string[];
}
export interface BulkOverrideResponse {
    marked: string[];
    skipped: string[];
    newTopThree: RoadmapTask[];
}
export interface RecalculateResponse {
    usersProcessed: number;
    entriesUpdated: number;
}
export interface TaskDetailResponse {
    taskId: string;
    name: string;
    status: TaskStatus;
    isBlocked: boolean;
    estimatedDuration: string;
    processingTime: string | null;
    governmentSourceUrl: string;
    taskType: TaskType;
    consequenceLine: string;
    steps: string[];
    documentsRequired: string[];
    commonMistakes: string[];
    watchOuts: string[];
    cost: string | null;
    relatedTasks: {
        taskId: string;
        name: string;
        relationship: string;
    }[];
    professionalAdviceRequired: boolean;
    professionalAdviceNote: string | null;
}
//# sourceMappingURL=roadmap.types.d.ts.map