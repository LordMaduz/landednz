// The Roadmap's itinerary: Done so far, Today, the current stage and the stages after it (spec §5.2).
import { journeyDay } from './journey-day'
import { LEGS, legName, legWhen } from './legs'
import { nzCalendarDate, weekdayDay } from './nz-date'
import { daysLeftIn, stageIndexOn } from './route-progress'
import { unlocksOf, waitsOn, type RouteTask, type RouteView } from './route-view'

export interface Itinerary {
  done: { when: string; summary: string; topics: string; count: number; tasks: RouteTask[] } | null
  today: { date: string; day: number | null; meta: string; task: RouteTask; unlocks: { title: string; stage: string; topic: string }[] } | null
  current: { name: string; count: number; when: string; daysLeft: number | null; rows: { task: RouteTask; meta: string }[]; more: RouteTask[] } | null
  later: { name: string; count: number; wait: string | null; when: string; tasks: RouteTask[] }[]
}

const ROWS = 3
const TOPICS = 3
const metaOf = (t: RouteTask) => (t.state === 'blocked' ? waitsOn(t) : t.time)

export function buildItinerary(route: RouteView, arrivalDate: string, now: Date): Itinerary {
  const day = journeyDay(arrivalDate, now)
  const before = day < 1
  const top = route.current
  const stageOf = (taskId: string) => route.legs.find(l => l.tasks.some(t => t.taskId === taskId))!.name

  const doneLegs = route.legs.filter(l => l.done > 0)
  const doneTasks = route.legs.flatMap(l => l.tasks).filter(t => t.state === 'done')
  const latest = doneTasks.filter(t => t.completedAt).sort((a, b) => a.completedAt!.localeCompare(b.completedAt!)).slice(-TOPICS)

  // Same stage as Home's "Then this week": today's stage, or the current leg if the traveller is ahead of the calendar
  const topLeg = route.legs.find(l => l.state === 'current')
  const topIndex = topLeg ? LEGS.findIndex(l => l.id === topLeg.id) : 0
  const stageIndex = before ? topIndex : Math.max(topIndex, stageIndexOn(day))
  const stageId = LEGS[stageIndex].id
  // Open tasks of earlier stages fold in, so the Roadmap lists every open task
  const rest = top
    ? route.legs.filter(l => LEGS.findIndex(x => x.id === l.id) <= stageIndex).flatMap(l => l.tasks).filter(t => t.state !== 'done' && t.taskId !== top.taskId)
    : []

  const unlocked = top ? unlocksOf(route, top.taskId) : []
  return {
    done: doneTasks.length
      ? {
          when: doneLegs.map(l => l.when).join(' · '),
          summary: doneLegs.map(l => `${l.name} ${l.done} of ${l.total}`).join(' · '),
          topics: latest.map(t => t.topic).join(', '),
          count: doneTasks.length,
          tasks: doneTasks,
        }
      : null,
    today: top
      ? {
          date: weekdayDay(nzCalendarDate(now)),
          day: before ? null : day,
          meta: `${before ? 'Up next' : "You're here · up next"} · ${top.time}`,
          task: top,
          unlocks: unlocked.map(t => ({ title: t.title, stage: stageOf(t.taskId), topic: t.topic })),
        }
      : null,
    current:
      rest.length
        ? {
            name: legName(stageId, before),
            count: rest.length,
            when: legWhen(stageId, arrivalDate),
            daysLeft: daysLeftIn(stageIndex, day),
            rows: rest.slice(0, ROWS).map(task => ({ task, meta: metaOf(task) })),
            more: rest.slice(ROWS),
          }
        : null,
    later: top
      ? route.legs
          .filter(l => LEGS.findIndex(x => x.id === l.id) > stageIndex)
          .map(l => {
            const open = l.tasks.filter(t => t.state !== 'done')
            const waiting = open.filter(t => unlocked.some(u => u.taskId === t.taskId)).length
            return { name: l.name, count: open.length, wait: waiting ? `, ${waiting} wait on ${top.topic}` : null, when: l.when, tasks: open }
          })
          .filter(l => l.count > 0)
      : [],
  }
}
