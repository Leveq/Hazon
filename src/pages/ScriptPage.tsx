// src/pages/ScriptPage.tsx
import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback, useMemo } from 'react'
import ScriptEditor from '../components/ScriptEditor'
import CharactersPanel from '../components/CharactersPanel'
import LocationsPanel from '../components/LocationsPanel'
import NotesPanel from '../components/NotesPanel'
import { calculatePageStats, formatPageCount, formatRuntime } from '../lib/pageCount'
import type { Script, Line } from '../types/models'

type SidebarTab = 'characters' | 'locations' | 'notes'

export default function ScriptPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [script, setScript] = useState<Script | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState<SidebarTab>('characters')

  useEffect(() => {
    ;(async () => {
      if (!id) {
        setLoading(false)
        return
      }
      const s = await window.api.getScript(id)
      if (s) setScript(s)
      setLoading(false)
    })()
  }, [id])

  const handleSave = useCallback(async (updatedLines: Line[]) => {
    if (!script) return
    const updated = await window.api.updateScript({
      ...script,
      lines: updatedLines,
      updatedAt: new Date().toISOString(),
    })
    if (updated) {
      setScript(prev => prev ? { ...prev, lines: updatedLines, updatedAt: updated.updatedAt } : null)
    }
  }, [script?.id])

  const handleDeleteScript = async () => {
    if (!script) return
    if (!confirm(`Delete "${script.title}"? This cannot be undone.`)) return
    
    const success = await window.api.scripts.delete(script.id)
    if (success) {
      navigate('/')
    }
  }

  // Calculate page stats
  const pageStats = useMemo(() => {
    return calculatePageStats(script?.lines || [])
  }, [script?.lines])

  if (loading) return <div className="p-6 text-gray-600 dark:text-gray-300">Loading…</div>
  if (!script) return <div className="p-6 text-gray-600 dark:text-gray-300">Script not found.</div>

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 transition-colors flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              📝 {script.title || 'Untitled'}
            </h1>
            {script.logline && (
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                {script.logline}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Page Stats */}
          <div className="flex items-center gap-3 text-sm">
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-medium">
              📄 {formatPageCount(pageStats)}
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">
              🎬 {formatRuntime(pageStats.estimatedMinutes)}
            </span>
            <span className="text-gray-400 dark:text-gray-500" title={`${pageStats.wordCount} words`}>
              {pageStats.wordCount.toLocaleString()} words
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Saved {new Date(script.updatedAt).toLocaleTimeString()}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          >
            {sidebarOpen ? '◀️' : '▶️'}
          </button>
          <button
            onClick={handleDeleteScript}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete script"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <main className={`flex-1 overflow-hidden transition-all ${sidebarOpen ? 'mr-80' : ''}`}>
          <ScriptEditor initialLines={script.lines} onSave={handleSave} />
        </main>

        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-80 fixed right-0 top-[57px] bottom-0 bg-gray-50 dark:bg-slate-800 border-l border-gray-200 dark:border-slate-700 flex flex-col overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <button
                onClick={() => setActiveTab('characters')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'characters'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50 dark:bg-slate-700'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                👥 Characters
              </button>
              <button
                onClick={() => setActiveTab('locations')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'locations'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50 dark:bg-slate-700'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                📍 Locations
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'notes'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-gray-50 dark:bg-slate-700'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                📝 Notes
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-800">
              {activeTab === 'characters' && <CharactersPanel scriptId={script.id} />}
              {activeTab === 'locations' && <LocationsPanel scriptId={script.id} />}
              {activeTab === 'notes' && <NotesPanel scriptId={script.id} />}
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}