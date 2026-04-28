export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}
export declare function streamMessage(systemPrompt: string, messages: ChatMessage[], onChunk: (text: string) => void): Promise<void>;
export declare function generateText(systemPrompt: string, userPrompt: string): Promise<string>;
//# sourceMappingURL=claude.client.d.ts.map