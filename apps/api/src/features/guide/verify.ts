// Verify step: citations must quote a passage we sent; factual sentences must be cited (spec §3.1, §7).
import { buildUnverifiedNote } from '../../core/prompts/registry.js';
import type { Passage, ReleasedSentence, VerifyResult } from './types.js';

const FACTUAL = /\d|\$|%|\b(eligible|eligibility|must|required|fee|cost|deadline)\b/i;
const NOTE_CLAIM_CHARS = 60;

const normalise = (text: string): string => text.replace(/\s+/g, ' ').trim();

function hostOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function verify(sentences: ReleasedSentence[], passages: Passage[]): VerifyResult {
  const contents = passages.map(p => normalise(p.content));
  let unmatchedCitations = 0;
  const uncitedClaims: string[] = [];
  let firstFailing: ReleasedSentence | null = null;

  for (const sentence of sentences) {
    const unmatched = sentence.citations.filter(c => !contents.some(content => content.includes(normalise(c.citedText)))).length;
    const uncited = sentence.citations.length === 0 && FACTUAL.test(sentence.text);
    unmatchedCitations += unmatched;
    if (uncited) uncitedClaims.push(sentence.text);
    if ((unmatched > 0 || uncited) && !firstFailing) firstFailing = sentence;
  }

  if (!firstFailing) return { unmatchedCitations, uncitedClaims, note: null };
  const cited = firstFailing.citations[0];
  const host = hostOf((cited ? passages[cited.passageIndex] : undefined)?.url ?? passages[0]?.url);
  return {
    unmatchedCitations,
    uncitedClaims,
    note: { type: 'unverified', text: buildUnverifiedNote(firstFailing.text.slice(0, NOTE_CLAIM_CHARS), host) },
  };
}
