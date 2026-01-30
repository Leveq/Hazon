import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Script } from '../types/models'

interface Props {
  limit?: number
  showTitle?: boolean
}

export default function Recents({ limit, showTitle = true }: Props) {
  const [scripts, setScripts] = useState<Script[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadScripts = async () => {
    try {
      const allScripts = await window.api.scripts.getAll()
      // Sort by updatedAt descending (most recent first)
      const sorted = allScripts.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setScripts(sorted)
    } catch (error) {
      console.error('Failed to load scripts:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadScripts()
  }, [])

  const handleDelete = async (e: React.MouseEvent, scriptId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to delete this script?')) {
      return
    }

    try {
      await window.api.scripts.delete(scriptId)
      setScripts(prev => prev.filter(s => s.id !== scriptId))
    } catch (error) {
      console.error('Failed to delete script:', error)
    }
  }

  const handleOpen = (scriptId: string) => {
    navigate(`/script/${scriptId}`)
  }

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-gray-500 dark:text-gray-400">Loading scripts...</p>
      </div>
    )
  }

  if (scripts.length === 0) {
    return (
      <div className="p-4">
        {showTitle && <h2 className="text-lg font-semibold mb-2 dark:text-white">Recent Scripts</h2>}
        <p className="text-gray-500 dark:text-gray-400">No scripts yet. Create your first one!</p>
      </div>
    )
  }

  const displayedScripts = limit ? scripts.slice(0, limit) : scripts

  return (
    <div className="p-4">
      {showTitle && <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Scripts</h2>}
      <ul className="space-y-2">
        {displayedScripts.map((script) => (
          <li
            key={script.id}
            onClick={() => handleOpen(script.id)}
            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                  {script.title}
                </h3>
                {script.logline && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                    {script.logline}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Updated {new Date(script.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => handleDelete(e, script.id)}
                className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                title="Delete script"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
