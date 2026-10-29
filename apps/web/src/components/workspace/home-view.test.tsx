import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildHomeView } from '@/lib/home-view'
import { buildRouteView } from '@/lib/route-view'
import { firstUse, priya } from '@/test/roadmap-fixtures'

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
vi.mock('next/navigation', () => ({ useRouter: () => router }))

const { HomeView, HomeScreen } = await import('./home-view')

const profile = {
  profileId: 'p1',
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'OTHER_PROFESSIONAL',
  arrivalDate: '2026-10-21',
} as const
const DAY_3 = new Date('2026-10-23T15:00:00+13:00')
const user = { name: 'Priya Sharma', initials: 'PS' }

function priyaWithWhy() {
  const r = priya()
  r.phases.flatMap(p => p.tasks).find(t => t.taskId === 'T08')!.consequenceLine = 'Your employer needs it before your first payday.'
  return r
}
const homeFor = (r = priyaWithWhy()) => {
  const route = buildRouteView(r, profile.arrivalDate, DAY_3)
  return { route, home: buildHomeView(route, profile, DAY_3) }
}

beforeEach(() => {
  vi.clearAllMocks()
  getOnboardingProfile.mockResolvedValue(profile)
  getRoadmap.mockResolvedValue(priyaWithWhy())
})
afterEach(() => vi.useRealTimers())

describe('HomeView', () => {
  const view = (props = homeFor()) => render(<HomeView {...props} arrivalDate={profile.arrivalDate} now={DAY_3} />)

  it('greeting and the 90 days card', () => {
    view()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Auckland')
    expect(screen.getByText('7 of 20 done · day 3 since you landed on Wed 21 Oct')).toBeInTheDocument()
    const days = screen.getByRole('region', { name: 'Your 90 days' })
    expect(within(days).getByRole('link', { name: 'Open roadmap' })).toHaveAttribute('href', '/app/roadmap')
    expect(within(days).getByText("You're here")).toBeInTheDocument()
    expect(screen.queryByText('Your plan')).not.toBeInTheDocument()
  })

  it('your next move: name, why, unlocks, the one primary and Ask', () => {
    view()
    const next = screen.getByRole('region', { name: /Your next move/ })
    expect(within(next).getByRole('heading', { level: 3 })).toHaveTextContent('Apply for your IRD number')
    expect(within(next).getByText(/Your next move · Week 1 · 1 hour/)).toBeInTheDocument()
    expect(within(next).getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
    expect(within(next).getByText(/^Unlocks:/)).toHaveTextContent('Unlocks: Give your employer a tax code (IR330) · ')
    expect(within(next).getByRole('link', { name: 'Start task: Apply for your IRD number' })).toHaveAttribute('href', '/app/roadmap?task=T08')
    expect(within(next).getByRole('link', { name: /Ask about this/ })).toHaveAttribute('href', '/app/roadmap?task=T08&ask=1')
  })

  it('then this week: aside, rows that link to their task, no footer when nothing more', () => {
    view()
    const week = screen.getByRole('region', { name: 'Then this week' })
    expect(week).toHaveTextContent('Week 1')
    expect(within(week).getByRole('link', { name: /Give your employer a tax code \(IR330\)\s*Waits on your IRD number/ })).toHaveAttribute('href', '/app/roadmap?task=T09')
    expect(within(week).getAllByRole('listitem').length).toBeLessThanOrEqual(3)
    expect(within(week).queryByRole('link', { name: /more in/ })).not.toBeInTheDocument()
  })

  it('recently done: the count, Show all and four tiles', () => {
    view()
    const done = screen.getByRole('region', { name: 'Recently done' })
    expect(within(done).getByText(/7 tasks done/)).toBeInTheDocument()
    expect(within(done).getByRole('link', { name: 'Show all' })).toHaveAttribute('href', '/app/roadmap?done=1')
    expect(within(done).getAllByRole('listitem')).toHaveLength(4)
    expect(within(done).getByRole('link', { name: /Open a bank account/ })).toHaveTextContent('Done Thu 22 Oct · Arrival')
  })

  it('first visit: welcome, the after-landing line and the empty Recently done', () => {
    const now = new Date('2026-10-13T15:00:00+13:00')
    const route = buildRouteView(firstUse(), profile.arrivalDate, now)
    render(<HomeView route={route} home={buildHomeView(route, profile, now)} arrivalDate={profile.arrivalDate} now={now} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome')
    expect(within(screen.getByRole('region', { name: 'Then this week' })).getByText(/^After you land: /)).toBeInTheDocument()
    const done = screen.getByRole('region', { name: 'Recently done' })
    expect(within(done).getByText('Nothing yet. Tasks you finish show up here, newest first.')).toBeInTheDocument()
    expect(within(done).getByRole('link', { name: 'Already done some? Tick them off' })).toHaveAttribute('href', '/app/roadmap')
  })
})

describe('HomeScreen', () => {
  it('fetches with the session token and shows Home', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(DAY_3)
    render(<HomeScreen user={user} />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Auckland')
    expect(getRoadmap).toHaveBeenCalledWith('tok')
    expect(getOnboardingProfile).toHaveBeenCalledWith('tok')
  })

  it('no profile: back to onboarding', async () => {
    getOnboardingProfile.mockRejectedValue(Object.assign(new Error('nf'), { status: 404 }))
    render(<HomeScreen user={user} />)
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding?step=1'))
  })

  it('API down: alert, Try again refetches, Ask disabled', async () => {
    getRoadmap.mockRejectedValueOnce(new Error('down'))
    render(<HomeScreen user={user} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ })).toBeDisabled()
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Welcome/)
    expect(getRoadmap).toHaveBeenCalledTimes(2)
  })

  it('header Ask: opens the current task on the Roadmap with its input focused', async () => {
    render(<HomeScreen user={user} />)
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?task=T08&ask=1')
  })
})
