'use client'

import { useState } from 'react'
import { HeroCard } from './HeroCard'
import { FilterTabs } from './FilterTabs'
import { PhaseSection } from './PhaseSection'
import { TaskRow } from './TaskRow'
import { TaskDetail } from './TaskDetail'
import { FirstUseHint } from './FirstUseHint'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { MOCK_PHASES, MOCK_TASKS_FLAT } from '@/mocks/roadmap'
import { PremiumGateCard } from './PremiumGateCard'
import { PremiumBanner } from './PremiumBanner'
import type { FilterValue, TaskListItem, PremiumGateState } from '@/types/web'

export function RoadmapView() {
  const [filter, setFilter] = useState<FilterValue>('all')
  const [selectedTask, setSelectedTask] = useState<TaskListItem | null>(null)
  const [gateState, setGateState] = useState<PremiumGateState>('full')
  const { activeHint, dismissHint } = useOnboardingStore()

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

      {MOCK_PHASES.map((phase, i) => (
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
