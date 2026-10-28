// Where the traveller is on Home's track: x in 0–1000, the pin label and the one-line summary.
import { journeyDay } from './journey-day'
import { LEGS, legName, legWhen } from './legs'
import { shortDay } from './nz-date'
import type { RouteView } from './route-view'

// Track geometry (viewBox 0–1000): the five stage flags, one per stage end
export const TRACK_FLAGS = [200, 400, 600, 800, 1000]

// The hill profile, shared with the board (docs/design/r0-polish/build.py terrain_y)
export const terrainY = (x: number) =>
  54 - 20 * Math.sin((x / 1000) * Math.PI * 2.6 + 0.3) - 9 * Math.sin((x / 1000) * Math.PI * 6.3)

// Journey days each stage covers, from arrival (day 1)
const STAGE_DAYS = [
  { start: 0, end: 0 }, // from arrival the before stage is over, so it caps at f = 1,
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

export function routeProgress(route: RouteView, arrivalDate: string, now: Date) {
  const day = journeyDay(arrivalDate, now)
  const { cur, i } = current(route)
  const allDone = route.total > 0 && route.doneCount === route.total

  let f: number
  if (day < 1) f = Math.max(0.2, cur && cur.total ? cur.done / cur.total : 0)
  else {
    const { start, end } = STAGE_DAYS[i]
    // The 0.2 floor applies only when ahead of schedule, so the pin never sits behind the previous flag
    f = day < start ? 0.2 : Math.min(1, (day - start + 1) / (end - start + 1))
  }
  const x = allDone ? 1000 : Math.min(1000, i * 200 + 200 * f)

  const label = day < 1 ? `You · ${plural(1 - day, 'day')} to go` : `You · day ${day}`
  const name = cur?.name ?? legName(LEGS[i].id, day < 1)
  const left = day < 1 ? null : STAGE_DAYS[i].end - day + 1
  const tail = day < 1 ? `by ${shortDay(arrivalDate)}` : left && left > 0 ? `${plural(left, 'day')} left` : ''
  const summary = [name, `${cur?.done ?? 0} of ${cur?.total ?? 0}`, tail].filter(Boolean).join(' · ')

  return { x, label, summary, passed: TRACK_FLAGS.map(fx => fx <= x) }
}

// The five stage labels under the track (board stage_labels): a done stage reads "done ✓"
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
      state: done === total ? 'done ✓' : `${done} of ${total} · ${legWhen(l.id, arrivalDate)}`,
      now: i === curIndex,
    }
  })
}
