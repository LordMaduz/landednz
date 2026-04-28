"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const config_1 = require("./config");
// Single logger instance used across the entire API.
// Use logger.info/warn/error with structured context — never console.log.
exports.logger = (0, pino_1.default)({
    level: config_1.config.nodeEnv === 'production' ? 'info' : 'debug',
    transport: config_1.config.nodeEnv !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
});
//# sourceMappingURL=logger.js.map