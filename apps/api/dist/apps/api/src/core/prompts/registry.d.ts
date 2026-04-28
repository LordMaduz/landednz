import type { ChatEntryPoint } from '@landednz/types';
export declare function buildChatOpeningMessage(entryPoint: ChatEntryPoint, user: {
    name: string | null;
    profile: {
        visaType: string;
        familySituation: string;
        city: string;
        occupation: string;
    };
    completedTaskCount: number;
}, taskContext: {
    taskName: string;
} | null): string;
import type { BuildSystemPromptParams } from '../../features/chat/chat.types';
export declare function buildChatSystemPrompt(params: BuildSystemPromptParams): string;
export declare function buildResponseStructuringPrompt(conversationalResponse: string): string;
//# sourceMappingURL=registry.d.ts.map