import { describe, expect, it } from 'vitest'
import type { GetProfileResponse } from './api'
import { buildHomeView } from './home-view'
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
// 15:00 NZ (NZDT, UTC+13) on 23 Oct = day 3
const nz = (date: string, time: string) => new Date(`${date}T${time}+13:00`)
const home = (now = nz('2026-10-23', '15:00:00'), r = priya(), p = profile) =>
  buildHomeView(buildRouteView(r, p.arrivalDate, now), p, now)

describe('buildHomeView — Priya, day 3', () => {
  const view = home()

  it('greets and says where the journey is', () => {
    expect(view.greeting).toBe('Welcome to Auckland')
    expect(view.subline).toBe('7 of 20 done · day 3 since you landed on Wed 21 Oct')
  })

  it('this week: the current task, then the rest of the leg', () => {
    expect(view.top?.taskId).toBe('T08')
    expect(view.week.map(w => [w.task.taskId, w.meta])).toEqual([
      ['T09', 'Waits on your IRD number'],
      ['T10', '30–45 minutes'],
    ])
    expect(view.nextMeta).toBe('Your next move · Week 1 · 1 hour')
    expect(view.weekFoot).toBeNull()
    expect(view.nextLine).toBeNull()
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
  buildHomeView(buildRouteView(r, ARRIVING, now), aleksandra, now)

describe('buildHomeView — before arrival and later', () => {
  const before = aleks(nz('2026-10-28', '12:00:00'), board([10, 4, 5, 5, 1], 0))
  const later = aleks(nz('2027-03-03', '12:00:00'))

  it('greeting and subline', () => {
    expect(before.greeting).toBe('Welcome')
    expect(before.subline).toBe('124 days until you land on 1 March 2027.')
    expect(before.sublineShort).toBe(before.subline)
    expect(later.greeting).toBe('Welcome to Christchurch')
    expect(later.subline).toBe('14 of 25 done · day 3 since you landed on Mon 1 Mar')
  })

  it('before arrival the foot says what comes after landing; later it does not', () => {
    expect(before.nextLine).toMatch(/^After you land: /)
    expect(before.nextMeta).toBe('Your next move · Before you fly · 1 hour')
    expect(later.nextLine).toBeNull()
  })

  it('a city outside the list reads New Zealand', () => {
    const view = buildHomeView(buildRouteView(board([10, 4, 5, 5, 1], 0), ARRIVING, nz('2026-10-28', '12:00:00')), { ...aleksandra, city: 'OTHER' }, nz('2027-03-03', '12:00:00'))
    expect(view.greeting).toBe('Welcome to New Zealand')
  })

  it('only the current task left this week: nothing else, and when the next leg starts', () => {
    const view = aleks(nz('2027-03-03', '12:00:00'), board([10, 4, 1, 5, 1], 14))
    expect(view.week).toEqual([])
    expect(view.weekFoot).toBeNull()
    expect(view.weekEmpty).toBe('Nothing else this week. Month 1 starts on 9 March.')
  })

  it('recently done caps at 4 and counts all; none done is empty', () => {
    expect(later.recent).toHaveLength(4)
    expect(later.recentTotal).toBe(14)
    expect(before.recent).toEqual([])
    expect(before.recentTotal).toBe(0)
  })
})

// Board Home: arrived 2 Nov, now Fri 6 Nov (day 5), 9 of 22 done, the IRD number (T08) is the next move
const BOARD_ARRIVAL = '2026-11-02'
const doneAt: Record<string, string> = {
  T06: '2026-11-01T01:00:00.000Z',
  T07: '2026-11-02T01:00:00.000Z',
  T09: '2026-11-03T01:00:00.000Z',
  T10: '2026-11-04T01:00:00.000Z',
}
const boardRoute = (over: (id: string) => object = () => ({})) => {
  const counts = [6, 4, 7, 4, 1]
  let n = 0
  return roadmap(
    counts.flatMap((count, i) =>
      Array.from({ length: count }, () => {
        n += 1
        const id = `T${String(n).padStart(2, '0')}`
        const done = n <= 5 || doneAt[id]
        return apiTask(id, {
          phase: i + 1,
          ...(done ? { status: 'COMPLETE' as const, completedAt: doneAt[id] ?? '2026-10-20T01:00:00.000Z' } : {}),
          ...(['T11', 'T20'].includes(id) ? { isBlocked: true, blockingTaskIds: ['T08'] } : {}),
          ...over(id),
        })
      }),
    ),
  )
}
const NOV_6 = nz('2026-11-06', '12:00:00')
const boardHome = (r = boardRoute(), now = NOV_6) =>
  buildHomeView(buildRouteView(r, BOARD_ARRIVAL, now), { ...profile, arrivalDate: BOARD_ARRIVAL }, now)

describe('buildHomeView — Home C', () => {
  const view = boardHome()

  it('subline with and without the date', () => {
    expect(view.subline).toBe('9 of 22 done · day 5 since you landed on Mon 2 Nov')
    expect(view.sublineShort).toBe('9 of 22 done · day 5 since you landed')
  })

  it('next move: meta, and the tasks it unlocks in leg order', () => {
    expect(view.top?.taskId).toBe('T08')
    expect(view.nextMeta).toBe('Your next move · Arrival · 1 hour')
    expect(view.nextMetaShort).toBe('Your next move · 1 hour')
    expect(view.unlocks).toEqual(['Sign a rental and protect your bond', 'Review your KiwiSaver fund'])
    expect(boardHome(boardRoute(() => ({ isBlocked: false, blockingTaskIds: [] }))).unlocks).toEqual([])
  })

  it('then this week: aside, rows with Waits on, and the footer', () => {
    expect(view.weekAside).toBe('Week 1 · 3 days left')
    expect(view.week.map(w => [w.task.taskId, w.meta])).toEqual([
      ['T11', 'Waits on your IRD number'],
      ['T12', '1 hour'],
      ['T13', '1 hour'],
    ])
    expect(view.weekFoot).toBe('4 more in Week 1')
    expect(view.weekTotal).toBe(7)
    const small = boardHome(boardRoute(id => (Number(id.slice(1)) > 13 && Number(id.slice(1)) < 18 ? { status: 'COMPLETE', completedAt: '2026-11-05T01:00:00.000Z' } : {})))
    expect(small.weekFoot).toBeNull()
  })

  it('recently done: four tiles, newest first', () => {
    expect(view.recent).toHaveLength(4)
    expect(view.recent[0]).toMatchObject({ taskId: 'T10', when: 'Done Wed 4 Nov · Arrival', weekday: 'Wed' })
    expect(view.recent.map(r => r.taskId)).toEqual(['T10', 'T09', 'T07', 'T06'])
    expect(view.recentTotal).toBe(9)
    expect(boardHome(roadmap(Array.from({ length: 5 }, (_, i) => apiTask(`T0${i + 1}`)))).recent).toEqual([])
  })

  it('the Your plan block is gone', () => {
    expect('plan' in view).toBe(false)
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
