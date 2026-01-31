// src/main/lib/fountain.ts
// Fountain (.fountain) screenplay format parser and generator
// Fountain spec: https://fountain.io/syntax

import { randomUUID } from 'crypto'
import type { Script, Line, LineType, CreateScriptInput } from '../../shared/types'

/**
 * Fountain element patterns
 */
const PATTERNS = {
  // Scene headings: INT./EXT./EST./INT./EXT. or forced with .
  SCENE_HEADING: /^(\.(?!\.)|(?:INT|EXT|EST|INT\.\/EXT|I\/E)[.\s])/i,
  
  // Character: ALL CAPS (with optional extension) or forced with @
  CHARACTER: /^@|^[A-Z][A-Z0-9 ]*(?:\s*\(.*\))?$/,
  
  // Parenthetical: text in parentheses
  PARENTHETICAL: /^\s*\(.*\)\s*$/,
  
  // Transition: ends with TO: or forced with >
  TRANSITION: /^>|(?:FADE OUT|CUT TO|DISSOLVE TO|SMASH CUT TO|MATCH CUT TO)[:.]?\s*$/i,
  
  // Forced elements
  FORCED_ACTION: /^!/,
  FORCED_SCENE: /^\./,
  FORCED_CHARACTER: /^@/,
  FORCED_TRANSITION: /^>/,
  
  // Title page key-value
  TITLE_PAGE: /^([A-Za-z\s]+):\s*(.*)$/,
  
  // Blank line
  BLANK: /^\s*$/,
  
  // Scene number
  SCENE_NUMBER: /#([^#]+)#$/,
}

/**
 * Title page keys recognized by Fountain
 */
const _TITLE_PAGE_KEYS = [
  'title', 'credit', 'author', 'authors', 'source', 'draft date',
  'date', 'contact', 'copyright', 'notes'
]

interface FountainMetadata {
  title?: string
  author?: string
  credit?: string
  source?: string
  draftDate?: string
  contact?: string
  copyright?: string
  notes?: string
}

/**
 * Parse a Fountain file into a Script object
 */
export function parseFountain(fountainText: string): { script: CreateScriptInput; lines: Line[] } {
  const rawLines = fountainText.split(/\r?\n/)
  const metadata: FountainMetadata = {}
  const lines: Line[] = []
  
  let inTitlePage = true
  let inDialogue = false
  let lastCharacterLine = false
  let i = 0

  // Parse title page (if present)
  while (i < rawLines.length && inTitlePage) {
    const line = rawLines[i]
    
    if (PATTERNS.BLANK.test(line)) {
      // Blank line might end title page if we've seen content
      if (Object.keys(metadata).length > 0) {
        // Look ahead for more title page content
        const nextNonBlank = rawLines.slice(i + 1).find(l => !PATTERNS.BLANK.test(l))
        if (!nextNonBlank || !PATTERNS.TITLE_PAGE.test(nextNonBlank)) {
          inTitlePage = false
        }
      }
      i++
      continue
    }

    const titleMatch = line.match(PATTERNS.TITLE_PAGE)
    if (titleMatch) {
      const key = titleMatch[1].toLowerCase().trim()
      const value = titleMatch[2].trim()
      
      switch (key) {
        case 'title':
          metadata.title = value
          break
        case 'author':
        case 'authors':
          metadata.author = value
          break
        case 'credit':
          metadata.credit = value
          break
        case 'draft date':
        case 'date':
          metadata.draftDate = value
          break
        case 'contact':
          metadata.contact = value
          break
        case 'copyright':
          metadata.copyright = value
          break
        case 'notes':
          metadata.notes = value
          break
      }
      i++
    } else {
      // Not a title page line, start parsing script
      inTitlePage = false
    }
  }

  // Parse script body
  while (i < rawLines.length) {
    const rawLine = rawLines[i]
    const trimmedLine = rawLine.trim()
    
    // Skip blank lines (but track them for dialogue detection)
    if (PATTERNS.BLANK.test(trimmedLine)) {
      inDialogue = false
      lastCharacterLine = false
      i++
      continue
    }

    // Determine line type
    let type: LineType = 'action'
    let text = trimmedLine

    // Check for forced elements first
    if (PATTERNS.FORCED_SCENE.test(trimmedLine)) {
      type = 'scene'
      text = trimmedLine.slice(1).trim()
    } else if (PATTERNS.FORCED_CHARACTER.test(trimmedLine)) {
      type = 'character'
      text = trimmedLine.slice(1).trim()
      lastCharacterLine = true
      inDialogue = true
    } else if (PATTERNS.FORCED_TRANSITION.test(trimmedLine)) {
      type = 'transition'
      text = trimmedLine.slice(1).trim()
    } else if (PATTERNS.FORCED_ACTION.test(trimmedLine)) {
      type = 'action'
      text = trimmedLine.slice(1).trim()
    }
    // Check natural patterns
    else if (PATTERNS.SCENE_HEADING.test(trimmedLine)) {
      type = 'scene'
      // Remove scene numbers if present
      text = trimmedLine.replace(PATTERNS.SCENE_NUMBER, '').trim()
    } else if (lastCharacterLine && PATTERNS.PARENTHETICAL.test(trimmedLine)) {
      type = 'parenthetical'
    } else if (inDialogue && !PATTERNS.CHARACTER.test(trimmedLine)) {
      type = 'dialogue'
    } else if (PATTERNS.TRANSITION.test(trimmedLine)) {
      type = 'transition'
    } else if (PATTERNS.CHARACTER.test(trimmedLine) && !inDialogue) {
      // Check if next non-blank line could be dialogue
      const nextIdx = rawLines.slice(i + 1).findIndex(l => !PATTERNS.BLANK.test(l))
      if (nextIdx !== -1) {
        type = 'character'
        lastCharacterLine = true
        inDialogue = true
      }
    }

    // Update dialogue state
    if (type !== 'character' && type !== 'parenthetical' && type !== 'dialogue') {
      inDialogue = false
      lastCharacterLine = false
    } else if (type === 'dialogue' || type === 'parenthetical') {
      lastCharacterLine = false
    }

    lines.push({
      id: randomUUID(),
      type,
      text,
    })

    i++
  }

  const script: CreateScriptInput = {
    title: metadata.title || 'Untitled',
    description: metadata.notes || '',
    author: metadata.author,
  }

  return { script, lines }
}

