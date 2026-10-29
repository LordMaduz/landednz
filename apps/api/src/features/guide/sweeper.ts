// Background upkeep: mark abandoned streaming answers, expire cached sources, watch per-answer cost.
import { db } from '../../shared/db.js';
import { logger } from '../../shared/logger.js';
import { startOfNzDay } from '../../shared/nz-day.js';

const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const COST_BUDGET_CENTS = 5;

export async function sweepStale(now: Date = new Date()): Promise<{ interrupted: number; cacheDeleted: number }> {
  const [stale, cache] = await Promise.all([
    db.guideMessage.updateMany({
      where: { role: 'assistant', status: 'streaming', createdAt: { lt: new Date(now.getTime() - 2 * MIN) } },
      data: { status: 'interrupted' },
    }),
    db.liveSourceCache.deleteMany({ where: { fetchedAt: { lt: new Date(now.getTime() - 30 * DAY) } } }),
  ]);
  return { interrupted: stale.count, cacheDeleted: cache.count };
}

export async function warnOnCost(now: Date = new Date()): Promise<void> {
  const end = startOfNzDay(now);
  const start = startOfNzDay(new Date(end.getTime() - 12 * 60 * MIN));
  const rows = await db.guideMessage.findMany({
    where: { role: 'assistant', createdAt: { gte: start, lt: end } },
    select: { meta: true },
  });
  const costs = rows.map(r => (r.meta as { costCents?: unknown } | null)?.costCents).filter((c): c is number => typeof c === 'number');
  if (!costs.length) return;
  const avg = costs.reduce((a, b) => a + b, 0) / costs.length;
  if (avg > COST_BUDGET_CENTS) logger.warn({ avgCostCents: avg, answers: costs.length }, 'guide cost above budget');
}

export function startSweeper(): () => void {
  const guarded = (name: string, fn: () => Promise<unknown>) => () => {
    fn().catch(err => logger.error({ err }, `guide ${name} failed`));
  };
  const sweep = guarded('sweep', sweepStale);
  const cost = guarded('cost check', warnOnCost);
  sweep();
  const timers = [setInterval(sweep, 5 * MIN), setInterval(cost, 60 * MIN)];
  timers.forEach(t => t.unref());
  return () => timers.forEach(clearInterval);
}
