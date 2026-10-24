import { render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Answers } from '@/lib/answers'

// SOLO: every KB task but T21 (couples only)
const tasks = Array.from({ length: 20 }, (_, i) => {
  const taskId = `T${String(i + 1).padStart(2, '0')}`
  return { taskId, name: `KB ${taskId}`, estimatedDuration: '1 day', phase: 1 }
})
vi.mock('@/lib/api', () => ({ getRoadmapPreview: async () => ({ tasks }) }))
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }))

const { SignIn } = await import('./sign-in-form')

const priya: Answers = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY', arrivalDate: '2027-01-14' }

afterEach(() => vi.unstubAllEnvs())

describe('SignIn', () => {
  it('with answers: back to the preview, heading and what you are saving', async () => {
    render(<SignIn answers={priya} />)
    expect(screen.getByRole('link', { name: 'Your roadmap preview' })).toHaveAttribute('href', '/onboarding/preview')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Save your roadmap')
    const aside = screen.getByRole('complementary', { name: "What you're saving" })
    expect(within(aside).getByText('Accredited Employer Work Visa (AEWV), Auckland, just you, technology, landing 14 January 2027')).toBeInTheDocument()
    const rows = (await within(aside).findAllByRole('listitem')).map(li => li.textContent)
    expect(rows).toEqual([
      'Research Auckland suburbsFirst, 4 to 6 weeks before you leave',
      'Book temporary accommodation',
      '18 more tasks, in the order they unlock',
    ])
  })

  it('without answers: just Sign in', () => {
    render(<SignIn answers={null} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sign in')
    expect(screen.queryByRole('link', { name: 'Your roadmap preview' })).toBeNull()
    expect(screen.queryByRole('complementary')).toBeNull()
  })

  it('Google button and consent links', () => {
    render(<SignIn answers={null} />)
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toHaveClass('gsi')
    expect(screen.getByRole('link', { name: 'terms' })).toHaveAttribute('href', '/terms')
    expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute('href', '/privacy')
  })

  it('password form only when enabled', () => {
    vi.stubEnv('NEXT_PUBLIC_AUTH_PASSWORD_ENABLED', 'false')
    const { unmount } = render(<SignIn answers={null} />)
    expect(screen.queryByLabelText('Password')).toBeNull()
    unmount()
    vi.stubEnv('NEXT_PUBLIC_AUTH_PASSWORD_ENABLED', 'true')
    render(<SignIn answers={null} />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })
})
