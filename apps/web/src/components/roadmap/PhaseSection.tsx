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

// Smart abbreviation for phase names - Linear style
function getPhaseDisplayText(name: string, level: 'minimal' | 'short' | 'medium' | 'full') {
  const words = name.split(' ')

  switch (level) {
    case 'minimal':
      return words[0] // "Arrival"
    case 'short':
      return words.slice(0, 2).join(' ') // "Arrival Planning"
    case 'medium':
      return words.slice(0, 3).join(' ') // "Arrival Planning & Setup"
    case 'full':
    default:
      return name // Full name
  }
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
        <div className="text-small font-semibold text-text-primary flex-1 text-left">
          {/* Mobile: Just number + first word */}
          <span className="md:hidden">
            Phase {phase.num}: {getPhaseDisplayText(phase.name, 'minimal')}
          </span>
          {/* Medium: Number + 2 words */}
          <span className="hidden md:block lg:hidden">
            Phase {phase.num}: {getPhaseDisplayText(phase.name, 'short')}
          </span>
          {/* Large: Number + 3 words */}
          <span className="hidden lg:block xl:hidden">
            Phase {phase.num}: {getPhaseDisplayText(phase.name, 'medium')}
          </span>
          {/* Extra large: Full name */}
          <span className="hidden xl:block">
            Phase {phase.num}: {getPhaseDisplayText(phase.name, 'full')}
          </span>
        </div>
        {/* Timeline - hidden on mobile to save space */}
        <span className="hidden md:block text-small text-text-tertiary">
          · {phase.timeline}
        </span>
        {/* Premium badge - abbreviated on mobile */}
        {phase.isPremium && (
          <>
            <span className="md:hidden text-caption bg-secondary-light text-secondary-hover px-1.5 py-0.5 rounded-badge font-medium ml-1">
              Pro
            </span>
            <span className="hidden md:block text-caption bg-secondary-light text-secondary-hover px-2 py-0.5 rounded-badge font-medium ml-1">
              Premium
            </span>
          </>
        )}
        {/* Progress counter - always visible but compact */}
        <span className="text-small text-text-tertiary ml-1 shrink-0">
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
