import { motion } from 'framer-motion'
import Layout from '../components/Layout'
import { useNavigate } from 'react-router-dom' // or your routing lib
import { useState } from 'react'
import { createPortal } from 'react-dom'
import Recents from '../components/Recents'
import NewScriptModal from '../components/NewScriptModal'

export default function LandingPage() {
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [allScriptsOpen, setAllScriptsOpen] = useState(false)

  const handleCreate = async (data: { title: string; description: string; logline?: string; genre?: string; author?: string }) => {
    // call Electron API
    const script = await window.api.scripts.create(data)
    setModalOpen(false)
    navigate(`/script/${script.id}`)
  }

  return (
    <Layout>
      <div className="h-full flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg text-center space-y-6">
          <motion.h2
            className="text-2xl font-semibold flex items-center justify-center gap-2 text-black dark:text-slate-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            🎬 <span>Hazon</span>
          </motion.h2>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <button
              onClick={() => setModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
              data-testid="new-script-btn"
            >
              Start New Script
            </button>

            <button 
              onClick={() => setAllScriptsOpen(true)}
              className="w-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 hover:dark:bg-slate-700 dark:text-slate-50 text-black py-2 rounded transition-colors"
            >
              Open Existing Script
            </button>
          </motion.div>

          <motion.div
            className="mt-8 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-slate-50 py-3 px-4 rounded shadow-sm transition-colors"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <Recents limit={3} />
          </motion.div>
        </div>
      </div>

      <NewScriptModal
        isOpen={modalOpen}
        onCreate={handleCreate}
        onClose={() => setModalOpen(false)}
      />

      {/* All Scripts Modal */}
      {allScriptsOpen && createPortal(
        <div 
          className="fixed inset-0 flex items-center justify-center"
          style={{ zIndex: 9999 }}
        >
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setAllScriptsOpen(false)}
          />
          <div 
            className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                📂 All Scripts
              </h2>
              <button
                onClick={() => setAllScriptsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Recents showTitle={false} />
            </div>
          </div>
        </div>,
        document.body
      )}
    </Layout>
  )
}