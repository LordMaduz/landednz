import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Answers } from '@/lib/answers'
import { phaseOf } from '@/test/roadmap-fixtures'

// Synthetic T01–T20 laid out by phaseOf, not the live KB tasks
const tasks = Array.from({ length: 20 }, (_, i) => {
  const taskId = `T${String(i + 1).padStart(2, '0')}`
  return { taskId, name: `KB ${taskId}`, estimatedDuration: '1 day', phase: phaseOf(taskId) }
})
const getRoadmapPreview = vi.fn(async () => ({ tasks }))
vi.mock('@/lib/api', () => ({ getRoadmapPreview: () => getRoadmapPreview() }))

const { PreviewRoute } = await import('./preview-route')

const priya: Answers = { visaType: 'AEWV', city: 'AUCKLAND', familySituation: 'SOLO', occupation: 'OTHER_PROFESSIONAL', arrivalDate: '2027-01-14' }

describe('PreviewRoute', () => {
  it('shows three legs and folds Month 1 and Later into one row with the count', async () => {
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    const route = await screen.findByRole('list', { name: 'Your roadmap' })
    const legs = within(route).getAllByRole('heading', { level: 2 }).map(h => h.textContent)
    expect(legs).toEqual(['Before you fly', 'Arrival', 'Week 1', 'Month 1 and later'])
    expect(screen.getByText(/^10 tasks: [^,]+, [^,]+, [^,]+, and more$/)).toBeInTheDocument()
    expect(screen.getByText('Choose where to live')).toBeInTheDocument()
    expect(screen.getByText('Open a bank account')).toBeInTheDocument()
    expect(screen.getByText('Accredited Employer Work Visa (AEWV), Auckland, just you, another job or profession, landing 14 January 2027.', { exact: false })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Save my roadmap' })).toHaveAttribute('href', '/auth/complete?redirect=%2Fapp')
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('marks the first task of the earliest phase, not the lowest id', async () => {
    getRoadmapPreview.mockResolvedValueOnce({
      tasks: [
        { taskId: 'T02', name: 'KB T02', estimatedDuration: '1 day', phase: 2 },
        { taskId: 'T08', name: 'KB T08', estimatedDuration: '1 day', phase: 1 },
      ],
    })
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    expect(await screen.findByText('Apply for your IRD number')).toHaveClass('font-semibold')
    expect(document.querySelectorAll('.font-semibold.grow')).toHaveLength(1)
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
    expect(await screen.findByText('Choose where to live')).toBeInTheDocument()
  })
})
