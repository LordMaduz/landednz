import { describe, expect, it } from 'vitest'
import { TASK_COPY, taskTitle } from './task-copy'

describe('TASK_COPY', () => {
  it('covers T01–T21', () => {
    const ids = Array.from({ length: 21 }, (_, i) => `T${String(i + 1).padStart(2, '0')}`)
    expect(Object.keys(TASK_COPY).sort()).toEqual(ids)
  })

  it('T08 matches the boards', () => {
    expect(TASK_COPY.T08).toEqual({
      title: 'Apply for your IRD number',
      topic: 'your IRD number',
      brief: 'your IRD number',
      actionLabel: 'Open the IRD application',
    })
  })

  it('Month 1 briefs read as the Home next line', () => {
    expect(['T11', 'T12', 'T13', 'T14'].map(id => TASK_COPY[id].brief)).toEqual([
      'a rental',
      'a GP',
      'ACC',
      'your rights as a tenant',
    ])
  })

  it('action labels only where the boards have them', () => {
    const withAction = Object.entries(TASK_COPY).filter(([, c]) => c.actionLabel).map(([id]) => id)
    expect(withAction).toEqual(['T08', 'T09', 'T12'])
  })
})

describe('taskTitle', () => {
  it('uses the copy title, else the fallback', () => {
    expect(taskTitle('T09', 'Raw')).toBe('Give your employer a tax code (IR330)')
    expect(taskTitle('T99', 'Raw name')).toBe('Raw name')
  })
})
