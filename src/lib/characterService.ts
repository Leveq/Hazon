import db from '../../db'
import { Character } from '../types/models'
import { v4 as uuid } from 'uuid'
import { currentUser } from './auth'

export async function addCharacter(characterData: Omit<Character, 'id' | 'userId'>): Promise<Character> {
  await db.read()

  const newCharacter: Character = {
    id: uuid(),
    userId: currentUser.id,
    ...characterData,
  }

  db.data!.characters.push(newCharacter)
  await db.write()

  return newCharacter
}