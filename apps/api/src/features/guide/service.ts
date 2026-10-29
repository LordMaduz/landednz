// One guide turn, spec §5.1 steps 2–8: understand + retrieve, live, cited answer through the sentence gate, verify, remember, finish.
import type { FastifyReply } from 'fastify';
import type { GuideMessageStatus, GuideScreen, ReplyPart } from '@landednz/types';
import { db } from '../../shared/db.js';
import { config } from '../../shared/config.js';
import { logger } from '../../shared/logger.js';
import { AppError, AIFailureError } from '../../shared/errors.js';
import { noUsage, streamGuideAnswer, type AnswerResult, type TokenUsage } from '../../shared/ai/claude.client.js';
import { GUIDE_CRISIS_TEXT, GUIDE_DISTRESS_CHECKIN, GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY, GUIDE_NOTHING_FOUND_REPLY, GUIDE_OUT_OF_SCOPE_REPLY, GUIDE_REFUSAL_REPLY } from '../../core/prompts/registry.js';
import { loadGuideContext } from './context.js';
import { hasCrisisSignal, understand, type HistoryTurn } from './understand.js';
import { fusePassages, retrieve } from './retrieve.js';
import { liveSources } from './live.js';
import { createSentenceGate, type SentenceGate } from './sentences.js';
import { verify } from './verify.js';
import { endParts } from './parts.js';
import { remember } from './remember.js';
import { finishTurn } from './turns.js';
import { buildAnswerRequest } from './answer.js';
import { openSse } from './sse.js';
import type { VerifyResult } from './types.js';

// USD per million tokens (cacheWrite = 5-minute cache, 1.25x input); searchCents is per web search
const RATES = {
  'claude-sonnet-5-5': { input: 2, output: 10, cacheRead: 0.2, cacheWrite: 2.5 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheRead: 0.01, cacheWrite: 0.125 },
  searchCents: 1,
} as const;
const HISTORY_TURNS = 6;
// Whole-turn limit, under the sweeper's 2-minute streaming threshold; mutable so a test can shorten it
export const TURN_LIMITS = { turnMs: 100_000 };

// shortcut: in-memory abort map assumes one API instance, move to a DB flag polled by the stream when scaling out
const running = new Map<string, AbortController>();

type AbortStatus = Extract<GuideMessageStatus, 'cancelled' | 'interrupted'>;

const priced = (u: TokenUsage, r: TokenUsage): number =>
  ((u.input * r.input + u.output * r.output + u.cacheRead * r.cacheRead + u.cacheWrite * r.cacheWrite) / 1e6) * 100;

// understand always runs on Haiku; the answer and the search call run on the configured model
export function turnCostCents(spend: { understand: TokenUsage; model: TokenUsage; searches: number }, model = config.anthropicModel): number {
  const rates = model === 'claude-haiku-5-5' ? RATES['claude-haiku-5-5'] : RATES['claude-sonnet-5-5'];
  return priced(spend.understand, RATES['claude-haiku-5-5']) + priced(spend.model, rates) + spend.searches * RATES.searchCents;
}

const addUsage = (...us: TokenUsage[]): TokenUsage =>
  us.reduce(
    (a, u) => ({ input: a.input + u.input, output: a.output + u.output, cacheRead: a.cacheRead + u.cacheRead, cacheWrite: a.cacheWrite + u.cacheWrite }),
    noUsage(),
  );

// Earlier turns only (a retry re-answers an older question), oldest first, empty texts dropped
async function loadHistory(userMessageId: string): Promise<HistoryTurn[]> {
  const q = await db.guideMessage.findUniqueOrThrow({ where: { id: userMessageId }, select: { conversationId: true, createdAt: true } });
  const rows = await db.guideMessage.findMany({
    where: { conversationId: q.conversationId, createdAt: { lt: q.createdAt }, text: { not: '' } },
    orderBy: { createdAt: 'desc' },
    take: HISTORY_TURNS,
    select: { role: true, text: true },
  });
  return rows.reverse().map((r) => ({ role: r.role as HistoryTurn['role'], content: r.text }));
}

