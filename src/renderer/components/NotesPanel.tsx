// src/components/NotesPanel.tsx
import { useState, useEffect } from 'react'
import type { Note, CreateNoteInput, UpdateNoteInput } from '../../shared/types'

interface Props {
  scriptId: string
}

const COLOR_OPTIONS = [
  { value: 'yellow', label: '🟡 Yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700' },
  { value: 'blue', label: '🔵 Blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
  { value: 'green', label: '🟢 Green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700' },
  { value: 'red', label: '🔴 Red', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700' },
  { value: 'purple', label: '🟣 Purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700' },
] as const

type NoteColor = 'yellow' | 'blue' | 'green' | 'red' | 'purple'

function getNoteStyles(color?: NoteColor) {
  const option = COLOR_OPTIONS.find(c => c.value === color) || COLOR_OPTIONS[0]
  return `${option.bg} ${option.border}`
}

export default function NotesPanel({ scriptId }: Props) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState<{
    text: string
    color: NoteColor
  }>({
    text: '',
    color: 'yellow',
  })

  // Load notes
  useEffect(() => {
    loadNotes()
  }, [scriptId])

  const loadNotes = async () => {
    setLoading(true)
    const notesList = await window.api.notes.getByScript(scriptId)
    setNotes(notesList)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({ text: '', color: 'yellow' })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.text.trim()) return

    if (editingId) {
      // Update existing
      const updates: UpdateNoteInput = {
        text: formData.text,
        color: formData.color,
      }
      const updated = await window.api.notes.update(editingId, updates)
      if (updated) {
        setNotes(n => n.map(note => note.id === editingId ? updated : note))
      }
    } else {
      // Create new
      const input: CreateNoteInput = {
        scriptId,
        text: formData.text,
        color: formData.color,
      }
      const newNote = await window.api.notes.create(input)
      setNotes(n => [...n, newNote])
    }
    resetForm()
  }

  const handleEdit = (note: Note) => {
    setFormData({
      text: note.text,
      color: note.color || 'yellow',
    })
    setEditingId(note.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Delete this note?')) {
      const success = await window.api.notes.delete(id)
      if (success) {
        setNotes(n => n.filter(note => note.id !== id))
      }
    }
  }

  if (loading) {
    return <div className="p-4 text-gray-500 dark:text-gray-400">Loading notes...</div>
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
        <span className="font-medium text-gray-700 dark:text-gray-200">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            + Add Note
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-3 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <textarea
            value={formData.text}
            onChange={e => setFormData(f => ({ ...f, text: e.target.value }))}
            placeholder="Write your note..."
            rows={4}
            className="w-full px-3 py-2 border rounded resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            autoFocus
          />
          
          <div className="mt-2">
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Color</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, color: opt.value }))}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    formData.color === opt.value 
                      ? 'scale-110 ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' 
                      : 'hover:scale-105'
                  } ${opt.bg} ${opt.border}`}
                  title={opt.label}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              type="submit"
              disabled={!formData.text.trim()}
              className="flex-1 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {editingId ? 'Update' : 'Add Note'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {notes.length === 0 && !isAdding && (
          <div className="text-center text-gray-400 dark:text-gray-500 py-8">
            <div className="text-4xl mb-2">📝</div>
            <p>No notes yet</p>
            <p className="text-sm">Add notes to track ideas, research, or reminders</p>
          </div>
        )}

        {notes.map(note => (
          <div
            key={note.id}
            className={`p-3 rounded-lg border ${getNoteStyles(note.color)} transition-colors`}
          >
            <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap text-sm">
              {note.text}
            </p>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-600/30">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(note.updatedAt).toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(note)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
