// src/main/db.ts
// Database layer using LowDB for local JSON storage

import { JSONFile } from 'lowdb/node'
import { Low } from 'lowdb'
import { randomUUID } from 'crypto'
import { app } from 'electron'
import path from 'path'
import type { 
  Script, 
  Character, 
  Location, 
  Note, 
  Line,
  DBData,
  CreateScriptInput,
  UpdateScriptInput,
  CreateCharacterInput,
  UpdateCharacterInput,
  CreateLocationInput,
  UpdateLocationInput,
  CreateNoteInput,
  UpdateNoteInput,
} from '../shared/types'

// Lazy initialization to ensure app.setName() has been called first
let db: Low<DBData> | null = null
const defaultData: DBData = { scripts: [], characters: [], locations: [], notes: [] }

function getDb(): Low<DBData> {
  if (!db) {
    const dbPath = path.join(app.getPath('userData'), 'data.json')
    const adapter = new JSONFile<DBData>(dbPath)
    db = new Low<DBData>(adapter, defaultData)
  }
  return db
}

/**
 * Ensure the file is loaded and has all required arrays
 */
export async function setupDB() {
  const database = getDb()
  await database.read()
  database.data ||= { scripts: [], characters: [], locations: [], notes: [] }
  // Ensure all arrays exist (for backwards compatibility)
  database.data.scripts ||= []
  database.data.characters ||= []
  database.data.locations ||= []
  database.data.notes ||= []
  return database
}

// ==================== SCRIPTS ====================

export async function addScript(data: CreateScriptInput): Promise<Script> {
  const database = await setupDB()
  const now = new Date().toISOString()

  const initialLines: Line[] = [
    {
      id: randomUUID(),
      text: '',
      type: 'scene',
    },
  ]

  const newScript: Script = {
    id: randomUUID(),
    title: data.title || 'Untitled',
    description: data.description || '',
    logline: data.logline,
    genre: data.genre,
    author: data.author,
    tags: data.tags || [],
    userId: 'local-user',
    createdAt: now,
    updatedAt: now,
    sceneOrder: [],
    lines: initialLines,
    characterIds: [],
    locationIds: [],
  }

  database.data!.scripts.push(newScript)
  await database.write()
  return newScript
}

export async function getScript(id: string): Promise<Script | null> {
  const database = await setupDB()
  return database.data!.scripts.find((s) => s.id === id) ?? null
}

export async function getAllScripts(): Promise<Script[]> {
  const database = await setupDB()
  return database.data!.scripts
}

export async function updateScript(id: string, updates: UpdateScriptInput): Promise<Script | null> {
  const database = await setupDB()
  const script = database.data!.scripts.find((s) => s.id === id)
  if (!script) return null

  Object.assign(script, updates, {
    updatedAt: new Date().toISOString(),
  })

  await database.write()
  return script
}

export async function deleteScript(id: string): Promise<boolean> {
  const database = await setupDB()
  const index = database.data!.scripts.findIndex((s) => s.id === id)
  if (index === -1) return false

  // Also delete associated characters, locations, and notes
  database.data!.characters = database.data!.characters.filter(c => c.scriptId !== id)
  database.data!.locations = database.data!.locations.filter(l => l.scriptId !== id)
  database.data!.notes = database.data!.notes.filter(n => n.scriptId !== id)
  
  database.data!.scripts.splice(index, 1)
  await database.write()
  return true
}

// ==================== CHARACTERS ====================

export async function addCharacter(data: CreateCharacterInput): Promise<Character> {
  const database = await setupDB()
  const now = new Date().toISOString()

  const newCharacter: Character = {
    id: randomUUID(),
    scriptId: data.scriptId,
    name: data.name,
    role: data.role,
    age: data.age,
    gender: data.gender,
    description: data.description || '',
    bio: data.bio || '',
    arc: data.arc,
    relationships: data.relationships || [],
    notes: data.notes,
    color: data.color,
    createdAt: now,
    updatedAt: now,
  }

  database.data!.characters.push(newCharacter)
  
  // Also add to script's characterIds
  const script = database.data!.scripts.find(s => s.id === data.scriptId)
  if (script && !script.characterIds.includes(newCharacter.id)) {
    script.characterIds.push(newCharacter.id)
  }
  
  await database.write()
  return newCharacter
}

