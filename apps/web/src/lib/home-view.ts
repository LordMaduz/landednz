// What Home shows, from the route and the profile: greeting, this week, recently done and the plan.
import type { GetProfileResponse } from './api'
import { answerLabel } from './answers'
import { journeyDay } from './journey-day'
import { shortDayNZ } from './nz-date'
import type { RouteTask, RouteView } from './route-view'
import { TASK_COPY } from './task-copy'

export interface HomeView {
  greeting: string
  subline: string
  weekTitle: string
  top: RouteTask | null
  week: RouteTask[]
  nextLine: string | null
  recent: { taskId: string; title: string; when: string }[]
  plan: { label: string; value: string }[]
}

// The name Home greets: the first word of Google's full name, else the email's local part
export function firstName(user: { email?: string; user_metadata?: { full_name?: string } }): string {
  return user.user_metadata?.full_name?.trim().split(/\s+/)[0] || (user.email ?? '').split('@')[0]
}

function nzHour(now: Date): number {
  return Number(new Intl.DateTimeFormat('en-NZ', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Pacific/Auckland' }).format(now))
}

const and = new Intl.ListFormat('en-NZ', { type: 'conjunction' })

export function buildHomeView(route: RouteView, profile: GetProfileResponse, user: { firstName: string }, now: Date): HomeView {
  const city = profile.city === 'OTHER' ? 'New Zealand' : answerLabel('city', profile.city)
  const firstUse = route.doneCount === 0
  const hour = nzHour(now)
  const partOfDay = hour >= 5 && hour < 12 ? 'morning' : hour >= 12 && hour < 18 ? 'afternoon' : 'evening'

  const day = journeyDay(profile.arrivalDate, now)
  const untilLanding = 1 - day
  const arrivalDone = route.legs.find(l => l.id === 'arrival')?.state === 'done'
  const subline =
    day < 1
      ? `${untilLanding} ${untilLanding === 1 ? 'day' : 'days'} until you land in ${city}.`
      : firstUse
        ? 'Start with the first task below. Each one you finish unlocks the next.'
        : `Day ${day} in ${city}${arrivalDone ? ', and the basics are sorted' : ''}.`

  const tasks = route.legs.flatMap(l => l.tasks)
  const top = route.current
  // The two open tasks after the current one, in route order; Home words a blocker as "After …"
  const week = tasks
    .filter(t => t.state !== 'done' && t !== top)
    .slice(0, 2)
    .map(t => (t.state === 'blocked' ? { ...t, meta: t.meta.replace(/^Needs (.+) first$/, 'After $1') } : t))

  const currentLeg = route.legs.findIndex(l => l.state === 'current')
  const nextLeg = currentLeg >= 0 ? route.legs[currentLeg + 1] : undefined
  const nextBriefs = nextLeg?.tasks.filter(t => t.state !== 'done').map(t => TASK_COPY[t.taskId]?.brief ?? t.topic) ?? []
  const nextLine = nextLeg && nextBriefs.length ? `${nextLeg.name} brings ${and.format(nextBriefs)}.` : null

  const recent = tasks
    .filter(t => t.state === 'done' && t.completedAt)
    .sort((a, b) => b.completedAt!.localeCompare(a.completedAt!))
    .slice(0, 3)
    .map(t => ({ taskId: t.taskId, title: t.title, when: shortDayNZ(t.completedAt!) }))

  return {
    greeting: firstUse ? `Welcome to ${city}, ${user.firstName}` : `Good ${partOfDay}, ${user.firstName}`,
    subline,
    weekTitle: firstUse ? 'Start here' : 'This week',
    top,
    week,
    nextLine,
    recent,
    plan: [
      { label: 'Visa', value: answerLabel('visaType', profile.visaType) },
      { label: 'City', value: answerLabel('city', profile.city) },
      { label: 'Moving', value: answerLabel('familySituation', profile.familySituation) },
      { label: 'Work', value: answerLabel('occupation', profile.occupation) },
    ],
  }
}
