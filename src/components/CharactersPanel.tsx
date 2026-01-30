// src/components/CharactersPanel.tsx
import { useState, useEffect } from 'react'
import type { Character, CreateCharacterInput } from '../types/models'

interface Props {
  scriptId: string
}

const ROLE_OPTIONS = [
  { value: 'protagonist', label: 'Protagonist' },
  { value: 'antagonist', label: 'Antagonist' },
  { value: 'supporting', label: 'Supporting' },
  { value: 'minor', label: 'Minor' },
  { value: 'extra', label: 'Extra' },
] as const

const GENDER_OPTIONS = [
  { value: '', label: 'Select gender...' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const

const COLOR_OPTIONS = [
  { value: '#ef4444', label: 'Red' },
  { value: '#f97316', label: 'Orange' },
  { value: '#eab308', label: 'Yellow' },
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
] as const

export default function CharactersPanel({ scriptId }: Props) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateCharacterInput>>({
    name: '',
    role: 'supporting',
    description: '',
    bio: '',
  })

  // Load characters
  useEffect(() => {
    loadCharacters()
  }, [scriptId])

  const loadCharacters = async () => {
    setLoading(true)
    const chars = await window.api.characters.getByScript(scriptId)
    setCharacters(chars)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({ name: '', role: 'supporting', description: '', bio: '' })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return

    if (editingId) {
      // Update existing
      const updated = await window.api.characters.update(editingId, formData)
      if (updated) {
        setCharacters(chars => chars.map(c => c.id === editingId ? updated : c))
      }
    } else {
      // Create new
      const newChar = await window.api.characters.create({
        scriptId,
        name: formData.name,
        role: formData.role || 'supporting',
        ...formData,
      } as CreateCharacterInput)
      setCharacters(chars => [...chars, newChar])
    }
    resetForm()
  }

  const handleEdit = (char: Character) => {
    setFormData({
      name: char.name,
      role: char.role,
      age: char.age,
      gender: char.gender,
      description: char.description,
      bio: char.bio,
      arc: char.arc,
      color: char.color,
    })
    setEditingId(char.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this character?')) return
    const success = await window.api.characters.delete(id)
    if (success) {
      setCharacters(chars => chars.filter(c => c.id !== id))
    }
  }

  if (loading) {
    return <div className="p-4 text-gray-500">Loading characters...</div>
  }

  return (
    <div className="characters-panel">
      <div className="px-4 py-3 bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          👥 Characters ({characters.length})
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-200 dark:border-slate-600 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Character name *"
              value={formData.name || ''}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              className="col-span-2 px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              autoFocus
            />
            <select
              value={formData.role || 'supporting'}
              onChange={e => setFormData(f => ({ ...f, role: e.target.value as Character['role'] }))}
              className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              {ROLE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Age (e.g., 30s, teenage)"
              value={formData.age || ''}
              onChange={e => setFormData(f => ({ ...f, age: e.target.value }))}
              className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
            <select
              value={formData.gender || ''}
              onChange={e => setFormData(f => ({ ...f, gender: e.target.value as 'male' | 'female' | undefined || undefined }))}
              className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              {GENDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={formData.color || ''}
              onChange={e => setFormData(f => ({ ...f, color: e.target.value }))}
              className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              style={{ backgroundColor: formData.color || undefined }}
            >
              <option value="">Select color...</option>
              {COLOR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value} style={{ backgroundColor: opt.value }}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Physical description"
            value={formData.description || ''}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
            rows={2}
          />
          <textarea
            placeholder="Bio / Backstory"
            value={formData.bio || ''}
            onChange={e => setFormData(f => ({ ...f, bio: e.target.value }))}
            className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
            rows={2}
          />
          <textarea
            placeholder="Character arc notes"
            value={formData.arc || ''}
            onChange={e => setFormData(f => ({ ...f, arc: e.target.value }))}
            className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              {editingId ? 'Update' : 'Add Character'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 dark:bg-slate-600 hover:bg-gray-300 dark:hover:bg-slate-500 rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Character List */}
      <div className="max-h-96 overflow-y-auto">
        {characters.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No characters yet. Add your first character!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {characters.map(char => (
              <li
                key={char.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Color indicator */}
                  <div
                    className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: char.color || '#6b7280' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {char.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-slate-600 rounded text-gray-600 dark:text-gray-300">
                        {char.role}
                      </span>
                      {char.age && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {char.age}
                        </span>
                      )}
                    </div>
                    {char.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {char.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(char)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(char.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
