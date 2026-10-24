import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRouteView } from '@/lib/route-view'
import { priya } from '@/test/roadmap-fixtures'

const getRoadmap = vi.fn()
const getOnboardingProfile = vi.fn()
const replace = vi.fn()
const push = vi.fn()
const router = { replace, push } // stable, like Next's
vi.mock('@/lib/api', () => ({
  getRoadmap: (token: string) => getRoadmap(token),
  getOnboardingProfile: (token: string) => getOnboardingProfile(token),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => new URLSearchParams(),
}))

const { RoadmapView, RoadmapScreen } = await import('./roadmap-view')

function priyaWithWhy() {
  const r = priya()
  const t08 = r.phases.flatMap(p => p.tasks).find(t => t.taskId === 'T08')!
  t08.consequenceLine = 'Your employer needs it before your first payday.'
  return r
}
const view = () => buildRouteView(priyaWithWhy(), '2026-10-21')
const user = { name: 'Priya Sharma', initials: 'PS' }

beforeEach(() => {
  vi.clearAllMocks()
  getOnboardingProfile.mockResolvedValue({ arrivalDate: '2026-10-21' })
  getRoadmap.mockResolvedValue(priyaWithWhy())
})

describe('RoadmapView', () => {
  it('title, done count and progress bar', () => {
    render(<RoadmapView view={view()} firstUse={false} onOpen={() => {}} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your roadmap')
    expect(screen.getByText('7 of 20 tasks done')).toBeInTheDocument()
    const bar = screen.getByRole('progressbar', { name: 'Tasks done' })
    expect(bar).toHaveAttribute('aria-valuenow', '7')
    expect(bar).toHaveAttribute('aria-valuemax', '20')
    expect(screen.queryByText('Done some already? Open a task and mark it done.')).toBeNull()
  })

  it('no task selected: the current task is the next-task card with the only primary', () => {
    const onOpen = vi.fn()
    render(<RoadmapView view={view()} firstUse={false} onOpen={onOpen} />)
    const card = screen.getByRole('heading', { level: 3, name: 'Apply for your IRD number' }).closest('article')!
    expect(within(card).getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
    expect(within(card).getByText('1 hour')).toBeInTheDocument()
    fireEvent.click(within(card).getByRole('button', { name: 'Start: Apply for your IRD number' }))
    expect(onOpen).toHaveBeenCalledWith('T08')
    expect(document.querySelectorAll('button.bg-ink')).toHaveLength(1)
  })

  it('a task selected: the card collapses to a row', () => {
    render(<RoadmapView view={view()} firstUse={false} selectedTaskId="T10" onOpen={() => {}} />)
    expect(screen.queryByRole('heading', { level: 3 })).toBeNull()
    expect(screen.getByRole('button', { name: /^Apply for your IRD number/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Choose your KiwiSaver fund/ })).toHaveAttribute('aria-current', 'true')
  })

  it('first use: the hint', () => {
    render(<RoadmapView view={view()} firstUse onOpen={() => {}} />)
    expect(screen.getByText('Done some already? Open a task and mark it done.')).toBeInTheDocument()
  })
})

describe('RoadmapScreen', () => {
  it('fetches with the session token and shows the route', async () => {
    render(<RoadmapScreen user={user} />)
    expect(await screen.findByRole('list', { name: 'Your route' })).toBeInTheDocument()
    expect(getRoadmap).toHaveBeenCalledWith('tok')
  })

  it('API down: alert, Try again refetches, Ask disabled, no route', async () => {
    getRoadmap.mockRejectedValueOnce(Object.assign(new Error('down'), { status: 503 }))
    render(<RoadmapScreen user={user} />)
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByRole('heading', { level: 1 })).toHaveTextContent("Can't reach LandedNZ")
    expect(alert).toHaveTextContent('Your progress is saved. Check your connection, then try again.')
    expect(screen.getByRole('button', { name: /^Ask/ })).toBeDisabled()
    expect(screen.queryByRole('list', { name: 'Your route' })).toBeNull()
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('list', { name: 'Your route' })).toBeInTheDocument()
    expect(getRoadmap).toHaveBeenCalledTimes(2)
  })

  it('no profile: back to onboarding', async () => {
    getOnboardingProfile.mockRejectedValueOnce(Object.assign(new Error('none'), { status: 404 }))
    render(<RoadmapScreen user={user} />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding?step=1'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('opening a task puts it in the URL', async () => {
    render(<RoadmapScreen user={user} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Start: Apply for your IRD number' }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?task=T08', { scroll: false })
  })
})
