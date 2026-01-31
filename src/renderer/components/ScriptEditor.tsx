// src/components/ScriptEditor.tsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Line, LineType } from '../../shared/types'

const LINE_TYPES: LineType[] = [
  'scene',
  'action',
  'character',
  'parenthetical',
  'dialogue',
  'transition',
]

const TYPE_LABELS: Record<LineType, string> = {
  scene: 'SCENE HEADING',
  action: 'ACTION',
  character: 'CHARACTER',
  parenthetical: 'PARENTHETICAL',
  dialogue: 'DIALOGUE',
  transition: 'TRANSITION',
}

// Lines per page (industry standard ~55 lines per page)
const LINES_PER_PAGE = 55

// Weight multipliers for different line types (how much vertical space they take)
const LINE_WEIGHTS: Record<LineType, number> = {
  scene: 2,        // Scene headings have space before/after
  action: 1,       // Standard line
  character: 1.5,  // Space before character name
  parenthetical: 0.5, // Tight spacing
  dialogue: 1,     // Standard line
  transition: 2,   // Space before/after
}

// Intelligent next type based on screenplay conventions
function getNextTypeAfterEnter(current: LineType): LineType {
  switch (current) {
    case 'scene': return 'action'
    case 'action': return 'action'
    case 'character': return 'dialogue'
    case 'parenthetical': return 'dialogue'
    case 'dialogue': return 'character'
    case 'transition': return 'scene'
    default: return 'action'
  }
}

function cycleType(current: LineType, delta = 1): LineType {
  const i = LINE_TYPES.indexOf(current)
  return LINE_TYPES[(i + delta + LINE_TYPES.length) % LINE_TYPES.length]
}

// Screenplay-standard formatting styles
function getLineStyles(type: LineType): string {
  const base = 'w-full resize-none bg-transparent outline-none leading-6 text-black dark:text-gray-100'
  
  switch (type) {
    case 'scene':
      return `${base} uppercase font-bold tracking-wide`
    case 'action':
      return `${base}`
    case 'character':
      return `${base} uppercase font-semibold`
    case 'parenthetical':
      return `${base} italic text-center`
    case 'dialogue':
      return `${base} text-justify`
    case 'transition':
      return `${base} uppercase font-bold`
    default:
      return base
  }
}

// Container styles for proper screenplay margins
function getContainerStyles(type: LineType): string {
  const base = 'relative'
  
  switch (type) {
    case 'scene':
      return `${base} ml-0 mr-0`
    case 'action':
      return `${base} ml-0 mr-0`
    case 'character':
      return `${base} ml-[37%] mr-[10%]`
    case 'parenthetical':
      return `${base} ml-[27%] mr-[25%]`
    case 'dialogue':
      return `${base} ml-[17%] mr-[25%]`
    case 'transition':
      return `${base} ml-[60%] mr-0 text-right`
    default:
      return base
  }
}

// Vertical spacing based on screenplay conventions
function getVerticalSpacing(type: LineType, prevType: LineType | null): string {
  if (type === 'scene') {
    return prevType ? 'mt-6' : 'mt-0'
  }
  if (type === 'character') {
    return 'mt-4'
  }
  if (type === 'parenthetical' || type === 'dialogue') {
    return 'mt-0'
  }
  if (type === 'action' && prevType === 'dialogue') {
    return 'mt-3'
  }
  if (type === 'transition') {
    return 'mt-4'
  }
  return 'mt-1'
}

// Calculate page breaks based on weighted line counts
function calculatePageBreaks(lines: Line[]): number[] {
  const pageBreaks: number[] = []
  let weightedLineCount = 0
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const content = line.text || ''
    
    // Calculate weighted lines for this element
    let lineWeight = LINE_WEIGHTS[line.type] || 1
    
    // Add extra weight for longer content that wraps
    if (line.type === 'action') {
      const actionLines = Math.ceil(content.length / 60) || 1
      lineWeight *= actionLines
    } else if (line.type === 'dialogue') {
      const dialogueLines = Math.ceil(content.length / 35) || 1
      lineWeight *= dialogueLines
    }
    
    weightedLineCount += lineWeight
    
    // Check if we've reached a page break
    if (weightedLineCount >= LINES_PER_PAGE) {
      pageBreaks.push(i)
      weightedLineCount = 0
    }
  }
  
  return pageBreaks
}

