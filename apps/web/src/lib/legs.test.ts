import { describe, expect, it } from 'vitest'
import { LEGS, legForTask, legWhen } from './legs'

describe('LEGS', () => {
  it('five legs in journey order with their tasks', () => {
    expect(LEGS.map(l => l.name)).toEqual(['Before you flew', 'Arrival', 'Week 1', 'Month 1', 'Later'])
    expect(LEGS.map(l => [l.taskIds[0], l.taskIds.at(-1)])).toEqual([
      ['T01', 'T05'],
      ['T06', 'T07'],
      ['T08', 'T10'],
      ['T11', 'T14'],
      ['T15', 'T21'],
    ])
    expect(LEGS.flatMap(l => l.taskIds)).toHaveLength(21)
  })

  it('legForTask, unknown ids go to later', () => {
    expect(legForTask('T07')).toBe('arrival')
    expect(legForTask('T14')).toBe('month1')
    expect(legForTask('T99')).toBe('later')
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
