// src/main/lib/sentry.ts
// Sentry crash reporting for Electron

import * as Sentry from '@sentry/electron/main'
import { app } from 'electron'

const isDev = process.env.NODE_ENV === 'development'

/**
 * Initialize Sentry for crash reporting
 * Only enabled in production unless SENTRY_DSN is explicitly set
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN

  // Skip Sentry in development unless DSN is explicitly set
  if (isDev && !dsn) {
    console.log('[Sentry] Skipping initialization in development mode')
    return
  }

  if (!dsn) {
    console.warn('[Sentry] No SENTRY_DSN configured, crash reporting disabled')
    return
  }

  Sentry.init({
    dsn,
    environment: isDev ? 'development' : 'production',
    release: `hazon@${app.getVersion()}`,
    
    // Performance monitoring (optional)
    tracesSampleRate: isDev ? 1.0 : 0.2,
    
    // Filter out development errors
    beforeSend(event) {
      // Don't send events in development
      if (isDev) {
        console.log('[Sentry] Would send event:', event.message)
        return null
      }
      return event
    },
  })

  console.log('[Sentry] Initialized crash reporting')
}

/**
 * Capture an exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.setContext('additional', context)
  }
  Sentry.captureException(error)
}

/**
 * Capture a message
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
  Sentry.captureMessage(message, level)
}

/**
 * Set user context for error reports
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  Sentry.setUser(user)
}

export { Sentry }
