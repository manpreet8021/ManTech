const STATUS_STYLES = {
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  processing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  pending: 'bg-slate-100 text-slate-600 ring-slate-500/20',
  failed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const STATUS_LABELS = {
  ready: 'Ready',
  processing: 'Processing',
  pending: 'Pending',
  failed: 'Failed',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending
  const label = STATUS_LABELS[status] ?? status

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {status === 'processing' && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
      )}
      {label}
    </span>
  )
}
