import pino from 'pino'
import { config } from './config.js'

// Single logger instance used across the entire API.
// Use logger.info/warn/error with structured context — never console.log.
export const logger = pino({
  level: config.nodeEnv === 'production' ? 'info' : 'debug',
  transport:
    config.nodeEnv !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
})
