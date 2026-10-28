import { describe, expect, it } from 'vitest'
import { LEGS } from './legs'
import { routeProgress, stageLabels, terrainY } from './route-progress'
import type { RouteLeg, RouteView } from './route-view'

const ARRIVAL = '2027-03-01'
const COUNTS = [10, 4, 5, 5, 1]
const NOW_BEFORE = new Date('2026-10-28T09:00:00+13:00')
const DAY_3 = new Date('2027-03-03T10:00:00+13:00')
const DAY_200 = new Date('2027-09-16T10:00:00+12:00')

// Five legs of 10/4/5/5/1 tasks; `done` is how many are done in each leg
function view(done: number[], skip: number[] = []): RouteView {
  const legs: RouteLeg[] = LEGS.map((l, i) => ({
    id: l.id, name: l.name, when: '', done: done[i], total: COUNTS[i], state: 'open' as const, tasks: [],
  })).filter((_, i) => !skip.includes(i))
  const cur = legs.find(l => l.done < l.total)
  if (cur) cur.state = 'current'
  legs.forEach(l => { if (l.done === l.total) l.state = 'done' })
  const total = legs.reduce((n, l) => n + l.total, 0)
  return { total, doneCount: legs.reduce((n, l) => n + l.done, 0), current: null, legs }
}
const week1Open = () => view([10, 4, 0, 0, 0])

describe('routeProgress', () => {
  it("before arrival, 0 done: x 40, '124 days to go'", () => {
    const p = routeProgress(view([0, 0, 0, 0, 0]), ARRIVAL, NOW_BEFORE)
    expect(p.x).toBe(40)
    expect(p.label).toBe('You · 124 days to go')
  })

  it('day 3, Week 1 open: x 433', () => {
    const p = routeProgress(week1Open(), ARRIVAL, DAY_3)
    expect(Math.round(p.x)).toBe(433)
    expect(p.label).toBe('You · day 3')
    expect(p.passed).toEqual([true, true, false, false, false])
  })

  it('summary names the current stage', () => {
    expect(routeProgress(week1Open(), ARRIVAL, DAY_3).summary).toBe('Week 1 · 0 of 5 · 6 days left')
    expect(routeProgress(view([0, 0, 0, 0, 0]), ARRIVAL, NOW_BEFORE).summary).toBe('Before you flew · 0 of 10 · by 1 Mar')
  })

  it('caps at the last flag', () => {
    const p = routeProgress(view(COUNTS), ARRIVAL, DAY_200)
    expect(p.x).toBe(1000)
    expect(p.label).toBe('You · day 200')
  })

  it('a stage with no tasks keeps its flag', () => {
    const p = routeProgress(view([10, 4, 0, 0, 0], [4]), ARRIVAL, DAY_3)
    expect(Math.round(p.x)).toBe(433)
    expect(p.passed).toHaveLength(5)
  })

  it('ahead of schedule stays past the previous flag', () => {
    const p = routeProgress(view([10, 4, 5, 0, 0]), ARRIVAL, DAY_3)
    expect(p.x).toBe(640)
    expect(p.passed[2]).toBe(true)
  })

  it('from arrival with the before stage unfinished: pin on the first flag, no NaN', () => {
    const p = routeProgress(view([5, 0, 0, 0, 0]), ARRIVAL, DAY_3)
    expect(p.x).toBe(200)
    expect(p.label).toBe('You · day 3')
    expect(p.summary).not.toMatch(/NaN/)
  })

  it('no tasks at all', () => {
    const p = routeProgress({ total: 0, doneCount: 0, current: null, legs: [] }, ARRIVAL, DAY_3)
    expect(Number.isFinite(p.x)).toBe(true)
    expect(p.label + p.summary).not.toMatch(/NaN|undefined/)
  })

  it('stage labels', () => {
    const labels = stageLabels(week1Open(), ARRIVAL, DAY_3)
    expect(labels.map(l => l.state)).toEqual(['done ✓', 'done ✓', '0 of 5 · to 8 Mar', '0 of 5 · to 31 Mar', '0 of 1 · from April'])
    expect(labels.map(l => l.now)).toEqual([false, false, true, false, false])
    expect(labels[0].name).toBe('Before you flew')
  })
})

describe('terrainY', () => {
  it('matches the board', () => {
    expect(terrainY(0).toFixed(1)).toBe('48.1')
    expect(terrainY(500).toFixed(1)).toBe('77.0')
  })
})
