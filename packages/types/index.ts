// Shared TypeScript types between mobile and API.
// All enums must match Prisma schema exactly.

// Onboarding dimensions: generated from apps/api/content/dimensions.yaml
import type { City, FamilySituation, Occupation, VisaType } from "@landednz/types/dimensions";
export * from "@landednz/types/dimensions";


export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "SKIPPED";
export type DependencyType = "HARD" | "SOFT";
export type ChatEntryPoint = "TASK_CARD" | "ROADMAP" | "EMAIL_DEEPLINK" | "NAVIGATION";

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
