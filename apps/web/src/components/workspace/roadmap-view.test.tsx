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
const view = () => buildRouteView(priyaWithWhy(), '2026-10-21', new Date('2026-10-23T10:00:00+13:00'))
const user = { name: 'Priya Sharma', initials: 'PS' }

beforeEach(() => {
  vi.clearAllMocks()
  params = new URLSearchParams()
  getOnboardingProfile.mockResolvedValue({ arrivalDate: '2026-10-21' })
  getRoadmap.mockResolvedValue(priyaWithWhy())
})

const NOW = new Date('2026-10-23T10:00:00+13:00')
const renderView = (over: Partial<{ arrivalDate: string; now: Date; firstUse: boolean; onOpen: (id: string) => void }> = {}) =>
  render(<RoadmapView view={view()} arrivalDate="2026-10-21" now={NOW} firstUse={false} onOpen={() => {}} {...over} />)

describe('RoadmapView', () => {
  it('title and the done/landed subline', () => {
    renderView()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your roadmap')
    expect(screen.getByText('7 of 20 done · landed 21 October 2026')).toBeInTheDocument()
    expect(screen.queryByText('Done some already? Open a task and mark it done.')).toBeNull()
  })

  it('before arrival the subline says arriving', () => {
    renderView({ arrivalDate: '2026-11-05' })
    expect(screen.getByText(/· arriving 5 November 2026$/)).toBeInTheDocument()
  })

  it('the current stage lists every task; the current one is Up next', () => {
    const onOpen = vi.fn()
    renderView({ onOpen })
    const stage = screen.getByRole('region', { name: 'Week 1' })
    expect(within(stage).getAllByRole('button')).toHaveLength(3)
    expect(within(stage).getByText('Up next')).toBeInTheDocument()
    expect(within(stage).getByText('0 of 3 · to 28 Oct')).toBeInTheDocument()
    fireEvent.click(within(stage).getByRole('button', { name: /Give your employer a tax code/ }))
    expect(onOpen).toHaveBeenCalledWith('T09')
  })

  it('Up next card: why, and Start task links to the task', () => {
    renderView()
    const card = screen.getByRole('region', { name: 'Up next' })
    expect(within(card).getByRole('heading', { level: 3, name: 'Apply for your IRD number' })).toBeInTheDocument()
    expect(within(card).getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
    expect(within(card).getByRole('link', { name: /Start task/ })).toHaveAttribute('href', '/app/roadmap?task=T08')
    expect(document.querySelectorAll('.bg-ink')).toHaveLength(1)
  })

  it('Other stages: remaining first, then done; Show reveals the tasks', () => {
    renderView()
    const other = screen.getByRole('region', { name: 'Other stages' })
    const names = within(other).getAllByRole('listitem').map(li => li.textContent)
    expect(names[0]).toMatch(/^Month 1.*4 tasks · to 20 Nov/)
    expect(names[1]).toMatch(/^Later.*6 tasks · from November/)
    expect(names[2]).toMatch(/^Before you flew.*5 of 5 done/)
    const show = within(other).getByRole('button', { name: 'Show Month 1 tasks' })
    expect(show).toHaveAttribute('aria-expanded', 'false')
    expect(within(other).queryByRole('button', { name: /Enrol with a GP/ })).toBeNull()
    fireEvent.click(show)
    expect(show).toHaveAttribute('aria-expanded', 'true')
    expect(within(other).getByRole('button', { name: /Enrol with a GP/ })).toBeInTheDocument()
  })

  it('Key dates after landing, and the link to change the arrival date', () => {
    renderView()
    const dates = screen.getByRole('region', { name: 'Key dates' })
    expect(within(dates).getByText('You landed').previousElementSibling).toHaveTextContent('21 Oct')
    expect(within(dates).getByText('Week 1 ends').previousElementSibling).toHaveTextContent('28 Oct')
    expect(within(dates).getByText('Month 1 ends').previousElementSibling).toHaveTextContent('20 Nov')
    expect(within(dates).getByRole('link', { name: 'Change your arrival date' })).toHaveAttribute('href', '/settings')
  })

  it('Key dates before landing say Arriving', () => {
    renderView({ arrivalDate: '2026-11-05' })
    expect(screen.getByText('Arriving')).toBeInTheDocument()
  })

  it('first use: the hint', () => {
    renderView({ firstUse: true })
    expect(screen.getByText('Done some already? Open a task and mark it done.')).toBeInTheDocument()
  })
})

describe('RoadmapScreen', () => {
  it('fetches with the session token and shows the route', async () => {
    render(<RoadmapScreen user={user} />)
    expect(await screen.findByRole('region', { name: 'Other stages' })).toBeInTheDocument()
    expect(getRoadmap).toHaveBeenCalledWith('tok')
  })

  it('API down: alert, Try again refetches, Ask disabled, no route', async () => {
    getRoadmap.mockRejectedValueOnce(Object.assign(new Error('down'), { status: 503 }))
    render(<RoadmapScreen user={user} />)
    const alert = await screen.findByRole('alert')
    expect(within(alert).getByRole('heading', { level: 1 })).toHaveTextContent("Can't reach LandedNZ")
    expect(alert).toHaveTextContent('Your progress is saved. Check your connection, then try again.')
    expect(screen.getByRole('button', { name: /^Ask/ })).toBeDisabled()
    expect(screen.queryByRole('region', { name: 'Other stages' })).toBeNull()
    fireEvent.click(within(alert).getByRole('button', { name: 'Try again' }))
    expect(await screen.findByRole('region', { name: 'Other stages' })).toBeInTheDocument()
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
    fireEvent.click(await screen.findByRole('button', { name: /^Apply for your IRD number/ }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?task=T08')
  })

  it('?task=: the task page in place of the route', async () => {
    params = new URLSearchParams('task=T08')
    render(<RoadmapScreen user={user} />)
    expect(await screen.findByRole('article', { name: 'Apply for your IRD number' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Other stages' })).toBeNull()
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
    fireEvent.click(await screen.findByRole('button', { name: 'Mark as done' }))
    await waitFor(() => expect(getRoadmap).toHaveBeenCalledTimes(2))
    fireEvent.click(await screen.findByRole('button', { name: 'Undo' }))
    await waitFor(() => expect(getRoadmap).toHaveBeenCalledTimes(3))
    // refetches keep the page up: no loading state in between
    expect(screen.getByRole('article', { name: 'Apply for your IRD number' })).toBeInTheDocument()
  })

  it('header Ask with no task open: opens the current task', async () => {
    render(<RoadmapScreen user={user} />)
    await screen.findByRole('region', { name: 'Other stages' })
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
    const box = await screen.findByRole('textbox', { name: 'Ask about your IRD number' })
    await vi.waitFor(() => expect(box).toHaveFocus())
  })
})
