import clsx from 'clsx'

const MAP: Record<string, { cls: string; dot: string; label: string }> = {
  running:   { cls: 'badge-running',   dot: 'bg-brand-400',   label: 'Running' },
  pending:   { cls: 'badge-pending',   dot: 'bg-amber-400',   label: 'Pending' },
  completed: { cls: 'badge-completed', dot: 'bg-emerald-400', label: 'Completed' },
  failed:    { cls: 'badge-failed',    dot: 'bg-red-400',     label: 'Failed' },
  paused:    { cls: 'badge-paused',    dot: 'bg-slate-400',   label: 'Paused' },
  cancelled: { cls: 'badge-cancelled', dot: 'bg-slate-500',   label: 'Cancelled' },
}

export default function StatusBadge({ status, animated }: { status: string; animated?: boolean }) {
  const m = MAP[status] ?? { cls: 'badge bg-slate-700 text-slate-400 border-slate-600', dot: 'bg-slate-400', label: status }
  return (
    <span className={m.cls}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', m.dot, animated && 'animate-pulse-slow')} />
      {m.label}
    </span>
  )
}
