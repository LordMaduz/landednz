import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRouteView } from '@/lib/route-view'
import { Toaster } from '@/components/ui/toaster'
import { apiTask, priya } from '@/test/roadmap-fixtures'

const getRoadmap = vi.fn()
const getOnboardingProfile = vi.fn()
const replace = vi.fn()
const push = vi.fn()
const back = vi.fn()
const router = { replace, push, back } // stable, like Next's
let params = new URLSearchParams()
const completeTask = vi.fn()
const reopenTask = vi.fn()
vi.mock('@/lib/api', () => ({
  getRoadmap: (token: string) => getRoadmap(token),
  getOnboardingProfile: (token: string) => getOnboardingProfile(token),
  getTaskDetail: async (taskId: string) => ({
    taskId,
    steps: [],
    governmentSourceUrl: 'https://www.ird.govt.nz',
    lastVerified: null,
    documentsRequired: [],
    processingTime: null,
    commonMistakes: [],
  }),
  completeTask: (id: string, token: string) => completeTask(id, token),
  reopenTask: (id: string, token: string) => reopenTask(id, token),
}))
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { getSession: async () => ({ data: { session: { access_token: 'tok' } } }) } }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams: () => params,
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
  params = new URLSearchParams()
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

  it('?task=: the sheet beside the route; Close drops task from the URL', async () => {
    params = new URLSearchParams('task=T08')
    render(<RoadmapScreen user={user} />)
    expect(await screen.findByRole('complementary', { name: 'Apply for your IRD number' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Close task' }))
    expect(push).toHaveBeenCalledWith('/app/roadmap', { scroll: false })
  })

  it('Mark as done then Undo: the route refetches and shows T09 blocked again (Review Focus 3)', async () => {
    params = new URLSearchParams('task=T08')
    const afterDone = priyaWithWhy()
    for (const t of afterDone.phases.flatMap(p => p.tasks)) {
      if (t.taskId === 'T08') Object.assign(t, apiTask('T08', { status: 'COMPLETE', completedAt: '2026-10-24T01:00:00.000Z' }))
      if (t.taskId === 'T09') Object.assign(t, { isBlocked: false, blockingTaskIds: [], blockingTaskNames: [] })
    }
    getRoadmap.mockResolvedValueOnce(priyaWithWhy()).mockResolvedValueOnce(afterDone).mockResolvedValueOnce(priyaWithWhy())
    completeTask.mockResolvedValue(undefined)
    reopenTask.mockResolvedValue(undefined)
    render(<><RoadmapScreen user={user} /><Toaster /></>)
    const t09 = () => screen.getByRole('button', { name: /^Give your employer a tax code/ })

    fireEvent.click(await screen.findByRole('button', { name: 'Mark as done' }))
    await waitFor(() => expect(t09()).not.toHaveTextContent('Needs your IRD number first'))
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(t09()).toHaveTextContent('Needs your IRD number first'))
    expect(getRoadmap).toHaveBeenCalledTimes(3)
    // refetches keep the sheet open: no loading state in between
    expect(screen.getByRole('complementary', { name: 'Apply for your IRD number' })).toBeInTheDocument()
  })

  it('header Ask with no task open: opens the current task', async () => {
    render(<RoadmapScreen user={user} />)
    await screen.findByRole('list', { name: 'Your route' })
    fireEvent.click(screen.getByRole('button', { name: /^Ask/ }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?task=T08', { scroll: false })
  })

  it('header Ask with the sheet open: focuses the ask input', async () => {
    params = new URLSearchParams('task=T08')
    render(<RoadmapScreen user={user} />)
    const box = await screen.findByRole('textbox', { name: 'Ask about your IRD number' })
    fireEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ }))
    expect(box).toHaveFocus()
  })

  it('?task=T08&ask=1 (Ask from Home): the ask input is focused', async () => {
    params = new URLSearchParams('task=T08&ask=1')
    render(<RoadmapScreen user={user} />)
    const box = await screen.findByRole('textbox', { name: 'Ask about your IRD number' })
    await vi.waitFor(() => expect(box).toHaveFocus())
  })
})
