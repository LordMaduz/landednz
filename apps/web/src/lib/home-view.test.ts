import { describe, expect, it } from 'vitest'
import type { GetProfileResponse } from './api'
import { buildHomeView, firstName } from './home-view'
import { buildRouteView } from './route-view'
import { apiTask, priya, roadmap } from '@/test/roadmap-fixtures'

const ARRIVAL = '2026-10-21'
const profile: GetProfileResponse = {
  profileId: 'p1',
  visaType: 'AEWV',
  city: 'AUCKLAND',
  familySituation: 'SOLO',
  occupation: 'OTHER_PROFESSIONAL',
  arrivalDate: ARRIVAL,
}
const user = { firstName: 'Priya' }
// 15:00 NZ (NZDT, UTC+13) on 23 Oct = day 3
const nz = (date: string, time: string) => new Date(`${date}T${time}+13:00`)
const home = (now = nz('2026-10-23', '15:00:00'), r = priya(), p = profile) =>
  buildHomeView(buildRouteView(r, p.arrivalDate, now), p, user, now)

describe('buildHomeView — Priya, day 3', () => {
  const view = home()

  it('greets and says where the journey is', () => {
    expect(view.greeting).toBe('Welcome to Auckland, Priya')
    expect(view.subline).toBe('Day 3 in Auckland · 7 of 20 tasks done.')
  })

  it('this week: the current task, then the rest of the leg', () => {
    expect(view.top?.taskId).toBe('T08')
    expect(view.week.map(t => [t.taskId, t.meta])).toEqual([
      ['T09', 'After your IRD number'],
      ['T10', '30–45 minutes'],
    ])
    expect(view.nextMeta).toBe('Week 1 · task 1 of 3')
    expect(view.weekCount).toBe('2 more tasks')
    expect(view.nextLine).toBeNull()
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
      { label: 'Work', value: 'Another job or profession' },
      { label: 'Arriving', value: '21 October 2026' },
    ])
  })
})

// Board data: 25 tasks (10 before, 4 arrival, 5 week 1, 5 month 1, 1 later), 14 done, arriving 1 March 2027
const ARRIVING = '2027-03-01'
const aleksandra = { ...profile, city: 'CHRISTCHURCH' as const, arrivalDate: ARRIVING }
const board = (counts: number[], done: number) => {
  let n = 0
  return roadmap(
    counts.flatMap((count, i) =>
      Array.from({ length: count }, () => {
        n += 1
        const id = `T${String(n).padStart(2, '0')}`
        return apiTask(id, { phase: i + 1, ...(n <= done ? { status: 'COMPLETE' as const, completedAt: `2027-03-${String(n).padStart(2, '0')}T01:00:00.000Z` } : {}) })
      }),
    ),
  )
}
const aleks = (now: Date, r = board([10, 4, 5, 5, 1], 14)) =>
  buildHomeView(buildRouteView(r, ARRIVING, now), aleksandra, { firstName: 'Aleksandra' }, now)

describe('buildHomeView — before arrival and later', () => {
  const before = aleks(nz('2026-10-28', '12:00:00'), board([10, 4, 5, 5, 1], 0))
  const later = aleks(nz('2027-03-03', '12:00:00'))

  it('greeting and subline', () => {
    expect(before.greeting).toBe('Welcome, Aleksandra')
    expect(before.subline).toBe('124 days until you land on 1 March 2027.')
    expect(later.greeting).toBe('Welcome to Christchurch, Aleksandra')
    expect(later.subline).toBe('Day 3 in Christchurch · 14 of 25 tasks done.')
  })

  it('before arrival the foot says what comes after landing; later it does not', () => {
    expect(before.nextLine).toMatch(/^After you land: /)
    expect(before.nextMeta).toBe('Before you fly · task 1 of 10')
    expect(later.nextLine).toBeNull()
  })

  it('a city outside the list reads New Zealand', () => {
    const view = buildHomeView(buildRouteView(board([10, 4, 5, 5, 1], 0), ARRIVING, nz('2026-10-28', '12:00:00')), { ...aleksandra, city: 'OTHER' }, { firstName: 'A' }, nz('2027-03-03', '12:00:00'))
    expect(view.greeting).toBe('Welcome to New Zealand, A')
  })

  it('plan has an Arriving row', () => {
    expect(later.plan.at(-1)).toEqual({ label: 'Arriving', value: '1 March 2027' })
  })

  it('also this week: three rows from the current leg, the count is all of them', () => {
    expect(later.nextMeta).toBe('Week 1 · task 1 of 5')
    expect(later.week.map(t => t.taskId)).toEqual(['T16', 'T17', 'T18'])
    expect(later.weekCount).toBe('4 more tasks')
    expect(later.weekMore).toBe(1)
    expect(later.weekEmpty).toBeNull()
  })

  it('only the current task left this week: nothing else, and when the next leg starts', () => {
    const view = aleks(nz('2027-03-03', '12:00:00'), board([10, 4, 1, 5, 1], 14))
    expect(view.week).toEqual([])
    expect(view.weekCount).toBe('')
    expect(view.weekEmpty).toBe('Nothing else this week. Month 1 starts on 9 March.')
  })

  it('recently done caps at 3 and counts all; none done is empty', () => {
    expect(later.recent).toHaveLength(3)
    expect(later.recentTotal).toBe(14)
    expect(before.recent).toEqual([])
    expect(before.recentTotal).toBe(0)
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
    expect(view.weekEmpty).toBeNull()
  })
})

describe('firstName', () => {
  it('first word of the Google full name, else the email local part', () => {
    expect(firstName({ email: 'p@x.nz', user_metadata: { full_name: 'Priya Sharma' } })).toBe('Priya')
    expect(firstName({ email: 'priya.s@example.com', user_metadata: {} })).toBe('priya.s')
    expect(firstName({ email: 'priya.s@example.com' })).toBe('priya.s')
  })
})