/**
 * Export a Script to Fountain format
 */
export function exportToFountain(script: Script): string {
  const output: string[] = []

  // Title page
  output.push(`Title: ${script.title}`)
  if (script.author) {
    output.push(`Author: ${script.author}`)
  }
  output.push(`Draft date: ${new Date().toLocaleDateString()}`)
  if (script.logline) {
    output.push(`Notes: ${script.logline}`)
  }
  output.push('')  // Blank line ends title page

  // Script body
  let lastType: LineType | null = null

  for (const line of script.lines) {
    // Add blank lines for element separation
    if (lastType !== null) {
      // Scene headings get extra spacing
      if (line.type === 'scene' || lastType === 'scene') {
        output.push('')
      }
      // Space before character (new dialogue block)
      else if (line.type === 'character' && lastType !== 'character') {
        output.push('')
      }
      // Space after dialogue block
      else if (lastType === 'dialogue' && line.type !== 'parenthetical' && line.type !== 'dialogue') {
        output.push('')
      }
      // Transitions get spacing
      else if (line.type === 'transition' || lastType === 'transition') {
        output.push('')
      }
    }

    // Format line based on type
    let formattedLine = line.text

    switch (line.type) {
      case 'scene':
        // Scene headings should be uppercase
        // Force with . if it doesn't match natural pattern
        if (!PATTERNS.SCENE_HEADING.test(line.text)) {
          formattedLine = `.${line.text}`
        } else {
          formattedLine = line.text.toUpperCase()
        }
        break

      case 'character':
        // Character names are uppercase
        formattedLine = line.text.toUpperCase()
        break

      case 'parenthetical':
        // Ensure parentheses
        if (!line.text.startsWith('(')) {
          formattedLine = `(${line.text})`
        }
        if (!formattedLine.endsWith(')')) {
          formattedLine = `${formattedLine.slice(0, -1)})`
        }
        break

      case 'dialogue':
        // Dialogue is plain text
        formattedLine = line.text
        break

      case 'transition':
        // Force transition with > if it doesn't match natural pattern
        if (!PATTERNS.TRANSITION.test(line.text)) {
          formattedLine = `>${line.text}`
        } else {
          formattedLine = line.text.toUpperCase()
        }
        break

      case 'action':
        // Action is plain text
        // Force with ! if it might be misinterpreted
        if (PATTERNS.SCENE_HEADING.test(line.text) || 
            PATTERNS.CHARACTER.test(line.text) ||
            PATTERNS.TRANSITION.test(line.text)) {
          formattedLine = `!${line.text}`
        } else {
          formattedLine = line.text
        }
        break
    }

    output.push(formattedLine)
    lastType = line.type
  }

  return output.join('\n')
}

/**
 * Validate Fountain syntax
 */
export function validateFountain(text: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const lines = text.split(/\r?\n/)
  
  let hasContent = false
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line) {
      hasContent = true
    }
  }

  if (!hasContent) {
    errors.push('Document is empty')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export default { parseFountain, exportToFountain, validateFountain }
