// Claude API client — the ONLY file importing @anthropic-ai/sdk (C03)
// Two exported functions only. All Anthropic SDK imports live here.

import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config.js';
import { AIFailureError } from '../errors.js';
import { mockStream } from './mock.js';

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
  if (config.aiMode === 'mock') return mockStream(messages, onChunk);

  const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
  });

  try {
    const stream = anthropic.messages.stream({
      model: config.anthropicModel!, // required in live mode (config.ts)
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

// Single-shot generation — for response post-processing and Job A AI personalisation
export async function generateText(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const anthropic = new Anthropic({
    apiKey: config.anthropicApiKey,
  });

  try {
    const message = await anthropic.messages.create({
      model: config.anthropicModel!, // required in live mode (config.ts)
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    // Extract text content from the response
    const content = message.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new AIFailureError('No text content in Claude response');
  } catch (error) {
    if (error instanceof AIFailureError) {
      throw error;
    }
    throw new AIFailureError(`Claude API error: ${error instanceof Error ? error.message : String(error)}`);
  }
}