// Understand step: Haiku rewrites the question and flags scope, live need, distress and memory candidates (spec §3.1).
import { z } from 'zod';
import { noUsage, structuredHaiku, type TokenUsage } from '../../shared/ai/claude.client.js';
import { logger } from '../../shared/logger.js';
import { GUIDE_UNDERSTAND_PROMPT } from '../../core/prompts/registry.js';
import { GUIDE_AGENCIES, type GuideContext, type Understanding } from './types.js';

export type HistoryTurn = { role: 'user' | 'assistant'; content: string };

// usage is the Haiku call's tokens, for the turn's cost (zero on fallback).
// lateDistress: on timeout, the still-running call's distress (false if it errors); null otherwise.
export type UnderstandResult = Understanding & { usage: TokenUsage; lateDistress: Promise<boolean> | null };

// Live Haiku (S7, 2026-10-30): p75 ~1.7 s, ~10% of calls reach 2 s; round-trip floor ~1 s; thinking makes no difference at effort low.
// A fallback loses Haiku's distress and scope signals (C08), so the budget covers the tail
const TIMEOUT_MS = 3_000;
// The client call outlives the budget so a late distress signal still reaches the turn (spec §6.4)
const LATE_MS = 15_000;
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
  /\b(suicide|suicidal|kill myself|end my life|self[- ]harm|hurt(ing)? myself|want to die|no reason to live|can'?t go on|take my own life|end it all|don'?t want to be here|(feel|feels|feeling|felt)( \w+){0,2} hopeless|no point in living|don'?t see the point (of living|(anymore|any more)(?! \w)))\b/i;

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
  lateDistress: null,
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

async function callHaiku(question: string, history: HistoryTurn[], ctx: GuideContext, timeoutMs: number): Promise<UnderstandResult> {
  const call = structuredHaiku(GUIDE_UNDERSTAND_PROMPT, buildUserMessage(question, history, ctx), understandingSchema, LATE_MS);
  let timer: NodeJS.Timeout | undefined;
  try {
    // Only the wait is bounded; the call itself keeps running for lateDistress
    const reply = await Promise.race([call, new Promise<null>((resolve) => (timer = setTimeout(() => resolve(null), timeoutMs)))]);
    if (!reply) {
      logger.warn('guide understand timed out, distress checked late');
      return { ...fallback(question), lateDistress: call.then((r) => r.value.distress, () => false) };
    }
    const { value: parsed, usage } = reply;
    return {
      ...parsed,
      searchQuery: parsed.searchQuery.trim() || question,
      memoryCandidates: parsed.memoryCandidates
        .slice(0, MAX_MEMORY_CANDIDATES)
        .map((m) => ({ ...m, text: m.text.slice(0, MAX_MEMORY_CHARS) })),
      usage,
      lateDistress: null,
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function understand(question: string, history: HistoryTurn[], ctx: GuideContext, timeoutMs = TIMEOUT_MS): Promise<UnderstandResult> {
  let result: UnderstandResult;
  try {
    result = await callHaiku(question, history, ctx, timeoutMs);
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
