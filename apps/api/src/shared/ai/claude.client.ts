// Claude API client — the ONLY file importing @anthropic-ai/sdk (C03)
// All Anthropic SDK imports live here.

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import type { z } from 'zod';
import { config } from '../config.js';
import { AIFailureError } from '../errors.js';
import { mockAnswerStream, mockSearchUrls, mockStructured } from './mock.js';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GUIDE_HAIKU_MODEL = 'claude-haiku-5-5';

function toAIFailure(error: unknown): AIFailureError {
  if (error instanceof AIFailureError) return error;
  return new AIFailureError(`Claude API error: ${error instanceof Error ? error.message : String(error)}`);
}

export type TokenUsage = { input: number; output: number; cacheRead: number; cacheWrite: number };
export const noUsage = (): TokenUsage => ({ input: 0, output: 0, cacheRead: 0, cacheWrite: 0 });

type ApiUsage = {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens?: number | null;
  cache_creation_input_tokens?: number | null;
};
const toUsage = (u: ApiUsage): TokenUsage => ({
  input: u.input_tokens,
  output: u.output_tokens,
  cacheRead: u.cache_read_input_tokens ?? 0,
  cacheWrite: u.cache_creation_input_tokens ?? 0,
});

// Small structured call (guide understand step) — schema-constrained JSON, aborted at timeoutMs
export async function structuredHaiku<T>(
  system: string,
  user: string,
  schema: z.ZodType<T>,
  timeoutMs: number,
): Promise<{ value: T; usage: TokenUsage }> {
  if (config.aiMode === 'mock') return { value: await mockStructured(system, user, schema), usage: noUsage() };

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
  try {
    const message = await anthropic.messages.parse(
      {
        model: GUIDE_HAIKU_MODEL,
        max_tokens: 600,
        system,
        messages: [{ role: 'user', content: user }],
        output_config: { format: zodOutputFormat(schema), effort: 'low' },
      },
      { signal: AbortSignal.timeout(timeoutMs) },
    );
    if (message.parsed_output == null) throw new AIFailureError('No structured output in Claude response');
    return { value: message.parsed_output, usage: toUsage(message.usage) };
  } catch (error) {
    throw toAIFailure(error);
  }
}

export interface GuideAnswerRequest {
  system: string;
  history: ChatMessage[];
  aboutUser: string;
  documents: { title: string; text: string }[];
  question: string;
}

export type AnswerEvent =
  | { type: 'text'; text: string }
  | { type: 'citation'; documentIndex: number; citedText: string }
  | { type: 'block_end' };

export interface AnswerResult {
  stopReason: 'end_turn' | 'max_tokens' | 'refusal' | 'aborted';
  usage: TokenUsage;
}

// The API rejects empty text turns and a first turn from the assistant (e.g. a reply cancelled before any text)
function answerHistory(history: ChatMessage[]): ChatMessage[] {
  const turns = history.filter(msg => msg.content.trim() !== '');
  const firstUser = turns.findIndex(msg => msg.role === 'user');
  return firstUser === -1 ? [] : turns.slice(firstUser).map(msg => ({ role: msg.role, content: msg.content }));
}

// Cited answer stream (guide answer step). An abort via signal resolves 'aborted', never throws.
export async function streamGuideAnswer(
  req: GuideAnswerRequest,
  onEvent: (e: AnswerEvent) => void,
  signal: AbortSignal,
): Promise<AnswerResult> {
  if (config.aiMode === 'mock') return mockAnswerStream(req, onEvent, signal);

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
  const usage = noUsage();
  let stopReason: AnswerResult['stopReason'] = 'end_turn';
  const textBlocks = new Set<number>();

  try {
    const stream = anthropic.messages.stream(
      {
        model: config.anthropicModel!, // required in live mode (config.ts)
        max_tokens: 2000,
        system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
        messages: [
          ...answerHistory(req.history),
          {
            role: 'user',
            content: [
              { type: 'text', text: req.aboutUser },
              ...req.documents.map(doc => ({
                type: 'document' as const,
                source: { type: 'text' as const, media_type: 'text/plain' as const, data: doc.text },
                title: doc.title,
                citations: { enabled: true },
              })),
              { type: 'text', text: req.question },
            ],
          },
        ],
        // between_tools is Sonnet 5.5 only (400 elsewhere); other models keep their default
        ...(config.anthropicModel === 'claude-sonnet-5-5' && { thinking: { type: config.guideAnswerThinking } }),
        output_config: { effort: 'low' },
      },
      { signal },
    );

    for await (const event of stream) {
      if (event.type === 'message_start') {
        usage.input = event.message.usage.input_tokens;
        usage.cacheRead = event.message.usage.cache_read_input_tokens ?? 0;
        usage.cacheWrite = event.message.usage.cache_creation_input_tokens ?? 0;
      } else if (event.type === 'content_block_start' && event.content_block.type === 'text') {
        textBlocks.add(event.index);
      } else if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') onEvent({ type: 'text', text: event.delta.text });
        else if (event.delta.type === 'citations_delta' && event.delta.citation.type === 'char_location') {
          onEvent({
            type: 'citation',
            documentIndex: event.delta.citation.document_index,
            citedText: event.delta.citation.cited_text,
          });
        }
      } else if (event.type === 'content_block_stop' && textBlocks.has(event.index)) {
        onEvent({ type: 'block_end' });
      } else if (event.type === 'message_delta') {
        usage.output = event.usage.output_tokens;
        const reason = event.delta.stop_reason;
        stopReason = reason === 'max_tokens' || reason === 'refusal' ? reason : 'end_turn';
      }
    }
    // An abort with no pending read ends the iterator quietly instead of throwing
    return { stopReason: signal.aborted ? 'aborted' : stopReason, usage };
  } catch (error) {
    if (signal.aborted) return { stopReason: 'aborted', usage };
    throw toAIFailure(error);
  }
}

// One web search restricted to official domains; returns up to 5 result URLs and the call's token usage
export async function searchOfficialUrls(query: string, allowedDomains: string[]): Promise<{ urls: string[]; usage: TokenUsage }> {
  if (config.aiMode === 'mock') return { urls: await mockSearchUrls(), usage: noUsage() };

  const anthropic = new Anthropic({ apiKey: config.anthropicApiKey });
  try {
    const message = await anthropic.messages.create({
      model: config.anthropicModel!, // required in live mode (config.ts)
      max_tokens: 400,
      messages: [{ role: 'user', content: query }],
      tools: [{ type: 'web_search_20260209', name: 'web_search', allowed_domains: allowedDomains, max_uses: 1 }],
      output_config: { effort: 'low' },
    });
    const urls = message.content.flatMap(block =>
      block.type === 'web_search_tool_result' && Array.isArray(block.content) ? block.content.map(r => r.url) : [],
    );
    return { urls: [...new Set(urls)].slice(0, 5), usage: toUsage(message.usage) };
  } catch (error) {
    throw toAIFailure(error);
  }
}
