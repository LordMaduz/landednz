// What Home shows, from the route and the profile: greeting, next move, this week and recently done.
import type { City } from '@landednz/types'
import type { GetProfileResponse } from './api'
import { journeyDay } from './journey-day'
import { LEGS, legName, legStart } from './legs'
import { dayMonth, longDay, weekdayDay, weekdayDayNZ } from './nz-date'
import { daysLeftIn, stageIndexOn } from './route-progress'
import { unlocksOf, waitsOn, type RouteTask, type RouteView } from './route-view'
import { TASK_COPY } from './task-copy'

export interface HomeView {
  greeting: string
  subline: string // "9 of 22 done · day 5 since you landed on Mon 2 Nov"
  sublineShort: string // phone: without the date
  top: RouteTask | null
  nextMeta: string // "Your next move · Arrival · 20–30 min"
  nextMetaShort: string // "Your next move · 20–30 min"
  unlocks: string[] // titles of the tasks waiting on `top`
  weekAside: string // "Week 1 · 3 days left"
  week: { task: RouteTask; meta: string }[] // open tasks after `top` in this week's stage, at most 2
  weekFoot: string | null // "4 more in Week 1"
  weekTotal: number
  weekEmpty: string | null
  nextLine: string | null // before arrival: what the Arrival leg brings
  recent: { taskId: string; title: string; when: string; weekday: string }[]
  recentTotal: number
}

// "9 of 22 done · day 5 since you landed on Mon 2 Nov"; before arrival the count-down
export function homeSubline(route: RouteView, arrivalDate: string, now: Date, short: boolean): string {
  const day = journeyDay(arrivalDate, now)
  if (day < 1) return `${1 - day} ${day === 0 ? 'day' : 'days'} until you land on ${longDay(arrivalDate)}.`
  return `${route.doneCount} of ${route.total} done · day ${day} since you landed${short ? '' : ` on ${weekdayDay(arrivalDate)}`}`
}

const and = new Intl.ListFormat('en-NZ', { type: 'conjunction' })

const WEEK_CAP = 2 // two wrapped rows match the next-move card's height
const RECENT_CAP = 4
// The short name the greeting uses
const CITY_NAME: Record<City, string> = { AUCKLAND: 'Auckland', WELLINGTON: 'Wellington', CHRISTCHURCH: 'Christchurch', OTHER: 'New Zealand' }

export function buildHomeView(route: RouteView, profile: GetProfileResponse, now: Date): HomeView {
  const city = CITY_NAME[profile.city]
  const day = journeyDay(profile.arrivalDate, now)

  const tasks = route.legs.flatMap(l => l.tasks)
  const top = route.current
  const leg = route.legs.find(l => l.state === 'current')
  const nextLeg = leg && route.legs[route.legs.indexOf(leg) + 1]
  // "This week" is the stage today falls in, or the current leg if the traveller is ahead of the calendar
  const topIndex = leg ? LEGS.findIndex(l => l.id === leg.id) : 0
  const weekIndex = day < 1 ? topIndex : Math.max(topIndex, stageIndexOn(day))
  const weekLeg = route.legs.find(l => l.id === LEGS[weekIndex].id)
  const rest = top && weekLeg ? weekLeg.tasks.filter(t => t.state !== 'done' && t.taskId !== top.taskId) : []
  const week = rest.slice(0, WEEK_CAP).map(task => ({ task, meta: task.state === 'blocked' ? waitsOn(task) : task.time }))
  const weekName = legName(LEGS[weekIndex].id, day < 1)
  const daysLeft = daysLeftIn(weekIndex, day)

  const arrivalBriefs =
    route.legs.find(l => l.id === 'arrival')?.tasks.filter(t => t.state !== 'done').map(t => TASK_COPY[t.taskId]?.brief ?? t.topic) ?? []
  const nextLine = day < 1 && arrivalBriefs.length ? `After you land: ${and.format(arrivalBriefs)}.` : null

  const done = tasks
    .filter(t => t.state === 'done' && t.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
  const stageOf = (taskId: string) => route.legs.find(l => l.tasks.some(t => t.taskId === taskId))!.name

  return {
    greeting: day < 1 ? 'Welcome' : `Welcome to ${city}`,
    subline: homeSubline(route, profile.arrivalDate, now, false),
    sublineShort: homeSubline(route, profile.arrivalDate, now, true),
    top,
    nextMeta: leg && top ? `Your next move · ${leg.name} · ${top.time}` : '',
    nextMetaShort: top ? `Your next move · ${top.time}` : '',
    unlocks: top ? unlocksOf(route, top.taskId).map(t => t.title) : [],
    weekAside: daysLeft ? `${weekName} · ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left` : weekName,
    week,
    weekFoot: rest.length > WEEK_CAP ? `${rest.length - WEEK_CAP} more in ${weekName}` : null,
    weekTotal: rest.length,
    weekEmpty:
      top && !rest.length
        ? `Nothing else this week.${nextLeg ? ` ${nextLeg.name} starts on ${dayMonth(legStart(nextLeg.id, profile.arrivalDate))}.` : ''}`
        : null,
    nextLine,
    recent: done.slice(0, RECENT_CAP).map(t => {
      const when = weekdayDayNZ(t.completedAt!)
      return { taskId: t.taskId, title: t.title, when: `Done ${when} · ${stageOf(t.taskId)}`, weekday: when.split(' ')[0] }
    }),
    recentTotal: done.length,
  }
}
