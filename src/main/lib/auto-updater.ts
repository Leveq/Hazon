// src/main/lib/auto-updater.ts
// Auto-update functionality using electron-updater

import { autoUpdater, UpdateInfo } from 'electron-updater'
import { BrowserWindow, dialog, app } from 'electron'
import { logger } from './logger'

const log = logger.withContext('AutoUpdater')

interface UpdaterCallbacks {
  onUpdateAvailable?: (info: UpdateInfo) => void
  onUpdateDownloaded?: (info: UpdateInfo) => void
  onError?: (error: Error) => void
}

let initialized = false

/**
 * Initialize the auto-updater
 */
export function initAutoUpdater(callbacks: UpdaterCallbacks = {}): void {
  if (initialized) {
    log.warn('Auto-updater already initialized')
    return
  }

  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    log.info('Auto-updater disabled in development mode')
    return
  }

  // Configure auto-updater
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  
  // Set up event handlers
  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...')
  })

  autoUpdater.on('update-available', async (info: UpdateInfo) => {
    log.info('Update available:', info)
    
    callbacks.onUpdateAvailable?.(info)

    // Show dialog to user
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      const result = await dialog.showMessageBox(win, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available.`,
        detail: 'Would you like to download it now?',
        buttons: ['Download', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })

      if (result.response === 0) {
        log.info('User chose to download update')
        autoUpdater.downloadUpdate()
      } else {
        log.info('User postponed update')
      }
    }
  })

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    log.info('No updates available:', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    log.debug('Download progress:', {
      percent: progress.percent,
      transferred: progress.transferred,
      total: progress.total,
    })
  })

  autoUpdater.on('update-downloaded', async (info: UpdateInfo) => {
    log.info('Update downloaded:', info)
    
    callbacks.onUpdateDownloaded?.(info)

    // Show dialog to user
    const win = BrowserWindow.getFocusedWindow()
    if (win) {
      const result = await dialog.showMessageBox(win, {
        type: 'info',
        title: 'Update Ready',
        message: `Version ${info.version} has been downloaded.`,
        detail: 'The update will be installed when you restart the app. Would you like to restart now?',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0,
        cancelId: 1,
      })

      if (result.response === 0) {
        log.info('User chose to restart and install')
        autoUpdater.quitAndInstall()
      } else {
        log.info('User postponed restart')
      }
    }
  })

  autoUpdater.on('error', (error: Error) => {
    log.error('Auto-updater error:', error)
    callbacks.onError?.(error)
  })

  initialized = true
  log.info('Auto-updater initialized')
}

/**
 * Check for updates manually
 */
export async function checkForUpdates(): Promise<void> {
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    log.info('Update check skipped in development')
    return
  }

  try {
    log.info('Manually checking for updates...')
    await autoUpdater.checkForUpdates()
  } catch (error) {
    log.error('Failed to check for updates:', error)
    throw error
  }
}

/**
 * Get the current app version
 */
export function getAppVersion(): string {
  return app.getVersion()
}

export default { initAutoUpdater, checkForUpdates, getAppVersion }
