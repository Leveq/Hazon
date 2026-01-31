// src/main/ipc/handlers.ts
// IPC handlers for main process

import { ipcMain, dialog, BrowserWindow } from 'electron'
import * as fs from 'fs/promises'
import {
  // Scripts
  addScript,
  getScript,
  getAllScripts,
  updateScript,
  deleteScript,
  // Characters
  addCharacter,
  getCharacter,
  getCharactersByScript,
  updateCharacter,
  deleteCharacter,
  // Locations
  addLocation,
  getLocation,
  getLocationsByScript,
  updateLocation,
  deleteLocation,
  // Notes
  addNote,
  getNote,
  getNotesByScript,
  updateNote,
  deleteNote,
} from '../db'
import { logger } from '../lib'
import { exportToPDF } from '../lib/pdf-export'
import { parseFountain, exportToFountain } from '../lib/fountain'
import type {
  Script,
  CreateScriptInput,
  UpdateCharacterInput,
  UpdateLocationInput,
  UpdateNoteInput,
} from '../../shared/types'

const log = logger.withContext('IPC')

/**
 * Wrapper to add error handling to IPC handlers
 */
function handleIpc<T, R>(
  channel: string,
  handler: (data: T) => Promise<R>
): (event: Electron.IpcMainInvokeEvent, data: T) => Promise<R> {
  return async (_evt, data) => {
    try {
      log.debug(`${channel} called`, data ? { data } : undefined)
      const result = await handler(data)
      return result
    } catch (error) {
      log.error(`${channel} failed:`, error)
      throw error
    }
  }
}

/**
 * Register all IPC handlers for the main process
 */
export function registerIpcHandlers(): void {
  log.info('Registering IPC handlers...')

  // ==================== SCRIPT IPC HANDLERS ====================

  ipcMain.handle('script:create', handleIpc('script:create', addScript))

  ipcMain.handle('script:get', handleIpc('script:get', getScript))

  ipcMain.handle('script:getAll', handleIpc('script:getAll', getAllScripts))

  ipcMain.handle('script:update', handleIpc('script:update', async (script: Script) => {
    const { id, ...updates } = script
    return updateScript(id, updates)
  }))

  ipcMain.handle('script:delete', handleIpc('script:delete', deleteScript))

  // ==================== CHARACTER IPC HANDLERS ====================

  ipcMain.handle('character:create', handleIpc('character:create', addCharacter))

  ipcMain.handle('character:get', handleIpc('character:get', getCharacter))

  ipcMain.handle('character:getByScript', handleIpc('character:getByScript', getCharactersByScript))

  ipcMain.handle('character:update', async (_evt, id: string, updates: UpdateCharacterInput) => {
    try {
      log.debug('character:update called', { id, updates })
      return await updateCharacter(id, updates)
    } catch (error) {
      log.error('character:update failed:', error)
      throw error
    }
  })

  ipcMain.handle('character:delete', handleIpc('character:delete', deleteCharacter))

  // ==================== LOCATION IPC HANDLERS ====================

  ipcMain.handle('location:create', handleIpc('location:create', addLocation))

  ipcMain.handle('location:get', handleIpc('location:get', getLocation))

  ipcMain.handle('location:getByScript', handleIpc('location:getByScript', getLocationsByScript))

  ipcMain.handle('location:update', async (_evt, id: string, updates: UpdateLocationInput) => {
    try {
      log.debug('location:update called', { id, updates })
      return await updateLocation(id, updates)
    } catch (error) {
      log.error('location:update failed:', error)
      throw error
    }
  })

  ipcMain.handle('location:delete', handleIpc('location:delete', deleteLocation))

  // ==================== NOTE IPC HANDLERS ====================

  ipcMain.handle('note:create', handleIpc('note:create', addNote))

  ipcMain.handle('note:get', handleIpc('note:get', getNote))

  ipcMain.handle('note:getByScript', handleIpc('note:getByScript', getNotesByScript))

  ipcMain.handle('note:update', async (_evt, id: string, updates: UpdateNoteInput) => {
    try {
      log.debug('note:update called', { id, updates })
      return await updateNote(id, updates)
    } catch (error) {
      log.error('note:update failed:', error)
      throw error
    }
  })

  ipcMain.handle('note:delete', handleIpc('note:delete', deleteNote))

  // ==================== EXPORT/IMPORT HANDLERS ====================

  ipcMain.handle('export:pdf', async (_evt, scriptId: string) => {
    try {
      log.info('export:pdf called', { scriptId })
      
      const script = await getScript(scriptId)
      if (!script) {
        throw new Error(`Script not found: ${scriptId}`)
      }

      const win = BrowserWindow.getFocusedWindow()
      const result = await dialog.showSaveDialog(win!, {
        title: 'Export PDF',
        defaultPath: `${script.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
      })

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true }
      }

      await exportToPDF(script, result.filePath)
      log.info('PDF exported successfully', { path: result.filePath })
      return { success: true, filePath: result.filePath }
    } catch (error) {
      log.error('export:pdf failed:', error)
      throw error
    }
  })

  ipcMain.handle('export:fountain', async (_evt, scriptId: string) => {
    try {
      log.info('export:fountain called', { scriptId })
      
      const script = await getScript(scriptId)
      if (!script) {
        throw new Error(`Script not found: ${scriptId}`)
      }

      const win = BrowserWindow.getFocusedWindow()
      const result = await dialog.showSaveDialog(win!, {
        title: 'Export Fountain',
        defaultPath: `${script.title.replace(/[^a-zA-Z0-9]/g, '_')}.fountain`,
        filters: [{ name: 'Fountain Files', extensions: ['fountain'] }],
      })

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true }
      }

      const fountainText = exportToFountain(script)
      await fs.writeFile(result.filePath, fountainText, 'utf-8')
      
      log.info('Fountain exported successfully', { path: result.filePath })
      return { success: true, filePath: result.filePath }
    } catch (error) {
      log.error('export:fountain failed:', error)
      throw error
    }
  })

  ipcMain.handle('import:fountain', async () => {
    try {
      log.info('import:fountain called')
      
      const win = BrowserWindow.getFocusedWindow()
      const result = await dialog.showOpenDialog(win!, {
        title: 'Import Fountain',
        filters: [
          { name: 'Fountain Files', extensions: ['fountain'] },
          { name: 'Text Files', extensions: ['txt'] },
        ],
        properties: ['openFile'],
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true }
      }

      const filePath = result.filePaths[0]
      const fountainText = await fs.readFile(filePath, 'utf-8')
      
      const { script: scriptData, lines } = parseFountain(fountainText)
      
      // Create the script with the parsed lines
      const script = await addScript({
        ...scriptData,
        lines,
      })
      
      log.info('Fountain imported successfully', { 
        path: filePath, 
        scriptId: script.id,
        lineCount: lines.length 
      })
      
      return { success: true, script }
    } catch (error) {
      log.error('import:fountain failed:', error)
      throw error
    }
  })

  // ==================== LEGACY HANDLERS (for backwards compatibility) ====================

  ipcMain.handle('add-script', async (_evt, data?: CreateScriptInput) => {
    return addScript(data || { title: 'Untitled', description: '' })
  })

  ipcMain.handle('get-script', async (_evt, id: string) => {
    return getScript(id)
  })

  ipcMain.handle('update-script', async (_evt, script: Script) => {
    const { id, ...updates } = script
    return updateScript(id, updates)
  })

  ipcMain.handle('get-all-scripts', async () => {
    return getAllScripts()
  })
}
