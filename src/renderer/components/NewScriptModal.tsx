import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { CreateScriptInput } from '../../shared/types'

interface Props {
    isOpen: boolean
    onCreate: (data: CreateScriptInput) => void | Promise<void>
    onClose: () => void
}

const GENRE_OPTIONS = [
    'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 
    'Sci-Fi', 'Thriller', 'Documentary', 'Animation', 'Other'
]

export default function NewScriptModal({ isOpen, onCreate, onClose }: Props) {
    const [title, setTitle] = useState('')
    const [logline, setLogline] = useState('')
    const [genre, setGenre] = useState('')
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('')

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        onCreate({
            title: title.trim() || 'Untitled',
            description,
            logline: logline || undefined,
            genre: genre || undefined,
            author: author || undefined,
        })
        // Reset form
        setTitle('')
        setLogline('')
        setGenre('')
        setAuthor('')
        setDescription('')
    }

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEsc)
            return () => document.removeEventListener('keydown', handleEsc)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const modalContent = (
        <div 
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 9999, pointerEvents: 'auto' }}
        >
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
                style={{ pointerEvents: 'auto' }}
            />
            
            {/* Modal */}
            <form 
                onSubmit={handleCreate}
                className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-lg mx-4"
                onClick={e => e.stopPropagation()}
                style={{ pointerEvents: 'auto' }}
            >
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
                    📄 New Script
                </h2>

                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="script-title" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Title *
                        </label>
                        <input
                            id="script-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="My Great Screenplay"
                            autoFocus
                        />
                    </div>

                    {/* Logline */}
                    <div>
                        <label htmlFor="script-logline" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Logline <span className="text-gray-400 text-sm font-normal">(one sentence summary)</span>
                        </label>
                        <input
                            id="script-logline"
                            type="text"
                            value={logline}
                            onChange={e => setLogline(e.target.value)}
                            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="When a... must... or else..."
                        />
                    </div>

                    {/* Genre and Author row */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="script-genre" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                Genre
                            </label>
                            <select
                                id="script-genre"
                                value={genre}
                                onChange={e => setGenre(e.target.value)}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select genre...</option>
                                {GENRE_OPTIONS.map(g => (
                                    <option key={g} value={g}>{g}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="script-author" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                                Author
                            </label>
                            <input
                                id="script-author"
                                type="text"
                                value={author}
                                onChange={e => setAuthor(e.target.value)}
                                className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="script-notes" className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                            Notes
                        </label>
                        <textarea
                            id="script-notes"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="block w-full px-3 py-2 h-20 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            placeholder="Any additional notes about this project..."
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                        Create Script
                    </button>
                </div>
            </form>
        </div>
    )

    // Use portal to render outside React tree
    return createPortal(modalContent, document.body)
}