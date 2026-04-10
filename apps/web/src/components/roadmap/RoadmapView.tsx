'use client'

import { useState } from 'react'
import { HeroCard } from './HeroCard'
import { FilterTabs } from './FilterTabs'
import { PhaseSection } from './PhaseSection'
import { TaskRow } from './TaskRow'
import { TaskDetail } from './TaskDetail'
import { FirstUseHint } from './FirstUseHint'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { mapApiPhasesToWeb, mapApiTaskToListItem } from '@/lib/roadmap-mapper'
import { PremiumGateCard } from './PremiumGateCard'
import { PremiumBanner } from './PremiumBanner'
import type { RoadmapApiResponse } from '@/lib/api'
import type { FilterValue, TaskListItem, PremiumGateState } from '@/types/web'

interface RoadmapViewProps {
  initialData: RoadmapApiResponse | null
}

export function RoadmapView({ initialData }: RoadmapViewProps) {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null)
  const [gateState, setGateState] = useState<PremiumGateState>('full')
  const { activeHint, dismissHint } = useOnboardingStore()

  // Derive data from API response
  const phases = initialData ? mapApiPhasesToWeb(initialData.phases) : []
  const allTasksFlat = phases.flatMap(phase => phase.tasks)
  const priorityTasks = initialData ? initialData.topThree.map(mapApiTaskToListItem) : []

  if (selectedTask) {
    return <TaskDetail task={selectedTask} onBack={() => setSelectedTask(null)} />
  }

  return (
    <div>
      <HeroCard tasks={allTasksFlat} />

      {/* Do these first — only shown in "all" filter */}
      {filter === 'all' && (
        <div className="mb-8">
          <div className="relative">
            <h2 className="text-body font-semibold text-text-primary mb-2.5">
              Do these first
            </h2>
            {activeHint === 1 && (
              <div className="absolute top-full left-0 mt-1 z-30">
                <FirstUseHint
                  message="Start here — tap any task to see what to do and why."
                  position="bottom"
                  onDismiss={dismissHint}
                />
              </div>
            )}
          </div>
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

      <div className="relative">
        <FilterTabs active={filter} onChange={setFilter} />
        {activeHint === 2 && (
          <div className="absolute top-full left-0 mt-1 z-30">
            <FirstUseHint
              message="Your full plan is organised by phase. Each phase covers a specific time period."
              position="bottom"
              onDismiss={dismissHint}
            />
          </div>
        )}
      </div>

      {activeHint === 3 && (
        <FirstUseHint
          message="Have questions? Our AI advisor knows your situation and can help."
          position="top"
          onDismiss={dismissHint}
          className="fixed bottom-24 right-6 z-40"
        />
      )}

      {phases.map((phase, i) => (
        <PhaseSection
          key={phase.num}
          phase={phase}
          filter={filter}
          onTaskClick={(task) => setSelectedTask(task)}
          defaultExpanded={i < 2}
          topSlot={
            phase.num === 3 && gateState === 'banner' && filter === 'all'
              ? <PremiumBanner
                  onUpgrade={() => {}}
                  onDismiss={() => setGateState('dismissed')}
                />
              : undefined
          }
          bottomSlot={
            phase.num === 3 && gateState === 'full' && filter === 'all'
              ? <div className="mt-4">
                  <PremiumGateCard
                    onUpgrade={() => {}}
                    onDefer={() => setGateState('banner')}
                    onDecline={() => setGateState('banner')}
                  />
                </div>
              : undefined
          }
        />
      ))}
    </div>
  )
}
