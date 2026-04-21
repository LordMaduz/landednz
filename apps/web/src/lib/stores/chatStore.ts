import { create } from 'zustand'
import type { ChatEntryPoint } from '@landednz/types'
import type { Message } from '@/types/chat'

interface ChatStore {
  isOpen: boolean
  entryPoint: ChatEntryPoint
  taskId: string | null
  messages: Message[]
  isStreaming: boolean
  streamingText: string
  sessionId: string | null
  open: (entryPoint: ChatEntryPoint, taskId?: string) => void
  close: () => void
  setMessages: (messages: Message[]) => void
  addMessage: (message: Message) => void
  setStreaming: (isStreaming: boolean) => void
  setStreamingText: (text: string) => void
  setSessionId: (sessionId: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  entryPoint: 'ROADMAP',
  taskId: null,
  messages: [],
  isStreaming: false,
  streamingText: '',
  sessionId: null,
  open: (entryPoint, taskId) =>
    set({
      isOpen: true,
      entryPoint,
      taskId: taskId ?? null,
    }),
  close: () => {
    set({
      isOpen: false,
      entryPoint: 'ROADMAP',
      taskId: null,
    })
    // Call reset to clear messages and streaming state
    useChatStore.getState().reset()
  },
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setStreaming: (isStreaming) => set({ isStreaming }),
  setStreamingText: (streamingText) => set({ streamingText }),
  setSessionId: (sessionId) => set({ sessionId }),
  reset: () =>
    set({
      messages: [],
      isStreaming: false,
      streamingText: '',
      sessionId: null,
    }),
}))