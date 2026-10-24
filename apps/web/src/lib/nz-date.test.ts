import { describe, expect, it } from 'vitest'
import { addDays, shortDay, shortDayNZ } from './nz-date'

describe('nz-date', () => {
  it('adds calendar days across a month', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(shortDay('2026-11-01')).toBe('1 Nov')
  })

  it('formats an instant on the NZ calendar', () => {
    expect(shortDayNZ('2026-10-21T11:05:00Z')).toBe('22 Oct') // 00:05 NZDT
    expect(shortDayNZ('2026-10-21T10:30:00Z')).toBe('21 Oct')
  })
})
