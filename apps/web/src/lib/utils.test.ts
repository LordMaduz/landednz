import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('keeps a type role and a colour together', () => {
    expect(cn('text-section text-ink')).toBe('text-section text-ink')
    expect(cn('text-small', 'text-muted')).toBe('text-small text-muted')
  })

  it('later type role or colour wins', () => {
    expect(cn('text-body text-ink', 'text-small')).toBe('text-ink text-small')
    expect(cn('text-ink', 'text-muted')).toBe('text-muted')
  })

  it('keeps radius and shadow tokens', () => {
    expect(cn('rounded-control shadow-lift', 'rounded-surface')).toBe('shadow-lift rounded-surface')
  })
})
