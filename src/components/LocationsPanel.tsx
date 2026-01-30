// src/components/LocationsPanel.tsx
import { useState, useEffect } from 'react'
import type { Location, CreateLocationInput } from '../types/models'

interface Props {
  scriptId: string
}

const TYPE_OPTIONS = [
  { value: 'INT', label: 'INT (Interior)' },
  { value: 'EXT', label: 'EXT (Exterior)' },
  { value: 'INT/EXT', label: 'INT/EXT' },
] as const

const TIME_OPTIONS = ['DAY', 'NIGHT', 'DAWN', 'DUSK', 'CONTINUOUS', 'LATER', 'MOMENTS LATER']

export default function LocationsPanel({ scriptId }: Props) {
  const [locations, setLocations] = useState<Location[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState<Partial<CreateLocationInput>>({
    name: '',
    type: 'INT',
    description: '',
    timeOfDay: 'DAY',
  })

  useEffect(() => {
    loadLocations()
  }, [scriptId])

  const loadLocations = async () => {
    setLoading(true)
    const locs = await window.api.locations.getByScript(scriptId)
    setLocations(locs)
    setLoading(false)
  }

  const resetForm = () => {
    setFormData({ name: '', type: 'INT', description: '', timeOfDay: 'DAY' })
    setIsAdding(false)
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) return

    if (editingId) {
      const updated = await window.api.locations.update(editingId, formData)
      if (updated) {
        setLocations(locs => locs.map(l => l.id === editingId ? updated : l))
      }
    } else {
      const newLoc = await window.api.locations.create({
        scriptId,
        name: formData.name,
        type: formData.type || 'INT',
        ...formData,
      } as CreateLocationInput)
      setLocations(locs => [...locs, newLoc])
    }
    resetForm()
  }

  const handleEdit = (loc: Location) => {
    setFormData({
      name: loc.name,
      type: loc.type,
      description: loc.description,
      timeOfDay: loc.timeOfDay,
      notes: loc.notes,
    })
    setEditingId(loc.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this location?')) return
    const success = await window.api.locations.delete(id)
    if (success) {
      setLocations(locs => locs.filter(l => l.id !== id))
    }
  }

  // Generate scene heading from location
  const getSceneHeading = (loc: Location) => {
    return `${loc.type}. ${loc.name.toUpperCase()}${loc.timeOfDay ? ` - ${loc.timeOfDay}` : ''}`
  }

  if (loading) {
    return <div className="p-4 text-gray-500">Loading locations...</div>
  }

  return (
    <div className="locations-panel">
      <div className="px-4 py-3 bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600 flex items-center justify-between">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">
          📍 Locations ({locations.length})
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
              placeholder="Location name *"
              value={formData.name || ''}
              onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
              className="col-span-2 px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
              autoFocus
            />
            <select
              value={formData.type || 'INT'}
              onChange={e => setFormData(f => ({ ...f, type: e.target.value as Location['type'] }))}
              className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={formData.timeOfDay || ''}
              onChange={e => setFormData(f => ({ ...f, timeOfDay: e.target.value }))}
              className="px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            >
              <option value="">Time of day...</option>
              {TIME_OPTIONS.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          
          {/* Preview */}
          {formData.name && (
            <div className="text-sm font-mono bg-gray-100 dark:bg-slate-900 p-2 rounded text-gray-700 dark:text-gray-300">
              Preview: {formData.type}. {formData.name.toUpperCase()}{formData.timeOfDay ? ` - ${formData.timeOfDay}` : ''}
            </div>
          )}

          <textarea
            placeholder="Description (set design notes, atmosphere, etc.)"
            value={formData.description || ''}
            onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
            className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
            rows={2}
          />
          <textarea
            placeholder="Notes"
            value={formData.notes || ''}
            onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
            className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600 dark:text-white resize-none"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
            >
              {editingId ? 'Update' : 'Add Location'}
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

      {/* Location List */}
      <div className="max-h-96 overflow-y-auto">
        {locations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No locations yet. Add your first location!
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-slate-700">
            {locations.map(loc => (
              <li
                key={loc.id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-bold text-gray-800 dark:text-gray-100">
                      {getSceneHeading(loc)}
                    </div>
                    {loc.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                        {loc.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(loc)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(loc.id)}
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
