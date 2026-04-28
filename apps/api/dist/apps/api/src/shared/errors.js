"use strict";
// AppError: for expected business logic failures.
// Never use for infrastructure failures (DB unreachable, network errors).
// See constitution C13.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIFailureError = exports.AppError = void 0;
class AppError extends Error {
    code;
    statusCode;
    constructor(code, message, statusCode = 500) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = 'AppError';
    }
}
exports.AppError = AppError;
// AIFailureError: for Claude API failures.
// Caught INSIDE chat service, never reaches global handler (C13).
class AIFailureError extends Error {
    constructor(message) {
        super(message);
        this.name = 'AIFailureError';
    }
}
exports.AIFailureError = AIFailureError;
//# sourceMappingURL=errors.js.map