// Get scene headings for navigation
function getSceneList(lines: Line[]): { index: number; text: string; page: number }[] {
  const scenes: { index: number; text: string; page: number }[] = []
  let weightedLineCount = 0
  let currentPage = 1
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const content = line.text || ''
    
    // Track page number
    let lineWeight = LINE_WEIGHTS[line.type] || 1
    if (line.type === 'action') {
      lineWeight *= Math.ceil(content.length / 60) || 1
    } else if (line.type === 'dialogue') {
      lineWeight *= Math.ceil(content.length / 35) || 1
    }
    weightedLineCount += lineWeight
    
    if (weightedLineCount >= LINES_PER_PAGE) {
      currentPage++
      weightedLineCount = 0
    }
    
    // Add scene headings
    if (line.type === 'scene' && line.text.trim()) {
      scenes.push({ index: i, text: line.text, page: currentPage })
    }
  }
  
  return scenes
}

interface Props {
  initialLines: Line[]
  onSave: (lines: Line[]) => void
}

export default function ScriptEditor({ initialLines, onSave }: Props) {
  const [lines, setLines] = useState<Line[]>(initialLines)
  const [focusedIdx, setFocusedIdx] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilter, setSearchFilter] = useState<LineType | 'all'>('all')
  const [showNav, setShowNav] = useState(true)
  const inputRefs = useRef<Array<HTMLTextAreaElement | null>>([])
  const editorRef = useRef<HTMLDivElement>(null)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Calculate page breaks
  const pageBreaks = useMemo(() => calculatePageBreaks(lines), [lines])
  
  // Get scene list for navigation
  const sceneList = useMemo(() => getSceneList(lines), [lines])
  
  // Calculate total pages
  const totalPages = useMemo(() => {
    let weightedLineCount = 0
    for (const line of lines) {
      const content = line.text || ''
      let lineWeight = LINE_WEIGHTS[line.type] || 1
      if (line.type === 'action') {
        lineWeight *= Math.ceil(content.length / 60) || 1
      } else if (line.type === 'dialogue') {
        lineWeight *= Math.ceil(content.length / 35) || 1
      }
      weightedLineCount += lineWeight
    }
    return Math.max(1, Math.ceil(weightedLineCount / LINES_PER_PAGE))
  }, [lines])
  
  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    
    const query = searchQuery.toLowerCase()
    return lines
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => {
        const matchesQuery = line.text.toLowerCase().includes(query)
        const matchesFilter = searchFilter === 'all' || line.type === searchFilter
        return matchesQuery && matchesFilter
      })
  }, [lines, searchQuery, searchFilter])

  // Debounced save
  const debouncedSave = useCallback((newLines: Line[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    saveTimeoutRef.current = setTimeout(() => {
      onSave(newLines)
    }, 500)
  }, [onSave])

  useEffect(() => {
    setLines(initialLines)
  }, [initialLines])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  const updateLines = useCallback((updater: (prev: Line[]) => Line[]) => {
    setLines(prev => {
      const next = updater(prev)
      debouncedSave(next)
      return next
    })
  }, [debouncedSave])

  const updateLine = useCallback((idx: number, updates: Partial<Line>) => {
    updateLines(ls => {
      const copy = [...ls]
      copy[idx] = { ...copy[idx], ...updates }
      return copy
    })
  }, [updateLines])

  const focusLine = useCallback((idx: number, cursorPos?: number) => {
    setTimeout(() => {
      const el = inputRefs.current[idx]
      if (el) {
        el.focus()
        if (cursorPos !== undefined) {
          el.setSelectionRange(cursorPos, cursorPos)
        }
      }
    }, 0)
  }, [])

  // Scroll to a specific line
  const scrollToLine = useCallback((idx: number) => {
    const el = inputRefs.current[idx]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      focusLine(idx, 0)
    }
  }, [focusLine])

  // Scroll to page
  const scrollToPage = useCallback((page: number) => {
    // Find the first line on this page
    let weightedLineCount = 0
    let targetPage = 1
    
    for (let i = 0; i < lines.length; i++) {
      if (targetPage === page) {
        scrollToLine(i)
        return
      }
      
      const line = lines[i]
      const content = line.text || ''
      let lineWeight = LINE_WEIGHTS[line.type] || 1
      if (line.type === 'action') {
        lineWeight *= Math.ceil(content.length / 60) || 1
      } else if (line.type === 'dialogue') {
        lineWeight *= Math.ceil(content.length / 35) || 1
      }
      weightedLineCount += lineWeight
      
      if (weightedLineCount >= LINES_PER_PAGE) {
        targetPage++
        weightedLineCount = 0
      }
    }
  }, [lines, scrollToLine])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, idx: number) => {
    const ta = inputRefs.current[idx]
    if (!ta) return

    const { key, shiftKey, ctrlKey } = e
    const line = lines[idx]

    if (ctrlKey && key.toLowerCase() === 't') {
      e.preventDefault()
      updateLine(idx, { type: cycleType(line.type, shiftKey ? -1 : 1) })
      focusLine(idx)
      return
    }

    if (key === 'Tab') {
      e.preventDefault()
      updateLine(idx, { type: cycleType(line.type, shiftKey ? -1 : 1) })
      return
    }

    if (key === 'Enter' && !shiftKey) {
      e.preventDefault()
      const cursorPos = ta.selectionStart
      const textBefore = line.text.slice(0, cursorPos)
      const textAfter = line.text.slice(ta.selectionEnd)
      
      const nextType = textAfter ? line.type : getNextTypeAfterEnter(line.type)
      
      const newLine: Line = {
        id: uuidv4(),
        text: textAfter,
        type: nextType,
      }
      
      updateLines(ls => {
        const copy = [...ls]
        copy[idx] = { ...copy[idx], text: textBefore }
        copy.splice(idx + 1, 0, newLine)
        return copy
      })
      
      focusLine(idx + 1, 0)
      return
    }

    if (key === 'Backspace' && ta.selectionStart === 0 && ta.selectionEnd === 0) {
      if (line.text === '' && lines.length > 1) {
        e.preventDefault()
        updateLines(ls => ls.filter((_, i) => i !== idx))
        focusLine(Math.max(0, idx - 1))
        return
      }
      if (idx > 0) {
        e.preventDefault()
        const prevLine = lines[idx - 1]
        const mergedText = prevLine.text + line.text
        const cursorPos = prevLine.text.length
        
        updateLines(ls => {
          const copy = [...ls]
          copy[idx - 1] = { ...copy[idx - 1], text: mergedText }
          return copy.filter((_, i) => i !== idx)
        })
        
        focusLine(idx - 1, cursorPos)
        return
      }
    }

    if (key === 'ArrowUp' && ta.selectionStart === 0) {
      if (idx > 0) {
        e.preventDefault()
        focusLine(idx - 1)
      }
      return
    }

    if (key === 'ArrowDown' && ta.selectionStart === ta.value.length) {
      if (idx < lines.length - 1) {
        e.preventDefault()
        focusLine(idx + 1, 0)
      }
      return
    }
  }

  const handleChange = (idx: number, value: string) => {
    let detectedType: LineType | null = null
    let processedValue = value

    if (/^(INT\.|EXT\.|INT\/EXT\.|I\/E\.)\s*/i.test(value) && lines[idx].type !== 'scene') {
      detectedType = 'scene'
      processedValue = value.toUpperCase()
    }
    else if (/\s*TO:$/i.test(value) && lines[idx].type !== 'transition') {
      detectedType = 'transition'
      processedValue = value.toUpperCase()
    }

    if (detectedType) {
      updateLine(idx, { text: processedValue, type: detectedType })
    } else {
      if (lines[idx].type === 'scene' || lines[idx].type === 'transition') {
        updateLine(idx, { text: value.toUpperCase() })
      } else {
        updateLine(idx, { text: value })
      }
    }
  }

  const autoResize = (el: HTMLTextAreaElement | null) => {
    if (el) {
      el.style.height = 'auto'
      el.style.height = `${el.scrollHeight}px`
    }
  }

  // Check if a line is right after a page break
  const isPageBreak = (idx: number) => pageBreaks.includes(idx - 1)
  
  // Get page number for a line index
  const getPageNumber = (idx: number): number => {
    let page = 1
    for (const breakIdx of pageBreaks) {
      if (breakIdx < idx) page++
      else break
    }
    return page
  }

  return (
    <div className="screenplay-editor flex h-full">
      {/* Left Sidebar - Page Navigation */}
      {showNav && (
        <div className="w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200 dark:border-slate-700">
            <input
              type="text"
              placeholder="Search script..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <select
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value as LineType | 'all')}
              className="w-full mt-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200"
            >
              <option value="all">All Types</option>
              {LINE_TYPES.map(type => (
                <option key={type} value={type}>{TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>
          
          {/* Search Results */}
          {searchQuery && (
            <div className="flex-1 overflow-y-auto border-b border-gray-200 dark:border-slate-700">
              <div className="p-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
              {searchResults.slice(0, 50).map(({ line, index }) => (
                <button
                  key={line.id}
                  onClick={() => scrollToLine(index)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800"
                >
                  <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
                    p{getPageNumber(index)}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 truncate block">
                    {line.text.slice(0, 40)}{line.text.length > 40 ? '...' : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
          
          {/* Page Navigator */}
          {!searchQuery && (
            <>
              <div className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 uppercase tracking-wide">
                Pages ({totalPages})
              </div>
              <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-slate-700">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => scrollToPage(page)}
                    className="w-8 h-8 text-sm font-medium rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {page}
                  </button>
                ))}
              </div>
              
              {/* Scene Navigator */}
              <div className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 uppercase tracking-wide">
                Scenes ({sceneList.length})
              </div>
              <div className="flex-1 overflow-y-auto">
                {sceneList.map(({ index, text, page }) => (
                  <button
                    key={index}
                    onClick={() => scrollToLine(index)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-slate-800 border-b border-gray-100 dark:border-slate-800 transition-colors"
                  >
                    <span className="text-xs text-blue-500 dark:text-blue-400 mr-2">
                      p{page}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 truncate block text-xs">
                      {text}
                    </span>
                  </button>
                ))}
                {sceneList.length === 0 && (
                  <div className="p-3 text-sm text-gray-400 dark:text-gray-500 italic">
                    No scenes yet
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 overflow-hidden">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 px-4 py-2 flex items-center gap-2 text-sm">
          <button
            onClick={() => setShowNav(!showNav)}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-500 dark:text-gray-400 transition-colors"
            title={showNav ? 'Hide navigation' : 'Show navigation'}
          >
            {showNav ? '◀' : '▶'}
          </button>
          <span className="text-gray-500 dark:text-gray-400 mr-2">Type:</span>
          {focusedIdx !== null && (
            <>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {TYPE_LABELS[lines[focusedIdx]?.type] || 'ACTION'}
              </span>
              <span className="text-gray-400 dark:text-gray-500 ml-4">
                TAB to cycle • ENTER for new line
              </span>
              <span className="ml-auto text-gray-400 dark:text-gray-500">
                Page {getPageNumber(focusedIdx)} of {totalPages}
              </span>
            </>
          )}
          {focusedIdx === null && (
            <span className="text-gray-400 dark:text-gray-500">Click a line to edit</span>
          )}
        </div>

        {/* Editor Content */}
        <div 
          ref={editorRef}
          className="flex-1 overflow-y-auto p-8 font-mono text-base"
          style={{ fontFamily: "'Courier New', Courier, monospace" }}
        >
          {lines.map((line, i) => {
            const prevType = i > 0 ? lines[i - 1].type : null
            const showPageBreak = isPageBreak(i)
            const pageNum = getPageNumber(i)
            
            return (
              <div key={line.id}>
                {/* Page Break Indicator */}
                {showPageBreak && (
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-300 dark:border-slate-600"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-xs font-medium text-gray-500 dark:text-gray-400 rounded-full">
                        Page {pageNum}
                      </span>
                    </div>
                  </div>
                )}
                
                <div
                  className={`${getContainerStyles(line.type)} ${getVerticalSpacing(line.type, prevType)} group`}
                >
                  {/* Type indicator on hover/focus */}
                  <div className={`
                    absolute -left-20 top-0 text-xs text-gray-400 dark:text-gray-500 
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                    ${focusedIdx === i ? 'opacity-100' : ''}
                  `}>
                    {TYPE_LABELS[line.type]}
                  </div>
                  
                  <textarea
                    ref={el => {
                      inputRefs.current[i] = el
                      autoResize(el)
                    }}
                    className={getLineStyles(line.type)}
                    value={line.text}
                    placeholder={focusedIdx === i ? `Enter ${TYPE_LABELS[line.type].toLowerCase()}...` : ''}
                    onChange={e => {
                      handleChange(i, e.target.value)
                      autoResize(e.target)
                    }}
                    onKeyDown={e => handleKeyDown(e, i)}
                    onFocus={() => setFocusedIdx(i)}
                    onBlur={() => setFocusedIdx(null)}
                    rows={1}
                    spellCheck={true}
                  />
                </div>
              </div>
            )
          })}
          
          {/* Click to add new line at bottom */}
          <div 
            className="h-32 cursor-text"
            onClick={() => {
              const lastType = lines[lines.length - 1]?.type || 'action'
              const newLine: Line = {
                id: uuidv4(),
                text: '',
                type: getNextTypeAfterEnter(lastType),
              }
              updateLines(ls => [...ls, newLine])
              focusLine(lines.length, 0)
            }}
          />
        </div>
      </div>
    </div>
  )
}
