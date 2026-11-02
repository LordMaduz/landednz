import { describe, expect, it } from 'vitest'
import { guides, guide, GUIDE_SLUGS } from './guides'

describe('guides', () => {
  it('every active task has a slug in GUIDE_SLUGS', () => {
    const all = guides()
    all.forEach(g => {
      expect(GUIDE_SLUGS[g.id]).toBe(g.slug)
    })
  })

  it('slugs are unique', () => {
    const slugs = Object.values(GUIDE_SLUGS)
    const unique = new Set(slugs)
    expect(unique.size).toBe(slugs.length)
  })

  it('slugs are URL-safe (lowercase, hyphens only)', () => {
    Object.values(GUIDE_SLUGS).forEach(slug => {
      expect(slug).toMatch(/^[a-z0-9-]+$/)
      expect(slug).not.toMatch(/--/)
      expect(slug).not.toMatch(/^-|-$/)
    })
  })

  it('retired tasks are excluded', () => {
    const all = guides()
    const retiredIds = ['T03', 'T04', 'T05', 'T13', 'T14', 'T15', 'T18', 'T20', 'T21']
    retiredIds.forEach(id => {
      expect(all.find(g => g.id === id)).toBeUndefined()
    })
  })

  it('items with when condition are filtered out', () => {
    const g = guide('get-ird-number') // T08
    expect(g).toBeDefined()
    if (!g) return
    const hasWhen = [...g.why, ...g.steps, ...g.documents, ...g.mistakes, ...g.watchOuts]
      .some(item => 'when' in item && item.when)
    expect(hasWhen).toBe(false)
  })

  it('checkedAt is present and formatted', () => {
    const all = guides()
    all.forEach(g => {
      expect(g.checkedAt).toMatch(/^\d{1,2} [A-Z][a-z]{2} \d{4}$/) // e.g., "27 Oct 2026"
    })
  })

  it('guide(slug) returns undefined for unknown slug', () => {
    expect(guide('unknown-slug')).toBeUndefined()
  })

  it('guide(slug) returns correct sections and sources', () => {
    const g = guide('get-ird-number') // T08
    expect(g).toBeDefined()
    if (!g) return
    expect(g.name).toBe('Get your IRD number')
    expect(g.why.length).toBeGreaterThan(0)
    expect(g.steps.length).toBeGreaterThan(0)
    expect(g.sources.length).toBeGreaterThan(0)
    g.sources.forEach(s => {
      expect(s.title).toBeTruthy()
      expect(s.agency).toBeTruthy()
      expect(s.url).toMatch(/^https?:\/\//)
    })
  })

  it('guide count matches GUIDE_SLUGS active entries', () => {
    const all = guides()
    expect(all.length).toBe(Object.keys(GUIDE_SLUGS).length)
  })
})