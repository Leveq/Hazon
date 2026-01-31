// src/main/lib/logger.ts
// Centralized logging for the main process

import log from 'electron-log'
import { app } from 'electron'
import path from 'path'

// Configure log file location
log.transports.file.resolvePathFn = () => 
  path.join(app.getPath('userData'), 'logs', 'main.log')

// Configure log format
log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}'
log.transports.console.format = '[{h}:{i}:{s}] [{level}] {text}'

// Set log level based on environment
const isDev = process.env.NODE_ENV === 'development'
log.transports.file.level = isDev ? 'debug' : 'info'
log.transports.console.level = isDev ? 'debug' : 'warn'

// Maximum log file size (5MB)
log.transports.file.maxSize = 5 * 1024 * 1024

// Export configured logger
export const logger = {
  debug: (message: string, ...args: unknown[]) => log.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => log.info(message, ...args),
  warn: (message: string, ...args: unknown[]) => log.warn(message, ...args),
  error: (message: string, ...args: unknown[]) => log.error(message, ...args),
  
  // Log with context (useful for tracking operations)
  withContext: (context: string) => ({
    debug: (message: string, ...args: unknown[]) => log.debug(`[${context}] ${message}`, ...args),
    info: (message: string, ...args: unknown[]) => log.info(`[${context}] ${message}`, ...args),
    warn: (message: string, ...args: unknown[]) => log.warn(`[${context}] ${message}`, ...args),
    error: (message: string, ...args: unknown[]) => log.error(`[${context}] ${message}`, ...args),
  }),
}

// Catch unhandled errors
export function setupErrorHandling(): void {
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error)
  })

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection:', reason)
  })
}

export default logger
