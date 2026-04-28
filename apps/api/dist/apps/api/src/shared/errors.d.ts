export type ErrorCode = 'TASK_NOT_FOUND' | 'PROFILE_NOT_FOUND' | 'ROADMAP_NOT_FOUND' | 'PREMIUM_REQUIRED' | 'INVALID_TOKEN' | 'UNAUTHORIZED' | 'VALIDATION_ERROR' | 'PROFILE_EXISTS' | 'TASK_ALREADY_COMPLETE' | 'INTERNAL_ERROR' | 'USER_NOT_FOUND' | 'SUBSCRIPTION_REQUIRED' | 'AI_FAILURE' | 'SESSION_NOT_FOUND' | 'SESSION_ACCESS_DENIED';
export declare class AppError extends Error {
    readonly code: ErrorCode;
    readonly statusCode: number;
    constructor(code: ErrorCode, message: string, statusCode?: number);
}
export declare class AIFailureError extends Error {
    constructor(message: string);
}
//# sourceMappingURL=errors.d.ts.map