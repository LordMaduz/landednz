// Typed API client for the LandedNZ Fastify backend.
// All fetch calls to NEXT_PUBLIC_API_URL live here — flat exported functions, no class.

import type {
  VisaType, City, FamilySituation, Occupation, OnboardingPreviewRequest, OnboardingPreviewResponse,
  GuideScreen, GuideSseEvent, GuideConversationPage, GuideMessageDto, GuideOpeningResponse, GuideMemoryDto,
} from '@landednz/types'

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

export interface SubmitProfileResult {
  success: boolean
  message?: string
  isExisting?: boolean
}

export interface GetProfileResponse {
  profileId: string
  visaType: VisaType
  city: City
  familySituation: FamilySituation
  occupation: Occupation
  arrivalDate: string // ISO date
}

// Public: the roadmap the five answers would produce, before sign-up
export async function getRoadmapPreview(answers: OnboardingPreviewRequest): Promise<OnboardingPreviewResponse> {
  const res = await fetch(`${API_URL}/onboarding/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  })
  if (!res.ok) {
    throw Object.assign(new Error('Roadmap preview failed'), { status: res.status })
  }
  return res.json()
}

export async function submitOnboardingProfile(
  payload: SubmitProfilePayload,
  token: string,
): Promise<SubmitProfileResult> {
  const res = await fetch(`${API_URL}/onboarding/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    return { success: true }
  }

  if (res.status === 409) {
    // Profile exists - return specific info
    return {
      success: false,
      isExisting: true,
      message: 'You already have a settlement plan. Redirecting to your existing roadmap...'
    }
  }

  throw new Error(`Profile submission failed: ${res.status}`)
}

export async function updateOnboardingProfile(
  payload: SubmitProfilePayload,
  token: string,
): Promise<SubmitProfileResult> {
  const res = await fetch(`${API_URL}/onboarding/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Request-Source': 'settings-page', // Simple restriction check
    },
    body: JSON.stringify(payload),
  })

  if (res.ok) {
    return { success: true }
  }

  if (res.status === 404) {
    return {
      success: false,
      message: 'No profile found. Please complete onboarding first.'
    }
  }

  if (res.status === 403) {
    return {
      success: false,
      message: 'Profile updates are only allowed from the settings page.'
    }
  }

  throw new Error(`Profile update failed: ${res.status}`)
}

export async function getOnboardingProfile(token: string): Promise<GetProfileResponse> {
  const res = await fetch(`${API_URL}/onboarding/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    throw Object.assign(new Error('Profile fetch failed'), { status: res.status })
  }

  return res.json()
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
  blockingTaskIds: string[]
  completedAt: string | null
  estimatedDuration: string
  taskType: 'FREE' | 'PREMIUM'
  consequenceLine: string
  bestBy: string | null
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
  lastVerified: string | null;
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
  contentVersion?: string;
  sources?: Record<string, { itemId: string; title: string; url: string; checked: string }[]>;
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

export async function reopenTask(taskId: string, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/roadmap/tasks/${taskId}/reopen`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`Reopen task failed: ${res.status}`)
}

// ─── Account ─────────────────────────────────────────────────────────────────

export async function deleteAccount(token: string): Promise<void> {
  const res = await fetch(`${API_URL}/account`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw Object.assign(new Error(`Delete account failed: ${res.status}`), { status: res.status })
}

// ─── User Profile ────────────────────────────────────────────────────────────

// Since there's no GET profile endpoint, we get basic user data from Supabase session
// For onboarding answers, we'll need to either add a backend GET endpoint or handle differently
export interface UserProfile {
  id: string
  email: string
  name?: string
  provider: string
}

// ─── Settlement guide ────────────────────────────────────────────────────────

export type GuideRequestError = Error & ({ kind: 'cap'; resetAt: string } | { kind: 'busy' } | { kind: 'failed'; status: number })

const guideError = (info: { kind: 'cap'; resetAt: string } | { kind: 'busy' } | { kind: 'failed'; status: number }): GuideRequestError =>
  Object.assign(new Error(`Guide request ${info.kind}`), info)

async function guideJson<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...(init.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw guideError({ kind: 'failed', status: res.status })
  return res.status === 204 ? (undefined as T) : res.json()
}

// SSE frames are `event: <name>\ndata: <json>\n\n`; a frame may span chunks
async function readSse(res: Response, onEvent: (e: GuideSseEvent) => void): Promise<void> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) return
    buffer += decoder.decode(value, { stream: true })
    const frames = buffer.split('\n\n')
    buffer = frames.pop() ?? ''
    for (const frame of frames) {
      const event = frame.match(/^event: (.*)$/m)?.[1]
      const data = frame.match(/^data: (.*)$/m)?.[1]
      if (event && data) onEvent({ event, data: JSON.parse(data) } as GuideSseEvent)
    }
  }
}

// SSE via fetch + ReadableStream (EventSource cannot send Authorization). Aborting through `signal` ends quietly.
async function streamGuide(path: string, body: unknown, token: string, onEvent: (e: GuideSseEvent) => void, signal: AbortSignal): Promise<void> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    })
    if (res.status === 429) {
      const cap = await res.json().catch(() => null) as { error?: string; resetAt?: string } | null
      // a per-minute rate limit is also a 429; only the daily cap carries this code
      if (cap?.error === 'CHAT_DAILY_CAP_REACHED') throw guideError({ kind: 'cap', resetAt: cap.resetAt ?? '' })
      throw guideError({ kind: 'failed', status: 429 })
    }
    if (res.status === 409) throw guideError({ kind: 'busy' })
    if (!res.ok || !res.body) throw guideError({ kind: 'failed', status: res.status })
    await readSse(res, onEvent)
  } catch (error) {
    if (signal.aborted) return
    throw error instanceof Error && 'kind' in error ? error : guideError({ kind: 'failed', status: 0 })
  }
}

export function askGuide(
  body: { text: string; screen: GuideScreen },
  token: string,
  onEvent: (e: GuideSseEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  return streamGuide('/guide/messages', body, token, onEvent, signal)
}

export function retryGuide(assistantId: string, token: string, onEvent: (e: GuideSseEvent) => void, signal: AbortSignal): Promise<void> {
  return streamGuide(`/guide/messages/${assistantId}/retry`, null, token, onEvent, signal)
}

export function cancelGuide(assistantId: string, token: string): Promise<void> {
  return guideJson(`/guide/messages/${assistantId}/cancel`, token, { method: 'POST' })
}

export function getGuideConversation(token: string, before?: string): Promise<GuideConversationPage> {
  return guideJson(`/guide/conversation${before ? `?before=${encodeURIComponent(before)}` : ''}`, token)
}

export function getGuideTaskMessages(taskKey: string, token: string): Promise<GuideMessageDto[]> {
  return guideJson(`/guide/conversation/task/${encodeURIComponent(taskKey)}`, token)
}

export function getGuideOpening(screen: GuideScreen, token: string): Promise<GuideOpeningResponse> {
  const q = new URLSearchParams({ screen: screen.kind, ...(screen.taskKey ? { taskKey: screen.taskKey } : {}) })
  return guideJson(`/guide/opening?${q}`, token)
}

export function listMemories(token: string): Promise<GuideMemoryDto[]> {
  return guideJson('/guide/memories', token)
}

export function updateMemory(id: string, text: string, token: string): Promise<GuideMemoryDto> {
  return guideJson(`/guide/memories/${id}`, token, { method: 'PATCH', body: JSON.stringify({ text }) })
}

export function deleteMemory(id: string, token: string): Promise<void> {
  return guideJson(`/guide/memories/${id}`, token, { method: 'DELETE' })
}
