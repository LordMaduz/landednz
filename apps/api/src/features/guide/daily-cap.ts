// Guide daily question cap, counted per conversation from midnight NZ time.
import type { TransactionClient } from '../../generated/prisma/internal/prismaNamespace.js';
import { config } from '../../shared/config.js';
import { AppError } from '../../shared/errors.js';
import { nextNzMidnight, startOfNzDay } from '../../shared/nz-day.js';

export function countToday(tx: TransactionClient, conversationId: string, now: Date): Promise<number> {
  return tx.guideMessage.count({
    where: { conversationId, role: 'user', countsTowardCap: true, createdAt: { gte: startOfNzDay(now) } },
  });
}

export async function assertUnderGuideCap(tx: TransactionClient, conversationId: string, now: Date): Promise<void> {
  if ((await countToday(tx, conversationId, now)) >= config.guideDailyCap) {
    throw new AppError('CHAT_DAILY_CAP_REACHED', 'Daily question limit reached. It resets at midnight NZ time.', 429, {
      resetAt: nextNzMidnight(now).toISOString(),
    });
  }
}
