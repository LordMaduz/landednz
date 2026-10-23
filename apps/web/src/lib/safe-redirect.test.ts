import { describe, it, expect } from 'vitest'
import { safeRedirect } from './safe-redirect'

describe('safeRedirect', () => {
  it.each(['/app', '/settings?tab=1', '/app#top'])('keeps the local path %s', (path) => {
    expect(safeRedirect(path)).toBe(path)
  })

  it.each([
    null,
    '',
    'https://evil.com',
    '//evil.com',
    '/\\evil.com',
    'app',
    // URL parsing strips tab/newline, turning these into //evil.com
    '/\t/evil.com',
    '/\n/evil.com',
    '/\r/evil.com',
  ])('falls back to /app for %j', (value) => {
    expect(safeRedirect(value)).toBe('/app')
  })
})
