// RoadmapApiResponse fixtures shaped like GET /roadmap (CW05). Priya: solo AEWV, Auckland, arrived 21 Oct 2026.
import type { RoadmapApiResponse, RoadmapApiTask } from '@/lib/api'

const DURATIONS: Record<string, string> = { T10: '30–45 minutes' }
// Fixture phases: T01–T05 before, T06–T07 arrival, T08–T10 week 1, T11–T14 month 1, the rest later
export const phaseOf = (id: string) => [5, 7, 10, 14].filter(last => Number(id.slice(1)) > last).length + 1

export function apiTask(taskId: string, over: Partial<RoadmapApiTask> = {}): RoadmapApiTask {
  return {
    taskId,
    name: `KB name ${taskId}`,
    phase: phaseOf(taskId),
    status: 'NOT_STARTED',
    isBlocked: false,
    blockingTaskNames: [],
    blockingTaskIds: [],
    completedAt: null,
    estimatedDuration: DURATIONS[taskId] ?? '1 hour',
    taskType: 'FREE',
    consequenceLine: '',
    bestBy: null,
    priorityScore: 50,
    ...over,
  }
}

export function roadmap(tasks: RoadmapApiTask[]): RoadmapApiResponse {
  const phases = [1, 2, 3, 4, 5].map(phase => ({ phase, tasks: tasks.filter(t => t.phase === phase).reverse() }))
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

// Board data: 22 tasks (6 before, 4 arrival, 7 week 1, 4 month 1, 1 later), 9 done by default; T09, T10, T20 wait on T08
const PHASES: [number, string[]][] = [
  [1, ['T01', 'T02', 'T03', 'T04', 'T05', 'T15']],
  [2, ['T06', 'T07', 'T28', 'T08']],
  [3, ['T09', 'T11', 'T12', 'T13', 'T14', 'T16', 'T17']],
  [4, ['T10', 'T18', 'T19', 'T20']],
  [5, ['T21']],
]
const BLOCKED: Record<string, string[]> = { T09: ['T08'], T10: ['T08'], T20: ['T08'] }
export const board = (done = 9) => {
  let n = 0
  return roadmap(
    PHASES.flatMap(([phase, ids]) =>
      ids.map(id => {
        n += 1
        const blocked = BLOCKED[id]
        return apiTask(id, {
          phase,
          ...(n <= done ? { status: 'COMPLETE' as const, completedAt: `2026-10-${String(10 + n).padStart(2, '0')}T01:00:00.000Z` } : {}),
          ...(blocked ? { isBlocked: true, blockingTaskIds: blocked } : {}),
        })
      }),
    ),
  )
}
