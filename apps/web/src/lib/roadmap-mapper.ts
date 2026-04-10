// Pure mapping functions for API → web type conversion
// Isolated module for AC-W4-06 unit testing

import type { RoadmapApiTask, RoadmapApiResponse } from '@/lib/api'
import type { TaskCardState, TaskListItem, RoadmapPhase } from '@/types/web'

// Hardcoded phase metadata — not provided by API
const PHASE_META = {
  1: { name: 'Before you start working', timeline: 'Before you arrive', isPremium: false },
  2: { name: 'First 2 weeks', timeline: 'Weeks 1–2', isPremium: false },
  3: { name: 'Settling in', timeline: 'Months 1–3', isPremium: true },
} as const

/**
 * Derives TaskCardState from API task data.
 * Priority order: COMPLETE → IN_PROGRESS → premium_locked → blocked → not_started
 */
export function deriveCardState(task: RoadmapApiTask): TaskCardState {
  if (task.status === 'COMPLETE') {
    return 'complete'
  }
  if (task.status === 'IN_PROGRESS') {
    return 'in_progress'
  }
  if (task.taskType === 'PREMIUM') {
    return 'premium_locked'
  }
  if (task.isBlocked) {
    return 'blocked'
  }
  return 'not_started'
}

/**
 * Maps API task to web TaskListItem format.
 * - name → taskName
 * - taskType === 'PREMIUM' → isPremium: true
 * - blockingTaskNames[0] → blockedBy (taskId empty, taskName from API)
 * - difficulty, completedAt omitted (not in API)
 */
export function mapApiTaskToListItem(task: RoadmapApiTask): TaskListItem {
  const baseItem: TaskListItem = {
    taskId: task.taskId,
    taskName: task.name,
    consequenceLine: task.consequenceLine,
    estimatedDuration: task.estimatedDuration,
    phase: task.phase as 1 | 2 | 3,
    cardState: deriveCardState(task),
    isPremium: task.taskType === 'PREMIUM',
  }

  // Add blockedBy if task has blocking task names
  if (task.blockingTaskNames.length > 0) {
    baseItem.blockedBy = {
      taskId: '', // API only provides names, not IDs
      taskName: task.blockingTaskNames[0],
    }
  }

  return baseItem
}

/**
 * Maps API phases to web RoadmapPhase format.
 * Merges API task data with hardcoded phase metadata.
 */
export function mapApiPhasesToWeb(
  apiPhases: RoadmapApiResponse['phases']
): RoadmapPhase[] {
  return apiPhases.map((apiPhase) => {
    const phaseNum = apiPhase.phase as 1 | 2 | 3
    const metadata = PHASE_META[phaseNum]

    if (!metadata) {
      throw new Error(`Unknown phase number: ${phaseNum}`)
    }

    return {
      num: phaseNum,
      name: metadata.name,
      timeline: metadata.timeline,
      isPremium: metadata.isPremium,
      tasks: apiPhase.tasks.map(mapApiTaskToListItem),
    }
  })
}