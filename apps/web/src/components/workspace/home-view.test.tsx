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
  occupation: 'TECHNOLOGY',
  arrivalDate: '2026-10-21',
  personaKey: 'AEWV_SOLO',
} as const
const DAY_3 = new Date('2026-10-23T15:00:00+13:00')
const user = { name: 'Priya Sharma', initials: 'PS' }

function priyaWithWhy() {
  const r = priya()
  r.phases.flatMap(p => p.tasks).find(t => t.taskId === 'T08')!.consequenceLine = 'Your employer needs it before your first payday.'
  return r
}
const homeFor = (r = priyaWithWhy()) => {
  const route = buildRouteView(r, profile.arrivalDate)
  return { route, home: buildHomeView(route, profile, { firstName: 'Priya' }, DAY_3) }
}

beforeEach(() => {
  vi.clearAllMocks()
  getOnboardingProfile.mockResolvedValue(profile)
  getRoadmap.mockResolvedValue(priyaWithWhy())
})
afterEach(() => vi.useRealTimers())

describe('HomeView', () => {
  it('greeting, route strip and the one primary', () => {
    render(<HomeView {...homeFor()} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Good afternoon, Priya')
    expect(screen.getByText('Day 3 in Auckland, and the basics are sorted.')).toBeInTheDocument()
    expect(screen.getByText('7 of 20 tasks done')).toBeInTheDocument()
    expect(screen.getByText('Week 1: 0 of 3 done')).toBeInTheDocument()
    const start = screen.getByRole('link', { name: 'Start: Apply for your IRD number' })
    expect(start).toHaveAttribute('href', '/app/roadmap?task=T08')
    expect(screen.getByText('Your employer needs it before your first payday.')).toBeInTheDocument()
  })

  it('this week: next two rows link to their task, then the next leg', () => {
    render(<HomeView {...homeFor()} />)
    const week = screen.getByRole('region', { name: 'This week' })
    expect(within(week).getByRole('link', { name: /Give your employer a tax code \(IR330\)\s*After your IRD number/ })).toHaveAttribute(
      'href',
      '/app/roadmap?task=T09',
    )
    expect(within(week).getByRole('link', { name: /Choose your KiwiSaver fund/ })).toHaveAttribute('href', '/app/roadmap?task=T10')
    expect(within(week).getByText('Month 1 brings a rental, a GP, ACC and your rights as a tenant.')).toBeInTheDocument()
  })

  it('recently done and the plan with Edit → /settings', () => {
    render(<HomeView {...homeFor()} />)
    const done = within(screen.getByRole('region', { name: 'Recently done' })).getAllByRole('listitem')
    expect(done.map(li => li.textContent)).toEqual(['Open a bank account22 Oct', 'Get an NZ SIM card21 Oct', 'Sort your home-country tax12 Oct'])
    const plan = screen.getByRole('complementary', { name: 'Your plan' })
    expect(within(plan).getByRole('link', { name: 'Edit your plan' })).toHaveAttribute('href', '/settings')
    expect(within(plan).getByText('Accredited Employer Work Visa (AEWV)')).toBeInTheDocument()
    expect(within(plan).getByText('Just me')).toBeInTheDocument()
  })

  it('first use: start here and the empty recently done', () => {
    render(<HomeView {...homeFor(firstUse())} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Auckland, Priya')
    expect(screen.getByRole('heading', { name: 'Start here' })).toBeInTheDocument()
    expect(
      screen.getByText('Nothing yet. Tasks you finish show up here with the day you did them. Already done some? Tick them off on your Roadmap.'),
    ).toBeInTheDocument()
  })
})

describe('HomeScreen', () => {
  it('fetches with the session token and shows Home', async () => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(DAY_3)
    render(<HomeScreen user={user} firstName="Priya" />)
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent('Good afternoon, Priya')
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
