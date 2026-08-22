import { classNames } from '../../utils/helpers'

export default function StatBadge({ icon, label, value, tone = 'default' }) {
  const tones = {
    default: 'bg-white text-ink-800 border-steel-200',
    brand: 'bg-brand-50 text-brand-800 border-brand-200',
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  }
  return (
    <div className={classNames('flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold', tones[tone])}>
      <span className="text-base leading-none">{icon}</span>
      <span className="tabular-nums font-mono">{value}</span>
      <span className="font-mono text-[10px] uppercase tracking-wide font-monor opacity-70">{label}</span>
    </div>
  )
}
