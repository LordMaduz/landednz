import { describe, expect, it } from 'vitest'
import { buildItinerary } from './roadmap-itinerary'
import { buildRouteView } from './route-view'
import { board } from '@/test/roadmap-fixtures'

// Board data (test/roadmap-fixtures): 22 tasks, 9 done, arrived Mon 2 Nov 2026
const ARRIVAL = '2026-11-02'
const nz = (date: string, time: string) => new Date(`${date}T${time}+13:00`)
const DAY5 = nz('2026-11-06', '10:00:00')
const itin = (now = DAY5, r = board(), arrival = ARRIVAL) => buildItinerary(buildRouteView(r, arrival, now), arrival, now)

describe('buildItinerary — board data, day 5', () => {
  const it5 = itin()

  it('done so far', () => {
    expect(it5.done).toMatchObject({
      when: 'by 2 Nov · 2–3 Nov',
      summary: 'Before you flew 6 of 6 · Arrival 3 of 4',
      topics: 'SIM cards, bank accounts, your visa conditions',
      count: 9,
    })
    expect(it5.done!.tasks).toHaveLength(9)
  })

  it('today', () => {
    expect(it5.today).toMatchObject({ date: 'Fri 6 Nov', day: 5, meta: "You're here · up next · 1 hour" })
    expect(it5.today!.task.taskId).toBe('T08')
    expect(it5.today!.unlocks.map(u => [u.stage, u.topic])).toEqual([
      ['Week 1', 'your tax code'],
      ['Month 1', 'KiwiSaver'],
      ['Month 1', 'KiwiSaver reviews'],
    ])
  })

  it('current stage: Week 1 with 3 rows and 4 more', () => {
    expect(it5.current).toMatchObject({ name: 'Week 1', count: 7, when: 'to 9 Nov', daysLeft: 3 })
    expect(it5.current!.rows).toHaveLength(3)
    expect(it5.current!.rows[0]).toMatchObject({ meta: 'Waits on your IRD number' })
    expect(it5.current!.more).toHaveLength(4)
  })

  it('later stages', () => {
    expect(it5.later.map(l => [l.name, l.count, l.wait, l.when])).toEqual([
      ['Month 1', 4, ', 2 wait on your IRD number', 'to 2 Dec'],
      ['Later', 1, null, 'from December'],
    ])
  })
})

describe('buildItinerary — ahead of the calendar', () => {
  it('open tasks of earlier stages fold into the current stage', () => {
    const it = itin(nz('2026-11-15', '10:00:00'))
    expect(it.current).toMatchObject({ name: 'Month 1', count: 4, carried: [{ stage: 'Week 1', count: 7 }] })
    expect(it.current!.carriedFrom.T11).toBe('Week 1')
    expect(it.current!.carriedFrom.T18).toBeUndefined()
    const ids = [...it.current!.rows.map(r => r.task), ...it.current!.more].map(t => t.taskId)
    expect(ids).toContain('T11') // Week 1, still open
    expect(ids).toContain('T18') // Month 1
    expect(it.later.map(l => l.name)).toEqual(['Later'])
  })
})

describe('buildItinerary — edges', () => {
  it('nothing done: no Done so far', () => {
    expect(itin(DAY5, board(0)).done).toBeNull()
  })

  it('before arrival: no day, today is the first open task', () => {
    const it = itin(nz('2026-10-30', '10:00:00'), board(0))
    expect(it.today!.day).toBeNull()
    expect(it.today!.task.taskId).toBe('T01')
  })

  it('everything done: no Today, no current stage', () => {
    const it = itin(DAY5, board(22))
    expect(it.today).toBeNull()
    expect(it.current).toBeNull()
    expect(it.later).toEqual([])
  })
})
