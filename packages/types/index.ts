// Shared TypeScript types between mobile and API.
// All enums must match Prisma schema exactly.

export type VisaType =
  | "AEWV"
  | "PARTNER_OF_STUDENT"
  | "GREEN_LIST_WORK"
  | "GREEN_LIST_RESIDENCE"
  | "OTHER";

export type City = "AUCKLAND" | "WELLINGTON" | "CHRISTCHURCH" | "OTHER";

export type FamilySituation =
  | "SOLO"
  | "COUPLE_DUAL_WORK"
  | "COUPLE_CONSTRAINED"
  | "FAMILY_WITH_CHILDREN";

export type Occupation =
  | "TECHNOLOGY"
  | "HEALTHCARE"
  | "EDUCATION"
  | "FINANCE"
  | "TRADES"
  | "OTHER_PROFESSIONAL"
  | "SEEKING_WORK";

export type ArrivalTiming =
  | "PRE_ARRIVAL"
  | "RECENT"
  | "WEEKS_TWO_TO_EIGHT"
  | "OVER_TWO_MONTHS";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "SKIPPED";
export type DependencyType = "HARD" | "SOFT";
export type PersonaKey = "constrained_couple" | "solo_aewv" | "family_with_children";
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