// What Home shows, from the route and the profile: greeting, this week, recently done and the plan.
import type { City } from '@landednz/types'
import type { GetProfileResponse } from './api'
import { answerLabel } from './answers'
import { journeyDay } from './journey-day'
import { legStart } from './legs'
import { dayMonth, longDay, shortDayNZ } from './nz-date'
import type { RouteTask, RouteView } from './route-view'
import { TASK_COPY } from './task-copy'

export interface HomeView {
  greeting: string
  subline: string
  top: RouteTask | null
  nextMeta: string // "Week 1 · task 1 of 5"
  week: RouteTask[] // the open tasks after `top` in the current leg, at most 3
  weekCount: string // "4 more tasks", all of them
  weekMore: number
  weekEmpty: string | null
  nextLine: string | null // before arrival: what the Arrival leg brings
  recent: { taskId: string; title: string; when: string }[]
  recentTotal: number
  plan: { label: string; value: string }[]
}

// The name Home greets: the first word of Google's full name, else the email's local part
export function firstName(user: { email?: string; user_metadata?: { full_name?: string } }): string {
  return user.user_metadata?.full_name?.trim().split(/\s+/)[0] || (user.email ?? '').split('@')[0]
}

const and = new Intl.ListFormat('en-NZ', { type: 'conjunction' })

const WEEK_CAP = 3
// The short name the greeting uses; the Plan row keeps the full answer label
const CITY_NAME: Record<City, string> = { AUCKLAND: 'Auckland', WELLINGTON: 'Wellington', CHRISTCHURCH: 'Christchurch', OTHER: 'New Zealand' }

export function buildHomeView(route: RouteView, profile: GetProfileResponse, user: { firstName: string }, now: Date): HomeView {
  const city = CITY_NAME[profile.city]
  const day = journeyDay(profile.arrivalDate, now)
  const untilLanding = 1 - day
  const subline =
    day < 1
      ? `${untilLanding} ${untilLanding === 1 ? 'day' : 'days'} until you land on ${longDay(profile.arrivalDate)}.`
      : `Day ${day} in ${city} · ${route.doneCount} of ${route.total} tasks done.`

  const tasks = route.legs.flatMap(l => l.tasks)
  const top = route.current
  const leg = route.legs.find(l => l.state === 'current')
  const nextLeg = leg && route.legs[route.legs.indexOf(leg) + 1]
  // Open tasks after the current one in this leg; Home words a blocker as "After …"
  const rest = leg && top ? leg.tasks.slice(leg.tasks.indexOf(top) + 1).filter(t => t.state !== 'done') : []
  const week = rest
    .slice(0, WEEK_CAP)
    .map(t => (t.state === 'blocked' ? { ...t, meta: t.meta.replace(/^Needs (.+) first$/, 'After $1') } : t))

  const arrivalBriefs =
    route.legs.find(l => l.id === 'arrival')?.tasks.filter(t => t.state !== 'done').map(t => TASK_COPY[t.taskId]?.brief ?? t.topic) ?? []
  const nextLine = day < 1 && arrivalBriefs.length ? `After you land: ${and.format(arrivalBriefs)}.` : null

  const done = tasks
    .filter(t => t.state === 'done' && t.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))

  return {
    greeting: day < 1 ? `Welcome, ${user.firstName}` : `Welcome to ${city}, ${user.firstName}`,
    subline,
    top,
    nextMeta: leg && top ? `${leg.name} · task ${leg.tasks.indexOf(top) + 1} of ${leg.total}` : '',
    week,
    weekCount: rest.length ? `${rest.length} more ${rest.length === 1 ? 'task' : 'tasks'}` : '',
    weekMore: Math.max(0, rest.length - WEEK_CAP),
    weekEmpty:
      top && !rest.length
        ? `Nothing else this week.${nextLeg ? ` ${nextLeg.name} starts on ${dayMonth(legStart(nextLeg.id, profile.arrivalDate))}.` : ''}`
        : null,
    nextLine,
    recent: done.slice(0, 3).map(t => ({ taskId: t.taskId, title: t.title, when: shortDayNZ(t.completedAt!) })),
    recentTotal: done.length,
    plan: [
      { label: 'Visa', value: answerLabel('visaType', profile.visaType) },
      { label: 'City', value: answerLabel('city', profile.city) },
      { label: 'Moving', value: answerLabel('familySituation', profile.familySituation) },
      { label: 'Work', value: answerLabel('occupation', profile.occupation) },
      { label: 'Arriving', value: longDay(profile.arrivalDate) },
    ],
  }
}
