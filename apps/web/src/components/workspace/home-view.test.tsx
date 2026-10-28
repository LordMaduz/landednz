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
  return { route, home: buildHomeView(route, profile, { firstName: 'Priya' }, DAY_3) }
}

beforeEach(() => {
  vi.clearAllMocks()
  getOnboardingProfile.mockResolvedValue(profile)
  getRoadmap.mockResolvedValue(priyaWithWhy())
})
afterEach(() => vi.useRealTimers())

describe('HomeView', () => {
  it('greeting, track card and the one primary', () => {
    render(<HomeView {...homeFor()} arrivalDate={profile.arrivalDate} now={DAY_3} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Auckland, Priya')
    expect(screen.getByText('Day 3 in Auckland · 7 of 20 tasks done.')).toBeInTheDocument()
    const roadmap = screen.getByRole('region', { name: 'Your roadmap' })
    expect(within(roadmap).getByRole('link', { name: '7 of 20 done · Open roadmap' })).toHaveAttribute('href', '/app/roadmap')
    expect(within(roadmap).getByText("You're here")).toBeInTheDocument()
    const next = screen.getByRole('region', { name: 'Up next' })
    expect(within(next).getByText('Week 1 · task 1 of 3')).toBeInTheDocument()
    const start = within(next).getByRole('link', { name: 'Start task: Apply for your IRD number' })
    expect(start).toHaveAttribute('href', '/app/roadmap?task=T08')
    expect(within(next).getByRole('link', { name: 'Ask about this' })).toHaveAttribute('href', '/app/roadmap?task=T08&ask=1')
    expect(within(next).getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
  })

  it('Up next and Your plan share one grid row', () => {
    render(<HomeView {...homeFor()} arrivalDate={profile.arrivalDate} now={DAY_3} />)
    const grid = screen.getByRole('region', { name: 'Up next' }).parentElement
    expect(screen.getByRole('complementary', { name: 'Your plan' }).parentElement).toBe(grid)
    expect(screen.getByRole('region', { name: 'Also this week' }).parentElement).toBe(grid)
  })

  it('also this week: rows link to their task', () => {
    render(<HomeView {...homeFor()} arrivalDate={profile.arrivalDate} now={DAY_3} />)
    const week = screen.getByRole('region', { name: 'Also this week' })
    expect(within(week).getByText('2 more tasks')).toBeInTheDocument()
    expect(within(week).getByRole('link', { name: /Give your employer a tax code \(IR330\)\s*After your IRD number/ })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T09',
    )
    expect(within(week).getByRole('link', { name: /Choose your KiwiSaver fund/ })).toHaveAttribute('href', '/app/roadmap?task=T10')
    expect(within(week).queryByRole('link', { name: /more this week/ })).not.toBeInTheDocument()
  })

  it('recently done: three rows and the link to all 7', () => {
    render(<HomeView {...homeFor()} arrivalDate={profile.arrivalDate} now={DAY_3} />)
    const done = screen.getByRole('region', { name: 'Recently done' })
    expect(within(done).getAllByRole('listitem').map(li => li.textContent)).toEqual(['Open a bank account22 Oct', 'Get an NZ SIM card21 Oct', 'Sort your home-country tax12 Oct'])
    expect(within(done).getByRole('link', { name: 'See all 7 done' })).toHaveAttribute('href', '/app/roadmap')
  })

  it('plan with Edit → /settings', () => {
    render(<HomeView {...homeFor()} arrivalDate={profile.arrivalDate} now={DAY_3} />)
    const plan = screen.getByRole('complementary', { name: 'Your plan' })
    expect(within(plan).getByRole('link', { name: 'Edit your plan' })).toHaveAttribute('href', '/settings')
    expect(within(plan).getByText('Accredited Employer Work Visa (AEWV)')).toBeInTheDocument()
    expect(within(plan).getByText('21 October 2026')).toBeInTheDocument()
  })

  it('first visit: welcome, the after-landing line and the empty Recently done', () => {
    const now = new Date('2026-10-13T15:00:00+13:00')
    const route = buildRouteView(firstUse(), profile.arrivalDate, now)
    render(<HomeView route={route} home={buildHomeView(route, profile, { firstName: 'Priya' }, now)} arrivalDate={profile.arrivalDate} now={now} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome, Priya')
    expect(within(screen.getByRole('region', { name: 'Also this week' })).getByText(/^After you land: /)).toBeInTheDocument()
    const done = screen.getByRole('region', { name: 'Recently done' })
    expect(within(done).getByText('Nothing yet. Tasks you finish show up here, newest first.')).toBeInTheDocument()
    expect(within(done).getByRole('link', { name: 'Already done some? Tick them off' })).toHaveAttribute('href', '/app/roadmap')
  })
})

describe('HomeScreen', () => {
  it('fetches with the session token and shows Home', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(DAY_3)
    render(<HomeScreen user={user} firstName="Priya" />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Auckland, Priya')
    expect(getRoadmap).toHaveBeenCalledWith('tok')
    expect(getOnboardingProfile).toHaveBeenCalledWith('tok')
  })

  it('no profile: back to onboarding', async () => {
    getOnboardingProfile.mockRejectedValue(Object.assign(new Error('nf'), { status: 404 }))
    render(<HomeScreen user={user} firstName="Priya" />)
    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith('/onboarding?step=1'))
  })

  it('API down: alert, Try again refetches, Ask disabled', async () => {
    getRoadmap.mockRejectedValueOnce(new Error('down'))
    render(<HomeScreen user={user} firstName="Priya" />)
    fireEvent.click(await screen.findByRole('button', { name: 'Try again' }))
    expect(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ })).toBeDisabled()
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(/Priya/)
    expect(getRoadmap).toHaveBeenCalledTimes(2)
  })

  it('header Ask: opens the current task on the Roadmap with its input focused', async () => {
    render(<HomeScreen user={user} firstName="Priya" />)
    await screen.findByRole('heading', { level: 1 })
    fireEvent.click(within(screen.getByRole('banner')).getByRole('button', { name: /^Ask/ }))
    expect(push).toHaveBeenCalledWith('/app/roadmap?task=T08&ask=1')
  })
})
