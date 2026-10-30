import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Opening } from './opening'

const opening = (whereYouAre: string) => ({ whereYouAre, starters: ['What do I need first?'], leftToday: 20, dailyCap: 20 })

describe('Opening', () => {
  it('sets the first sentence as the heading and the rest, unchanged, as a quieter line (board "Opening")', () => {
    render(<Opening opening={opening("You've done 0 of 19 tasks. Next up: Choose where to live.")} onAsk={vi.fn()} />)
    expect(screen.getByRole('heading', { name: "You've done 0 of 19 tasks." })).toBeInTheDocument()
    expect(screen.getByText('Next up: Choose where to live.').tagName).toBe('P')
  })

  it('a one-sentence line is the heading alone', () => {
    render(<Opening opening={opening('Welcome to the guide.')} onAsk={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Welcome to the guide.' })).toBeInTheDocument()
    expect(screen.queryByRole('paragraph')).toBeNull()
  })
})
