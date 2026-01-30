// preload.ts - Bridge between Electron and React
import { contextBridge, ipcRenderer } from 'electron'
import type { 
  Script, 
  Character,
  Location,
  Note,
  CreateScriptInput,
  CreateCharacterInput,
  UpdateCharacterInput,
  CreateLocationInput,
  UpdateLocationInput,
  CreateNoteInput,
  UpdateNoteInput,
} from './src/types/models'

// API exposed to the renderer process
const api = {
  // ==================== SCRIPTS ====================
  scripts: {
    create: (data: CreateScriptInput): Promise<Script> => 
      ipcRenderer.invoke('script:create', data),
    get: (id: string): Promise<Script | null> => 
      ipcRenderer.invoke('script:get', id),
    getAll: (): Promise<Script[]> => 
      ipcRenderer.invoke('script:getAll'),
    update: (script: Script): Promise<Script | null> => 
      ipcRenderer.invoke('script:update', script),
    delete: (id: string): Promise<boolean> => 
      ipcRenderer.invoke('script:delete', id),
  },

  // ==================== CHARACTERS ====================
  characters: {
    create: (data: CreateCharacterInput): Promise<Character> => 
      ipcRenderer.invoke('character:create', data),
    get: (id: string): Promise<Character | null> => 
      ipcRenderer.invoke('character:get', id),
    getByScript: (scriptId: string): Promise<Character[]> => 
      ipcRenderer.invoke('character:getByScript', scriptId),
    update: (id: string, updates: UpdateCharacterInput): Promise<Character | null> => 
      ipcRenderer.invoke('character:update', id, updates),
    delete: (id: string): Promise<boolean> => 
      ipcRenderer.invoke('character:delete', id),
  },

  // ==================== LOCATIONS ====================
  locations: {
    create: (data: CreateLocationInput): Promise<Location> => 
      ipcRenderer.invoke('location:create', data),
    get: (id: string): Promise<Location | null> => 
      ipcRenderer.invoke('location:get', id),
    getByScript: (scriptId: string): Promise<Location[]> => 
      ipcRenderer.invoke('location:getByScript', scriptId),
    update: (id: string, updates: UpdateLocationInput): Promise<Location | null> => 
      ipcRenderer.invoke('location:update', id, updates),
    delete: (id: string): Promise<boolean> => 
      ipcRenderer.invoke('location:delete', id),
  },

  // ==================== NOTES ====================
  notes: {
    create: (data: CreateNoteInput): Promise<Note> => 
      ipcRenderer.invoke('note:create', data),
    get: (id: string): Promise<Note | null> => 
      ipcRenderer.invoke('note:get', id),
    getByScript: (scriptId: string): Promise<Note[]> => 
      ipcRenderer.invoke('note:getByScript', scriptId),
    update: (id: string, updates: UpdateNoteInput): Promise<Note | null> => 
      ipcRenderer.invoke('note:update', id, updates),
    delete: (id: string): Promise<boolean> => 
      ipcRenderer.invoke('note:delete', id),
  },

  // ==================== LEGACY API (backwards compatibility) ====================
  addScript: (data?: Partial<CreateScriptInput>): Promise<Script> => 
    ipcRenderer.invoke('add-script', data),
  getScript: (id: string): Promise<Script | null> => 
    ipcRenderer.invoke('get-script', id),
  updateScript: (script: Script): Promise<Script | null> => 
    ipcRenderer.invoke('update-script', script),
  getAllScripts: (): Promise<Script[]> => 
    ipcRenderer.invoke('get-all-scripts'),
}

contextBridge.exposeInMainWorld('api', api)

// Export type for use in renderer
export type ElectronAPI = typeof api
