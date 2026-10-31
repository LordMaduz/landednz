import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('keeps a type role and a colour together', () => {
    expect(cn('text-section text-fg')).toBe('text-section text-fg')
    expect(cn('text-small', 'text-fg-muted')).toBe('text-small text-fg-muted')
  })

  it('later type role or colour wins', () => {
    expect(cn('text-body text-fg', 'text-small')).toBe('text-fg text-small')
    expect(cn('text-fg', 'text-fg-muted')).toBe('text-fg-muted')
  })

  it('keeps radius and shadow tokens', () => {
    expect(cn('rounded-control shadow-raised', 'rounded-card')).toBe('shadow-raised rounded-card')
  })
})
