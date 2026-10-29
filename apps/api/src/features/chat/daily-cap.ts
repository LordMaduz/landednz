import { db } from '../../shared/db.js';
import { config } from '../../shared/config.js';
import { AppError } from '../../shared/errors.js';
import { startOfNzDay } from '../../shared/nz-day.js';

// Throws 429 once the user has sent config.chatDailyCap messages since midnight NZ time.
export async function assertUnderDailyCap(userId: string, now: Date = new Date()): Promise<void> {
  const sentToday = await db.chatMessage.count({
    where: { role: 'USER', createdAt: { gte: startOfNzDay(now) }, session: { userId } },
  });
  if (sentToday >= config.chatDailyCap) {
    throw new AppError('CHAT_DAILY_CAP_REACHED', 'Daily message limit reached. It resets at midnight NZ time.', 429);
  }
}
