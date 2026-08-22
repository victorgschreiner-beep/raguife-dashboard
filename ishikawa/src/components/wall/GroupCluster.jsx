import { useState } from 'react'
import { ChevronDown, ChevronRight, Pencil, Ungroup } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import PostIt from './PostIt'
import { categoryIcon, categoryLabel } from '../../utils/helpers'

const COLOR_DOT = { yellow: '#eab308', blue: '#3b82f6', green: '#22c55e', pink: '#ec4899', orange: '#f97316', purple: '#a855f7' }
const COLOR_BG = { yellow: 'bg-postit-yellow', blue: 'bg-postit-blue', green: 'bg-postit-green', pink: 'bg-postit-pink', orange: 'bg-postit-orange', purple: 'bg-postit-purple' }

export default function GroupCluster({ group, ideas, participantsById, wallRef, onIdeaClick, onDragEnd }) {
  const [expanded, setExpanded] = useState(true)
  const renameGroup = useAppStore((s) => s.renameGroup)
  const dissolveGroup = useAppStore((s) => s.dissolveGroup)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(group.title)

  if (ideas.length === 0) return null
  // Ancora o rótulo do grupo na ideia mais "acima" do cluster, sempre com
  // margem mínima positiva para não cortar o cabeçalho no topo da parede.
  const anchor = ideas.reduce((top, i) => (i.y < top.y ? i : top), ideas[0])
  const clusterTop = Math.max(8, anchor.y - 56)

  function saveTitle() {
    renameGroup(group.id, title.trim() || group.title)
    setEditing(false)
  }

  return (
    <div style={{ position: 'absolute', left: Math.max(8, anchor.x - 12), top: clusterTop, width: 420 }}>
      <div className="inline-flex items-center gap-2 bg-white border border-steel-200 rounded-full pl-2 pr-3 py-1 shadow-card mb-2">
        <button onClick={() => setExpanded((v) => !v)} className="w-5 h-5 flex items-center justify-center text-steel-500">
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
            className="text-xs font-bold text-ink-900 bg-steel-50 rounded px-1.5 py-0.5 outline-none w-40"
          />
        ) : (
          <span className="text-xs font-extrabold text-ink-900 uppercase tracking-wide font-mono truncate max-w-[200px]" title={group.title}>{group.title}</span>
        )}
        {group.category && <span className="text-[10px] text-steel-400">{categoryIcon(group.category)} {categoryLabel(group.category)}</span>}
        <span className="text-[10px] font-bold text-steel-400">· {ideas.length} ideias</span>
        <button onClick={() => setEditing(true)} className="text-steel-400 hover:text-brand-600"><Pencil size={12} /></button>
        <button onClick={() => dissolveGroup(group.id)} className="text-steel-400 hover:text-red-500"><Ungroup size={12} /></button>
      </div>

      {expanded && (
        <div
          className="rounded-2xl border-2 border-dashed p-4"
          style={{ borderColor: COLOR_DOT[anchor.color] || '#cdd7e4', background: 'rgba(255,255,255,0.35)' }}
        >
          <div className="flex flex-wrap gap-3">
            {ideas.map((idea) => (
              <div key={idea.id} className="relative" style={{ width: 168, transform: `rotate(${idea.rotation}deg)` }}>
                <div className={`rounded-[3px] p-3 shadow-postit border border-black/5 ${COLOR_BG[idea.color] || COLOR_BG.yellow}`} onClick={() => onIdeaClick(idea)}>
                  <p className="text-[12px] leading-snug font-medium text-ink-900 line-clamp-4">{idea.text}</p>
                  <div className="mt-2 text-[10px] font-semibold text-ink-800/70">👤 {participantsById[idea.authorId]?.name || idea.authorName || 'Anônimo'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
