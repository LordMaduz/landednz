// End parts after the answer: unverified note, truncation notice, one follow-up (spec §6, §7).
import type { ReplyPart } from '@landednz/types';
import { buildFollowUp } from '../../core/prompts/registry.js';
import type { AnswerResult } from '../../shared/ai/claude.client.js';
import type { GuideContext, VerifyResult } from './types.js';

export function endParts(args: {
  verify: VerifyResult;
  stopReason: AnswerResult['stopReason'];
  ctx: GuideContext;
  answerText: string;
}): ReplyPart[] {
  const parts: ReplyPart[] = args.verify.note ? [args.verify.note] : [];
  if (args.stopReason === 'max_tokens') {
    parts.push({ type: 'notice', kind: 'truncated' }, { type: 'follow_up', text: buildFollowUp('more') });
    return parts;
  }
  const next = args.ctx.nextTasks[0];
  if (next && args.answerText.trim() !== '' && !args.answerText.includes(next.title)) {
    parts.push({ type: 'follow_up', text: buildFollowUp('task', next.title) });
  }
  return parts;
}
