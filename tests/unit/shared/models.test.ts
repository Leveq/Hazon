// tests/unit/shared/models.test.ts
// Unit tests for type definitions and constants

import { describe, it, expect } from 'vitest'
import { LINE_TYPES } from '@shared/types'

describe('models', () => {
  describe('LINE_TYPES', () => {
    it('should contain all expected line types', () => {
      expect(LINE_TYPES).toContain('scene')
      expect(LINE_TYPES).toContain('action')
      expect(LINE_TYPES).toContain('character')
      expect(LINE_TYPES).toContain('parenthetical')
      expect(LINE_TYPES).toContain('dialogue')
      expect(LINE_TYPES).toContain('transition')
    })

    it('should have exactly 6 line types', () => {
      expect(LINE_TYPES).toHaveLength(6)
    })
  })
})
