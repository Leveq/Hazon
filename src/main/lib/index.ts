// src/main/lib/index.ts
// Main process library exports

export { logger, setupErrorHandling } from './logger'
export { initSentry, captureException, captureMessage, setUser } from './sentry'
export { initAutoUpdater, checkForUpdates, getAppVersion } from './auto-updater'
export { exportToPDF } from './pdf-export'
export { parseFountain, exportToFountain, validateFountain } from './fountain'
