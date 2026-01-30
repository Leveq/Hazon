// main.ts - Electron main process
import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

// Set app name before anything else uses userData path
app.setName('hazon')

import { 
  setupDB, 
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
} from './db.js'
import type { 
  Script, 
  CreateScriptInput,
  CreateCharacterInput,
  UpdateCharacterInput,
  CreateLocationInput,
  UpdateLocationInput,
  CreateNoteInput,
  UpdateNoteInput,
} from './src/types/models'

const isDev = process.env.NODE_ENV === 'development'

// ==================== SCRIPT IPC HANDLERS ====================

ipcMain.handle('script:create', async (_evt, data: CreateScriptInput) => {
  return addScript(data)
})

ipcMain.handle('script:get', async (_evt, id: string) => {
  return getScript(id)
})

ipcMain.handle('script:getAll', async () => {
  return getAllScripts()
})

ipcMain.handle('script:update', async (_evt, script: Script) => {
  const { id, ...updates } = script
  return updateScript(id, updates)
})

ipcMain.handle('script:delete', async (_evt, id: string) => {
  return deleteScript(id)
})

// ==================== CHARACTER IPC HANDLERS ====================

ipcMain.handle('character:create', async (_evt, data: CreateCharacterInput) => {
  return addCharacter(data)
})

ipcMain.handle('character:get', async (_evt, id: string) => {
  return getCharacter(id)
})

ipcMain.handle('character:getByScript', async (_evt, scriptId: string) => {
  return getCharactersByScript(scriptId)
})

ipcMain.handle('character:update', async (_evt, id: string, updates: UpdateCharacterInput) => {
  return updateCharacter(id, updates)
})

ipcMain.handle('character:delete', async (_evt, id: string) => {
  return deleteCharacter(id)
})

// ==================== LOCATION IPC HANDLERS ====================

ipcMain.handle('location:create', async (_evt, data: CreateLocationInput) => {
  return addLocation(data)
})

ipcMain.handle('location:get', async (_evt, id: string) => {
  return getLocation(id)
})

ipcMain.handle('location:getByScript', async (_evt, scriptId: string) => {
  return getLocationsByScript(scriptId)
})

ipcMain.handle('location:update', async (_evt, id: string, updates: UpdateLocationInput) => {
  return updateLocation(id, updates)
})

ipcMain.handle('location:delete', async (_evt, id: string) => {
  return deleteLocation(id)
})

// ==================== NOTE IPC HANDLERS ====================

ipcMain.handle('note:create', async (_evt, data: CreateNoteInput) => {
  return addNote(data)
})

ipcMain.handle('note:get', async (_evt, id: string) => {
  return getNote(id)
})

ipcMain.handle('note:getByScript', async (_evt, scriptId: string) => {
  return getNotesByScript(scriptId)
})

ipcMain.handle('note:update', async (_evt, id: string, updates: UpdateNoteInput) => {
  return updateNote(id, updates)
})

ipcMain.handle('note:delete', async (_evt, id: string) => {
  return deleteNote(id)
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

// ==================== WINDOW CREATION ====================

async function createWindow() {
  await setupDB()

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    await win.loadURL('http://localhost:5173')
  } else {
    await win.loadFile(path.join(__dirname, 'index.html'))
  }
}

app.whenReady().then(createWindow)
