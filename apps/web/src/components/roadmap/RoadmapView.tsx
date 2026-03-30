'use client'

import { useState } from 'react'
import { HeroCard } from './HeroCard'
import { FilterTabs } from './FilterTabs'
import { PhaseSection } from './PhaseSection'
import { TaskRow } from './TaskRow'
import { TaskDetail } from './TaskDetail'
import { MOCK_PHASES, MOCK_TASKS_FLAT } from '@/mocks/roadmap'
import type { FilterValue, TaskListItem } from '@/types/web'

export function RoadmapView() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null)

  // Top 3 actionable tasks for "Do these first"
  const priorityTasks = MOCK_TASKS_FLAT.filter(
    (t) =>
      t.cardState !== 'complete' &&
      t.cardState !== 'blocked' &&
      t.cardState !== 'premium_locked'
  ).slice(0, 3)

  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />
  }

  return (
    <div>
      <HeroCard tasks={MOCK_TASKS_FLAT} />

      {/* Do these first — only shown in "all" filter */}
      {filter === 'all' && (
        <div className="mb-7">
          <h2 className="text-body font-semibold text-text-primary mb-2.5">
            Do these first
          </h2>
          {priorityTasks.map((task) => (
            <TaskRow
              key={task.taskId}
              task={task}
              priority
              onClick={() => setSelectedTask(task)}
            />
          ))}
        </div>
      )}

      <FilterTabs active={filter} onChange={setFilter} />

      {MOCK_PHASES.map((phase, i) => (
        <PhaseSection
          key={phase.num}
          phase={phase}
          filter={filter}
          onTaskClick={(task) => setSelectedTask(task)}
          defaultExpanded={i < 2}
        />
      ))}
    </div>
  )
}
