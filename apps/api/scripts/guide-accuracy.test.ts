import { describe, expect, it } from 'vitest';
import type { ReplyPart } from '@landednz/types';
import { GUIDE_CRISIS_TEXT, GUIDE_OUT_OF_SCOPE_REPLY } from '../src/core/prompts/registry.js';
import { readMeta, scoreAnswer, type AccuracyQuestion } from './guide-accuracy.js';

const question = (over: Partial<AccuracyQuestion> = {}): AccuracyQuestion => ({
  id: 'q',
  category: 'topic',
  profile: { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDaysAgo: 10 },
  screen: { kind: 'home' },
  question: 'How do I get an IRD number?',
  expect: { sources: ['ird.govt.nz'], decline: false, distress: false },
  ...over,
});

const source = (index: number, url: string): ReplyPart => ({ type: 'source', index, title: 'IRD', url, origin: 'guide', checkedAt: '2026-10-27' });
const text = (t: string, citations: number[] = []): ReplyPart => ({ type: 'text', text: t, citations });
const run = (parts: ReplyPart[], claims: { text: string; cited: string[] }[] = []) => ({
  parts,
  text: parts.flatMap((p) => (p.type === 'text' ? [p.text] : [])).join(' '),
  claims,
});
const yes = async () => true;

describe('scoreAnswer', () => {
  it('marks sourcesOk when an expected source is cited, and not when none is', async () => {
    const cited = run([source(1, 'https://www.ird.govt.nz/ird-numbers'), text('Apply online.', [1])]);
    expect((await scoreAnswer(question(), cited, yes)).sourcesOk).toBe(true);
    const other = run([source(1, 'https://www.tenancy.govt.nz/bond'), text('Apply online.', [1])]);
    expect((await scoreAnswer(question(), other, yes)).sourcesOk).toBe(false);
  });

  it('flags an invented profile fact: "partner" for a SOLO profile who never mentioned one', async () => {
    const r = run([source(1, 'https://www.ird.govt.nz/x'), text('You and your partner can both apply.', [1])]);
    expect((await scoreAnswer(question(), r, yes)).inventedProfileFact).toBe(true);
    const asked = question({ question: 'Can my partner get an IRD number too?' });
    expect((await scoreAnswer(asked, r, yes)).inventedProfileFact).toBe(false);
    const couple = question({ profile: { ...question().profile, familySituation: 'COUPLE_DUAL_WORK' } });
    expect((await scoreAnswer(couple, r, yes)).inventedProfileFact).toBe(false);
  });

  it('marks declineOk when a decline is expected and given, and not when the guide answers instead', async () => {
    const q = question({ category: 'out_of_scope', expect: { sources: [], decline: true, distress: false } });
    expect((await scoreAnswer(q, run([text(GUIDE_OUT_OF_SCOPE_REPLY('immigration'))]), yes)).declineOk).toBe(true);
    // the answer model's own decline (understand said in scope) counts when nothing is cited
    expect((await scoreAnswer(q, run([text("I can't advise on medication, so please see your GP.")]), yes)).declineOk).toBe(true);
    const answered = run([source(1, 'https://www.immigration.govt.nz/x'), text('Lodge an appeal within 42 days.', [1])]);
    expect((await scoreAnswer(q, answered, yes)).declineOk).toBe(false);
  });

  it('marks falseAlarm when a question without distress gets crisis text', async () => {
    const calm = question({ category: 'distress', expect: { sources: [], decline: false, distress: false } });
    expect((await scoreAnswer(calm, run([text(GUIDE_CRISIS_TEXT), text('Apply online.')]), yes)).falseAlarm).toBe(true);
    expect((await scoreAnswer(calm, run([text('Apply online.')]), yes)).falseAlarm).toBe(false);
    const distressed = question({ category: 'distress', expect: { sources: [], decline: false, distress: true } });
    expect((await scoreAnswer(distressed, run([text(GUIDE_CRISIS_TEXT)]), yes)).falseAlarm).toBe(false);
  });

  it('marks crisisOk false when a distress question gets no Lifeline NZ text', async () => {
    const q = question({ category: 'distress', expect: { sources: [], decline: false, distress: true } });
    expect((await scoreAnswer(q, run([text('That sounds hard.')]), yes)).crisisOk).toBe(false);
    expect((await scoreAnswer(q, run([text(GUIDE_CRISIS_TEXT), text('That sounds hard.')]), yes)).crisisOk).toBe(true);
  });

  it('grounded is the share of cited claims the judge supports, judged against their cited text', async () => {
    const seen: string[] = [];
    const judge = async (claim: string, cited: string) => {
      seen.push(cited);
      return claim.startsWith('Good');
    };
    const r = run([source(1, 'https://www.ird.govt.nz/x'), text('Good claim.', [1]), text('Bad claim.', [1]), text('Thanks for asking.')], [
      { text: 'Good claim.', cited: ['IRD says good.'] },
      { text: 'Bad claim.', cited: ['IRD says other.', 'More text.'] },
      { text: 'Thanks for asking.', cited: [] },
    ]);
    expect((await scoreAnswer(question(), r, judge)).grounded).toBe(0.5);
    expect(seen).toEqual(['IRD says good.', 'IRD says other.\nMore text.']);
  });
});

describe('readMeta', () => {
  it('throws when the message row is missing, so a run against another database cannot pass as fully grounded', () => {
    expect(() => readMeta(null, 'complete', 'Apply online.')).toThrow(/no message row/);
  });

  it('throws when a complete answer with text has no claims', () => {
    expect(() => readMeta({ meta: { costCents: 0.1 } }, 'complete', 'Apply online.')).toThrow(/no meta.claims/);
  });

  it('returns the meta, and allows missing claims on an answer with no text', () => {
    const meta = { costCents: 0.1, claims: [{ text: 'Apply online.', cited: ['IRD'] }] };
    expect(readMeta({ meta }, 'complete', 'Apply online.')).toBe(meta);
    expect(readMeta({ meta: {} }, 'failed', '')).toEqual({});
  });
});
