// AppError: for expected business logic failures.
// Never use for infrastructure failures (DB unreachable, network errors).
// See constitution C13.

export type ErrorCode =
  | 'TASK_NOT_FOUND'
  | 'PROFILE_NOT_FOUND'
  | 'ROADMAP_NOT_FOUND'
  | 'PREMIUM_REQUIRED'
  | 'INVALID_TOKEN'
  | 'UNAUTHORIZED'
  | 'VALIDATION_ERROR'
  | 'PROFILE_EXISTS'
  | 'TASK_ALREADY_COMPLETE'
  | 'INTERNAL_ERROR'
  | 'USER_NOT_FOUND'
  | 'SUBSCRIPTION_REQUIRED'
  | 'AI_FAILURE'
  | 'SESSION_NOT_FOUND'
  | 'SESSION_ACCESS_DENIED'

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// AIFailureError: for Claude API failures.
// Caught INSIDE chat service, never reaches global handler (C13).
export class AIFailureError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AIFailureError'
  }
}
