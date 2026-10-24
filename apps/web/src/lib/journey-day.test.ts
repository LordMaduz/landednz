import { describe, expect, it } from 'vitest'
import { journeyDay } from './journey-day'

describe('journeyDay', () => {
  it('arrival day is day 1 until NZ midnight', () => {
    expect(journeyDay('2026-10-21', new Date('2026-10-21T10:30:00Z'))).toBe(1) // 23:30 NZDT
  })

  it('00:05 NZ the next day is day 2', () => {
    expect(journeyDay('2026-10-21', new Date('2026-10-21T11:05:00Z'))).toBe(2)
  })

  it('before arrival counts down (day ≤ 0)', () => {
    expect(journeyDay('2026-11-01', new Date('2026-10-24T00:00:00Z'))).toBe(-7)
  })
})
