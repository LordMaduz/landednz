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