import { useQuery } from '@tanstack/react-query'
import { statsApi, jobsApi } from '../lib/api'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, Globe, FileText, Briefcase, TrendingUp, Zap } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'
import StatusBadge from '../components/ui/StatusBadge'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function fmtBytes(b: number) {
  if (b >= 1_073_741_824) return (b / 1_073_741_824).toFixed(2) + ' GB'
  if (b >= 1_048_576)     return (b / 1_048_576).toFixed(1) + ' MB'
  if (b >= 1_024)         return (b / 1_024).toFixed(1) + ' KB'
  return b + ' B'
}

export default function Dashboard() {
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: () => statsApi.get().then(r => r.data), refetchInterval: 10_000 })
  const { data: jobs }  = useQuery({ queryKey: ['jobs', 'recent'], queryFn: () => jobsApi.list({ limit: 8 }).then(r => r.data), refetchInterval: 10_000 })

  const statCards = [
    { label: 'Total Jobs',     value: fmt(stats?.total_jobs ?? 0),           icon: Briefcase,  color: 'text-brand-400' },
    { label: 'Active Now',     value: fmt(stats?.active_jobs ?? 0),           icon: Activity,   color: 'text-emerald-400' },
    { label: 'Pages Crawled',  value: fmt(stats?.total_pages_crawled ?? 0),   icon: FileText,   color: 'text-violet-400' },
    { label: 'Domains',        value: fmt(stats?.total_domains ?? 0),          icon: Globe,      color: 'text-amber-400' },
    { label: 'Data Downloaded',value: fmtBytes(stats?.total_bytes_downloaded ?? 0), icon: TrendingUp, color: 'text-cyan-400' },
    { label: 'Jobs Today',     value: fmt(stats?.jobs_today ?? 0),             icon: Zap,        color: 'text-pink-400' },
  ]

  // Mock sparkline data (replace with real time-series from DB)
  const sparkData = Array.from({ length: 14 }, (_, i) => ({
    day: `D${i + 1}`,
    pages: Math.floor(Math.random() * 5000 + 500),
  }))

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Real-time overview of your crawler</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</span>
              <Icon size={15} className={color} />
            </div>
            <p className={`text-2xl font-semibold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <h2 className="text-sm font-medium text-slate-300 mb-4">Pages crawled — last 14 days</h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={fmt} />
            <Tooltip
              contentStyle={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#38bdf8' }}
            />
            <Area type="monotone" dataKey="pages" stroke="#0ea5e9" strokeWidth={2} fill="url(#grad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-slate-300">Recent Jobs</h2>
          <Link to="/jobs" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-surface-border">
                <th className="pb-2 text-xs text-slate-500 font-medium">Domain</th>
                <th className="pb-2 text-xs text-slate-500 font-medium">Status</th>
                <th className="pb-2 text-xs text-slate-500 font-medium">Pages</th>
                <th className="pb-2 text-xs text-slate-500 font-medium">Started</th>
              </tr>
            </thead>
            <tbody>
              {(jobs || []).map((job: any) => (
                <tr key={job.id} className="table-row">
                  <td className="py-2.5 pr-4">
                    <Link to={`/jobs/${job.id}`} className="text-slate-200 hover:text-brand-400 font-mono text-xs transition-colors">
                      {job.domain.replace(/^https?:\/\//, '')}
                    </Link>
                  </td>
                  <td className="py-2.5 pr-4"><StatusBadge status={job.status} /></td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-slate-400">{fmt(job.pages_crawled)}</td>
                  <td className="py-2.5 text-xs text-slate-500">
                    {job.created_at ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true }) : '—'}
                  </td>
                </tr>
              ))}
              {!jobs?.length && (
                <tr><td colSpan={4} className="py-8 text-center text-slate-600 text-sm">No jobs yet. <Link to="/jobs/new" className="text-brand-400">Start your first crawl →</Link></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
