import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Briefcase, FileText, Globe, Plus, LogOut, Activity, Radio, Target, MessageSquare } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import clsx from 'clsx'

const nav = [
  { to: '/',        icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/jobs',    icon: Briefcase,       label: 'Crawl Jobs' },
  { to: '/targets', icon: Target,          label: 'URL Targets' },
  { to: '/pages',   icon: FileText,        label: 'Pages' },
  { to: '/domains', icon: Globe,           label: 'Domains' },
  { to: '/chat',    icon: MessageSquare,   label: 'RAG Chat' },
]

export default function Layout() {
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-surface-card border-r border-surface-border flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <Radio size={14} className="text-white" />
            </div>
            <span className="font-semibold text-slate-100 tracking-tight">WebCrawler</span>
          </div>
        </div>

        {/* New Job button */}
        <div className="px-3 pt-4 pb-2">
          <button onClick={() => navigate('/jobs/new')} className="btn-primary w-full justify-center">
            <Plus size={15} />
            New Crawl Job
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-600/15 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-muted'
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-surface-border pt-3">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="btn-ghost w-full justify-start text-slate-500"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
