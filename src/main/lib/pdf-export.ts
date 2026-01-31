// src/main/lib/pdf-export.ts
// PDF export for screenplays using industry-standard formatting

import PDFDocument from 'pdfkit'
import { createWriteStream } from 'fs'
import type { Script, Line, LineType } from '../../shared/types'

// Industry-standard screenplay formatting constants
const PAGE = {
  WIDTH: 612,    // 8.5 inches in points
  HEIGHT: 792,   // 11 inches in points
  MARGIN_TOP: 72,      // 1 inch
  MARGIN_BOTTOM: 72,   // 1 inch
  MARGIN_LEFT: 108,    // 1.5 inches
  MARGIN_RIGHT: 72,    // 1 inch
}

// Standard Courier 12pt for screenplays
const FONT = {
  FAMILY: 'Courier',
  SIZE: 12,
  LINE_HEIGHT: 12,  // Single-spaced
}

// Element margins (from left edge of text area)
const ELEMENT_MARGINS: Record<LineType, { left: number; right: number; caps?: boolean }> = {
  scene: { left: 0, right: 0, caps: true },
  action: { left: 0, right: 0 },
  character: { left: 168, right: 0, caps: true },  // 2.3 inches from dialogue margin
  parenthetical: { left: 120, right: 144 },        // Centered under character
  dialogue: { left: 72, right: 144 },              // 2.5 inch column
  transition: { left: 288, right: 0, caps: true }, // Right-aligned
}

interface PDFExportOptions {
  includeTitlePage?: boolean
  includePageNumbers?: boolean
}

/**
 * Export a script to PDF format
 */
export async function exportToPDF(
  script: Script,
  outputPath: string,
  options: PDFExportOptions = {}
): Promise<void> {
  const { includeTitlePage = true, includePageNumbers = true } = options

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: PAGE.MARGIN_TOP,
          bottom: PAGE.MARGIN_BOTTOM,
          left: PAGE.MARGIN_LEFT,
          right: PAGE.MARGIN_RIGHT,
        },
        bufferPages: true,
      })

      const stream = createWriteStream(outputPath)
      doc.pipe(stream)

      // Set default font
      doc.font(FONT.FAMILY).fontSize(FONT.SIZE)

      let yPosition = PAGE.MARGIN_TOP

      // Title page
      if (includeTitlePage) {
        renderTitlePage(doc, script)
        doc.addPage()
        yPosition = PAGE.MARGIN_TOP
      }

      // Render script content
      for (let i = 0; i < script.lines.length; i++) {
        const line = script.lines[i]
        const nextLine = script.lines[i + 1]

        // Calculate space needed for this element
        const elementHeight = calculateElementHeight(doc, line)
        
        // Check if we need a new page
        if (yPosition + elementHeight > PAGE.HEIGHT - PAGE.MARGIN_BOTTOM) {
          doc.addPage()
          yPosition = PAGE.MARGIN_TOP
        }

        // Render the line
        yPosition = renderLine(doc, line, yPosition)

        // Add appropriate spacing after element
        yPosition += getSpacingAfter(line.type, nextLine?.type)
      }

      // Add page numbers
      if (includePageNumbers) {
        addPageNumbers(doc, includeTitlePage ? 1 : 0)
      }

      doc.end()

      stream.on('finish', () => resolve())
      stream.on('error', reject)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Render the title page
 */
function renderTitlePage(doc: PDFKit.PDFDocument, script: Script): void {
  // Title - centered, 1/3 down the page
  doc.fontSize(24)
  doc.text(script.title.toUpperCase(), PAGE.MARGIN_LEFT, PAGE.HEIGHT / 3, {
    width: PAGE.WIDTH - PAGE.MARGIN_LEFT - PAGE.MARGIN_RIGHT,
    align: 'center',
  })

  // "written by" - centered below title
  doc.fontSize(FONT.SIZE)
  doc.moveDown(2)
  doc.text('written by', {
    width: PAGE.WIDTH - PAGE.MARGIN_LEFT - PAGE.MARGIN_RIGHT,
    align: 'center',
  })

  // Author name
  doc.moveDown(1)
  doc.text(script.author || 'Anonymous', {
    width: PAGE.WIDTH - PAGE.MARGIN_LEFT - PAGE.MARGIN_RIGHT,
    align: 'center',
  })

  // Logline (if present) - lower on the page
  if (script.logline) {
    doc.fontSize(10)
    doc.text(script.logline, PAGE.MARGIN_LEFT, PAGE.HEIGHT - 200, {
      width: PAGE.WIDTH - PAGE.MARGIN_LEFT - PAGE.MARGIN_RIGHT,
      align: 'center',
    })
  }

  // Reset font size
  doc.fontSize(FONT.SIZE)
}

/**
 * Render a single line element
 */
function renderLine(doc: PDFKit.PDFDocument, line: Line, yPosition: number): number {
  const margins = ELEMENT_MARGINS[line.type]
  const text = margins.caps ? line.text.toUpperCase() : line.text
  
  if (!text.trim()) {
    return yPosition
  }

  const xPosition = PAGE.MARGIN_LEFT + margins.left
  const maxWidth = PAGE.WIDTH - PAGE.MARGIN_LEFT - PAGE.MARGIN_RIGHT - margins.left - margins.right

  // Special handling for transitions (right-aligned)
  const align = line.type === 'transition' ? 'right' : 'left'

  doc.text(text, xPosition, yPosition, {
    width: maxWidth,
    align,
    lineGap: 0,
  })

  // Return new Y position
  return doc.y
}

/**
 * Calculate the height needed for an element
 */
function calculateElementHeight(doc: PDFKit.PDFDocument, line: Line): number {
  const margins = ELEMENT_MARGINS[line.type]
  const maxWidth = PAGE.WIDTH - PAGE.MARGIN_LEFT - PAGE.MARGIN_RIGHT - margins.left - margins.right
  
  if (!line.text.trim()) {
    return 0
  }

  const height = doc.heightOfString(line.text, {
    width: maxWidth,
  })

  return height + getSpacingAfter(line.type)
}

/**
 * Get spacing after an element type
 */
function getSpacingAfter(currentType: LineType, nextType?: LineType): number {
  // Scene headings: double space after
  if (currentType === 'scene') {
    return FONT.LINE_HEIGHT * 2
  }

  // Character names: no space before dialogue
  if (currentType === 'character') {
    return 0
  }

  // Parentheticals: no space before/after dialogue
  if (currentType === 'parenthetical') {
    return 0
  }

  // Dialogue: space after unless followed by parenthetical
  if (currentType === 'dialogue') {
    if (nextType === 'parenthetical' || nextType === 'dialogue') {
      return 0
    }
    return FONT.LINE_HEIGHT
  }

  // Transitions: double space after
  if (currentType === 'transition') {
    return FONT.LINE_HEIGHT * 2
  }

  // Action: single space after
  return FONT.LINE_HEIGHT
}

/**
 * Add page numbers to all pages (except title page)
 */
function addPageNumbers(doc: PDFKit.PDFDocument, skipPages: number): void {
  const pages = doc.bufferedPageRange()
  
  for (let i = skipPages; i < pages.count; i++) {
    doc.switchToPage(i)
    
    const pageNum = i - skipPages + 1
    
    // Page number in top right corner
    doc.fontSize(FONT.SIZE)
    doc.text(
      `${pageNum}.`,
      PAGE.WIDTH - PAGE.MARGIN_RIGHT - 50,
      PAGE.MARGIN_TOP - 24,
      {
        width: 50,
        align: 'right',
      }
    )
  }
}

export default exportToPDF
