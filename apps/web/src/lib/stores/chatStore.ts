import { create } from 'zustand'
import type { ChatEntryPoint } from '@landednz/types'

interface ChatStore {
  isOpen: boolean
  entryPoint: ChatEntryPoint
  taskId: string | null
  open: (entryPoint: ChatEntryPoint, taskId?: string) => void
  close: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  entryPoint: 'ROADMAP',
  taskId: null,
  open: (entryPoint, taskId) =>
    set({
      isOpen: true,
      entryPoint,
      taskId: taskId ?? null,
    }),
  close: () =>
    set({
      isOpen: false,
      entryPoint: 'ROADMAP',
      taskId: null,
    }),
}))