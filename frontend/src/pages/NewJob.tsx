import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { jobsApi } from '../lib/api'
import { ArrowLeft, Play, Globe, Settings, Filter, Clock } from 'lucide-react'

export default function NewJob() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState<'basic'|'advanced'|'schedule'>('basic')
  const [form, setForm] = useState({
    domain: '',
    name: '',
    mode: 'auto',
    max_pages: '',
    crawl_delay: '1.0',
    max_depth: '',
    follow_external_links: false,
    respect_robots_txt: true,
    include_patterns: '',
    exclude_patterns: '',
    schedule_cron: '',
    tags: '',
  })

  const create = useMutation({
    mutationFn: (data: any) => jobsApi.create(data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      navigate(`/jobs/${res.data.id}`)
    },
  })

  function set(k: string, v: any) { setForm(f => ({ ...f, [k]: v })) }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const payload: any = {
      domain: form.domain,
      name: form.name || undefined,
      mode: form.mode,
      max_pages: form.max_pages ? parseInt(form.max_pages) : undefined,
      crawl_delay: parseFloat(form.crawl_delay) || 1.0,
      max_depth: form.max_depth ? parseInt(form.max_depth) : undefined,
      follow_external_links: form.follow_external_links,
      respect_robots_txt: form.respect_robots_txt,
      include_patterns: form.include_patterns ? form.include_patterns.split('\n').filter(Boolean) : undefined,
      exclude_patterns: form.exclude_patterns ? form.exclude_patterns.split('\n').filter(Boolean) : undefined,
      schedule_cron: form.schedule_cron || undefined,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
    }
    create.mutate(payload)
  }

  const tabs = [
    { id: 'basic',    label: 'Basic',    icon: Globe },
    { id: 'advanced', label: 'Advanced', icon: Settings },
    { id: 'schedule', label: 'Schedule', icon: Clock },
  ]

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">New Crawl Job</h1>
          <p className="text-sm text-slate-500">Configure and launch a domain crawl</p>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-muted p-1 rounded-lg w-fit">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id as any)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === id ? 'bg-surface-card text-slate-100 shadow-sm' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* Basic tab */}
        {tab === 'basic' && (
          <div className="card space-y-4">
            <div>
              <label className="label">Domain URL *</label>
              <input className="input font-mono" required placeholder="https://example.com" value={form.domain} onChange={e => set('domain', e.target.value)} />
              <p className="text-xs text-slate-600 mt-1">The crawler will discover and crawl all paths under this domain automatically.</p>
            </div>
            <div>
              <label className="label">Job Name (optional)</label>
              <input className="input" placeholder="My first crawl" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="label">Crawl Mode</label>
              <select className="input" value={form.mode} onChange={e => set('mode', e.target.value)}>
                <option value="auto">Auto (detect static vs JS-rendered)</option>
                <option value="static">Static only — Scrapy (fast)</option>
                <option value="dynamic">Dynamic — Playwright (JS sites)</option>
              </select>
            </div>
            <div>
              <label className="label">Tags (comma-separated)</label>
              <input className="input" placeholder="seo, blog, ecommerce" value={form.tags} onChange={e => set('tags', e.target.value)} />
            </div>
          </div>
        )}

        {/* Advanced tab */}
        {tab === 'advanced' && (
          <div className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Max pages</label>
                <input className="input" type="number" placeholder="10000" value={form.max_pages} onChange={e => set('max_pages', e.target.value)} />
              </div>
              <div>
                <label className="label">Max depth</label>
                <input className="input" type="number" placeholder="Unlimited" value={form.max_depth} onChange={e => set('max_depth', e.target.value)} />
              </div>
              <div>
                <label className="label">Crawl delay (seconds)</label>
                <input className="input" type="number" step="0.1" min="0.5" placeholder="1.0" value={form.crawl_delay} onChange={e => set('crawl_delay', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.respect_robots_txt} onChange={e => set('respect_robots_txt', e.target.checked)} />
                <span className="text-sm text-slate-300">Respect robots.txt</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded" checked={form.follow_external_links} onChange={e => set('follow_external_links', e.target.checked)} />
                <span className="text-sm text-slate-300">Follow external links</span>
              </label>
            </div>
            <div>
              <label className="label">Include URL patterns (one regex per line)</label>
              <textarea className="input h-20 font-mono text-xs" placeholder="/blog/.*&#10;/products/.*" value={form.include_patterns} onChange={e => set('include_patterns', e.target.value)} />
            </div>
            <div>
              <label className="label">Exclude URL patterns (one regex per line)</label>
              <textarea className="input h-20 font-mono text-xs" placeholder="/admin/.*&#10;/login" value={form.exclude_patterns} onChange={e => set('exclude_patterns', e.target.value)} />
            </div>
          </div>
        )}

        {/* Schedule tab */}
        {tab === 'schedule' && (
          <div className="card space-y-4">
            <div>
              <label className="label">Cron Schedule (optional)</label>
              <input className="input font-mono" placeholder="0 2 * * *  (daily at 2am)" value={form.schedule_cron} onChange={e => set('schedule_cron', e.target.value)} />
              <p className="text-xs text-slate-600 mt-1.5">Leave empty to run once immediately. Use standard cron syntax for recurring crawls.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                ['Every hour',    '0 * * * *'],
                ['Daily at 2am',  '0 2 * * *'],
                ['Weekly Mon',    '0 0 * * 1'],
                ['Monthly 1st',   '0 0 1 * *'],
              ].map(([label, cron]) => (
                <button key={cron} type="button" onClick={() => set('schedule_cron', cron)}
                  className="text-left px-3 py-2 rounded-lg border border-surface-border hover:border-brand-500/50 hover:bg-brand-500/5 text-slate-400 hover:text-slate-200 transition-colors font-mono">
                  <span className="block text-brand-400">{cron}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3">
          <button type="submit" disabled={create.isPending} className="btn-primary px-6">
            <Play size={14} />
            {create.isPending ? 'Starting...' : 'Launch Crawl'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
        </div>

        {create.isError && (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 px-4 py-2 rounded-lg">
            Failed to create job. Check your domain URL and try again.
          </p>
        )}
      </form>
    </div>
  )
}
