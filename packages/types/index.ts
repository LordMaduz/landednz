// Shared TypeScript types between mobile and API.
// All enums must match Prisma schema exactly.

// Onboarding dimensions: generated from apps/api/content/dimensions.yaml
import type { City, FamilySituation, Occupation, VisaType } from "@landednz/types/dimensions";
export * from "@landednz/types/dimensions";


export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "SKIPPED";
export type DependencyType = "HARD" | "SOFT";

// AppError shape — returned by all API error responses
export interface ApiError {
  error: string;       // error code — e.g. "INVALID_TOKEN"
  message: string;     // human-readable description
  statusCode: number;
}

// Response from POST /auth/verify
export interface AuthVerifyResponse {
  userId: string;
  email: string;
  isNewUser: boolean;
  hasProfile: boolean;
}
// POST /onboarding/preview (public) — the five onboarding answers
export interface OnboardingPreviewRequest {
  visaType: VisaType;
  city: City;
  familySituation: FamilySituation;
  occupation: Occupation;
  arrivalDate: string; // YYYY-MM-DD
}

// Response from POST /onboarding/preview — tasks ordered by task id
export interface OnboardingPreviewResponse {
  tasks: { taskId: string; name: string; estimatedDuration: string; phase: number }[];
}

// Settlement guide — one finished reply piece, sent as an SSE `part` event and stored in GuideMessage.parts
export type ReplyPart =
  | { type: 'notice'; kind: 'checking_guide' | 'checking_official' | 'official_unavailable' | 'interrupted' | 'truncated' }
  // one finished sentence; citations index into the reply's sources. block: answer shape for layout (none = prose); step: the step number
  | { type: 'text'; text: string; citations: number[]; block?: 'step' | 'limits' | 'crisis'; step?: number }
  | { type: 'source'; index: number; title: string; url: string; origin: 'guide' | 'official'; checkedAt: string }
  | { type: 'task_link'; taskKey: string; title: string }          // taskKey for routing only; UI renders the title
  | { type: 'unverified'; text: string }
  | { type: 'follow_up'; text: string }
  | { type: 'memory_saved'; memoryId: string; text: string }
  | { type: 'error'; code: 'AI_FAILURE'; retryable: boolean };
// Reserved for the agent feature: { type: 'action'; ... } with a confirm step.

export type GuideScreen = { kind: 'home' | 'roadmap' | 'task'; taskKey?: string };

export type GuideMessageStatus = 'streaming' | 'complete' | 'failed' | 'interrupted' | 'cancelled';

export type GuideSseEvent =
  | { event: 'start'; data: { userMessageId: string; assistantMessageId: string } }
  | { event: 'part'; data: ReplyPart }
  | { event: 'done'; data: { assistantMessageId: string; status: GuideMessageStatus } };

// 429 body of POST /guide/messages and retry; resetAt is the next midnight NZ time (ISO)
export type GuideCapError = { error: 'CHAT_DAILY_CAP_REACHED'; message: string; resetAt: string };

export type GuideMessageDto = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  parts: ReplyPart[] | null;
  status: GuideMessageStatus;
  screen: GuideScreen;
  createdAt: string;
};

export type GuideConversationPage = { messages: GuideMessageDto[]; nextBefore: string | null };

// leftToday: questions left before the daily cap (never below 0)
export type GuideOpeningResponse = { whereYouAre: string; starters: string[]; leftToday: number; dailyCap: number };

export type GuideMemoryDto = { id: string; text: string; createdAt: string; updatedAt: string };
