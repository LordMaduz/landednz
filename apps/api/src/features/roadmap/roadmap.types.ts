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
