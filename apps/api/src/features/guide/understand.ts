// Understand step: Haiku rewrites the question and flags scope, live need, distress and memory candidates (spec §3.1).
import { z } from 'zod';
import { noUsage, structuredHaiku, type TokenUsage } from '../../shared/ai/claude.client.js';
import { logger } from '../../shared/logger.js';
import { GUIDE_UNDERSTAND_PROMPT } from '../../core/prompts/registry.js';
import { GUIDE_AGENCIES, type GuideContext, type Understanding } from './types.js';

export type HistoryTurn = { role: 'user' | 'assistant'; content: string };

// usage is the Haiku call's tokens, for the turn's cost (zero on fallback)
export type UnderstandResult = Understanding & { usage: TokenUsage };

// Live Haiku (S7, 2026-10-30): p75 ~1.7 s, ~10% of calls reach 2 s; round-trip floor ~1 s; thinking makes no difference at effort low.
// A fallback loses Haiku's distress and scope signals (C08), so the budget covers the tail
const TIMEOUT_MS = 3_000;
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
  /\b(suicide|suicidal|kill myself|end my life|self[- ]harm|hurt myself|want to die|no reason to live|can'?t go on|take my own life|end it all|don'?t want to be here|feel(ing)?( \w+)? hopeless|don'?t see the point (anymore|any more|of living))\b/i;

export function hasCrisisSignal(text: string): boolean {
  return CRISIS_PATTERN.test(text.replace(/’/g, "'"));
}

const fallback = (question: string): UnderstandResult => ({
  searchQuery: question,
  scope: 'in',
  redirectAgency: null,
  needsLive: false,
  distress: false,
  memoryCandidates: [],
  usage: noUsage(),
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

async function callHaiku(question: string, history: HistoryTurn[], ctx: GuideContext): Promise<UnderstandResult> {
  let timer: NodeJS.Timeout | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('understand timed out')), TIMEOUT_MS);
  });
  try {
    // The client aborts at the same limit; this race also covers mock mode and a stuck parse.
    const { value: parsed, usage } = await Promise.race([
      structuredHaiku(GUIDE_UNDERSTAND_PROMPT, buildUserMessage(question, history, ctx), understandingSchema, TIMEOUT_MS),
      timeout,
    ]);
    return {
      ...parsed,
      searchQuery: parsed.searchQuery.trim() || question,
      memoryCandidates: parsed.memoryCandidates
        .slice(0, MAX_MEMORY_CANDIDATES)
        .map((m) => ({ ...m, text: m.text.slice(0, MAX_MEMORY_CHARS) })),
      usage,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function understand(question: string, history: HistoryTurn[], ctx: GuideContext): Promise<UnderstandResult> {
  let result: UnderstandResult;
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
