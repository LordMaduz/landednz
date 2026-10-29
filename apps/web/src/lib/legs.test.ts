import { describe, expect, it } from 'vitest'
import { LEGS, legForPhase, legName, legWhen } from './legs'

describe('LEGS', () => {
  it('five legs in journey order', () => {
    expect(LEGS.map(l => l.name)).toEqual(['Before you flew', 'Arrival', 'Week 1', 'Month 1', 'Later'])
  })

  it('legForPhase maps phases 1 to 5 onto the legs; anything else goes to later', () => {
    expect([1, 2, 3, 4, 5].map(legForPhase)).toEqual(['before', 'arrival', 'week1', 'month1', 'later'])
    expect(legForPhase(0)).toBe('later')
    expect(legForPhase(6)).toBe('later')
  })
})

describe('legWhen', () => {
  it('dates each leg from the arrival date', () => {
    const when = (leg: Parameters<typeof legWhen>[0]) => legWhen(leg, '2026-10-21')
    expect(when('before')).toBe('by 21 Oct')
    expect(when('arrival')).toBe('21–22 Oct')
    expect(when('week1')).toBe('to 28 Oct')
    expect(when('month1')).toBe('to 20 Nov')
    expect(when('later')).toBe('from November')
  })

  it('matches the board for a 1 Mar arrival', () => {
    expect(['before', 'arrival', 'week1', 'month1', 'later'].map(l => legWhen(l as 'before', '2027-03-01'))).toEqual([
      'by 1 Mar', '1–2 Mar', 'to 8 Mar', 'to 31 Mar', 'from April',
    ])
  })

  it('names the first leg by tense', () => {
    expect(legName('before', true)).toBe('Before you fly')
    expect(legName('before', false)).toBe('Before you flew')
    expect(legName('week1', true)).toBe('Week 1')
  })

  it('crosses a month end', () => {
    expect(legWhen('arrival', '2026-10-31')).toBe('31 Oct–1 Nov')
  })
})
