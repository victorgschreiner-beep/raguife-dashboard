import { CATEGORIES, classNames } from '../../utils/helpers'

const EXTRA = [
  { key: 'sem_classificacao', label: 'Sem classificação', icon: '❔' },
  { key: 'agrupadas', label: 'Agrupadas', icon: '🔗' },
  { key: 'prioritarias', label: 'Prioritárias', icon: '⭐' },
  { key: 'sugestoes_ia', label: 'Sugestões da IA', icon: '🤖' },
]

export default function FilterBar({ active, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
      <Chip active={active === 'todas'} onClick={() => onChange('todas')} icon="🗂️" label="Todas" />
      {CATEGORIES.map((c) => (
        <Chip key={c.key} active={active === c.key} onClick={() => onChange(c.key)} icon={c.icon} label={c.label} />
      ))}
      <div className="w-px h-5 bg-steel-200 mx-1 shrink-0" />
      {EXTRA.map((c) => (
        <Chip key={c.key} active={active === c.key} onClick={() => onChange(c.key)} icon={c.icon} label={c.label} />
      ))}
    </div>
  )
}

function Chip({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors',
        active ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-600 border-steel-200 hover:bg-steel-50'
      )}
    >
      <span>{icon}</span>{label}
    </button>
  )
}
