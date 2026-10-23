import { db } from '../../shared/db.js';
import { config } from '../../shared/config.js';
import { AppError } from '../../shared/errors.js';

const NZ_TIME_ZONE = 'Pacific/Auckland';

const nzClock = new Intl.DateTimeFormat('en-NZ', {
  timeZone: NZ_TIME_ZONE,
  year: 'numeric', month: 'numeric', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric',
  hourCycle: 'h23',
});

function nzParts(instant: number): Record<string, number> {
  return Object.fromEntries(
    nzClock.formatToParts(instant).filter(p => p.type !== 'literal').map(p => [p.type, Number(p.value)]),
  );
}

// NZ wall-clock minus UTC, in ms, at the given instant (+13h in NZDT, +12h in NZST)
function nzOffset(instant: number): number {
  const p = nzParts(instant);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(instant / 1000) * 1000;
}

// Midnight in Pacific/Auckland on the NZ calendar day containing `now`.
// NZ DST changes happen at 2–3 am, so the offset found at midnight is exact.
function startOfNzDay(now: Date): Date {
  const { year, month, day } = nzParts(now.getTime());
  const midnightAsUtc = Date.UTC(year, month - 1, day);
  const guess = midnightAsUtc - nzOffset(midnightAsUtc);
  return new Date(midnightAsUtc - nzOffset(guess));
}

// Throws 429 once the user has sent config.chatDailyCap messages since midnight NZ time.
export async function assertUnderDailyCap(userId: string, now: Date = new Date()): Promise<void> {
  const sentToday = await db.chatMessage.count({
    where: { role: 'USER', createdAt: { gte: startOfNzDay(now) }, session: { userId } },
  });
  if (sentToday >= config.chatDailyCap) {
    throw new AppError('CHAT_DAILY_CAP_REACHED', 'Daily message limit reached. It resets at midnight NZ time.', 429);
  }
}
