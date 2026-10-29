import { describe, expect, it } from 'vitest'
import { landChip, monthGrid, moveDate } from './calendar'

describe('monthGrid', () => {
  it('covers whole Monday-first weeks', () => {
    const g = monthGrid('2026-10')
    expect(g).toHaveLength(35)
    expect(g[0]).toBe('2026-09-28')
    expect(g[34]).toBe('2026-11-01')
  })
})

describe('moveDate', () => {
  it('crosses year edges and moves by weeks', () => {
    expect(moveDate('2027-01-01', 'ArrowLeft')).toBe('2026-12-31')
    expect(moveDate('2026-12-31', 'ArrowRight')).toBe('2027-01-01')
    expect(moveDate('2026-10-30', 'ArrowDown')).toBe('2026-11-06')
    expect(moveDate('2026-10-30', 'ArrowUp')).toBe('2026-10-23')
  })
  it('pages by month and clamps to the month end', () => {
    expect(moveDate('2026-03-31', 'PageUp')).toBe('2026-02-28')
    expect(moveDate('2026-01-31', 'PageDown')).toBe('2026-02-28')
    expect(moveDate('2026-12-15', 'PageDown')).toBe('2027-01-15')
  })
  it('Home and End go to Monday and Sunday', () => {
    expect(moveDate('2026-10-30', 'Home')).toBe('2026-10-26')
    expect(moveDate('2026-10-30', 'End')).toBe('2026-11-01')
    expect(moveDate('2026-10-26', 'Home')).toBe('2026-10-26')
  })
})

describe('landChip', () => {
  it('words the distance from today', () => {
    const t = '2026-10-29'
    expect(landChip(t, t)).toBe('Today')
    expect(landChip('2026-10-30', t)).toBe('Tomorrow')
    expect(landChip('2026-10-28', t)).toBe('Yesterday')
    expect(landChip('2026-11-03', t)).toBe('In 5 days')
    expect(landChip('2026-10-24', t)).toBe('5 days ago')
  })
})
