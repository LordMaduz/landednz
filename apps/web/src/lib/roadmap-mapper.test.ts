import { describe, it, expect } from 'vitest'
import { deriveCardState, mapApiTaskToListItem } from './roadmap-mapper'
import type { RoadmapApiTask } from './api'

describe('deriveCardState()', () => {
  // Test 1: NOT_STARTED, FREE, not blocked → not_started (base case)
  it('returns not_started for FREE task that has not started and is not blocked', () => {
    const task: RoadmapApiTask = {
      taskId: 'T01',
      name: 'Test Task',
      phase: 1,
      status: 'NOT_STARTED',
      isBlocked: false,
      blockingTaskNames: [],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'FREE',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('not_started')
  })

  // Test 2: IN_PROGRESS, FREE, not blocked → in_progress (active task)
  it('returns in_progress for FREE task that is in progress', () => {
    const task: RoadmapApiTask = {
      taskId: 'T02',
      name: 'Test Task',
      phase: 1,
      status: 'IN_PROGRESS',
      isBlocked: false,
      blockingTaskNames: [],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'FREE',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('in_progress')
  })

  // Test 3: COMPLETE, FREE, not blocked → complete (completion)
  it('returns complete for completed FREE task', () => {
    const task: RoadmapApiTask = {
      taskId: 'T03',
      name: 'Test Task',
      phase: 1,
      status: 'COMPLETE',
      isBlocked: false,
      blockingTaskNames: [],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'FREE',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('complete')
  })

  // Test 4: COMPLETE, PREMIUM, isBlocked → complete (complete beats everything)
  it('returns complete for completed PREMIUM task even when blocked', () => {
    const task: RoadmapApiTask = {
      taskId: 'T04',
      name: 'Test Task',
      phase: 1,
      status: 'COMPLETE',
      isBlocked: true,
      blockingTaskNames: ['T01'],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'PREMIUM',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('complete')
  })

  // Test 5: NOT_STARTED, FREE, isBlocked → blocked (dependency not met)
  it('returns blocked for FREE task that is blocked by dependency', () => {
    const task: RoadmapApiTask = {
      taskId: 'T05',
      name: 'Test Task',
      phase: 1,
      status: 'NOT_STARTED',
      isBlocked: true,
      blockingTaskNames: ['T01'],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'FREE',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('blocked')
  })

  // Test 6: NOT_STARTED, PREMIUM, not blocked → premium_locked (premium gate)
  it('returns premium_locked for PREMIUM task that has not started', () => {
    const task: RoadmapApiTask = {
      taskId: 'T06',
      name: 'Test Task',
      phase: 1,
      status: 'NOT_STARTED',
      isBlocked: false,
      blockingTaskNames: [],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'PREMIUM',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('premium_locked')
  })

  // Test 7: NOT_STARTED, PREMIUM, isBlocked → premium_locked (premium beats blocked)
  it('returns premium_locked for PREMIUM task even when blocked (premium beats blocked)', () => {
    const task: RoadmapApiTask = {
      taskId: 'T07',
      name: 'Test Task',
      phase: 1,
      status: 'NOT_STARTED',
      isBlocked: true,
      blockingTaskNames: ['T01'],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'PREMIUM',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('premium_locked')
  })

  // Test 8: IN_PROGRESS, PREMIUM, isBlocked → in_progress (in_progress beats all)
  it('returns in_progress for PREMIUM task in progress even when blocked', () => {
    const task: RoadmapApiTask = {
      taskId: 'T08',
      name: 'Test Task',
      phase: 1,
      status: 'IN_PROGRESS',
      isBlocked: true,
      blockingTaskNames: ['T01'],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'PREMIUM',
      consequenceLine: 'Test consequence',
      priorityScore: 50,
    }
    expect(deriveCardState(task)).toBe('in_progress')
  })
})

describe('mapApiTaskToListItem()', () => {
  // Test 9: FREE task, no blocking tasks → isPremium: false, no blockedBy field
  it('maps FREE task with no blocking tasks correctly', () => {
    const task: RoadmapApiTask = {
      taskId: 'T09',
      name: 'Free Task',
      phase: 2,
      status: 'NOT_STARTED',
      isBlocked: false,
      blockingTaskNames: [],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '45 minutes',
      taskType: 'FREE',
      consequenceLine: 'Important consequence',
      priorityScore: 75,
    }

    const result = mapApiTaskToListItem(task)

    expect(result).toEqual({
      taskId: 'T09',
      taskName: 'Free Task',
      consequenceLine: 'Important consequence',
      estimatedDuration: '45 minutes',
      phase: 2,
      cardState: 'not_started',
      isPremium: false,
      // blockedBy should not be present when no blocking tasks
    })
    expect(result.blockedBy).toBeUndefined()
  })

  // Test 10: PREMIUM task → isPremium: true
  it('maps PREMIUM task correctly', () => {
    const task: RoadmapApiTask = {
      taskId: 'T10',
      name: 'Premium Task',
      phase: 3,
      status: 'NOT_STARTED',
      isBlocked: false,
      blockingTaskNames: [],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '60 minutes',
      taskType: 'PREMIUM',
      consequenceLine: 'Premium consequence',
      priorityScore: 90,
    }

    const result = mapApiTaskToListItem(task)

    expect(result.isPremium).toBe(true)
    expect(result.cardState).toBe('premium_locked')
  })

  // Test 11: Task with blockingTaskNames → blockedBy.taskName set, blockedBy.taskId empty string
  it('maps task with blocking tasks correctly', () => {
    const task: RoadmapApiTask = {
      taskId: 'T11',
      name: 'Blocked Task',
      phase: 2,
      status: 'NOT_STARTED',
      isBlocked: true,
      blockingTaskNames: ['Get TFN', 'Open bank account'],
      blockingTaskIds: [],
      completedAt: null,
      estimatedDuration: '30 minutes',
      taskType: 'FREE',
      consequenceLine: 'Blocked consequence',
      priorityScore: 60,
    }

    const result = mapApiTaskToListItem(task)

    expect(result.blockedBy).toEqual({
      taskId: '', // API only provides names, not IDs
      taskName: 'Get TFN', // First blocking task name
    })
    expect(result.cardState).toBe('blocked')
  })
})