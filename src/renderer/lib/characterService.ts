// src/renderer/lib/characterService.ts
// Character service using IPC to communicate with main process

import type { Character, CreateCharacterInput, UpdateCharacterInput } from '../../shared/types'

/**
 * Create a new character
 */
export async function addCharacter(characterData: CreateCharacterInput): Promise<Character> {
  return window.api.characters.create(characterData)
}

/**
 * Get a character by ID
 */
export async function getCharacter(id: string): Promise<Character | null> {
  return window.api.characters.get(id)
}

/**
 * Get all characters for a script
 */
export async function getCharactersByScript(scriptId: string): Promise<Character[]> {
  return window.api.characters.getByScript(scriptId)
}

/**
 * Update a character
 */
export async function updateCharacter(id: string, updates: UpdateCharacterInput): Promise<Character | null> {
  return window.api.characters.update(id, updates)
}

/**
 * Delete a character
 */
export async function deleteCharacter(id: string): Promise<boolean> {
  return window.api.characters.delete(id)
}