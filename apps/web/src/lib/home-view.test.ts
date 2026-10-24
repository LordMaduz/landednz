import { describe, expect, it } from 'vitest'
import type { GetProfileResponse } from './api'
import { buildHomeView, firstName } from './home-view'
import { buildRouteView } from './route-view'
import { firstUse, priya } from '@/test/roadmap-fixtures'

const ARRIVAL = '2026-10-21'
const profile: GetProfileResponse = {
  profileId: 'p1',
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'TECHNOLOGY',
  arrivalDate: ARRIVAL,
  personaKey: 'AEWV_SOLO',
}
const user = { firstName: 'Priya' }
// 15:00 NZ (NZDT, UTC+13) on 23 Oct = day 3
const nz = (date: string, time: string) => new Date(`${date}T${time}+13:00`)
const home = (now = nz('2026-10-23', '15:00:00'), r = priya(), p = profile) =>
  buildHomeView(buildRouteView(r, p.arrivalDate), p, user, now)

describe('buildHomeView — Priya, day 3', () => {
  const view = home()

  it('greets and says where the journey is', () => {
    expect(view.greeting).toBe('Good afternoon, Priya')
    expect(view.subline).toBe('Day 3 in Auckland, and the basics are sorted.')
    expect(view.weekTitle).toBe('This week')
  })

  it('this week: the current task, then the next two', () => {
    expect(view.top?.taskId).toBe('T08')
    expect(view.week.map(t => [t.taskId, t.meta])).toEqual([
      ['T09', 'After your IRD number'],
      ['T10', '30–45 minutes'],
    ])
    expect(view.nextLine).toBe('Month 1 brings a rental, a GP, ACC and your rights as a tenant.')
  })

  it('recently done: the last three by completedAt, newest first', () => {
    expect(view.recent).toEqual([
      { taskId: 'T07', title: 'Open a bank account', when: '22 Oct' },
      { taskId: 'T06', title: 'Get an NZ SIM card', when: '21 Oct' },
      { taskId: 'T05', title: 'Sort your home-country tax', when: '12 Oct' },
    ])
  })

  it('plan: the answers the roadmap is built from', () => {
    expect(view.plan).toEqual([
      { label: 'Visa', value: 'Accredited Employer Work Visa (AEWV)' },
      { label: 'City', value: 'Auckland' },
      { label: 'Moving', value: 'Just me' },
      { label: 'Work', value: 'Technology' },
    ])
  })
})

describe('buildHomeView — greeting by NZ hour', () => {
  it.each([
    ['04:59:00', 'Good evening, Priya'],
    ['05:00:00', 'Good morning, Priya'],
    ['11:59:00', 'Good morning, Priya'],
    ['12:00:00', 'Good afternoon, Priya'],
    ['17:59:00', 'Good afternoon, Priya'],
    ['18:00:00', 'Good evening, Priya'],
  ])('%s → %s', (time, greeting) => {
    expect(home(nz('2026-10-23', time)).greeting).toBe(greeting)
  })
})

describe('buildHomeView — first use', () => {
  const view = home(nz('2026-10-23', '15:00:00'), firstUse())

  it('welcomes and points at the first task', () => {
    expect(view.greeting).toBe('Welcome to Auckland, Priya')
    expect(view.subline).toBe('Start with the first task below. Each one you finish unlocks the next.')
    expect(view.weekTitle).toBe('Start here')
    expect(view.recent).toEqual([])
  })
})

describe('buildHomeView — around arrival (Review Focus 5)', () => {
  it('7 days before arrival: days until landing', () => {
    expect(home(nz('2026-10-13', '15:00:00')).subline).toBe('8 days until you land in Auckland.')
  })

  it('the day before arrival: one day', () => {
    expect(home(nz('2026-10-20', '23:30:00')).subline).toBe('1 day until you land in Auckland.')
  })

  it('arrival day at 23:30 NZ is day 1; 00:05 the next day is day 2', () => {
    expect(home(nz('2026-10-21', '23:30:00')).subline).toMatch(/^Day 1 in Auckland/)
    expect(home(nz('2026-10-22', '00:05:00')).subline).toMatch(/^Day 2 in Auckland/)
  })

  it('arrival not finished: no "basics are sorted"', () => {
    const r = priya()
    r.phases.flatMap(p => p.tasks).find(t => t.taskId === 'T07')!.status = 'NOT_STARTED'
    expect(home(undefined, r).subline).toBe('Day 3 in Auckland.')
  })

  it('a city outside the list reads New Zealand', () => {
    const p = { ...profile, city: 'OTHER' as const }
    expect(home(nz('2026-10-13', '15:00:00'), priya(), p).subline).toBe('8 days until you land in New Zealand.')
    expect(home(undefined, firstUse(), p).greeting).toBe('Welcome to New Zealand, Priya')
  })
})

describe('buildHomeView — end of the route', () => {
  it('no next leg → no next line; nothing open → no top task', () => {
    const r = priya()
    for (const t of r.phases.flatMap(p => p.tasks)) {
      t.status = 'COMPLETE'
      t.isBlocked = false
      t.completedAt ??= '2026-11-01T01:00:00.000Z'
    }
    const view = home(undefined, r)
    expect(view.top).toBeNull()
    expect(view.week).toEqual([])
    expect(view.nextLine).toBeNull()
  })
})

describe('firstName', () => {
  it('first word of the Google full name, else the email local part', () => {
    expect(firstName({ email: 'p@x.nz', user_metadata: { full_name: 'Priya Sharma' } })).toBe('Priya')
    expect(firstName({ email: 'priya.s@example.com', user_metadata: {} })).toBe('priya.s')
    expect(firstName({ email: 'priya.s@example.com' })).toBe('priya.s')
  })
})
