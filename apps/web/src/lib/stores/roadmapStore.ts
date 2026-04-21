import { create } from 'zustand'
import type { RoadmapApiResponse } from '@/lib/api'
import type { FilterValue, TaskListItem, PremiumGateState } from '@/types/web'

interface RoadmapStore {
  roadmapData: RoadmapApiResponse | null
  filter: FilterValue
  selectedTask: TaskListItem | null
  gateState: PremiumGateState
  setRoadmapData: (data: RoadmapApiResponse | null) => void
  setFilter: (filter: FilterValue) => void
  setSelectedTask: (task: TaskListItem | null) => void
  updateSelectedTask: (updater: (task: TaskListItem) => TaskListItem) => void
  setGateState: (state: PremiumGateState) => void
  reset: () => void
}

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  roadmapData: null,
  filter: 'all',
  selectedTask: null,
  gateState: 'full',
  setRoadmapData: (data) => set({ roadmapData: data }),
  setFilter: (filter) => set({ filter }),
  setSelectedTask: (task) => set({ selectedTask: task }),
  updateSelectedTask: (updater) =>
    set((state) => ({
      selectedTask: state.selectedTask ? updater(state.selectedTask) : null,
    })),
  setGateState: (gateState) => set({ gateState }),
  reset: () =>
    set({
      roadmapData: null,
      filter: 'all',
      selectedTask: null,
      gateState: 'full',
    }),
}))