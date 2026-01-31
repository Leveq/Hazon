// src/shared/types/models.ts
// Shared type definitions used by both main and renderer processes

// ============ USER ============
export interface User {
  id: string
  name: string
  email: string
}

// ============ LINE TYPES ============
export const LINE_TYPES = [
  'scene',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
] as const

export type LineType = (typeof LINE_TYPES)[number]

export interface Line {
  id: string
  text: string
  type: LineType
  characterId?: string // Link to a Character if this is dialogue/character line
  notes?: string
}

// ============ SCRIPT ============
export interface Script {
  id: string
  title: string
  description: string
  logline?: string // One-sentence summary
  genre?: string
  author?: string
  userId: string
  createdAt: string
  updatedAt: string
  sceneOrder: string[]
  lines: Line[]
  characterIds: string[] // Characters in this script
  locationIds: string[] // Locations in this script
  tags?: string[]
}

// ============ CHARACTER ============
export type Gender = 'male' | 'female'

export interface Character {
  id: string
  scriptId: string // Which script this character belongs to
  name: string
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor' | 'extra'
  age?: string // e.g., "30s", "teenage", "elderly"
  gender?: Gender
  description: string // Physical description
  bio: string // Backstory
  arc?: string // Character arc notes
  relationships?: CharacterRelationship[]
  notes?: string
  color?: string // UI color for highlighting
  createdAt: string
  updatedAt: string
}

export interface CharacterRelationship {
  characterId: string
  relationship: string // e.g., "brother", "enemy", "love interest"
}

// ============ LOCATION ============
export interface Location {
  id: string
  scriptId: string
  name: string
  type: 'INT' | 'EXT' | 'INT/EXT'
  description: string
  timeOfDay?: string // e.g., "DAY", "NIGHT", "CONTINUOUS"
  notes?: string
  createdAt: string
  updatedAt: string
}

// ============ NOTE ============
export interface Note {
  id: string
  scriptId: string
  text: string
  linkedTo?: {
    type: 'line' | 'character' | 'location' | 'script'
    id: string
  }
  color?: 'yellow' | 'blue' | 'green' | 'red' | 'purple'
  createdAt: string
  updatedAt: string
}

// ============ SCENE (for future scene breakdown) ============
export interface Scene {
  id: string
  scriptId: string
  heading: string // e.g., "INT. COFFEE SHOP - DAY"
  lineStartId: string // First line ID of this scene
  lineEndId?: string // Last line ID (optional, could be next scene start)
  locationId?: string
  characterIds: string[]
  summary?: string
  notes?: string
  order: number
}

// ============ DATABASE SCHEMA ============
export interface DBData {
  scripts: Script[]
  characters: Character[]
  locations: Location[]
  notes: Note[]
}

// ============ API INPUT TYPES ============
export type CreateScriptInput = Pick<Script, 'title' | 'description'> & 
  Partial<Pick<Script, 'logline' | 'genre' | 'author' | 'tags' | 'lines'>>

export type UpdateScriptInput = Partial<Omit<Script, 'id' | 'createdAt' | 'userId'>>

export type CreateCharacterInput = Pick<Character, 'scriptId' | 'name' | 'role'> &
  Partial<Omit<Character, 'id' | 'scriptId' | 'name' | 'role' | 'createdAt' | 'updatedAt'>>

export type UpdateCharacterInput = Partial<Omit<Character, 'id' | 'scriptId' | 'createdAt' | 'updatedAt'>>

export type CreateLocationInput = Pick<Location, 'scriptId' | 'name' | 'type'> &
  Partial<Omit<Location, 'id' | 'scriptId' | 'name' | 'type' | 'createdAt' | 'updatedAt'>>

export type UpdateLocationInput = Partial<Omit<Location, 'id' | 'scriptId' | 'createdAt' | 'updatedAt'>>

export type CreateNoteInput = Pick<Note, 'scriptId' | 'text'> &
  Partial<Omit<Note, 'id' | 'scriptId' | 'text' | 'createdAt' | 'updatedAt'>>

export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'scriptId' | 'createdAt' | 'updatedAt'>>
