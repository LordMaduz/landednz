// RoadmapApiResponse fixtures shaped like GET /roadmap (CW05). Priya: solo AEWV, Auckland, arrived 21 Oct 2026.
import type { RoadmapApiResponse, RoadmapApiTask } from '@/lib/api'

const DURATIONS: Record<string, string> = { T10: '30–45 minutes' }
const PHASE = (id: string) => (Number(id.slice(1)) <= 5 ? 1 : Number(id.slice(1)) <= 10 ? 2 : 3)

export function apiTask(taskId: string, over: Partial<RoadmapApiTask> = {}): RoadmapApiTask {
  return {
    taskId,
    name: `KB name ${taskId}`,
    phase: PHASE(taskId),
    status: 'NOT_STARTED',
    isBlocked: false,
    blockingTaskNames: [],
    blockingTaskIds: [],
    completedAt: null,
    estimatedDuration: DURATIONS[taskId] ?? '1 hour',
    taskType: 'FREE',
    consequenceLine: '',
    priorityScore: 50,
    ...over,
  }
}

export function roadmap(tasks: RoadmapApiTask[]): RoadmapApiResponse {
  const phases = [1, 2, 3].map(phase => ({ phase, tasks: tasks.filter(t => t.phase === phase).reverse() }))
  return { topThree: [], phases, lastComputedAt: '2026-10-23T00:00:00.000Z' }
}

const ids = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => `T${String(from + i).padStart(2, '0')}`)

// Done dates: T01–T05 before arrival, T06 21 Oct, T07 22 Oct (NZ days)
const DONE_AT: Record<string, string> = {
  T01: '2026-09-28T01:00:00.000Z',
  T02: '2026-09-30T01:00:00.000Z',
  T03: '2026-10-03T01:00:00.000Z',
  T04: '2026-10-06T01:00:00.000Z',
  T05: '2026-10-12T01:00:00.000Z',
  T06: '2026-10-21T02:00:00.000Z',
  T07: '2026-10-22T03:00:00.000Z',
}

export function priya(): RoadmapApiResponse {
  return roadmap(
    ids(1, 20).map(id => {
      if (DONE_AT[id]) return apiTask(id, { status: 'COMPLETE', completedAt: DONE_AT[id] })
      if (id === 'T09') return apiTask(id, { isBlocked: true, blockingTaskIds: ['T08'], blockingTaskNames: ['IRD Number Application'] })
      if (id === 'T20') return apiTask(id, { isBlocked: true, blockingTaskIds: ['T10', 'T08'], blockingTaskNames: ['b', 'a'] })
      return apiTask(id)
    }),
  )
}

export function firstUse(): RoadmapApiResponse {
  return roadmap(ids(1, 20).map(id => apiTask(id)))
}
