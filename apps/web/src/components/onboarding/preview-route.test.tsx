import { fireEvent, render, screen, within } from '@testing-library/react'
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
  it('rail of answers, itinerary with Start here, folded stages, Save card', async () => {
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    const rail = screen.getByRole('list', { name: 'Your answers' })
    expect(within(rail).getAllByRole('link', { name: /Change/ })).toHaveLength(5)
    expect(screen.getByText('All five answered. Change any of them and the roadmap updates.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Your roadmap is ready' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Change my answers' })).toHaveAttribute('href', '/onboarding?step=1')

    expect(await screen.findByRole('heading', { level: 2, name: /^Before you fly/ })).toHaveTextContent('Before you fly · 5 tasks')
    const start = screen.getByText(/^Start here/).closest('section')!
    expect(within(start).getByText('Choose where to live')).toBeInTheDocument()
    expect(within(start).getByText('First, 4 to 6 weeks before you leave', { exact: false })).toBeInTheDocument()
    expect(within(start).getByText('The next task waits on this one.')).toBeInTheDocument()

    // 3 next tasks, then the rest behind Show n more
    const more = screen.getByRole('button', { name: /^Show 1 more Before you fly tasks$/ })
    expect(more).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByText('Sort your home-country tax')).toBeNull()
    fireEvent.click(more)
    expect(more).toHaveAttribute('aria-expanded', 'true')

    for (const [name, n] of [['Arrival', 2], ['Week 1', 3], ['Month 1 and later', 10]] as const) {
      const h = screen.getByRole('heading', { level: 2, name: new RegExp(`^${name}`) })
      expect(h).toHaveTextContent(`${name} · ${n} tasks`)
      const show = within(h.closest('li')!).getByRole('button', { name: `Show ${name}` })
      expect(show).toHaveAttribute('aria-expanded', 'false')
      const panel = document.getElementById(show.getAttribute('aria-controls')!)!
      expect(panel).toHaveAttribute('hidden')
      fireEvent.click(show)
      expect(show).toHaveAttribute('aria-expanded', 'true')
      expect(show).toHaveAccessibleName(`Hide ${name}`)
      expect(panel).not.toHaveAttribute('hidden')
      expect(panel.querySelectorAll('li').length).toBe(n)
    }
    expect(screen.getByRole('link', { name: 'Save my roadmap' })).toHaveAttribute('href', '/auth/complete?redirect=%2Fapp')
    expect(screen.getByText('Sign in with Google or email on the next screen.')).toBeInTheDocument()
    expect(document.querySelector('.sticky')).toBeNull()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Start here is the first task of the earliest phase, not the lowest id', async () => {
    getRoadmapPreview.mockResolvedValueOnce({
      tasks: [
        { taskId: 'T02', name: 'KB T02', estimatedDuration: '1 day', phase: 2 },
        { taskId: 'T08', name: 'KB T08', estimatedDuration: '1 day', phase: 1 },
        { taskId: 'T09', name: 'KB T09', estimatedDuration: '1 day', phase: 1 },
      ],
    })
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    const start = (await screen.findByText(/^Start here/)).closest('section')!
    expect(within(start).getByText('Apply for your IRD number')).toBeInTheDocument()
    expect(within(start).getByText('The next task waits on this one.')).toBeInTheDocument()
  })

  it('no "waits on this one" line when nothing depends on the first task', async () => {
    getRoadmapPreview.mockResolvedValueOnce({ tasks: [{ taskId: 'T06', name: 'KB T06', estimatedDuration: '1 day', phase: 1 }] })
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    await screen.findByText(/^Start here/)
    expect(screen.queryByText('The next task waits on this one.')).toBeNull()
  })

  it('loading line, then API down: a retryable alert under the page h1', async () => {
    getRoadmapPreview.mockRejectedValueOnce(new Error('down'))
    render(<PreviewRoute answers={priya} saveFailed={false} />)
    expect(screen.getByText('Building your roadmap…')).toBeInTheDocument()
    expect(await screen.findByRole('heading', { level: 2, name: "Can't reach LandedNZ" })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('says when saving failed', async () => {
    render(<PreviewRoute answers={{ ...priya, city: 'OTHER' }} saveFailed />)
    expect(screen.getByRole('alert')).toHaveTextContent("Your roadmap wasn't saved")
    expect(await screen.findByText('Choose where to live')).toBeInTheDocument()
  })
})
