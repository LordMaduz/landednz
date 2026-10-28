import { describe, expect, it } from 'vitest'
import { LEGS } from './legs'
import { phoneStages, routeProgress, stageLabels, stageSpan, taskDots, terrainY, todayX, TRACK_FLAGS, youX } from './route-progress'
import type { RouteLeg, RouteTask, RouteView, WaypointState } from './route-view'

const ARRIVAL = '2026-11-02'
const COUNTS = [6, 4, 7, 4, 1]
const at = (iso: string) => new Date(`${iso}T10:00:00+13:00`)
const DAY_0 = at('2026-11-01')
const DAY_1 = at('2026-11-02')
const DAY_5 = at('2026-11-06')
const DAY_200 = at('2027-05-20')

const task = (id: string, state: WaypointState): RouteTask => ({
  taskId: id, title: id, topic: id, state, meta: '', time: '', why: '', completedAt: null, blocker: null, blockedBy: [], bestBy: null,
})

// Five legs of 6/4/7/4/1 tasks; `done` is how many are done in each leg
// `cur` forces the current leg (the open task can sit past a leg whose last task is blocked)
function view(done: number[], skip: number[] = [], cur?: number): RouteView {
  const legs: RouteLeg[] = LEGS.map((l, i) => ({
    id: l.id, name: l.name, when: '', done: done[i], total: COUNTS[i], state: 'open' as const,
    tasks: Array.from({ length: COUNTS[i] }, (_, k) => task(`${l.id}${k}`, k < done[i] ? 'done' : 'available')),
  })).filter((_, i) => !skip.includes(i))
  const open = legs[cur ?? -1] ?? legs.find(l => l.done < l.total)
  if (open) open.state = 'current'
  legs.forEach(l => { if (l !== open && l.done === l.total) l.state = 'done' })
  return { total: legs.reduce((n, l) => n + l.total, 0), doneCount: legs.reduce((n, l) => n + l.done, 0), current: null, legs }
}
const week1Open = () => view([6, 3, 0, 0, 0])

describe('geometry', () => {
  it('flags and stage spans', () => {
    expect(TRACK_FLAGS).toEqual([150, 270, 530, 820, 1000])
    expect(stageSpan(0)).toEqual([0, 150])
    expect(stageSpan(2)).toEqual([270, 530])
  })
})

describe('youX', () => {
  it('Arrival current with 3 of 4 done', () => expect(youX(view([6, 3, 0, 0, 0]))).toBe(240))
  it('Before current with 2 of 6 done', () => expect(youX(view([2, 0, 0, 0, 0]))).toBe(50))
  it('nothing done anywhere', () => expect(youX(view([0, 0, 0, 0, 0]))).toBe(0))
  it('all done', () => expect(youX(view(COUNTS))).toBe(1000))
  it('no tasks at all: 0, not NaN', () => expect(youX({ total: 0, doneCount: 0, current: null, legs: [] })).toBe(0))
})

describe('todayX', () => {
  it('null before arrival', () => expect(todayX(ARRIVAL, DAY_0)).toBeNull())
  it('day 1 is half of Arrival', () => expect(todayX(ARRIVAL, DAY_1)).toBe(210))
  it('day 5 is half of Week 1', () => expect(todayX(ARRIVAL, DAY_5)).toBe(400))
  it('past day 61 is the end', () => expect(todayX(ARRIVAL, DAY_200)).toBe(1000))
})

describe('taskDots', () => {
  it('spreads a stage evenly and maps states', () => {
    const v = view([0, 0, 0, 0, 0])
    const [a, b, c] = v.legs[0].tasks
    a.state = 'done'; b.state = 'blocked'; c.blockedBy = ['x']
    const dots = taskDots(v).slice(0, 6)
    expect(dots.map(d => d.x)).toEqual([1, 2, 3, 4, 5, 6].map(k => (150 * k) / 7))
    expect(dots.slice(0, 4).map(d => d.state)).toEqual(['done', 'blocked', 'blocked', 'open'])
  })
})

describe('routeProgress', () => {
  it("before arrival: x 0, '1 day to go', no Today", () => {
    const p = routeProgress(view([0, 0, 0, 0, 0]), ARRIVAL, DAY_0)
    expect(p).toMatchObject({ x: 0, todayX: null, label: 'You · 1 day to go' })
  })

  it("on day 5 the pin reads You're here", () => {
    const p = routeProgress(week1Open(), ARRIVAL, DAY_5)
    expect(p).toMatchObject({ x: 240, todayX: 400, label: "You're here", passed: [true, false, false, false, false] })
    expect(p.summary).toBe('Arrival · 3 of 4')
  })

  it('names the stage and days left', () => {
    expect(routeProgress(view([6, 4, 0, 0, 0]), ARRIVAL, DAY_5).summary).toBe('Week 1 · 0 of 7 · 3 days left')
    expect(routeProgress(view([0, 0, 0, 0, 0]), ARRIVAL, DAY_0).summary).toBe('Before you flew · 0 of 6 · by 2 Nov')
  })

  it('all done caps at the last flag', () => {
    const p = routeProgress(view(COUNTS), ARRIVAL, DAY_200)
    expect(p.x).toBe(1000)
    expect(p.summary).not.toMatch(/NaN/)
  })

  it('no tasks at all', () => {
    const p = routeProgress({ total: 0, doneCount: 0, current: null, legs: [] }, ARRIVAL, DAY_5)
    expect(p.label + p.summary).not.toMatch(/NaN|undefined/)
  })
})

describe('stageLabels', () => {
  it('done, untouched and part-done stages', () => {
    const labels = stageLabels(view([6, 3, 0, 0, 0]), ARRIVAL, DAY_5)
    expect(labels.map(l => l.state)).toEqual([
      '6 of 6 done · by 2 Nov', '3 of 4 done · 2–3 Nov', '7 tasks · to 9 Nov', '4 tasks · to 2 Dec', '1 task · from December',
    ])
    expect(labels.map(l => l.now)).toEqual([false, true, false, false, false])
  })
})

describe('phoneStages', () => {
  it('day 5 with Arrival 3 of 4 behind and Week 1 current', () => {
    expect(phoneStages(view([6, 3, 0, 0, 0], [], 2), ARRIVAL, DAY_5)).toEqual({
      prev: { name: 'Arrival', state: '3 of 4' }, cur: { name: 'Week 1', daysLeft: 3 }, next: 'Month 1',
    })
  })
  it('a finished previous stage reads ✓', () => {
    expect(phoneStages(view([6, 4, 0, 0, 0]), ARRIVAL, DAY_5).prev).toEqual({ name: 'Arrival', state: '✓' })
  })
  it('no days left before arrival', () => {
    expect(phoneStages(view([0, 0, 0, 0, 0]), ARRIVAL, DAY_0)).toEqual({
      prev: null, cur: { name: 'Before you fly', daysLeft: null }, next: 'Arrival',
    })
  })
})

describe('terrainY', () => {
  it('matches the board', () => {
    expect(terrainY(0).toFixed(1)).toBe('48.1')
    expect(terrainY(500).toFixed(1)).toBe('77.0')
  })
})
