"use strict";
// Claude API client — the ONLY file importing @anthropic-ai/sdk (C03)
// Two exported functions only. All Anthropic SDK imports live here.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamMessage = streamMessage;
exports.generateText = generateText;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const config_1 = require("../config");
const errors_1 = require("../errors");
// Streaming — for chat advisor (Job B)
async function streamMessage(systemPrompt, messages, onChunk) {
    const anthropic = new sdk_1.default({
        apiKey: config_1.config.anthropicApiKey,
    });
    try {
        const stream = anthropic.messages.stream({
            model: config_1.config.anthropicModel,
            max_tokens: 1024, // Never increase per spec
            system: systemPrompt,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content,
            })),
        });
        for await (const event of stream) {
            // Handle content delta events
            if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
                onChunk(event.delta.text);
            }
        }
    }
    catch (error) {
        // Wrap all SDK errors in AIFailureError (C13)
        if (error instanceof errors_1.AIFailureError) {
            throw error; // Already wrapped
        }
        // SDK throws errors for non-2xx responses
        throw new errors_1.AIFailureError(error instanceof Error
            ? `Anthropic API failed: ${error.message}`
            : 'Anthropic API failed: Unknown error');
    }
}
// Single-shot generation — for response post-processing and Job A AI personalisation
async function generateText(systemPrompt, userPrompt) {
    const anthropic = new sdk_1.default({
        apiKey: config_1.config.anthropicApiKey,
    });
    try {
        const message = await anthropic.messages.create({
            model: config_1.config.anthropicModel,
            max_tokens: 1024,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }],
        });
        // Extract text content from the response
        const content = message.content[0];
        if (content.type === 'text') {
            return content.text;
        }
        throw new errors_1.AIFailureError('No text content in Claude response');
    }
    catch (error) {
        if (error instanceof errors_1.AIFailureError) {
            throw error;
        }
        throw new errors_1.AIFailureError(`Claude API error: ${error instanceof Error ? error.message : String(error)}`);
    }
}
//# sourceMappingURL=claude.client.js.map