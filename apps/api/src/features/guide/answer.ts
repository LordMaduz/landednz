// Builds the cited answer request; documents keep `passages` order so citation documentIndex = passage index.
import { GUIDE_SYSTEM_PROMPT, buildGuideAboutUser } from '../../core/prompts/registry.js';
import type { GuideAnswerRequest } from '../../shared/ai/claude.client.js';
import type { HistoryTurn } from './understand.js';
import type { GuideContext, Passage } from './types.js';

export function buildAnswerRequest(ctx: GuideContext, history: HistoryTurn[], passages: Passage[], question: string): GuideAnswerRequest {
  return {
    system: GUIDE_SYSTEM_PROMPT,
    history,
    aboutUser: buildGuideAboutUser(ctx),
    documents: passages.map((p) => ({ title: `${p.title} (${p.url})`, text: p.content })),
    question,
  };
}
