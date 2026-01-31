// tests/unit/shared/pageCount.test.ts
// Unit tests for page count calculations

import { describe, it, expect } from 'vitest'
import { calculatePageStats, formatPageCount, formatRuntime } from '@renderer/lib/pageCount'
import type { Line } from '@shared/types'

describe('pageCount', () => {
  describe('calculatePageStats', () => {
    it('should return zero stats for empty lines', () => {
      const stats = calculatePageStats([])
      expect(stats.pageCount).toBe(0)
      expect(stats.wordCount).toBe(0)
    })

    it('should calculate page count based on line weights', () => {
      const lines: Line[] = [
        { id: '1', type: 'scene', text: 'INT. COFFEE SHOP - DAY' },
        { id: '2', type: 'action', text: 'A busy morning scene.' },
        { id: '3', type: 'character', text: 'JOHN' },
        { id: '4', type: 'dialogue', text: 'Hello there!' },
      ]
      const stats = calculatePageStats(lines)
      expect(stats.pageCount).toBeGreaterThan(0)
      expect(stats.wordCount).toBeGreaterThan(0)
    })

    it('should count words correctly', () => {
      const lines: Line[] = [
        { id: '1', type: 'action', text: 'One two three four five' }, // 5 words
      ]
      const stats = calculatePageStats(lines)
      expect(stats.wordCount).toBe(5)
    })

    it('should handle empty text lines', () => {
      const lines: Line[] = [
        { id: '1', type: 'scene', text: '' },
        { id: '2', type: 'action', text: '' },
      ]
      const stats = calculatePageStats(lines)
      expect(stats.wordCount).toBe(0)
    })
  })

  describe('formatPageCount', () => {
    it('should format single page', () => {
      const stats = { pageCount: 1, estimatedMinutes: 1, lineCount: 50, wordCount: 500 }
      expect(formatPageCount(stats)).toBe('1 page')
    })

    it('should format multiple pages', () => {
      const stats = { pageCount: 5, estimatedMinutes: 5, lineCount: 250, wordCount: 2500 }
      expect(formatPageCount(stats)).toBe('5 pages')
    })

    it('should format fractional pages', () => {
      const stats = { pageCount: 1.5, estimatedMinutes: 2, lineCount: 75, wordCount: 750 }
      expect(formatPageCount(stats)).toBe('1.5 pages')
    })

    it('should format zero pages', () => {
      const stats = { pageCount: 0, estimatedMinutes: 0, lineCount: 0, wordCount: 0 }
      expect(formatPageCount(stats)).toBe('0 pages')
    })
  })

  describe('formatRuntime', () => {
    it('should format runtime under an hour', () => {
      const result = formatRuntime(45)
      expect(result).toBe('~45 min')
    })

    it('should format runtime over an hour', () => {
      const result = formatRuntime(90)
      expect(result).toBe('~1h 30m')
    })

    it('should format exact hours', () => {
      const result = formatRuntime(120)
      expect(result).toBe('~2h')
    })

    it('should handle zero runtime', () => {
      const result = formatRuntime(0)
      expect(result).toBe('0 min')
    })
  })
})
