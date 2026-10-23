import { describe, it, expect } from 'vitest'
import { safeRedirect } from './safe-redirect'

describe('safeRedirect', () => {
  it.each(['/app', '/settings?tab=1'])('keeps the local path %s', (path) => {
    expect(safeRedirect(path)).toBe(path)
  })

  it.each([null, '', 'https://evil.com', '//evil.com', '/\\evil.com', 'app'])(
    'falls back to /app for %s',
    (value) => {
      expect(safeRedirect(value)).toBe('/app')
    },
  )
})
