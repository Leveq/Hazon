// src/main/main.ts
// Electron main process entry point

import 'dotenv/config'
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { setupDB } from './db'
import { registerIpcHandlers } from './ipc'
import { logger, setupErrorHandling, initSentry, initAutoUpdater, checkForUpdates } from './lib'

// Initialize Sentry early for crash reporting
initSentry()

// Set up error handling early
setupErrorHandling()

// Set app name before anything else uses userData path
app.setName('hazon')

// Check if running in development
// In packaged apps, always load from file. In dev, load from vite server if NODE_ENV is set.
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development'

logger.info('Starting Hazon...', { isDev, isPackaged: app.isPackaged, version: app.getVersion() })

// Register all IPC handlers
registerIpcHandlers()

// ==================== WINDOW CREATION ====================

async function createWindow() {
  logger.info('Creating main window...')
  
  try {
    await setupDB()
    logger.info('Database initialized')
  } catch (error) {
    logger.error('Failed to initialize database:', error)
    throw error
  }

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,  // CRITICAL for security
      nodeIntegration: false,  // CRITICAL for security
      sandbox: true,           // Additional security layer
    },
  })

  // Log renderer errors
  win.webContents.on('render-process-gone', (_event, details) => {
    logger.error('Renderer process crashed:', details)
  })

  win.webContents.on('unresponsive', () => {
    logger.warn('Window became unresponsive')
  })

  win.webContents.on('responsive', () => {
    logger.info('Window became responsive again')
  })

  if (isDev) {
    await win.loadURL('http://localhost:5173')
    logger.info('Loaded development server')
  } else {
    await win.loadFile(path.join(__dirname, 'index.html'))
    logger.info('Loaded production build')
  }
}

// ==================== APP LIFECYCLE ====================

app.whenReady().then(() => {
  logger.info('App ready')
  createWindow()
  
  // Initialize auto-updater after app is ready
  initAutoUpdater()
  
  // Check for updates after a short delay (don't block startup)
  setTimeout(() => {
    checkForUpdates().catch(err => {
      logger.warn('Initial update check failed:', err)
    })
  }, 3000)
})

app.on('window-all-closed', () => {
  logger.info('All windows closed')
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.on('before-quit', () => {
  logger.info('App quitting...')
})
