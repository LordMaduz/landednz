// Typed API client for the LandedNZ Fastify backend.
// All fetch calls to NEXT_PUBLIC_API_URL live here — flat exported functions, no class.

import type { VisaType, City, FamilySituation, Occupation, ChatEntryPoint } from '@landednz/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL

// ─── Onboarding ───────────────────────────────────────────────────────────────

// Web-specific request type — mirrors API's CreateProfileRequest but cannot import
// from apps/api directly. Primitive types come from @landednz/types (CW04 compliant).
export interface SubmitProfilePayload {
  visaType: VisaType
  city: City
  familySituation: FamilySituation
  occupation: Occupation
  arrivalDate: string // ISO date, e.g. "2024-06-15"
}

export async function submitOnboardingProfile(
  payload: SubmitProfilePayload,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/onboarding/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  // 409 = profile already exists — treat as success so refreshes don't block the user
  if (!res.ok && res.status !== 409) {
    throw new Error(`Profile submission failed: ${res.status}`)
  }
}

// ─── Roadmap ──────────────────────────────────────────────────────────────────

// Web-specific API response types — mirrors API's RoadmapResponse but cannot import
// from apps/api directly. Primitive types come from @landednz/types (CW04 compliant).
export interface RoadmapApiTask {
  taskId: string
  name: string
  phase: number
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE'
  isBlocked: boolean
  blockingTaskNames: string[]
  estimatedDuration: string
  taskType: 'FREE' | 'PREMIUM'
  consequenceLine: string
  priorityScore: number
}

export interface RoadmapApiResponse {
  topThree: RoadmapApiTask[]
  phases: { phase: number; tasks: RoadmapApiTask[] }[]
  lastComputedAt: string
}

export async function getRoadmap(token: string): Promise<RoadmapApiResponse> {
  const res = await fetch(`${API_URL}/roadmap`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw Object.assign(new Error('Roadmap fetch failed'), { status: res.status })
  }

  return res.json()
}

// ─── Task Detail ─────────────────────────────────────────────────────────────

// Mirrors backend TaskDetailResponse from apps/api/src/features/roadmap/roadmap.types.ts
export interface TaskDetailApiResponse {
  taskId: string;
  name: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETE';
  isBlocked: boolean;
  estimatedDuration: string;
  processingTime: string | null;
  governmentSourceUrl: string;
  taskType: 'FREE' | 'PREMIUM';
  consequenceLine: string;
  steps: string[];
  documentsRequired: string[];
  commonMistakes: string[];
  watchOuts: string[];
  cost: string | null;
  relatedTasks: { taskId: string; name: string; relationship: string }[];
  professionalAdviceRequired: boolean;
  professionalAdviceNote: string | null;
}

export async function getTaskDetail(taskId: string, token: string): Promise<TaskDetailApiResponse> {
  const res = await fetch(`${API_URL}/roadmap/tasks/${taskId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw Object.assign(new Error('Task detail fetch failed'), { status: res.status })
  }

  return res.json()
}

export async function completeTask(taskId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/roadmap/tasks/${taskId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Complete task failed: ${res.status}`)
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

// Mirrors backend CreateSessionResponse from apps/api/src/features/chat/chat.types.ts
export interface CreateChatSessionResponse {
  sessionId: string
  openingMessage: string
}

export async function createChatSession(
  entryPoint: ChatEntryPoint,
  token: string,
  taskContext?: string,
): Promise<CreateChatSessionResponse> {
  const res = await fetch(`${API_URL}/chat/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ entryPoint, taskContext }),
  })
  if (!res.ok) throw Object.assign(new Error('Chat session creation failed'), { status: res.status })
  return res.json()
}

// SSE streaming — must use fetch + ReadableStream, NOT EventSource (no auth header support).
// Calls onChunk for each text token, onDone when stream ends, onError on failure.
export async function streamChat(
  sessionId: string,
  content: string,
  token: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (message: string) => void,
  onStructured?: (structuredJson: string) => void,
): Promise<void> {
  const res = await fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ content }),
  })

  if (!res.ok || !res.body) {
    onError('Failed to connect to chat service')
    return
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const event = JSON.parse(line.slice(6))
          if (event.type === 'chunk') onChunk(event.text)
          else if (event.type === 'structured') {
            if (onStructured) onStructured(event.content)
          }
          else if (event.type === 'done') { onDone(); return }
          else if (event.type === 'error') { onError(event.message); return }
        } catch { /* skip malformed SSE lines */ }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Stream failed')
  }
}
