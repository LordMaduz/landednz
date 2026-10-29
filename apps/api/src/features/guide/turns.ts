// Atomic start, finish and restart of a guide answer turn.
import type { GuideMessageStatus, GuideScreen, ReplyPart } from '@landednz/types';
import { Prisma } from '../../generated/prisma/client.js';
import type { TransactionClient } from '../../generated/prisma/internal/prismaNamespace.js';
import { db } from '../../shared/db.js';
import { AppError } from '../../shared/errors.js';
import { assertUnderGuideCap } from './daily-cap.js';

const busy = () => new AppError('GUIDE_BUSY', 'Another answer is still being written.', 409);

// Serialises turns per conversation; the partial unique index backs it up.
async function lockConversation(tx: TransactionClient, id: string) {
  await tx.$queryRaw`SELECT id FROM "GuideConversation" WHERE id = ${id} FOR UPDATE`;
  if (await tx.guideMessage.findFirst({ where: { conversationId: id, role: 'assistant', status: 'streaming' }, select: { id: true } })) {
    throw busy();
  }
}

function mapBusy(e: unknown): never {
  throw e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' ? busy() : e;
}

export async function startTurn(userId: string, text: string, screen: GuideScreen, now: Date = new Date()) {
  const base = { screenKind: screen.kind, taskKey: screen.taskKey ?? null };
  try {
    return await db.$transaction(async tx => {
      const { id: conversationId } = await tx.guideConversation.upsert({ where: { userId }, create: { userId }, update: {}, select: { id: true } });
      await lockConversation(tx, conversationId);
      await assertUnderGuideCap(tx, conversationId, now);
      const user = await tx.guideMessage.create({
        data: { conversationId, role: 'user', text, status: 'complete', countsTowardCap: true, createdAt: now, ...base },
      });
      const assistant = await tx.guideMessage.create({
        data: { conversationId, role: 'assistant', text: '', status: 'streaming', replyToId: user.id, createdAt: now, ...base },
      });
      return { conversationId, userMessageId: user.id, assistantMessageId: assistant.id };
    });
  } catch (e) {
    return mapBusy(e);
  }
}

export async function finishTurn(
  assistantMessageId: string,
  r: { status: Exclude<GuideMessageStatus, 'streaming'>; parts: ReplyPart[]; text: string; meta: object; textSent: boolean },
): Promise<void> {
  await db.$transaction(async tx => {
    const a = await tx.guideMessage.update({
      where: { id: assistantMessageId },
      data: { status: r.status, parts: r.parts as unknown as Prisma.InputJsonValue, text: r.text, meta: r.meta as Prisma.InputJsonValue },
    });
    // Nothing reached the user, so the question does not use up their daily allowance.
    if (!r.textSent && (r.status === 'failed' || r.status === 'cancelled') && a.replyToId) {
      await tx.guideMessage.update({ where: { id: a.replyToId }, data: { countsTowardCap: false } });
    }
  });
}

export async function restartTurn(userId: string, assistantMessageId: string, now: Date = new Date()) {
  try {
    return await db.$transaction(async tx => {
      const a = await tx.guideMessage.findFirst({
        where: { id: assistantMessageId, role: 'assistant', conversation: { userId } },
      });
      if (!a?.replyToId) throw new AppError('MESSAGE_NOT_FOUND', 'Message not found.', 404);
      await lockConversation(tx, a.conversationId);
      // Re-read under the lock: status may have changed while waiting.
      const fresh = await tx.guideMessage.findUniqueOrThrow({ where: { id: a.id } });
      if (fresh.status !== 'failed' && fresh.status !== 'interrupted') {
        throw new AppError('NOT_RETRYABLE', 'This answer cannot be retried.', 409);
      }
      const user = await tx.guideMessage.findUniqueOrThrow({ where: { id: a.replyToId } });
      if (!user.countsTowardCap) {
        await assertUnderGuideCap(tx, a.conversationId, now);
        await tx.guideMessage.update({ where: { id: user.id }, data: { countsTowardCap: true } });
      }
      await tx.guideMessage.update({ where: { id: a.id }, data: { status: 'streaming', parts: Prisma.DbNull } });
      return {
        userMessageId: user.id,
        question: user.text,
        screen: (user.taskKey ? { kind: user.screenKind, taskKey: user.taskKey } : { kind: user.screenKind }) as GuideScreen,
      };
    });
  } catch (e) {
    return mapBusy(e);
  }
}
