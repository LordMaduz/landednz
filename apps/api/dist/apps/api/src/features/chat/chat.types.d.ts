import type { ChatEntryPoint } from '@landednz/types';
export interface CreateSessionRequest {
    entryPoint: ChatEntryPoint;
    taskContext?: string;
}
export interface CreateSessionResponse {
    sessionId: string;
    openingMessage: string;
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
    chunkKey: string;
    personaKey: string;
    content: string;
    sourceName: string;
    sourceUrl: string;
}
export interface BuildSystemPromptParams {
    user: {
        name: string | null;
        visaType: string;
        familySituation: string;
        city: string;
        occupation: string;
        arrivalDaysAgo: number;
        personaKey: string;
        recentCompletions: string[];
    };
    entryPoint: ChatEntryPoint;
    taskName?: string | null;
    consequenceLine?: string | null;
    kbChunks: ChatKbChunk[];
    guardrailAugmentations: string[];
}
//# sourceMappingURL=chat.types.d.ts.map