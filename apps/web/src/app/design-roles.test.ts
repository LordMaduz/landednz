import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'

// Raw values live once in the palette block; every role points at it (spec §4).
const css = readFileSync(join(__dirname, 'globals.css'), 'utf8')

describe('design roles', () => {
  it('roles point at the palette', () => {
    const start = css.indexOf('/* palette */')
    const end = css.indexOf('/* end palette */')
    expect(start).toBeGreaterThan(-1)
    expect(end).toBeGreaterThan(start)
    const outside = css.slice(0, start) + css.slice(end)
    const raw = outside
      .split('\n')
      .filter(l => /^\s*--(color|shadow|radius)-[\w-]+\s*:/.test(l) && /#[0-9a-f]{3,8}\b|rgba?\(/i.test(l))
    expect(raw).toEqual([])
  })

  it('cn keeps role classes from different groups', () => {
    const merged = cn('bg-surface text-fg rounded-card shadow-raised', 'text-section').split(' ')
    expect(merged).toEqual(expect.arrayContaining(['bg-surface', 'text-fg', 'rounded-card', 'shadow-raised', 'text-section']))
    expect(cn('rounded-card', 'rounded-control')).toBe('rounded-control')
    expect(cn('shadow-raised', 'shadow-floating')).toBe('shadow-floating')
    expect(cn('text-fg-on-inverse-muted', 'text-small')).toBe('text-fg-on-inverse-muted text-small')
    expect(cn('text-fg', 'text-fg-muted')).toBe('text-fg-muted')
    expect(cn('bg-surface', 'bg-surface-sunken')).toBe('bg-surface-sunken')
    expect(cn('border-border', 'border-border-subtle')).toBe('border-border-subtle')
    expect(cn('px-4', 'px-page-gutter')).toBe('px-page-gutter')
  })
})
