// tests/unit/main/fountain.test.ts
// Tests for Fountain import/export functionality

import { describe, it, expect } from 'vitest'
import { parseFountain, exportToFountain, validateFountain } from '../../../src/main/lib/fountain'
import type { Script } from '../../../src/shared/types'

describe('Fountain Parser', () => {
  describe('parseFountain', () => {
    it('should parse title page metadata', () => {
      const fountain = `Title: My Screenplay
Author: John Doe
Draft date: 2024-01-01

FADE IN:`

      const { script } = parseFountain(fountain)
      
      expect(script.title).toBe('My Screenplay')
      expect(script.author).toBe('John Doe')
    })

    it('should parse scene headings', () => {
      const fountain = `INT. COFFEE SHOP - DAY

Action text here.`

      const { lines } = parseFountain(fountain)
      
      expect(lines[0].type).toBe('scene')
      expect(lines[0].text).toBe('INT. COFFEE SHOP - DAY')
    })

    it('should parse forced scene headings with dot prefix', () => {
      const fountain = `.FLASHBACK - CHILDHOOD HOME`

      const { lines } = parseFountain(fountain)
      
      expect(lines[0].type).toBe('scene')
      expect(lines[0].text).toBe('FLASHBACK - CHILDHOOD HOME')
    })

    it('should parse character names and dialogue', () => {
      const fountain = `JOHN
Hello there!`

      const { lines } = parseFountain(fountain)
      
      expect(lines[0].type).toBe('character')
      expect(lines[0].text).toBe('JOHN')
      expect(lines[1].type).toBe('dialogue')
      expect(lines[1].text).toBe('Hello there!')
    })

    it('should parse parentheticals', () => {
      const fountain = `JOHN
(whispering)
Hello there!`

      const { lines } = parseFountain(fountain)
      
      expect(lines[0].type).toBe('character')
      expect(lines[1].type).toBe('parenthetical')
      expect(lines[1].text).toBe('(whispering)')
      expect(lines[2].type).toBe('dialogue')
    })

    it('should parse transitions', () => {
      const fountain = `INT. OFFICE - DAY

Action.

CUT TO:`

      const { lines } = parseFountain(fountain)
      
      // Find the transition line
      const transitionLine = lines.find(l => l.type === 'transition')
      expect(transitionLine).toBeDefined()
      expect(transitionLine?.text).toBe('CUT TO:')
    })

    it('should parse forced transitions with > prefix', () => {
      const fountain = `>INTERCUT WITH:`

      const { lines } = parseFountain(fountain)
      
      expect(lines[0].type).toBe('transition')
      expect(lines[0].text).toBe('INTERCUT WITH:')
    })

    it('should parse action lines as default', () => {
      const fountain = `John walks into the room and looks around nervously.`

      const { lines } = parseFountain(fountain)
      
      expect(lines[0].type).toBe('action')
    })

    it('should default title to Untitled if not provided', () => {
      const fountain = `INT. OFFICE - DAY

Some action.`

      const { script } = parseFountain(fountain)
      
      expect(script.title).toBe('Untitled')
    })
  })

  describe('exportToFountain', () => {
    const mockScript: Script = {
      id: '1',
      title: 'Test Script',
      description: 'A test',
      author: 'Jane Doe',
      logline: 'A test screenplay',
      userId: 'user1',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      sceneOrder: [],
      characterIds: [],
      locationIds: [],
      lines: [
        { id: '1', type: 'scene', text: 'INT. OFFICE - DAY' },
        { id: '2', type: 'action', text: 'John enters the room.' },
        { id: '3', type: 'character', text: 'JOHN' },
        { id: '4', type: 'dialogue', text: 'Hello!' },
      ],
    }

    it('should export title page', () => {
      const result = exportToFountain(mockScript)
      
      expect(result).toContain('Title: Test Script')
      expect(result).toContain('Author: Jane Doe')
    })

    it('should export scene headings in uppercase', () => {
      const result = exportToFountain(mockScript)
      
      expect(result).toContain('INT. OFFICE - DAY')
    })

    it('should export character names in uppercase', () => {
      const result = exportToFountain(mockScript)
      
      expect(result).toContain('JOHN')
    })

    it('should export dialogue text', () => {
      const result = exportToFountain(mockScript)
      
      expect(result).toContain('Hello!')
    })
  })

  describe('validateFountain', () => {
    it('should return valid for non-empty content', () => {
      const result = validateFountain('INT. OFFICE - DAY\n\nSome action.')
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should return invalid for empty content', () => {
      const result = validateFountain('')
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Document is empty')
    })

    it('should return invalid for whitespace-only content', () => {
      const result = validateFountain('   \n\n   ')
      
      expect(result.valid).toBe(false)
    })
  })
})
