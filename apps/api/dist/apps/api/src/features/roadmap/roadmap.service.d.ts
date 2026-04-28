import type { RoadmapResponse, TaskCompleteResponse, BulkOverrideResponse, TaskDetailResponse } from './roadmap.types';
export declare function getRoadmap(userId: string): Promise<RoadmapResponse>;
export declare function completeTask(userId: string, taskId: string, currentDate?: Date): Promise<TaskCompleteResponse>;
export declare function bulkOverride(userId: string, taskIds: string[], currentDate?: Date): Promise<BulkOverrideResponse>;
export declare function getTaskDetail(userId: string, taskId: string): Promise<TaskDetailResponse>;
//# sourceMappingURL=roadmap.service.d.ts.map