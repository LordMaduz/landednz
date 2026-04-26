'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HeroCard } from './HeroCard'
import { FilterTabs } from './FilterTabs'
import { PhaseSection } from './PhaseSection'
import { TaskRow } from './TaskRow'
import { TaskDetail } from './TaskDetail'
import { FirstUseHint } from './FirstUseHint'
import { useOnboardingStore } from '@/lib/stores/onboardingStore'
import { useChatStore } from '@/lib/stores/chatStore'
import { useRoadmapStore } from '@/lib/stores/roadmapStore'
import { mapApiPhasesToWeb, mapApiTaskToListItem, mapApiTaskDetail } from '@/lib/roadmap-mapper'
import { getTaskDetail, completeTask, getRoadmap } from '@/lib/api'
import { toast } from 'sonner'
import { BetaAccessCard } from './BetaAccessCard'
import { PremiumBanner } from './PremiumBanner'
import type { RoadmapApiResponse } from '@/lib/api'
import type { FilterValue, TaskListItem, PremiumGateState } from '@/types/web'

interface RoadmapViewProps {
  initialData: RoadmapApiResponse | null
  token: string
}

export function RoadmapView({ initialData, token }: RoadmapViewProps) {
  const {
    roadmapData,
    filter,
    selectedTask,
    gateState,
    setRoadmapData,
    setFilter,
    setSelectedTask,
    updateSelectedTask,
    setGateState,
  } = useRoadmapStore()
  const { activeHint, dismissHint } = useOnboardingStore()
  const router = useRouter()

  // Hydrate store from initialData on mount if store is empty
  useEffect(() => {
    if (roadmapData === null && initialData !== null) {
      setRoadmapData(initialData)
    }
  }, [initialData, roadmapData, setRoadmapData])

  // Derive data from local roadmap state
  const phases = roadmapData ? mapApiPhasesToWeb(roadmapData.phases) : []
  const allTasksFlat = phases.flatMap(phase => phase.tasks)
  const priorityTasks = roadmapData ? roadmapData.topThree.map(mapApiTaskToListItem) : []

  // Optimistic complete: update local state, POST to API, re-fetch on success, rollback on failure
  const handleComplete = async (taskId: string) => {
    if (!roadmapData) return
    const previousData = roadmapData

    const optimisticData: RoadmapApiResponse = {
      ...roadmapData,
      phases: roadmapData.phases.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(t =>
          t.taskId === taskId ? { ...t, status: 'COMPLETE' as const } : t
        ),
      })),
      topThree: roadmapData.topThree.map(t =>
        t.taskId === taskId ? { ...t, status: 'COMPLETE' as const } : t
      ),
    }
    setRoadmapData(optimisticData)

    try {
      await completeTask(taskId, token)
      const freshData = await getRoadmap(token)
      setRoadmapData(freshData)
      setSelectedTask(null)
    } catch {
      setRoadmapData(previousData)
      toast.error('Something went wrong. Your progress was not saved.')
    }
  }

  // Handle task click: show detail immediately, then fetch real detail
  const handleTaskClick = async (task: TaskListItem) => {
    setSelectedTask(task)
    try {
      const response = await getTaskDetail(task.taskId, token)
      const detail = mapApiTaskDetail(response)
      updateSelectedTask(prev => ({ ...prev, detail }))
    } catch (error) {
      // AC-W4-14 adds proper error UI — for now, detail stays undefined (shows fallback text)
      // Note: Using console.error temporarily until web structured logging is added
      // Handle 401 unauthorized error — redirect to sign in
      if ((error as { status?: number }).status === 401) {
        router.push('/auth/signin?redirect=/roadmap')
        return
      }
      console.error('Failed to load task detail:', error)
    }
  }

  // Show inline error when no roadmap data could be loaded
  if (roadmapData === null && initialData === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-error-light border border-error rounded-button px-6 py-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-error flex items-center justify-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
              <path d="M15 9l-6 6M9 9l6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-small font-semibold text-text-primary mb-2">We couldn't load your roadmap</h2>
          <p className="text-small text-text-secondary mb-6">
            There was an error loading your settlement tasks. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-3 rounded-button bg-primary text-text-inverse text-small font-semibold hover:bg-primary-hover transition-colors focus:outline-none focus:ring-2 focus:ring-border-focus focus:ring-offset-2"
          >
            Refresh page
          </button>
        </div>
      </div>
    )
  }

  if (selectedTask) {
    return (
      <TaskDetail
        task={selectedTask}
        onBack={() => setSelectedTask(null)}
        onComplete={() => handleComplete(selectedTask.taskId)}
        onOpenChat={() => useChatStore.getState().open('TASK_CARD', selectedTask.taskId)}
      />
    )
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
              onClick={() => handleTaskClick(task)}
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
          onTaskClick={handleTaskClick}
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
                  <BetaAccessCard
                    onDismiss={() => setGateState('dismissed')}
                  />
                </div>
              : undefined
          }
        />
      ))}
    </div>
  )
}
