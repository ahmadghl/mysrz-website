import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '../lib/api'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { Plus, Pause, Play, X, Trash2, Download, Eye } from 'lucide-react'
import StatusBadge from '../components/ui/StatusBadge'
import { useState } from 'react'

function fmt(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export default function Jobs() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ['jobs', statusFilter, search],
    queryFn: () => jobsApi.list({ status: statusFilter || undefined, domain: search || undefined }).then(r => r.data),
    refetchInterval: 8_000,
  })

  const pause  = useMutation({ mutationFn: (id: string) => jobsApi.pause(id),  onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }) })
  const resume = useMutation({ mutationFn: (id: string) => jobsApi.resume(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }) })
  const cancel = useMutation({ mutationFn: (id: string) => jobsApi.cancel(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }) })
  const del    = useMutation({ mutationFn: (id: string) => jobsApi.delete(id), onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }) })

  function exportCsv(id: string, domain: string) {
    jobsApi.export(id).then(r => {
      const url = URL.createObjectURL(new Blob([r.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `crawl_${domain.replace(/[^a-z0-9]/gi, '_')}.csv`
      a.click()
    })
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Crawl Jobs</h1>
          <p className="text-sm text-slate-500 mt-0.5">{jobs.length} jobs</p>
        </div>
        <Link to="/jobs/new" className="btn-primary">
          <Plus size={15} /> New Job
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search domain..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="input max-w-44" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {['pending','running','paused','completed','failed','cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-surface-border">
            <tr className="text-left">
              {['Domain / Name','Status','Pages','Failed','Mode','Created','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-xs text-slate-500 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">Loading...</td></tr>
            )}
            {!isLoading && jobs.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">
                No jobs found. <Link to="/jobs/new" className="text-brand-400">Create one →</Link>
              </td></tr>
            )}
            {jobs.map((job: any) => (
              <tr key={job.id} className="table-row">
                <td className="px-4 py-3">
                  <div className="font-mono text-xs text-slate-200 truncate max-w-[200px]">
                    {job.domain.replace(/^https?:\/\//, '')}
                  </div>
                  {job.name && <div className="text-xs text-slate-500 mt-0.5">{job.name}</div>}
                </td>
                <td className="px-4 py-3"><StatusBadge status={job.status} animated={job.status === 'running'} /></td>
                <td className="px-4 py-3 font-mono text-xs text-slate-300">{fmt(job.pages_crawled)}</td>
                <td className="px-4 py-3 font-mono text-xs text-red-400">{fmt(job.pages_failed)}</td>
                <td className="px-4 py-3">
                  <span className="badge bg-slate-700/50 text-slate-400 border border-slate-700">{job.mode}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">
                  {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link to={`/jobs/${job.id}`} className="btn-ghost px-2 py-1.5" title="View"><Eye size={13} /></Link>
                    {job.status === 'running' && (
                      <button onClick={() => pause.mutate(job.id)} className="btn-ghost px-2 py-1.5" title="Pause"><Pause size={13} /></button>
                    )}
                    {job.status === 'paused' && (
                      <button onClick={() => resume.mutate(job.id)} className="btn-ghost px-2 py-1.5" title="Resume"><Play size={13} /></button>
                    )}
                    {['running','pending','paused'].includes(job.status) && (
                      <button onClick={() => cancel.mutate(job.id)} className="btn-ghost px-2 py-1.5 text-amber-500" title="Cancel"><X size={13} /></button>
                    )}
                    {job.status === 'completed' && (
                      <button onClick={() => exportCsv(job.id, job.domain)} className="btn-ghost px-2 py-1.5 text-emerald-400" title="Export CSV"><Download size={13} /></button>
                    )}
                    <button onClick={() => { if (confirm('Delete this job and all its pages?')) del.mutate(job.id) }} className="btn-ghost px-2 py-1.5 text-red-500" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
