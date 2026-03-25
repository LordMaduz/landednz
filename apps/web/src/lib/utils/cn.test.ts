import { describe, it, expect } from 'vitest'
import { cn } from './cn'

describe('cn()', () => {
  it('merges class strings with tailwind-merge conflict resolution', () => {
    // tailwind-merge removes px-4 (conflict), preserves py-2 and px-8 in original order
    expect(cn('px-4 py-2', 'px-8')).toBe('py-2 px-8')
  })

  it('handles conditional classes via clsx', () => {
    expect(cn('base', false && 'excluded', 'included')).toBe('base included')
  })

  it('deduplicates same utility', () => {
    expect(cn('text-body', 'text-body')).toBe('text-body')
  })
})
