import { describe, expect, it } from 'vitest'
import { LEGS, legForPhase, legWhen } from './legs'

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
    expect(when('before')).toBe('before 21 Oct')
    expect(when('arrival')).toBe('21 to 22 Oct')
    expect(when('week1')).toBe('to 28 Oct')
    expect(when('month1')).toBe('to 20 Nov')
    expect(when('later')).toBe('from month 2')
  })

  it('crosses a month end', () => {
    expect(legWhen('arrival', '2026-10-31')).toBe('31 Oct to 1 Nov')
  })
})
