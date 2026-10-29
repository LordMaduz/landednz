// Remember step: saves the facts understand picked out, under the memory rules (spec §6.4).
import type { ReplyPart } from '@landednz/types';
import { db } from '../../shared/db.js';
import type { Understanding } from './types.js';

export const MAX_MEMORIES = 50;

export async function remember(args: {
  userId: string;
  messageId: string;
  candidates: Understanding['memoryCandidates'];
  skip: boolean;
}): Promise<ReplyPart[]> {
  if (args.skip) return [];
  const existing = await db.guideMemory.findMany({ where: { userId: args.userId }, select: { text: true } });
  const seen = new Set(existing.map(m => m.text.toLowerCase()));
  let room = MAX_MEMORIES - existing.length;
  const parts: ReplyPart[] = [];

  // Sequential: one answer per user at a time (turns lock), so the count above stays true
  for (const candidate of args.candidates) {
    const key = candidate.text.toLowerCase();
    if (room <= 0) break;
    if ((candidate.sensitive && !candidate.explicit) || seen.has(key)) continue;
    const row = await db.guideMemory.create({
      data: { userId: args.userId, text: candidate.text, sourceMessageId: args.messageId },
    });
    seen.add(key);
    room--;
    parts.push({ type: 'memory_saved', memoryId: row.id, text: row.text });
  }
  return parts;
}
