// Types for chat feature — session creation and message exchange

import type { ChatEntryPoint } from '@landednz/types';

export interface CreateSessionRequest {
  entryPoint: ChatEntryPoint;
  taskContext?: string; // task ID — required if entryPoint === TASK_CARD
}

export interface CreateSessionResponse {
  sessionId: string;
  openingMessage: string; // Built by core/prompts/registry.ts buildChatOpeningMessage()
}

export interface SendMessageRequest {
  content: string;
}

export interface GuardrailResult {
  triggered: boolean;
  flags: string[];
  augmentations: string[];
}

export interface Level2Result {
  flags: string[];
}

export interface ChatKbChunk {
  chunkKey: string;      // e.g. "T08-constrained_couple"
  personaKey: string;
  content: string;       // In Phase 4: formatted from TaskContentVariant fields
  sourceName: string;    // e.g. task name
  sourceUrl: string;
}

export interface BuildSystemPromptParams {
  user: {
    name: string | null;
    visaType: string;
    familySituation: string;
    city: string;
    occupation: string;
    arrivalDaysAgo: number;   // calculated before call
    personaKey: string;
    recentCompletions: string[];  // last 5 task names
  };
  entryPoint: ChatEntryPoint;
  taskName?: string | null;
  consequenceLine?: string | null;
  kbChunks: ChatKbChunk[];         // 3–5 chunks, empty array if no task context
  guardrailAugmentations: string[]; // from Level 1
}