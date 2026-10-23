import type { TaskStatus, TaskType } from '../../generated/prisma/enums.js';

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
  unlockedTasks: string[];  // Task IDs that transitioned isBlocked true → false
}

export interface BulkOverrideRequest {
  completedTaskIds: string[];
}

export interface BulkOverrideResponse {
  marked: string[];        // Task IDs successfully marked COMPLETE in this request
  skipped: string[];       // Task IDs already COMPLETE — silently skipped
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

  // From TaskContentVariant for user's personaKey (fallback: solo_aewv)
  consequenceLine: string;
  steps: string[];
  documentsRequired: string[];
  commonMistakes: string[];
  watchOuts: string[];
  cost: string | null;
  relatedTasks: { taskId: string; name: string; relationship: string }[];  // always [] in MVP
  professionalAdviceRequired: boolean;
  professionalAdviceNote: string | null;
}