export async function getCharacter(id: string): Promise<Character | null> {
  const database = await setupDB()
  return database.data!.characters.find((c) => c.id === id) ?? null
}

export async function getCharactersByScript(scriptId: string): Promise<Character[]> {
  const database = await setupDB()
  return database.data!.characters.filter((c) => c.scriptId === scriptId)
}

export async function updateCharacter(id: string, updates: UpdateCharacterInput): Promise<Character | null> {
  const database = await setupDB()
  const character = database.data!.characters.find((c) => c.id === id)
  if (!character) return null

  Object.assign(character, updates, {
    updatedAt: new Date().toISOString(),
  })

  await database.write()
  return character
}

export async function deleteCharacter(id: string): Promise<boolean> {
  const database = await setupDB()
  const character = database.data!.characters.find((c) => c.id === id)
  if (!character) return false

  // Remove from script's characterIds
  const script = database.data!.scripts.find(s => s.id === character.scriptId)
  if (script) {
    script.characterIds = script.characterIds.filter(cId => cId !== id)
  }

  database.data!.characters = database.data!.characters.filter(c => c.id !== id)
  await database.write()
  return true
}

// ==================== LOCATIONS ====================

export async function addLocation(data: CreateLocationInput): Promise<Location> {
  const database = await setupDB()
  const now = new Date().toISOString()

  const newLocation: Location = {
    id: randomUUID(),
    scriptId: data.scriptId,
    name: data.name,
    type: data.type,
    description: data.description || '',
    timeOfDay: data.timeOfDay,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  }

  database.data!.locations.push(newLocation)
  
  // Also add to script's locationIds
  const script = database.data!.scripts.find(s => s.id === data.scriptId)
  if (script && !script.locationIds.includes(newLocation.id)) {
    script.locationIds.push(newLocation.id)
  }
  
  await database.write()
  return newLocation
}

export async function getLocation(id: string): Promise<Location | null> {
  const database = await setupDB()
  return database.data!.locations.find((l) => l.id === id) ?? null
}

export async function getLocationsByScript(scriptId: string): Promise<Location[]> {
  const database = await setupDB()
  return database.data!.locations.filter((l) => l.scriptId === scriptId)
}

export async function updateLocation(id: string, updates: UpdateLocationInput): Promise<Location | null> {
  const database = await setupDB()
  const location = database.data!.locations.find((l) => l.id === id)
  if (!location) return null

  Object.assign(location, updates, {
    updatedAt: new Date().toISOString(),
  })

  await database.write()
  return location
}

export async function deleteLocation(id: string): Promise<boolean> {
  const database = await setupDB()
  const location = database.data!.locations.find((l) => l.id === id)
  if (!location) return false

  // Remove from script's locationIds
  const script = database.data!.scripts.find(s => s.id === location.scriptId)
  if (script) {
    script.locationIds = script.locationIds.filter(lId => lId !== id)
  }

  database.data!.locations = database.data!.locations.filter(l => l.id !== id)
  await database.write()
  return true
}

// ==================== NOTES ====================

export async function addNote(data: CreateNoteInput): Promise<Note> {
  const database = await setupDB()
  const now = new Date().toISOString()

  const newNote: Note = {
    id: randomUUID(),
    scriptId: data.scriptId,
    text: data.text,
    linkedTo: data.linkedTo,
    color: data.color,
    createdAt: now,
    updatedAt: now,
  }

  database.data!.notes.push(newNote)
  await database.write()
  return newNote
}

export async function getNote(id: string): Promise<Note | null> {
  const database = await setupDB()
  return database.data!.notes.find((n) => n.id === id) ?? null
}

export async function getNotesByScript(scriptId: string): Promise<Note[]> {
  const database = await setupDB()
  return database.data!.notes.filter((n) => n.scriptId === scriptId)
}

export async function updateNote(id: string, updates: UpdateNoteInput): Promise<Note | null> {
  const database = await setupDB()
  const note = database.data!.notes.find((n) => n.id === id)
  if (!note) return null

  Object.assign(note, updates, {
    updatedAt: new Date().toISOString(),
  })

  await database.write()
  return note
}

export async function deleteNote(id: string): Promise<boolean> {
  const database = await setupDB()
  const index = database.data!.notes.findIndex((n) => n.id === id)
  if (index === -1) return false

  database.data!.notes.splice(index, 1)
  await database.write()
  return true
}
