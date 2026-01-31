// src/shared/types/ipc.ts
// Type-safe IPC channel definitions

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
} from './models'

/**
 * IPC Channel definitions with request/response types
 * This ensures type safety between main and renderer processes
 */
export interface IpcChannels {
  // Script operations
  'script:create': { request: CreateScriptInput; response: Script }
  'script:get': { request: string; response: Script | null }
  'script:getAll': { request: void; response: Script[] }
  'script:update': { request: Script; response: Script | null }
  'script:delete': { request: string; response: boolean }

  // Character operations
  'character:create': { request: CreateCharacterInput; response: Character }
  'character:get': { request: string; response: Character | null }
  'character:getByScript': { request: string; response: Character[] }
  'character:update': { request: { id: string; updates: UpdateCharacterInput }; response: Character | null }
  'character:delete': { request: string; response: boolean }

  // Location operations
  'location:create': { request: CreateLocationInput; response: Location }
  'location:get': { request: string; response: Location | null }
  'location:getByScript': { request: string; response: Location[] }
  'location:update': { request: { id: string; updates: UpdateLocationInput }; response: Location | null }
  'location:delete': { request: string; response: boolean }

  // Note operations
  'note:create': { request: CreateNoteInput; response: Note }
  'note:get': { request: string; response: Note | null }
  'note:getByScript': { request: string; response: Note[] }
  'note:update': { request: { id: string; updates: UpdateNoteInput }; response: Note | null }
  'note:delete': { request: string; response: boolean }
}

/**
 * Type-safe IPC invoke helper type
 */
export type IpcInvoke = {
  [K in keyof IpcChannels]: (
    data: IpcChannels[K]['request']
  ) => Promise<IpcChannels[K]['response']>
}

/**
 * All valid IPC channel names
 */
export type IpcChannel = keyof IpcChannels
