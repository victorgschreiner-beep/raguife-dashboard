import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { classNames } from '../../utils/helpers'

export default function CauseNode({ cause, children, onSelect, selected, onAddSub, depth = 0 }) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = children && children.length > 0

  return (
    <div className={depth > 0 ? 'ml-4 mt-1.5 border-l border-dashed border-steel-300 pl-3' : 'mt-1.5'}>
      <div
        onClick={() => onSelect(cause)}
        className={classNames(
          'group flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 cursor-pointer border text-xs font-semibold transition-colors',
          selected?.id === cause.id ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-800 border-steel-200 hover:border-brand-300',
          cause.type === 'causa_raiz' && selected?.id !== cause.id && 'border-red-300 bg-red-50 text-red-700'
        )}
      >
        {hasChildren ? (
          <button onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }} className="shrink-0">
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : <span className="w-3" />}
        <span className="truncate max-w-[160px]">{cause.title}</span>
        {cause.type === 'causa_raiz' && <span className="text-[9px] font-bold shrink-0">🎯 RAIZ</span>}
        {cause.votes > 0 && <span className="text-[9px] font-bold opacity-70 shrink-0">{cause.votes}v</span>}
        <button
          onClick={(e) => { e.stopPropagation(); onAddSub(cause) }}
          className="opacity-0 group-hover:opacity-100 shrink-0 ml-auto"
          title="Criar subcausa"
        >
          <Plus size={12} />
        </button>
      </div>
      {expanded && hasChildren && (
        <div>
          {children}
        </div>
      )}
    </div>
  )
}
