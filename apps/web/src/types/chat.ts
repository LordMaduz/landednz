// Chat response types for premium user experience

export interface StepItem {
  text: string
  sources?: string[]
  note?: string // Optional clarification
}

export interface ChecklistItem {
  text: string
  required: boolean
  sources?: string[]
}

export interface StepsResponse {
  type: 'steps'
  header: string
  intro: string
  steps: StepItem[]
  callout?: {
    type: 'warning' | 'info' | 'success'
    title: string
    text: string
  }
  sources: string[]
}

export interface ChecklistResponse {
  type: 'checklist'
  header: string
  intro: string
  items: ChecklistItem[]
  note?: string
  sources: string[]
}

export interface AlertResponse {
  type: 'alert'
  severity: 'warning' | 'error' | 'info'
  title: string
  message: string
  action?: string
  deadline?: string
  sources: string[]
}

export interface PlainTextResponse {
  type: 'plain'
  header?: string
  text: string
  sources?: string[]
}

export type ChatResponse =
  | StepsResponse
  | ChecklistResponse
  | AlertResponse
  | PlainTextResponse

export interface ChatMessage {
  id: string
  variant: 'ai' | 'user'
  content: string | ChatResponse
  timestamp: string
}

// Message types for ChatPanel component
export interface UserMessage {
  id: string
  variant: 'user'
  content: string
  timestamp: string
}

export interface AIMessage {
  id: string
  variant: 'ai'
  content: ChatResponse | { type: 'markdown'; text: string }
  sources?: string[]
  timestamp: string
}

export type Message = UserMessage | AIMessage