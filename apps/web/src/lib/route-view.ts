// The route the Roadmap rail and Home strip draw: legs of waypoints from GET /roadmap.
import type { RoadmapApiResponse, RoadmapApiTask } from './api'
import { LEGS, legForTask, legWhen, type LegId } from './legs'
import { shortDayNZ } from './nz-date'
import { TASK_COPY, taskTitle } from './task-copy'

export type WaypointState = 'done' | 'current' | 'available' | 'blocked' | 'locked'

export interface RouteTask {
  taskId: string
  title: string
  topic: string
  state: WaypointState
  meta: string
  time: string
  why: string // the consequence line: what happens if it waits
  completedAt: string | null
}

export interface RouteLeg {
  id: LegId
  name: string
  when: string
  done: number
  total: number
  state: 'done' | 'current' | 'open' | 'locked'
  tasks: RouteTask[]
}

export interface RouteView {
  total: number
  doneCount: number
  current: RouteTask | null
  legs: RouteLeg[]
}

function blockedMeta(t: RoadmapApiTask): string {
  const blocker = [...t.blockingTaskIds].sort()[0]
  const topic = blocker && TASK_COPY[blocker]?.topic
  return topic ? `Needs ${topic} first` : 'Needs another task first'
}

export function buildRouteView(roadmap: RoadmapApiResponse, arrivalDate: string): RouteView {
  const tasks = roadmap.phases.flatMap(p => p.tasks).sort((a, b) => a.taskId.localeCompare(b.taskId))
  const isDone = (t: RoadmapApiTask) => t.status === 'COMPLETE'
  const currentId = tasks.find(t => !isDone(t) && !t.isBlocked)?.taskId ?? null

  const legs = LEGS.map(leg => ({ leg, tasks: tasks.filter(t => legForTask(t.taskId) === leg.id) })).filter(
    l => l.tasks.length > 0,
  )
  // The leg the traveller is in: the one holding the current task, else the first with open work
  const currentLegIndex = legs.findIndex(l =>
    currentId ? l.tasks.some(t => t.taskId === currentId) : l.tasks.some(t => !isDone(t)),
  )

  const routeLegs: RouteLeg[] = legs.map(({ leg, tasks: legTasks }, index) => {
    const done = legTasks.filter(isDone).length
    const state: RouteLeg['state'] =
      done === legTasks.length
        ? 'done'
        : index === currentLegIndex
          ? 'current'
          : index > currentLegIndex + 1
            ? 'locked'
            : 'open'

    return {
      id: leg.id,
      name: leg.name,
      when: legWhen(leg.id, arrivalDate),
      done,
      total: legTasks.length,
      state,
      tasks: legTasks.map(t => {
        const taskState: WaypointState = isDone(t)
          ? 'done'
          : t.taskId === currentId
            ? 'current'
            : state === 'locked'
              ? 'locked'
              : t.isBlocked
                ? 'blocked'
                : 'available'
        // KB durations carry a note in brackets ("2–4 hours (viewings + …)"); the route shows the time
        const time = t.estimatedDuration.replace(/\s*\(.*\)\s*$/, '')
        const meta = {
          done: t.completedAt ? `Done ${shortDayNZ(t.completedAt)}` : 'Done',
          current: 'Next',
          blocked: blockedMeta(t),
          available: time,
          locked: time,
        }[taskState]
        return {
          taskId: t.taskId,
          title: taskTitle(t.taskId, t.name),
          topic: TASK_COPY[t.taskId]?.topic ?? t.name,
          state: taskState,
          meta,
          time,
          why: t.consequenceLine,
          completedAt: t.completedAt,
        }
      }),
    }
  })

  const current = routeLegs.flatMap(l => l.tasks).find(t => t.state === 'current') ?? null
  return { total: tasks.length, doneCount: tasks.filter(isDone).length, current, legs: routeLegs }
}
