import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { jobsApi, pagesApi, wsUrl } from '../lib/api'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft, Pause, Play, X, Download, Trash2,
  Globe, FileText, AlertTriangle, Clock, Zap, Activity
} from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function fmtBytes(b: number) {
  if (b >= 1_048_576) return (b / 1_048_576).toFixed(1) + ' MB'
  if (b >= 1_024)     return (b / 1_024).toFixed(1) + ' KB'
  return b + ' B'
}

export default function JobDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)

  const [liveLog, setLiveLog] = useState<string[]>([])
  const [liveStats, setLiveStats] = useState<any>(null)
  const [sparkData, setSparkData] = useState<{ t: string; pages: number }[]>([])
  const logRef = useRef<HTMLDivElement>(null)

  const { data: job, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => jobsApi.get(id!).then(r => r.data),
    refetchInterval: job?.status === 'running' ? 5000 : false,
  })

  const { data: pages = [] } = useQuery({
    queryKey: ['pages', id],
    queryFn: () => pagesApi.list({ job_id: id, limit: 100 }).then(r => r.data),
    refetchInterval: job?.status === 'running' ? 8000 : false,
  })

  const pause  = useMutation({ mutationFn: () => jobsApi.pause(id!),  onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }) })
  const resume = useMutation({ mutationFn: () => jobsApi.resume(id!), onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }) })
  const cancel = useMutation({ mutationFn: () => jobsApi.cancel(id!), onSuccess: () => qc.invalidateQueries({ queryKey: ['job', id] }) })
  const del    = useMutation({
    mutationFn: () => jobsApi.delete(id!),
    onSuccess: () => navigate('/jobs'),
  })

  // WebSocket live monitor
  useEffect(() => {
    if (!id || !job || job.status !== 'running') return
    const ws = new WebSocket(wsUrl(id))
    wsRef.current = ws

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'progress') {
        setLiveStats(data)
        setLiveLog(prev => {
          const next = [`[${new Date().toLocaleTimeString()}] ${data.current_url}`, ...prev]
          return next.slice(0, 200)
        })
        setSparkData(prev => {
          const next = [...prev, { t: new Date().toLocaleTimeString(), pages: data.pages_crawled }]
          return next.slice(-30)
        })
        qc.invalidateQueries({ queryKey: ['job', id] })
      }
    }
    ws.onerror = () => ws.close()

    return () => ws.close()
  }, [id, job?.status])

  // Auto-scroll log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = 0
  }, [liveLog])

  function exportCsv() {
    jobsApi.export(id!).then(r => {
      const url = URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `crawl_${job?.domain?.replace(/[^a-z0-9]/gi, '_')}.csv`
      a.click()
    })
  }

  if (isLoading) return <div className="p-6 text-slate-500">Loading...</div>
  if (!job) return <div className="p-6 text-slate-500">Job not found.</div>

  const stats = liveStats || job
  const progress = job.max_pages ? Math.min(100, (stats.pages_crawled / job.max_pages) * 100) : null

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={16} /></button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold text-slate-100 font-mono">
                {job.domain.replace(/^https?:\/\//, '')}
              </h1>
              <StatusBadge status={job.status} animated={job.status === 'running'} />
            </div>
            {job.name && <p className="text-sm text-slate-500 mt-0.5 ml-0">{job.name}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {job.status === 'running'  && <button onClick={() => pause.mutate()}  className="btn-ghost"><Pause size={14} /> Pause</button>}
          {job.status === 'paused'   && <button onClick={() => resume.mutate()} className="btn-ghost"><Play  size={14} /> Resume</button>}
          {['running','pending','paused'].includes(job.status) && (
            <button onClick={() => cancel.mutate()} className="btn-ghost text-amber-400"><X size={14} /> Cancel</button>
          )}
          {job.status === 'completed' && (
            <button onClick={exportCsv} className="btn-primary"><Download size={14} /> Export CSV</button>
          )}
          <button onClick={() => { if (confirm('Delete this job and all pages?')) del.mutate() }} className="btn-danger">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {progress !== null && (
        <div className="card py-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1.5">
            <span>{fmt(stats.pages_crawled)} pages crawled</span>
            <span>{progress.toFixed(1)}% of {fmt(job.max_pages)} limit</span>
          </div>
          <div className="h-1.5 bg-surface-border rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pages crawled', value: fmt(stats.pages_crawled),  icon: FileText,       color: 'text-brand-400' },
          { label: 'Failed',        value: fmt(stats.pages_failed),    icon: AlertTriangle,  color: 'text-red-400' },
          { label: 'Downloaded',    value: fmtBytes(job.bytes_downloaded || 0), icon: Zap,  color: 'text-violet-400' },
          { label: 'Crawl delay',   value: `${job.crawl_delay}s`,      icon: Clock,          color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wide">{label}</span>
              <Icon size={14} className={color} />
            </div>
            <p className={`text-xl font-semibold mt-0.5 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live chart */}
        {sparkData.length > 1 && (
          <div className="card">
            <div className="flex items-center gap-2 mb-3">
              <Activity size={14} className="text-brand-400" />
              <h2 className="text-sm font-medium text-slate-300">Live crawl speed</h2>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={sparkData} margin={{ top: 0, right: 0, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="cgrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} tickFormatter={fmt} />
                <Tooltip contentStyle={{ background: '#161b27', border: '1px solid #1e2535', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="pages" stroke="#0ea5e9" strokeWidth={1.5} fill="url(#cgrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Job config */}
        <div className="card">
          <h2 className="text-sm font-medium text-slate-300 mb-3">Configuration</h2>
          <dl className="space-y-2 text-sm">
            {[
              ['Mode',       job.mode],
              ['Max pages',  job.max_pages ?? 'Unlimited'],
              ['Max depth',  job.max_depth ?? 'Unlimited'],
              ['Robots.txt', job.respect_robots_txt ? 'Respected' : 'Ignored'],
              ['External',   job.follow_external_links ? 'Follow' : 'Stay on domain'],
              ['Schedule',   job.schedule_cron ?? 'One-time'],
              ['Started',    job.started_at ? format(new Date(job.started_at), 'MMM d, HH:mm') : '—'],
              ['Completed',  job.completed_at ? format(new Date(job.completed_at), 'MMM d, HH:mm') : '—'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-slate-500">{k}</dt>
                <dd className="text-slate-300 font-mono text-xs">{String(v)}</dd>
              </div>
            ))}
          </dl>
          {job.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {job.tags.map((t: string) => (
                <span key={t} className="badge bg-slate-700/50 text-slate-400 border border-slate-700">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live log */}
      {job.status === 'running' && (
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
            <h2 className="text-sm font-medium text-slate-300">Live URL log</h2>
            <span className="text-xs text-slate-600 ml-auto">{liveLog.length} entries</span>
          </div>
          <div ref={logRef} className="h-48 overflow-y-auto font-mono text-xs text-slate-400 space-y-0.5 bg-surface p-3 rounded-lg border border-surface-border">
            {liveLog.length === 0 && <p className="text-slate-600">Waiting for crawl data...</p>}
            {liveLog.map((line, i) => (
              <div key={i} className={i === 0 ? 'text-brand-400' : ''}>{line}</div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {job.error_message && (
        <div className="card border-red-900/50 bg-red-900/10">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={14} className="text-red-400" />
            <h2 className="text-sm font-medium text-red-400">Error</h2>
          </div>
          <p className="text-xs font-mono text-red-300">{job.error_message}</p>
        </div>
      )}

      {/* Pages table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-slate-300">Crawled Pages</h2>
          <span className="text-xs text-slate-500">{pages.length} shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-border">
              <tr>
                {['URL','Title','Status','Words','Links','Depth','Load time'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pages.map((p: any) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-2.5 max-w-[240px]">
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                       className="font-mono text-xs text-slate-300 hover:text-brand-400 truncate block transition-colors">
                      {p.url.replace(/^https?:\/\/[^/]+/, '')}
                    </a>
                  </td>
                  <td className="px-4 py-2.5 max-w-[180px]">
                    <span className="text-xs text-slate-400 truncate block">{p.title || '—'}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`badge text-xs ${
                      p.status_code >= 200 && p.status_code < 300 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status_code >= 300 && p.status_code < 400 ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>{p.status_code || '—'}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.word_count ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.links_found}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.depth}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.load_time_ms ? `${p.load_time_ms}ms` : '—'}</td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-600 text-sm">No pages crawled yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
