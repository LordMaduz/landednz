// Where the traveller is on the road: You and Today as x in 0–1000, a dot per task, the pin label and the one-line summary.
import { journeyDay } from './journey-day'
import { LEGS, legName, legWhen } from './legs'
import { shortDay } from './nz-date'
import type { RouteView } from './route-view'

// Track geometry (viewBox 0–1000): the five stage flags, one per stage end. Stage widths follow the days each covers.
export const TRACK_FLAGS = [150, 270, 530, 820, 1000]

// The x span of stage i: from the previous flag to its own
export const stageSpan = (i: number): [number, number] => [i ? TRACK_FLAGS[i - 1] : 0, TRACK_FLAGS[i]]

// The hill profile, shared with the board (docs/design/r0-polish/build.py terrain_y)
export const terrainY = (x: number) =>
  54 - 20 * Math.sin((x / 1000) * Math.PI * 2.6 + 0.3) - 9 * Math.sin((x / 1000) * Math.PI * 6.3)

// Journey days each stage covers, from arrival (day 1)
const STAGE_DAYS = [
  { start: 0, end: 0 }, // over by arrival, so it never holds a day
  { start: 1, end: 2 },
  { start: 3, end: 8 },
  { start: 9, end: 31 },
  { start: 32, end: 61 },
]

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`

// The current leg and its stage index in LEGS, never its position in route.legs (which drops empty legs)
function current(route: RouteView) {
  const cur = route.legs.find(l => l.state === 'current') ?? route.legs.find(l => l.state !== 'done')
  return { cur, i: cur ? LEGS.findIndex(l => l.id === cur.id) : 4 }
}

// You: inside the current stage by the share of its tasks done, at the end when everything is
export function youX(route: RouteView): number {
  const { cur, i } = current(route)
  if (!cur) return route.total > 0 ? 1000 : 0
  const [start, end] = stageSpan(i)
  return cur.total ? start + ((end - start) * cur.done) / cur.total : start
}

// Today: inside the stage whose days hold today, null before arrival, at the end past day 61
export function todayX(arrivalDate: string, now: Date): number | null {
  const day = journeyDay(arrivalDate, now)
  if (day < 1) return null
  const i = STAGE_DAYS.findIndex((s, k) => k > 0 && day <= s.end)
  if (i < 0) return 1000
  const { start, end } = STAGE_DAYS[i]
  const [from, to] = stageSpan(i)
  return from + ((to - from) * (day - start + 1)) / (end - start + 1)
}

// One dot per task, spread evenly inside its stage
export function taskDots(route: RouteView) {
  return route.legs.flatMap(leg => {
    const [from, to] = stageSpan(LEGS.findIndex(l => l.id === leg.id))
    return leg.tasks.map((t, k) => ({
      taskId: t.taskId,
      x: from + ((to - from) * (k + 1)) / (leg.tasks.length + 1),
      state: t.state === 'done' ? ('done' as const) : t.state === 'blocked' || t.blockedBy.length ? ('blocked' as const) : ('open' as const),
    }))
  })
}

// Days left in stage i after today; null before arrival or when none
const daysLeftIn = (i: number, day: number) => (day < 1 ? null : STAGE_DAYS[i].end - day > 0 ? STAGE_DAYS[i].end - day : null)

export function routeProgress(route: RouteView, arrivalDate: string, now: Date) {
  const day = journeyDay(arrivalDate, now)
  const { cur, i } = current(route)
  const x = youX(route)

  const label = day < 1 ? `You · ${plural(1 - day, 'day')} to go` : "You're here"
  const name = cur?.name ?? legName(LEGS[i].id, day < 1)
  const left = daysLeftIn(i, day)
  const tail = day < 1 ? `by ${shortDay(arrivalDate)}` : left ? `${plural(left, 'day')} left` : ''
  const summary = [name, `${cur?.done ?? 0} of ${cur?.total ?? 0}`, tail].filter(Boolean).join(' · ')

  return { x, todayX: todayX(arrivalDate, now), label, summary, passed: TRACK_FLAGS.map(fx => fx <= x) }
}

// The phone row: the stage behind, the stage now with its days left, the stage ahead
export function phoneStages(route: RouteView, arrivalDate: string, now: Date) {
  const day = journeyDay(arrivalDate, now)
  const before = day < 1
  const { i } = current(route)
  const prevLeg = i > 0 ? route.legs.find(l => l.id === LEGS[i - 1].id) : undefined
  return {
    prev: i > 0 ? { name: legName(LEGS[i - 1].id, before), state: !prevLeg || prevLeg.done === prevLeg.total ? '✓' : `${prevLeg.done} of ${prevLeg.total}` } : null,
    cur: { name: legName(LEGS[i].id, before), daysLeft: daysLeftIn(i, day) },
    next: i < LEGS.length - 1 ? legName(LEGS[i + 1].id, before) : null,
  }
}

// The five stage labels under the road
export function stageLabels(route: RouteView, arrivalDate: string, now: Date) {
  const before = journeyDay(arrivalDate, now) < 1
  const { i: curIndex } = current(route)
  return LEGS.map((l, i) => {
    const leg = route.legs.find(r => r.id === l.id)
    const done = leg?.done ?? 0
    const total = leg?.total ?? 0
    return {
      id: l.id,
      name: legName(l.id, before),
      state: `${done ? `${done} of ${total} done` : plural(total, 'task')} · ${legWhen(l.id, arrivalDate)}`,
      now: i === curIndex,
    }
  })
}
