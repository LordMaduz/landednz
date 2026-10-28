import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildRouteView, type RouteView } from '@/lib/route-view'
import { Toaster } from '@/components/ui/toaster'
import { apiTask, board, priya } from '@/test/roadmap-fixtures'

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
const view = () => buildRouteView(priyaWithWhy(), '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))
const user = { name: 'Priya Sharma', initials: 'PS' }

beforeEach(() => {
  vi.clearAllMocks()
  params = new URLSearchParams()
  getOnboardingProfile.mockResolvedValue({ arrivalDate: '2026-10-21' })
  getRoadmap.mockResolvedValue(priyaWithWhy())
})

const NOW = new Date('2026-10-23T10:00:00+13:00')
const BOARD_NOW = new Date('2026-11-06T10:00:00+13:00')
const boardView = () => buildRouteView(board(), '2026-11-02', BOARD_NOW)
const renderView = (over: Partial<{ view: RouteView; arrivalDate: string; now: Date; firstUse: boolean }> = {}) =>
  render(<RoadmapView view={view()} arrivalDate="2026-10-21" now={NOW} firstUse={false} {...over} />)
const renderBoard = () => renderView({ view: boardView(), arrivalDate: '2026-11-02', now: BOARD_NOW })
const itinerary = () => screen.getByRole('region', { name: 'Itinerary' })

describe('RoadmapView', () => {
  it('title and the done/landed subline', () => {
    renderView()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your roadmap')
    expect(screen.getByText('7 of 20 done · day 3 since you landed on Wed 21 Oct')).toBeInTheDocument()
    expect(screen.queryByText('Done some already? Open a task and mark it done.')).toBeNull()
  })

  it('before arrival the subline counts down', () => {
    renderView({ arrivalDate: '2026-11-05' })
    expect(screen.getAllByText('13 days until you land on 5 November 2026.')).toHaveLength(2) // desktop and phone variants
  })

  it('the old cards are gone; the road card holds the tall track', () => {
    renderBoard()
    for (const name of ['Up next', 'Key dates', 'Other stages']) expect(screen.queryByRole('heading', { name })).toBeNull()
    expect(screen.getByRole('region', { name: 'Where you are' })).toBeInTheDocument()
    expect(document.querySelector('.track[data-variant="tall"]')).not.toBeNull()
  })

  it('itinerary order: Done so far, Today, Week 1, Month 1, Later', () => {
    renderBoard()
    const rows = [...itinerary().querySelectorAll(':scope > ol > li')].map(li => li.textContent ?? '')
    expect(rows).toHaveLength(5)
    expect(rows[0]).toMatch(/^by 2 Nov2–3 Nov.*Done so far.*Before you flew 6 of 6 · Arrival 3 of 4.*SIM cards, bank accounts, your visa conditions/)
    expect(rows[1]).toMatch(/^TodayFri 6 Nov.*day 5.*You're here · up next · 1 hour.*Apply for your IRD number/)
    expect(rows[2]).toMatch(/^to 9 Nov3 days left.*Week 1 · 7 tasks/)
    expect(rows[3]).toMatch(/Month 1.*4 tasks, 2 wait on your IRD number/)
    expect(rows[4]).toMatch(/Later.*1 task/)
  })

  it('Today: why, unlocks with stages, ink Start task, Ask keeps ask=1', () => {
    renderBoard()
    const today = within(itinerary()).getByRole('heading', { level: 2, name: 'Apply for your IRD number' })
    expect(today).toBeInTheDocument()
    expect(itinerary().textContent).toContain('Unlocks 3 tasks:')
    expect(itinerary().textContent).toContain('Give your employer a tax code (IR330) (Week 1)')
    expect(screen.getByRole('link', { name: /Start task/ })).toHaveAttribute('href', '/app/roadmap?task=T08')
    expect(screen.getByRole('link', { name: 'Ask about this' })).toHaveAttribute('href', '/app/roadmap?task=T08&ask=1')
    expect(document.querySelectorAll('.bg-ink')).toHaveLength(1)
  })

  it('Week 1 shows 3 rows with meta; Show 4 more reveals 4 in place', () => {
    renderBoard()
    const stage = within(itinerary()).getByRole('list', { name: 'Week 1 tasks' })
    expect(within(stage).getAllByRole('listitem')).toHaveLength(3)
    expect(within(stage).getByText('Waits on your IRD number')).toBeInTheDocument()
    const show = within(itinerary()).getByRole('button', { name: 'Show 4 more' })
    expect(show).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(show)
    expect(show).toHaveAttribute('aria-expanded', 'true')
    expect(within(stage).getAllByRole('listitem')).toHaveLength(7)
  })

  it('carried tasks: the title counts the stage and names where the rest are from; rows start with their stage', () => {
    renderView({ view: buildRouteView(board(), '2026-11-02', new Date('2026-11-15T10:00:00+13:00')), arrivalDate: '2026-11-02', now: new Date('2026-11-15T10:00:00+13:00') })
    expect(within(itinerary()).getByRole('heading', { name: /^Month 1 · 4 tasks, \d+ still open from Week 1/ })).toBeInTheDocument()
    expect(within(itinerary()).getAllByText(/^Week 1 · /).length).toBeGreaterThan(0)
  })

  it('every Show is a toggle button; later stages expand in place', () => {
    renderBoard()
    const shows = within(itinerary()).getAllByRole('button', { name: /^Show/ })
    expect(shows).toHaveLength(4)
    for (const b of shows) expect(b).toHaveAttribute('aria-expanded', 'false')
    const month = within(itinerary()).getByRole('button', { name: 'Show Month 1 tasks' })
    expect(within(itinerary()).queryByRole('link', { name: /KiwiSaver fund/ })).toBeNull()
    fireEvent.click(month)
    expect(month).toHaveAttribute('aria-expanded', 'true')
    expect(within(itinerary()).getByRole('link', { name: /Choose your KiwiSaver fund/ })).toHaveAttribute('href', '/app/roadmap?task=T10')
  })

  it('Done so far expands to the done tasks, each linking to its task', () => {
    renderBoard()
    const show = within(itinerary()).getByRole('button', { name: 'Show done tasks' })
    expect(within(itinerary()).queryByRole('link', { name: 'Get an NZ SIM card' })).toBeNull()
    fireEvent.click(show)
    expect(within(itinerary()).getByRole('link', { name: 'Get an NZ SIM card' })).toHaveAttribute('href', '/app/roadmap?task=T06')
  })

  it('?done=1 opens Done so far expanded', () => {
    params = new URLSearchParams('done=1')
    renderBoard()
    expect(within(itinerary()).getByRole('button', { name: 'Hide done tasks' })).toHaveAttribute('aria-expanded', 'true')
    expect(within(itinerary()).getAllByRole('link', { name: /./ }).filter(a => a.getAttribute('href')?.startsWith('/app/roadmap?task='))).toHaveLength(2 + 9 + 3)
  })

  it('first use: the hint', () => {
    renderView({ firstUse: true })
    expect(screen.getByText('Done some already? Open a task and mark it done.')).toBeInTheDocument()
  })
})

describe('RoadmapScreen', () => {
  it('fetches with the session token and shows the route', async () => {
    render(<RoadmapScreen user={user} />)
    expect(await screen.findByRole('region', { name: 'Itinerary' })).toBeInTheDocument()
    expect(getRoadmap).toHaveBeenCalledWith('tok')
  })

  it('API down: alert, Try again refetches, Ask disabled, no route', async () => {
    getRoadmap.mockRejectedValueOnce(Object.assign(new Error('down'), { status: 503 }))
    render(<RoadmapScreen user={user} />)
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByRole('heading', { level: 1 })).toHaveTextContent("Can't reach LandedNZ")
    expect(alert).toHaveTextContent('Your progress is saved. Check your connection, then try again.')
    expect(screen.getByRole('button', { name: /^Ask/ })).toBeDisabled()
    expect(screen.queryByRole('region', { name: 'Itinerary' })).toBeNull()
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('region', { name: 'Itinerary' })).toBeInTheDocument()
    expect(getRoadmap).toHaveBeenCalledTimes(2)
  })

  it('no profile: back to onboarding', async () => {
    getOnboardingProfile.mockRejectedValueOnce(Object.assign(new Error('none'), { status: 404 }))
    render(<RoadmapScreen user={user} />)
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding?step=1'))
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('a task row links to its task page', async () => {
    render(<RoadmapScreen user={user} />)
    const link = await screen.findByRole('link', { name: /^Sign a rental/ })
    expect(link).toHaveAttribute('href', '/app/roadmap?task=T11')
  })

  it('?task=: the task page in place of the route', async () => {
    params = new URLSearchParams('task=T08')
    render(<RoadmapScreen user={user} />)
    expect(await screen.findByRole('article', { name: 'Apply for your IRD number' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Itinerary' })).toBeNull()
  })

  it('Mark as done then Undo: the route refetches each time and the page stays (Review Focus 3)', async () => {
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
    fireEvent.click((await screen.findAllByRole('button', { name: 'Mark as done' }))[0]) // desktop copy first; the phone layout repeats it
    await waitFor(() => expect(getRoadmap).toHaveBeenCalledTimes(2))
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(getRoadmap).toHaveBeenCalledTimes(3))
    // refetches keep the page up: no loading state in between
    expect(screen.getByRole('article', { name: 'Apply for your IRD number' })).toBeInTheDocument()
  })

  it('header Ask with no task open: opens the current task', async () => {
    render(<RoadmapScreen user={user} />)
    await screen.findByRole('region', { name: 'Itinerary' })
    fireEvent.click(screen.getByRole('button', { name: /^Ask/ }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?task=T08')
  })

  it('header Ask with a task open: focuses the ask input', async () => {
    params = new URLSearchParams('task=T08')
    render(<RoadmapScreen user={user} />)
    const box = await screen.findByRole('textbox', { name: 'Ask about your IRD number' })
    fireEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ }))
    expect(box).toHaveFocus()
  })

  it('?ask=1 with no task (Ask from Settings): opens the current task', async () => {
    params = new URLSearchParams('ask=1')
    render(<RoadmapScreen user={user} />)
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/app/roadmap?task=T08&ask=1', { scroll: false }))
  })

  it('?task=T08&ask=1 (Ask from Home): the ask input is focused', async () => {
    params = new URLSearchParams('task=T08&ask=1')
    render(<RoadmapScreen user={user} />)
    const box = (await screen.findAllByRole('textbox', { name: 'Ask about your IRD number' }))[0]
    await vi.waitFor(() => expect(box).toHaveFocus())
  })
})
