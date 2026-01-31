// src/renderer/types/global.d.ts
// Global type declarations for the renderer process

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
} from '../../shared/types'

declare global {
  interface Window {
    api: {
      // Modern API
      scripts: {
        create: (data: CreateScriptInput) => Promise<Script>
        get: (id: string) => Promise<Script | null>
        getAll: () => Promise<Script[]>
        update: (script: Script) => Promise<Script | null>
        delete: (id: string) => Promise<boolean>
      }
      characters: {
        create: (data: CreateCharacterInput) => Promise<Character>
        get: (id: string) => Promise<Character | null>
        getByScript: (scriptId: string) => Promise<Character[]>
        update: (id: string, updates: UpdateCharacterInput) => Promise<Character | null>
        delete: (id: string) => Promise<boolean>
      }
      locations: {
        create: (data: CreateLocationInput) => Promise<Location>
        get: (id: string) => Promise<Location | null>
        getByScript: (scriptId: string) => Promise<Location[]>
        update: (id: string, updates: UpdateLocationInput) => Promise<Location | null>
        delete: (id: string) => Promise<boolean>
      }
      notes: {
        create: (data: CreateNoteInput) => Promise<Note>
        get: (id: string) => Promise<Note | null>
        getByScript: (scriptId: string) => Promise<Note[]>
        update: (id: string, updates: UpdateNoteInput) => Promise<Note | null>
        delete: (id: string) => Promise<boolean>
      }
      // Export/Import API
      export: {
        pdf: (scriptId: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>
        fountain: (scriptId: string) => Promise<{ success: boolean; filePath?: string; canceled?: boolean }>
      }
      import: {
        fountain: () => Promise<{ success: boolean; script?: Script; canceled?: boolean }>
      }
      // Legacy API (backwards compatibility)
      addScript: (data?: Partial<CreateScriptInput>) => Promise<Script>
      getScript: (id: string) => Promise<Script | null>
      updateScript: (script: Script) => Promise<Script | null>
      getAllScripts: () => Promise<Script[]>
    }
  }
}

export {}
