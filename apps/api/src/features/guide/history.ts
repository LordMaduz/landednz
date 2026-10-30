// Guide history and opening (spec §6): conversation paging, task view, opening line and starters. No model calls.
import type { GuideConversationPage, GuideMessageDto, GuideOpeningResponse, GuideScreen, ReplyPart } from '@landednz/types';
import type { GuideMessage } from '../../generated/prisma/client.js';
import { buildStarters, buildWhereYouAre } from '../../core/prompts/registry.js';
import { config } from '../../shared/config.js';
import { db } from '../../shared/db.js';
import { countToday } from './daily-cap.js';
import { AppError } from '../../shared/errors.js';
import { loadGuideContext } from './context.js';

const TASK_VIEW_MAX = 50;

const toDto = (m: GuideMessage): GuideMessageDto => ({
  id: m.id,
  role: m.role as GuideMessageDto['role'],
  text: m.text,
  parts: m.parts as ReplyPart[] | null,
  status: m.status as GuideMessageDto['status'],
  screen: { kind: m.screenKind as GuideScreen['kind'], ...(m.taskKey ? { taskKey: m.taskKey } : {}) },
  createdAt: m.createdAt.toISOString(),
});

// Newest first; ties on createdAt break on id so a page boundary never skips or repeats a row
const NEWEST_FIRST = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

export async function getConversation(userId: string, before: string | null, limit: number): Promise<GuideConversationPage> {
  const conversation = await db.guideConversation.findUnique({ where: { userId }, select: { id: true } });
  if (!conversation) {
    if (before) throw new AppError('VALIDATION_ERROR', 'Unknown cursor', 400);
    return { messages: [], nextBefore: null };
  }
  let older = {};
  if (before) {
    const cursor = await db.guideMessage.findFirst({ where: { id: before, conversationId: conversation.id }, select: { id: true, createdAt: true } });
    if (!cursor) throw new AppError('VALIDATION_ERROR', 'Unknown cursor', 400);
    older = { OR: [{ createdAt: { lt: cursor.createdAt } }, { createdAt: cursor.createdAt, id: { lt: cursor.id } }] };
  }
  const rows = await db.guideMessage.findMany({ where: { conversationId: conversation.id, ...older }, orderBy: NEWEST_FIRST, take: limit + 1 });
  const page = rows.slice(0, limit);
  return { messages: page.map(toDto), nextBefore: rows.length > limit ? page.at(-1)!.id : null };
}

export async function getTaskMessages(userId: string, taskKey: string): Promise<GuideMessageDto[]> {
  const rows = await db.guideMessage.findMany({ where: { conversation: { userId }, taskKey }, orderBy: NEWEST_FIRST, take: TASK_VIEW_MAX });
  return rows.reverse().map(toDto);
}

export async function getOpening(userId: string, screen: GuideScreen): Promise<GuideOpeningResponse> {
  const ctx = await loadGuideContext(userId, screen);
  const titles = screen.kind === 'task' ? (ctx.currentTask ? [ctx.currentTask.title] : []) : ctx.nextTasks.map((t) => t.title);
  const conversation = await db.guideConversation.findUnique({ where: { userId }, select: { id: true } });
  const asked = conversation ? await countToday(db, conversation.id, new Date()) : 0;
  return {
    whereYouAre: buildWhereYouAre(ctx.doneTasks.length, ctx.totalTasks, ctx.nextTasks[0]?.title ?? null),
    starters: buildStarters(screen, titles),
    leftToday: Math.max(0, config.guideDailyCap - asked),
    dailyCap: config.guideDailyCap,
  };
}
