// src/lib/pageCount.ts
// Screenplay page estimation based on industry standards
// ~1 page = ~1 minute of screen time
// Standard page: ~55 lines with proper formatting

import type { Line, LineType } from '../../shared/types'

// Approximate line weights for different element types
// These account for margins and spacing in standard screenplay format
const LINE_WEIGHTS: Record<LineType, number> = {
  scene: 2,        // Scene headings have extra spacing
  action: 1,       // Action lines are full width
  character: 1.5,  // Character names have top margin
  parenthetical: 0.5, // Short, indented
  dialogue: 0.8,   // Narrower column = more lines per content
  transition: 1.5, // Has spacing around it
}

const LINES_PER_PAGE = 55

export interface PageStats {
  pageCount: number
  estimatedMinutes: number
  lineCount: number
  wordCount: number
}

/**
 * Calculate estimated page count and runtime for a screenplay
 */
export function calculatePageStats(lines: Line[]): PageStats {
  if (!lines || lines.length === 0) {
    return { pageCount: 0, estimatedMinutes: 0, lineCount: 0, wordCount: 0 }
  }

  let weightedLines = 0
  let wordCount = 0

  for (const line of lines) {
    const content = line.text || ''
    const weight = LINE_WEIGHTS[line.type] || 1
    
    // Count words
    const words = content.trim().split(/\s+/).filter((w: string) => w.length > 0)
    wordCount += words.length

    // Calculate weighted lines based on content length
    // Action and dialogue can wrap to multiple lines
    if (line.type === 'action') {
      // Action: ~60 characters per line
      const actionLines = Math.ceil(content.length / 60) || 1
      weightedLines += actionLines * weight
    } else if (line.type === 'dialogue') {
      // Dialogue: ~35 characters per line (narrower column)
      const dialogueLines = Math.ceil(content.length / 35) || 1
      weightedLines += dialogueLines * weight
    } else {
      // Other elements: usually single line
      weightedLines += weight
    }
  }

  const pageCount = Math.max(1, Math.round(weightedLines / LINES_PER_PAGE * 10) / 10)
  const estimatedMinutes = Math.round(pageCount) // 1 page ≈ 1 minute

  return {
    pageCount,
    estimatedMinutes,
    lineCount: lines.length,
    wordCount,
  }
}

/**
 * Format page count for display
 */
export function formatPageCount(stats: PageStats): string {
  if (stats.pageCount === 0) return '0 pages'
  
  const pages = stats.pageCount === 1 ? '1 page' : `${stats.pageCount} pages`
  return pages
}

/**
 * Format estimated runtime
 */
export function formatRuntime(minutes: number): string {
  if (minutes === 0) return '0 min'
  if (minutes < 60) return `~${minutes} min`
  
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `~${hours}h`
  return `~${hours}h ${mins}m`
}
