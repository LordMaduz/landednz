// src/types/web.ts — Web-specific types (CW04 compliance)
// Shared types imported from @landednz/types

import type {
  TaskStatus,
  VisaType,
  City,
  FamilySituation,
  Occupation,
  PersonaKey,
  ChatEntryPoint,
} from '@landednz/types';

export type TaskCardState =
  | 'not_started'
  | 'in_progress'
  | 'complete'
  | 'blocked'
  | 'premium_locked'
  | 'loading'
  | 'error';

export interface TaskListItem {
  taskId: string;
  taskName: string;
  consequenceLine: string;
  estimatedDuration: string;
  phase: 1 | 2 | 3;
  cardState: TaskCardState;
  completedAt?: string;
  blockedBy?: { taskId: string; taskName: string };
  isPremium: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface RoadmapPhase {
  num: 1 | 2 | 3;
  name: string;
  timeline: string;
  isPremium: boolean;
  tasks: TaskListItem[];
}

export type FilterValue = 'all' | 'todo' | 'progress' | 'done';

export interface OnboardingState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  answers: {
    visaType?: VisaType;
    city?: City;
    familySituation?: FamilySituation;
    occupation?: Occupation;
    arrivalDate?: string;
  };
  isComplete: boolean;
}

export type DetailPanelMode = 'empty' | 'task' | 'chat';