// Understand step: Haiku rewrites the question and flags scope, live need, distress and memory candidates (spec §3.1).
import { z } from 'zod';
import { structuredHaiku } from '../../shared/ai/claude.client.js';
import { logger } from '../../shared/logger.js';
import { GUIDE_UNDERSTAND_PROMPT } from '../../core/prompts/registry.js';
import { GUIDE_AGENCIES, type GuideContext, type Understanding } from './types.js';

export type HistoryTurn = { role: 'user' | 'assistant'; content: string };

const TIMEOUT_MS = 1_000;
const MAX_MEMORY_CANDIDATES = 3;
const MAX_MEMORY_CHARS = 200;
const HISTORY_TURNS = 6;

// Limits stay loose: the SDK moves maxItems/maxLength into descriptions, so we truncate after parse instead.
export const understandingSchema = z.object({
  searchQuery: z.string(),
  scope: z.enum(['in', 'out']),
  redirectAgency: z.enum(GUIDE_AGENCIES).nullable(),
  needsLive: z.boolean(),
  distress: z.boolean(),
  memoryCandidates: z.array(z.object({ text: z.string(), sensitive: z.boolean(), explicit: z.boolean() })),
});

const CRISIS_PATTERN =
  /\b(suicide|suicidal|kill myself|end my life|self[- ]harm|hurt myself|want to die|no reason to live|can'?t go on|take my own life|end it all|don'?t want to be here)\b/i;

export function hasCrisisSignal(text: string): boolean {
  return CRISIS_PATTERN.test(text.replace(/’/g, "'"));
}

const fallback = (question: string): Understanding => ({
  searchQuery: question,
  scope: 'in',
  redirectAgency: null,
  needsLive: false,
  distress: false,
  memoryCandidates: [],
});

function buildUserMessage(question: string, history: HistoryTurn[], ctx: GuideContext): string {
  const turns = history.slice(-HISTORY_TURNS).map((t) => `${t.role === 'user' ? 'Person' : 'Guide'}: ${t.content}`);
  return [
    ctx.currentTask ? `They are looking at the task: ${ctx.currentTask.title}` : null,
    turns.length ? `Recent conversation:\n${turns.join('\n')}` : null,
    `Latest question: ${question}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

async function callHaiku(question: string, history: HistoryTurn[], ctx: GuideContext): Promise<Understanding> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('understand timed out')), TIMEOUT_MS);
  });
  try {
    // The client aborts at the same limit; this race also covers mock mode and a stuck parse.
    const parsed = await Promise.race([
      structuredHaiku(GUIDE_UNDERSTAND_PROMPT, buildUserMessage(question, history, ctx), understandingSchema, TIMEOUT_MS),
      timeout,
    ]);
    return {
      ...parsed,
      searchQuery: parsed.searchQuery.trim() || question,
      memoryCandidates: parsed.memoryCandidates
        .slice(0, MAX_MEMORY_CANDIDATES)
        .map((m) => ({ ...m, text: m.text.slice(0, MAX_MEMORY_CHARS) })),
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function understand(question: string, history: HistoryTurn[], ctx: GuideContext): Promise<Understanding> {
  let result: Understanding;
  try {
    result = await callHaiku(question, history, ctx);
  } catch (error) {
    logger.warn({ err: error }, 'guide understand fell back');
    result = fallback(question);
  }
  // The keyword check can only turn distress on, never off
  return { ...result, distress: result.distress || hasCrisisSignal(question) };
}

// First use of a structured-output schema compiles slowly; one call at startup takes that hit.
export async function warmUnderstand(): Promise<void> {
  try {
    await structuredHaiku(
      GUIDE_UNDERSTAND_PROMPT,
      'Latest question: How do I get an IRD number?',
      understandingSchema,
      10_000,
    );
  } catch (error) {
    logger.warn({ err: error }, 'guide understand warm-up failed');
  }
}
