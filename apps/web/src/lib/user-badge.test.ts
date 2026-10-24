import { describe, expect, it } from 'vitest'
import { userBadge } from './user-badge'

describe('userBadge', () => {
  it('uses the Google full name', () => {
    expect(userBadge({ email: 'p@example.com', user_metadata: { full_name: 'Priya Sharma' } })).toEqual({ name: 'Priya Sharma', initials: 'PS' })
  })

  it('falls back to the email', () => {
    expect(userBadge({ email: 'e2e-auth@example.com', user_metadata: {} })).toEqual({ name: 'e2e-auth@example.com', initials: 'E' })
  })
})
