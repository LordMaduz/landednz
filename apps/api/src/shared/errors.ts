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
  | 'INTERNAL_ERROR'

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
