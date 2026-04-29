import { useQuery } from '@tanstack/react-query'
import { domainsApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import { Globe, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Domains() {
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['domains'],
    queryFn: () => domainsApi.list().then(r => r.data),
    staleTime: 30_000,
  })

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Domains</h1>
          <p className="text-sm text-slate-500 mt-0.5">{domains.length} domains crawled</p>
        </div>
        <Link to="/jobs/new" className="btn-primary">
          <Plus size={15} /> Crawl new domain
        </Link>
      </div>

      {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}

      <div className="grid gap-3">
        {domains.map((d: any) => (
          <div key={d.domain} className="card flex items-center gap-4 hover:border-brand-500/30 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-brand-600/15 border border-brand-600/20 flex items-center justify-center flex-shrink-0">
              <Globe size={16} className="text-brand-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-slate-200 truncate">
                {d.domain.replace(/^https?:\/\//, '')}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {d.total_jobs} job{d.total_jobs !== 1 ? 's' : ''}
                {d.last_crawled && ` · last crawled ${formatDistanceToNow(new Date(d.last_crawled), { addSuffix: true })}`}
              </p>
            </div>
            <Link
              to={`/jobs/new?domain=${encodeURIComponent(d.domain)}`}
              className="btn-ghost text-xs flex-shrink-0"
            >
              Re-crawl
            </Link>
          </div>
        ))}
        {!isLoading && domains.length === 0 && (
          <div className="card text-center py-10">
            <Globe size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No domains crawled yet.</p>
            <Link to="/jobs/new" className="btn-primary mt-4 inline-flex">Start crawling</Link>
          </div>
        )}
      </div>
    </div>
  )
}
