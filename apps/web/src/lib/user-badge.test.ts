import { describe, expect, it } from 'vitest'
import { userBadge } from './user-badge'

describe('userBadge', () => {
  it('uses the Google full name and picture', () => {
    expect(userBadge({ email: 'p@example.com', user_metadata: { full_name: 'Priya Sharma', avatar_url: 'https://lh3.googleusercontent.com/a/x' } }))
      .toEqual({ name: 'Priya Sharma', initials: 'PS', email: 'p@example.com', avatar: 'https://lh3.googleusercontent.com/a/x' })
  })

  it('falls back to the email, with no photo', () => {
    expect(userBadge({ email: 'e2e-auth@example.com', user_metadata: {} })).toEqual({ name: 'e2e-auth@example.com', initials: 'E', email: 'e2e-auth@example.com', avatar: undefined })
  })
})
