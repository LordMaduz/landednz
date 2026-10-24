import { describe, expect, it } from 'vitest'
import { buildRouteView } from './route-view'
import { apiTask, firstUse, priya, roadmap } from '@/test/roadmap-fixtures'

const ARRIVAL = '2026-10-21'
const task = (view: ReturnType<typeof buildRouteView>, id: string) =>
  view.legs.flatMap(l => l.tasks).find(t => t.taskId === id)!

describe('buildRouteView — Priya, day 3', () => {
  const view = buildRouteView(priya(), ARRIVAL)

  it('counts and current task', () => {
    expect(view.total).toBe(20)
    expect(view.doneCount).toBe(7)
    expect(view.current?.taskId).toBe('T08')
  })

  it('task states and meta', () => {
    expect(task(view, 'T08')).toMatchObject({ state: 'current', meta: 'Next', title: 'Apply for your IRD number', topic: 'your IRD number' })
    expect(task(view, 'T09')).toMatchObject({ state: 'blocked', meta: 'Needs your IRD number first' })
    expect(task(view, 'T10')).toMatchObject({ state: 'available', meta: '30–45 minutes', time: '30–45 minutes' })
    expect(task(view, 'T06')).toMatchObject({ state: 'done', meta: 'Done 21 Oct', completedAt: '2026-10-21T02:00:00.000Z' })
  })

  it('drops the KB duration note in brackets, as the board shows times', () => {
    const v = buildRouteView(roadmap([apiTask('T11', { estimatedDuration: '2–4 hours (viewings + agreement review + bond lodgement)' })]), ARRIVAL)
    expect(task(v, 'T11')).toMatchObject({ meta: 'Next', time: '2–4 hours' })
  })

  it('leg states, counts and dates', () => {
    expect(view.legs.map(l => [l.id, l.state, l.done, l.total])).toEqual([
      ['before', 'done', 5, 5],
      ['arrival', 'done', 2, 2],
      ['week1', 'current', 0, 3],
      ['month1', 'open', 0, 4],
      ['later', 'locked', 0, 6],
    ])
    expect(view.legs[2]).toMatchObject({ name: 'Week 1', when: 'to 28 Oct' })
  })

  it('tasks in a locked leg are locked; a blocked one names its lowest-id blocker', () => {
    expect(task(view, 'T15').state).toBe('locked')
    expect(task(view, 'T20')).toMatchObject({ state: 'locked' })
  })

  it('task order inside a leg is id order', () => {
    expect(view.legs[4].tasks.map(t => t.taskId)).toEqual(['T15', 'T16', 'T17', 'T18', 'T19', 'T20'])
  })
})

describe('buildRouteView — edges', () => {
  it('current is the first task in id order that is neither done nor blocked', () => {
    const view = buildRouteView(
      roadmap([apiTask('T06', { isBlocked: true, blockingTaskIds: ['T99'] }), apiTask('T07'), apiTask('T08')]),
      ARRIVAL,
    )
    expect(view.current?.taskId).toBe('T07')
    expect(task(view, 'T06')).toMatchObject({ state: 'blocked', meta: 'Needs another task first' })
  })

  it('blocked meta names the lowest-id blocker', () => {
    const view = buildRouteView(
      roadmap([apiTask('T10'), apiTask('T20', { isBlocked: true, blockingTaskIds: ['T10', 'T08'] })]),
      ARRIVAL,
    )
    expect(task(view, 'T20').meta).toBe('Needs your IRD number first')
  })

  it('first use: T01 current, later legs locked', () => {
    const view = buildRouteView(firstUse(), ARRIVAL)
    expect(view.doneCount).toBe(0)
    expect(view.current?.taskId).toBe('T01')
    expect(view.legs.map(l => l.state)).toEqual(['current', 'open', 'locked', 'locked', 'locked'])
  })

  it('all done → no current, every leg done', () => {
    const all = roadmap(['T01', 'T06', 'T08'].map(id => apiTask(id, { status: 'COMPLETE', completedAt: '2026-10-22T00:00:00Z' })))
    const view = buildRouteView(all, ARRIVAL)
    expect(view.current).toBeNull()
    expect(view.legs.map(l => l.state)).toEqual(['done', 'done', 'done'])
  })
})
