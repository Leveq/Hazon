import Header from './Header'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen transition-colors duration-300 bg-white text-black dark:bg-slate-900 dark:text-slate-50">
      <Header />
      <main>{children}</main>
    </div>
  )
}