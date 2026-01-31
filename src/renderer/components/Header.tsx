import { useTheme } from '../lib/useTheme'

export default function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 bg-white text-black dark:bg-slate-800 dark:text-slate-50 shadow-md transition-colors">
      <h1 className="text-xl font-bold">🎬 Hazon</h1>

      <button
        onClick={toggleTheme}
        className="bg-gray-200 dark:bg-gray-700 text-black dark:text-slate-50 px-3 py-1 rounded text-sm shadow-sm hover:dark:bg-slate-700 transition-colors"
      >
        {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
      </button>
    </header>
  )
}