import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { targetsApi } from '../lib/api'
import { formatDistanceToNow } from 'date-fns'
import {
  Plus, Trash2, Play, CheckSquare, Square, ToggleLeft,
  ToggleRight, Globe, Clock, Loader2, RefreshCw
} from 'lucide-react'
import clsx from 'clsx'

interface Target {
  id: string
  url: string
  label: string
  enabled: boolean
  crawl_mode: string
  max_pages: number
  last_crawled_at: string | null
  created_at: string
}

export default function Targets() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showForm, setShowForm] = useState(false)
  const [runningNow, setRunningNow] = useState(false)
  const [form, setForm] = useState({ url: '', label: '', crawl_mode: 'auto', max_pages: '5000' })
  const [formError, setFormError] = useState('')

  const { data: targets = [], isLoading } = useQuery<Target[]>({
    queryKey: ['targets'],
    queryFn: () => targetsApi.list().then(r => r.data),
    refetchInterval: 15_000,
  })

  const create = useMutation({
    mutationFn: (data: any) => targetsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['targets'] }); setShowForm(false); setForm({ url: '', label: '', crawl_mode: 'auto', max_pages: '5000' }); setFormError('') },
    onError: (e: any) => setFormError(e.response?.data?.detail || 'Failed to add URL'),
  })

  const del = useMutation({
    mutationFn: (id: string) => targetsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['targets'] }); setSelected(new Set()) },
  })

  const toggle = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      enabled ? targetsApi.enable(id) : targetsApi.disable(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['targets'] }),
  })

  const bulkToggle = useMutation({
    mutationFn: ({ ids, enabled }: { ids: string[]; enabled: boolean }) =>
      targetsApi.bulkToggle(ids, enabled),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['targets'] }); setSelected(new Set()) },
  })

  async function runNow() {
    setRunningNow(true)
    try {
      await targetsApi.runNow()
      qc.invalidateQueries({ queryKey: ['jobs'] })
      alert('Daily crawl started! Check the Jobs page for progress.')
    } catch {
      alert('Failed to start crawl.')
    } finally {
      setRunningNow(false)
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function selectAll() {
    setSelected(prev =>
      prev.size === targets.length ? new Set() : new Set(targets.map(t => t.id))
    )
  }

  function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')
    create.mutate({
      url: form.url.trim(),
      label: form.label.trim() || undefined,
      crawl_mode: form.crawl_mode,
      max_pages: parseInt(form.max_pages) || 5000,
    })
  }

  const allSelected = selected.size === targets.length && targets.length > 0
  const someSelected = selected.size > 0

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">URL Targets</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage the URLs crawled every day. The daily crawl runs at <span className="text-slate-300 font-mono">06:00 UTC</span>.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runNow}
            disabled={runningNow || targets.filter(t => t.enabled).length === 0}
            className="btn-ghost border border-surface-border text-emerald-400 hover:text-emerald-300 disabled:opacity-40"
          >
            {runningNow ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
            Run now
          </button>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary">
            <Plus size={15} /> Add URL
          </button>
        </div>
      </div>

      {/* Add URL form */}
      {showForm && (
        <form onSubmit={submitForm} className="card space-y-4 border-brand-500/30 animate-slide-in">
          <h2 className="text-sm font-medium text-slate-200">Add new URL target</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">URL *</label>
              <input
                className="input font-mono"
                placeholder="https://example.com"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="label">Label (optional)</label>
              <input
                className="input"
                placeholder="My site"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
              />
            </div>
            <div>
              <label className="label">Crawl mode</label>
              <select className="input" value={form.crawl_mode} onChange={e => setForm(f => ({ ...f, crawl_mode: e.target.value }))}>
                <option value="auto">Auto (detect static / JS)</option>
                <option value="static">Static — Scrapy (fast)</option>
                <option value="dynamic">Dynamic — Playwright</option>
              </select>
            </div>
            <div>
              <label className="label">Max pages per crawl</label>
              <input
                className="input"
                type="number"
                min="100"
                max="50000"
                value={form.max_pages}
                onChange={e => setForm(f => ({ ...f, max_pages: e.target.value }))}
              />
            </div>
          </div>
          {formError && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/40 px-3 py-2 rounded-lg">{formError}</p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={create.isPending} className="btn-primary">
              {create.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Add target
            </button>
            <button type="button" onClick={() => { setShowForm(false); setFormError('') }} className="btn-ghost">Cancel</button>
          </div>
        </form>
      )}

      {/* Bulk actions bar */}
      {someSelected && (
        <div className="flex items-center gap-3 bg-brand-600/10 border border-brand-600/20 rounded-xl px-4 py-2.5 animate-slide-in">
          <span className="text-sm text-brand-400 font-medium">{selected.size} selected</span>
          <div className="flex gap-2 ml-auto">
            <button onClick={() => bulkToggle.mutate({ ids: [...selected], enabled: true })} className="btn-ghost text-emerald-400 text-xs">
              <ToggleRight size={14} /> Enable all
            </button>
            <button onClick={() => bulkToggle.mutate({ ids: [...selected], enabled: false })} className="btn-ghost text-slate-400 text-xs">
              <ToggleLeft size={14} /> Disable all
            </button>
            <button onClick={() => { if (confirm(`Delete ${selected.size} targets?`)) [...selected].forEach(id => del.mutate(id)) }} className="btn-danger text-xs">
              <Trash2 size={13} /> Delete
            </button>
            <button onClick={() => setSelected(new Set())} className="btn-ghost text-xs text-slate-500">Clear</button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="flex gap-6 text-sm text-slate-500">
        <span>{targets.length} total</span>
        <span className="text-emerald-400">{targets.filter(t => t.enabled).length} enabled</span>
        <span className="text-slate-600">{targets.filter(t => !t.enabled).length} disabled</span>
      </div>

      {/* Target list */}
      <div className="card p-0 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_120px_100px_120px_80px] items-center px-4 py-2.5 border-b border-surface-border bg-surface-muted/30">
          <button onClick={selectAll} className="text-slate-500 hover:text-slate-300 transition-colors">
            {allSelected ? <CheckSquare size={16} className="text-brand-400" /> : <Square size={16} />}
          </button>
          <span className="text-xs text-slate-500 font-medium">URL / Label</span>
          <span className="text-xs text-slate-500 font-medium">Mode</span>
          <span className="text-xs text-slate-500 font-medium">Max pages</span>
          <span className="text-xs text-slate-500 font-medium">Last crawled</span>
          <span className="text-xs text-slate-500 font-medium">Actions</span>
        </div>

        {isLoading && (
          <div className="px-4 py-10 text-center text-slate-600 text-sm">Loading...</div>
        )}

        {!isLoading && targets.length === 0 && (
          <div className="px-4 py-12 text-center space-y-2">
            <Globe size={32} className="text-slate-700 mx-auto" />
            <p className="text-slate-500 text-sm">No URL targets yet.</p>
            <button onClick={() => setShowForm(true)} className="btn-primary inline-flex mt-2">
              <Plus size={14} /> Add your first URL
            </button>
          </div>
        )}

        {targets.map(target => (
          <div
            key={target.id}
            className={clsx(
              'grid grid-cols-[40px_1fr_120px_100px_120px_80px] items-center px-4 py-3 border-b border-surface-border transition-colors',
              selected.has(target.id) ? 'bg-brand-600/5' : 'hover:bg-surface-muted/40',
              !target.enabled && 'opacity-50'
            )}
          >
            {/* Checkbox */}
            <button onClick={() => toggleSelect(target.id)} className="text-slate-500 hover:text-brand-400 transition-colors">
              {selected.has(target.id)
                ? <CheckSquare size={16} className="text-brand-400" />
                : <Square size={16} />}
            </button>

            {/* URL + label */}
            <div className="min-w-0 pr-4">
              <p className="font-mono text-xs text-slate-200 truncate">
                {target.url.replace(/^https?:\/\//, '')}
              </p>
              {target.label && target.label !== target.url && (
                <p className="text-xs text-slate-500 mt-0.5">{target.label}</p>
              )}
            </div>

            {/* Mode badge */}
            <span className="badge bg-slate-700/50 text-slate-400 border border-slate-700 w-fit">
              {target.crawl_mode}
            </span>

            {/* Max pages */}
            <span className="font-mono text-xs text-slate-400">
              {target.max_pages?.toLocaleString()}
            </span>

            {/* Last crawled */}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              {target.last_crawled_at
                ? <><Clock size={11} />{formatDistanceToNow(new Date(target.last_crawled_at), { addSuffix: true })}</>
                : <span className="text-slate-600">Never</span>
              }
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                title={target.enabled ? 'Disable' : 'Enable'}
                onClick={() => toggle.mutate({ id: target.id, enabled: !target.enabled })}
                className={clsx('p-1.5 rounded-md transition-colors', target.enabled
                  ? 'text-emerald-400 hover:bg-emerald-400/10'
                  : 'text-slate-600 hover:bg-slate-700/40'
                )}
              >
                {target.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              </button>
              <button
                title="Delete"
                onClick={() => { if (confirm('Delete this target?')) del.mutate(target.id) }}
                className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="card border-amber-500/20 bg-amber-500/5 flex gap-3">
        <Clock size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-slate-400">
          <p className="text-amber-400 font-medium mb-0.5">Daily crawl schedule</p>
          <p>All enabled targets are crawled automatically every day at <span className="text-slate-200 font-mono">06:00 UTC</span>. After crawling, each page is chunked and embedded into the vector store so it's immediately available in the RAG chat.</p>
          <p className="mt-1">You can also trigger a manual run at any time using the <span className="text-slate-200">Run now</span> button.</p>
        </div>
      </div>
    </div>
  )
}
