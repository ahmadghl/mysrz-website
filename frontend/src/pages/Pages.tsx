import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { pagesApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { Search, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Pages() {
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [jobId, setJobId]       = useState('')

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ['pages', search, status, jobId],
    queryFn: () => pagesApi.list({
      search: search || undefined,
      status_code: status ? parseInt(status) : undefined,
      job_id: jobId || undefined,
      limit: 200,
    }).then(r => r.data),
    staleTime: 15_000,
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Pages</h1>
        <p className="text-sm text-slate-500 mt-0.5">Browse all crawled pages across all jobs</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            className="input pl-9 w-72"
            placeholder="Search by URL..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-44" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All status codes</option>
          <option value="200">200 OK</option>
          <option value="301">301 Redirect</option>
          <option value="404">404 Not found</option>
          <option value="500">500 Server error</option>
        </select>
        <input
          className="input w-72 font-mono text-xs"
          placeholder="Filter by job ID..."
          value={jobId}
          onChange={e => setJobId(e.target.value)}
        />
      </div>

      {/* Summary bar */}
      <div className="flex gap-4 text-sm text-slate-500">
        <span>{pages.length} pages</span>
        <span>·</span>
        <span className="text-emerald-400">{pages.filter((p: any) => p.status_code >= 200 && p.status_code < 300).length} OK</span>
        <span>·</span>
        <span className="text-red-400">{pages.filter((p: any) => p.status_code >= 400 || p.error).length} errors</span>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-surface-border">
              <tr>
                {['URL','Title','Status','Words','Links','Depth','Crawled'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-slate-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">Loading...</td></tr>
              )}
              {!isLoading && pages.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-600">
                  No pages found. <Link to="/jobs/new" className="text-brand-400">Start a crawl →</Link>
                </td></tr>
              )}
              {pages.map((p: any) => (
                <tr key={p.id} className="table-row group">
                  <td className="px-4 py-2.5 max-w-[280px]">
                    <div className="flex items-center gap-1.5">
                      <a href={p.url} target="_blank" rel="noopener noreferrer"
                         className="font-mono text-xs text-slate-300 hover:text-brand-400 truncate transition-colors">
                        {p.url}
                      </a>
                      <ExternalLink size={11} className="text-slate-600 group-hover:text-slate-400 flex-shrink-0 transition-colors" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5 max-w-[180px]">
                    <span className="text-xs text-slate-400 truncate block">{p.title || '—'}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`badge ${
                      p.status_code >= 200 && p.status_code < 300 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      p.status_code >= 300 && p.status_code < 400 ? 'bg-amber-500/10  text-amber-400  border-amber-500/20'  :
                      p.status_code >= 400                         ? 'bg-red-500/10    text-red-400    border-red-500/20'    :
                      'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>{p.status_code || '—'}</span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.word_count?.toLocaleString() ?? '—'}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.links_found}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">{p.depth}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500">
                    {p.crawled_at ? formatDistanceToNow(new Date(p.crawled_at), { addSuffix: true }) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