export async function runTurn(args: {
  userId: string;
  reply: FastifyReply;
  question: string;
  screen: GuideScreen;
  ids: { userMessageId: string; assistantMessageId: string };
  isRetry: boolean;
}): Promise<void> {
  const { userId, question, ids } = args;
  const t0 = Date.now();
  const deadline = AbortSignal.timeout(TURN_LIMITS.turnMs);
  const ms = { understand: 0, retrieve: 0, live: 0, firstText: 0, total: 0 };
  const steps: string[] = [];
  const sent: ReplyPart[] = [];
  const spend = { understand: noUsage(), model: noUsage(), searches: 0 };
  let verified: VerifyResult | null = null;
  // released sentences with the text they cited; stored for the accuracy judge (Task 15)
  let claims: { text: string; cited: string[] }[] = [];
  let finished = false;

  const sse = openSse(args.reply);
  const ctl = new AbortController();
  running.set(ids.assistantMessageId, ctl);
  sse.onClose(() => {
    if (!finished) ctl.abort('interrupted' satisfies AbortStatus);
  });
  const emit = (part: ReplyPart): void => {
    if (part.type === 'text' && !ms.firstText) ms.firstText = Date.now() - t0;
    sent.push(part);
    sse.send({ event: 'part', data: part });
  };
  const say = (text: string): void => emit({ type: 'text', text, citations: [] });
  let gate: SentenceGate | null = null;
  const answerTextSent = () => (gate?.sentTextCount() ?? 0) > 0;

  const finish = async (status: Exclude<GuideMessageStatus, 'streaming'>, textSent: boolean): Promise<void> => {
    finished = true;
    // A retry may have replaced this turn's entry; only remove our own
    if (running.get(ids.assistantMessageId) === ctl) running.delete(ids.assistantMessageId);
    ms.total = Date.now() - t0;
    const meta = {
      ms,
      tokens: addUsage(spend.understand, spend.model),
      costCents: turnCostCents(spend),
      steps,
      verify: verified ? { unmatchedCitations: verified.unmatchedCitations, uncitedClaims: verified.uncitedClaims.length } : null,
      claims,
    };
    const text = sent.flatMap((p) => (p.type === 'text' ? [p.text] : [])).join(' ');
    await finishTurn(ids.assistantMessageId, { status, parts: sent, text, meta, textSent });
    sse.send({ event: 'done', data: { assistantMessageId: ids.assistantMessageId, status } });
    sse.end();
  };
  // A question counts once answer or fixed-reply text was sent; crisis text alone never costs one
  const replyTextSent = () => sent.some((p) => p.type === 'text' && p.text !== GUIDE_CRISIS_TEXT);
  const crisisSent = () => sent.some((p) => p.type === 'text' && p.text === GUIDE_CRISIS_TEXT);
  const aborted = () => (ctl.signal.aborted ? (ctl.signal.reason as AbortStatus) : null);

  sse.send({ event: 'start', data: ids });
  try {
    emit({ type: 'notice', kind: 'checking_guide' });
    // C08: the keyword check needs no model, so its crisis text goes out before anything can fail
    if (hasCrisisSignal(question)) say(GUIDE_CRISIS_TEXT);
    const [ctx, history] = await Promise.all([loadGuideContext(userId, args.screen), loadHistory(ids.userMessageId)]);
    const retrieveOpts = { profile: ctx.profile, taskKey: ctx.currentTask?.taskKey ?? null };

    const timed = async <T>(key: 'understand' | 'retrieve' | 'live', p: Promise<T>): Promise<T> => {
      const start = Date.now();
      let onDeadline = () => {};
      const out = await Promise.race([
        p,
        new Promise<never>((_, reject) => {
          onDeadline = () => reject(new Error('turn deadline'));
          if (deadline.aborted) onDeadline();
          else deadline.addEventListener('abort', onDeadline, { once: true });
        }),
      ]).finally(() => deadline.removeEventListener('abort', onDeadline));
      ms[key] += Date.now() - start;
      steps.push(key);
      return out;
    };
    const [understanding, first] = await Promise.all([
      timed('understand', understand(question, history, ctx)),
      timed('retrieve', retrieve(question, retrieveOpts)),
    ]);
    spend.understand = understanding.usage;
    // Haiku timed out but keeps running: its distress can still arrive (spec §6.4)
    let lateDistress = false;
    understanding.lateDistress?.then((d) => {
      lateDistress = d;
    });
    let found = first;
    if (understanding.searchQuery !== question) {
      const again = await timed('retrieve', retrieve(understanding.searchQuery, retrieveOpts));
      found = { passages: fusePassages([found.passages, again.passages]), candidates: fusePassages([found.candidates, again.candidates]) };
    }
    if (aborted()) return await finish(aborted()!, false);

    // C08: crisis text before any settlement information
    if (understanding.distress && !crisisSent()) say(GUIDE_CRISIS_TEXT);
    const skipMemory = args.isRetry || understanding.scope === 'out' || understanding.distress;
    const rememberParts = async (): Promise<ReplyPart[]> => {
      if (!skipMemory) steps.push('remember');
      // Memory is best-effort: a save error must not turn a finished answer into a failed one
      return remember({ userId, messageId: ids.assistantMessageId, candidates: understanding.memoryCandidates, skip: skipMemory }).catch((err) => {
        logger.error({ err, assistantMessageId: ids.assistantMessageId }, 'guide memory save failed');
        return [];
      });
    };

    if (understanding.scope === 'out') {
      if (understanding.distress) say(GUIDE_DISTRESS_OUT_OF_SCOPE_REPLY(understanding.redirectAgency));
      else say(understanding.redirectAgency ? GUIDE_OUT_OF_SCOPE_REPLY(understanding.redirectAgency) : GUIDE_REFUSAL_REPLY);
      return await finish('complete', true);
    }

    let passages = found.passages;
    if (passages.length === 0 || understanding.needsLive) {
      emit({ type: 'notice', kind: 'checking_official' });
      const live = await timed('live', liveSources(understanding.searchQuery, found.candidates));
      spend.searches += live.searches;
      spend.model = addUsage(spend.model, live.usage);
      if (live.unavailable) emit({ type: 'notice', kind: 'official_unavailable' });
      passages = [...live.passages, ...passages];
    }
    if (aborted()) return await finish(aborted()!, replyTextSent());

    if (passages.length === 0) {
      logger.info({ searchQuery: understanding.searchQuery }, 'guide knowledge gap');
      say(GUIDE_NOTHING_FOUND_REPLY(understanding.redirectAgency));
      (await rememberParts()).forEach(emit);
      return await finish('complete', true);
    }

    if (lateDistress && !crisisSent()) say(GUIDE_CRISIS_TEXT);
    const g = createSentenceGate({ passages, taskTitles: ctx.taskTitles, emit });
    gate = g;
    steps.push('answer');
    let result: AnswerResult;
    try {
      result = await streamGuideAnswer(buildAnswerRequest(ctx, history, passages, question), (e) => g.push(e), AbortSignal.any([ctl.signal, deadline]));
    } catch (error) {
      if (!(error instanceof AIFailureError)) throw error;
      logger.error({ err: error, assistantMessageId: ids.assistantMessageId }, 'guide answer failed');
      g.dropTail();
      return await failed();
    }
    spend.model = addUsage(spend.model, result.usage);
    if (result.stopReason !== 'end_turn') g.dropTail();
    if (result.stopReason === 'aborted' && !aborted()) {
      logger.error({ assistantMessageId: ids.assistantMessageId }, 'guide answer timed out');
      return await failed();
    }
    const released = g.end();
    if (lateDistress && !crisisSent()) say(GUIDE_DISTRESS_CHECKIN);
    claims = released.map((r) => ({ text: r.text, cited: r.citations.map((c) => c.citedText) }));
    if (result.stopReason === 'refusal') {
      logger.warn({ assistantMessageId: ids.assistantMessageId }, 'guide answer refused');
      say(GUIDE_REFUSAL_REPLY);
    }
    if (aborted()) return await finish(aborted()!, replyTextSent());

    steps.push('verify');
    verified = verify(released, passages);
    if (verified.note) logger.warn({ assistantMessageId: ids.assistantMessageId, uncited: verified.uncitedClaims.length, unmatched: verified.unmatchedCitations }, 'guide answer unverified');
    if (result.stopReason === 'max_tokens') logger.warn({ assistantMessageId: ids.assistantMessageId }, 'guide answer truncated');
    endParts({ verify: verified, stopReason: result.stopReason, ctx, answerText: released.map((s) => s.text).join(' ') }).forEach(emit);
    (await rememberParts()).forEach(emit);
    return await finish('complete', replyTextSent());
  } catch (error) {
    // C13: nothing escapes once the stream is open; the row must never stay streaming
    logger.error({ err: error, assistantMessageId: ids.assistantMessageId }, 'guide turn failed');
    if (!finished) await failed().catch((err) => logger.error({ err }, 'guide turn finish failed'));
    sse.end();
  }

  // Before any answer text: error + Retry, question stops counting. After: keep the text, mark interrupted.
  async function failed(): Promise<void> {
    if (answerTextSent()) {
      emit({ type: 'notice', kind: 'interrupted' });
      return finish('interrupted', true);
    }
    emit({ type: 'error', code: 'AI_FAILURE', retryable: true });
    return finish('failed', false);
  }
}

export async function cancelTurn(userId: string, assistantMessageId: string): Promise<void> {
  const row = await db.guideMessage.findFirst({
    where: { id: assistantMessageId, role: 'assistant', status: 'streaming', conversation: { userId } },
    select: { id: true },
  });
  if (!row) throw new AppError('MESSAGE_NOT_FOUND', 'Message not found.', 404);
  const ctl = running.get(assistantMessageId);
  if (ctl) return ctl.abort('cancelled' satisfies AbortStatus);
  // No stream in this process (it died with a restart): close the row now instead of waiting for the sweeper. What was sent is unknown, so it counts.
  await finishTurn(assistantMessageId, { status: 'cancelled', parts: [], text: '', meta: {}, textSent: true });
}
