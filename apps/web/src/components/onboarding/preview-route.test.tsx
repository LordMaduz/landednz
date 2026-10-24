import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Answers } from '@/lib/answers'

// SOLO: every KB task but T21 (couples only)
const tasks = Array.from({ length: 20 }, (_, i) => {
  const taskId = `T${String(i + 1).padStart(2, '0')}`
  return { taskId, name: `KB ${taskId}`, estimatedDuration: '1 day', phase: 1 }
})
const getRoadmapPreview = vi.fn(async () => ({ tasks }))
vi.mock('@/lib/api', () => ({ getRoadmapPreview: () => getRoadmapPreview() }))

const { PreviewRoute } = await import('./preview-route')

const priya: Answers = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'TECHNOLOGY', arrivalDate: '2027-01-14' }

describe('PreviewRoute', () => {
  it('shows three legs and folds Month 1 and Later into one row with the count', async () => {
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    const route = await screen.findByRole('list', { name: 'Your roadmap' })
    const legs = within(route).getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(legs).toEqual(['Before you fly', 'Arrival', 'Week 1', 'Month 1 and later'])
    expect(screen.getByText(/^10 tasks: renting/)).toBeInTheDocument()
    expect(screen.getByText('Research Auckland suburbs')).toBeInTheDocument()
    expect(screen.getByText('Open a bank account')).toBeInTheDocument()
    expect(screen.getByText('Accredited Employer Work Visa (AEWV), Auckland, just you, technology, landing 14 January 2027.', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Save my roadmap' })).toHaveAttribute('href', '/auth/complete?redirect=%2Fapp')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('API down: a retryable alert under the page h1', async () => {
    getRoadmapPreview.mockRejectedValueOnce(new Error('down'))
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    expect(await screen.findByRole('heading', { level: 2, name: "Can't reach LandedNZ" })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('says when saving failed', async () => {
    render(<PreviewRoute answers={{ ...priya, city: 'OTHER' }} saveFailed />)
    expect(screen.getByRole('alert')).toHaveTextContent("Your roadmap wasn't saved")
    expect(await screen.findByText('Research suburbs where you will live')).toBeInTheDocument()
  })
})
