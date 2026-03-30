'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import type { RoadmapPhase, TaskListItem, FilterValue } from '@/types/web'
import { TaskRow } from './TaskRow'
import { cn } from '@/lib/utils/cn'

interface PhaseSectionProps {
  phase: RoadmapPhase
  filter: FilterValue
  onTaskClick: (task: TaskListItem) => void
  defaultExpanded?: boolean
  topSlot?: React.ReactNode
  bottomSlot?: React.ReactNode
}

function filterTasks(tasks: TaskListItem[], filter: FilterValue): TaskListItem[] {
  if (filter === 'todo') return tasks.filter((t) => t.cardState === 'not_started' || t.cardState === 'blocked')
  if (filter === 'progress') return tasks.filter((t) => t.cardState === 'in_progress')
  if (filter === 'done') return tasks.filter((t) => t.cardState === 'complete')
  return tasks
}

export function PhaseSection({ phase, filter, onTaskClick, defaultExpanded = true, topSlot, bottomSlot }: PhaseSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const completedCount = phase.tasks.filter((t) => t.cardState === 'complete').length
  const visibleTasks = filterTasks(phase.tasks, filter)

  // Collapse section when filter is active and no tasks match
  if (visibleTasks.length === 0 && filter !== 'all') return null

  const displayedTasks = filter === 'all' ? phase.tasks : visibleTasks

  return (
    <div className="mb-4">
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center gap-2 py-2.5 px-2 rounded-md hover:bg-bg transition-colors duration-150"
      >
        <ChevronRight
          className={cn(
            'w-3 h-3 text-text-tertiary transition-transform duration-150 flex-shrink-0',
            expanded && 'rotate-90'
          )}
          aria-hidden="true"
        />
        <span className="text-small font-semibold text-text-primary flex-1 text-left">
          Phase {phase.num}: {phase.name}
        </span>
        <span className="text-small text-text-tertiary">
          · {phase.timeline}
        </span>
        {phase.isPremium && (
          <span className="text-caption bg-secondary-light text-secondary-hover px-2 py-0.5 rounded-badge font-medium ml-1">
            Premium
          </span>
        )}
        <span className="text-small text-text-tertiary ml-1">
          {completedCount}/{phase.tasks.length}
        </span>
      </button>

      {expanded && (
        <div className="pt-1">
          {topSlot}
          {displayedTasks.map((task) => (
            <TaskRow
              key={task.taskId}
              task={task}
              onClick={() => onTaskClick(task)}
            />
          ))}
          {bottomSlot}
        </div>
      )}
    </div>
  )
}
