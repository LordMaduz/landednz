// Claude API client — the ONLY file importing @anthropic-ai/sdk (C03)
// Two exported functions only. All Anthropic SDK imports live here.

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import { AIFailureError } from '../errors';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Streaming — for chat advisor (Job B)
export async function streamMessage(
  systemPrompt: string,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
): Promise<void> {
  const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
  });

  try {
    const stream = anthropic.messages.stream({
      model: config.anthropicModel,
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
  } catch (error) {
    // Wrap all SDK errors in AIFailureError (C13)
    if (error instanceof AIFailureError) {
      throw error; // Already wrapped
    }

    // SDK throws errors for non-2xx responses
    throw new AIFailureError(
      error instanceof Error
        ? `Anthropic API failed: ${error.message}`
        : 'Anthropic API failed: Unknown error'
    );
  }
}

// Single-shot generation — for Job A AI personalisation (deferred to v2)
// Stubbed in Phase 4, implemented in Phase 5 if AI personalisation is added
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  throw new Error('TODO: generateText() — deferred to Phase 5 AI personalisation');
}