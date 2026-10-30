import { describe, expect, it } from 'vitest'
import type { GuideMessageDto, ReplyPart } from '@landednz/types'
import { applyEvent, askedOn, groupBlocks, provenance, textCount, turnsFromHistory, type Turn } from './guide-turns'

const row = (o: Partial<GuideMessageDto> & Pick<GuideMessageDto, 'id' | 'role'>): GuideMessageDto => ({
  text: '', parts: null, status: 'complete', screen: { kind: 'home' }, createdAt: '2026-10-30T00:00:00.000Z', ...o,
})
const text = (t: string, extra: Partial<Extract<ReplyPart, { type: 'text' }>> = {}) => ({ type: 'text' as const, text: t, citations: [], ...extra })
const source = (index: number, url: string, origin: 'guide' | 'official' = 'guide'): ReplyPart =>
  ({ type: 'source', index, title: 't', url, origin, checkedAt: '2026-10-30' })

describe('turnsFromHistory', () => {
  it('pairs each user row with the assistant row after it; a failed row with null parts stays failed', () => {
    const turns = turnsFromHistory([
      row({ id: 'u1', role: 'user', text: 'Q1', screen: { kind: 'task', taskKey: 'T1' } }),
      row({ id: 'a1', role: 'assistant', parts: [text('A.')] }),
      row({ id: 'u2', role: 'user', text: 'Q2' }),
      row({ id: 'a2', role: 'assistant', parts: null, status: 'failed' }),
    ])
    expect(turns).toHaveLength(2)
    expect(turns[0]).toMatchObject({ question: 'Q1', screen: { kind: 'task', taskKey: 'T1' }, assistantId: 'a1', parts: [text('A.')], status: 'complete' })
    expect(turns[1]).toMatchObject({ question: 'Q2', assistantId: 'a2', parts: [], status: 'failed' })
  })

  it('skips an assistant row whose question is on an older page', () => {
    expect(turnsFromHistory([row({ id: 'a0', role: 'assistant' }), row({ id: 'u1', role: 'user' }), row({ id: 'a1', role: 'assistant' })])).toHaveLength(1)
  })
})

describe('applyEvent', () => {
  const t: Turn = { key: 'k', question: 'q', screen: { kind: 'home' }, assistantId: null, parts: [], status: 'sending', createdAt: '' }
  it('start, part, done', () => {
    const started = applyEvent(t, { event: 'start', data: { userMessageId: 'u', assistantMessageId: 'a' } })
    expect(started).toMatchObject({ assistantId: 'a', status: 'streaming' })
    const withPart = applyEvent(started, { event: 'part', data: text('Hi.') })
    expect(withPart.parts).toEqual([text('Hi.')])
    expect(applyEvent(withPart, { event: 'done', data: { assistantMessageId: 'a', status: 'complete' } }).status).toBe('complete')
  })
})

describe('textCount', () => {
  it('ignores crisis text', () => {
    const t: Turn = { key: 'k', question: 'q', screen: { kind: 'home' }, assistantId: 'a', parts: [text('c', { block: 'crisis' }), text('x'), source(1, 'https://a.nz')], status: 'streaming', createdAt: '' }
    expect(textCount(t)).toBe(1)
  })
})

describe('provenance', () => {
  it('all guide sources: guide label, host without www, count', () => {
    const parts = [1, 2, 3].map(i => source(i, `https://www.ird.govt.nz/p${i}`))
    expect(provenance(parts)).toEqual({ label: "LandedNZ's checked guide", domain: 'ird.govt.nz', count: 3 })
  })
  it('one official source: official label; most frequent host wins', () => {
    const parts = [source(1, 'https://www.ird.govt.nz/a'), source(2, 'https://ird.govt.nz/b'), source(3, 'https://immigration.govt.nz/c', 'official')]
    expect(provenance(parts)).toEqual({ label: 'Official sites, checked today', domain: 'ird.govt.nz', count: 3 })
  })
  it('null without sources', () => {
    expect(provenance([text('x')])).toBeNull()
  })
})

describe('groupBlocks', () => {
  it('consecutive steps form one list; the same step number forms one item', () => {
    const p = text('Intro.'), s1a = text('1a', { block: 'step', step: 1 }), s1b = text('1b', { block: 'step', step: 1 }), s2 = text('2', { block: 'step', step: 2 })
    const lim = text('Limit.', { block: 'limits' }), c = text('Call 1737.', { block: 'crisis' })
    expect(groupBlocks([c, p, s1a, s1b, s2, source(1, 'https://a.nz'), lim])).toEqual([
      { kind: 'crisis', parts: [c] },
      { kind: 'prose', parts: [p] },
      { kind: 'steps', items: [[s1a, s1b], [s2]] },
      { kind: 'limits', parts: [lim] },
    ])
  })
})

describe('askedOn', () => {
  const now = new Date('2026-10-30T02:00:00.000Z') // 30 Oct, 3 pm in Auckland
  const t = (screen: Turn['screen'], createdAt: string) => ({ screen, createdAt })
  it('names where and when an earlier day\'s question was asked (board "Asked on this task · 29 Oct")', () => {
    expect(askedOn(t({ kind: 'task', taskKey: 'T08' }, '2026-10-29T01:00:00.000Z'), { kind: 'task', taskKey: 'T08' }, now)).toBe('Asked on this task · 29 Oct')
    expect(askedOn(t({ kind: 'task', taskKey: 'T07' }, '2026-10-29T01:00:00.000Z'), { kind: 'task', taskKey: 'T08' }, now)).toBe('Asked on Open a bank account · 29 Oct')
    expect(askedOn(t({ kind: 'home' }, '2026-10-28T01:00:00.000Z'), { kind: 'roadmap' }, now)).toBe('Asked on Home · 28 Oct')
    expect(askedOn(t({ kind: 'roadmap' }, '2026-10-28T01:00:00.000Z'), null, now)).toBe('Asked on your roadmap · 28 Oct')
  })
  it('says nothing for today\'s questions, judged in New Zealand time', () => {
    // 29 Oct 11:30 UTC is 30 Oct 00:30 in Auckland: today there
    expect(askedOn(t({ kind: 'home' }, '2026-10-29T11:30:00.000Z'), { kind: 'home' }, now)).toBeNull()
  })
})
