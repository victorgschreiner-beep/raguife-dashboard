import { useState } from 'react'
import { X, Trash2, Layers, Tag, Search, GitBranch, Save } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { CATEGORIES, formatDateTime, categoryIcon, categoryLabel } from '../../utils/helpers'
import { AIService } from '../../services/AIService'
import Button from '../ui/Button'
import CategoryBadge from '../ui/CategoryBadge'

export default function IdeaDetailPanel({ idea, participantsById, allIdeas, onClose }) {
  const updateIdea = useAppStore((s) => s.updateIdea)
  const deleteIdea = useAppStore((s) => s.deleteIdea)
  const createGroup = useAppStore((s) => s.createGroup)
  const [text, setText] = useState(idea.text)
  const [similar, setSimilar] = useState(null)
  const [loadingSimilar, setLoadingSimilar] = useState(false)

  const author = participantsById[idea.authorId]?.name || idea.authorName || 'Anônimo'

  async function investigate() {
    setLoadingSimilar(true)
    const results = await AIService.findSimilarIdeas(idea, allIdeas, 0.2)
    setSimilar(results)
    setLoadingSimilar(false)
  }

  function saveText() {
    updateIdea(idea.id, { text })
  }

  function groupWith(otherId) {
    const other = allIdeas.find((i) => i.id === otherId)
    createGroup([idea.id, otherId], suggestTitleFrom(idea.text, other?.text), idea.category)
    onClose()
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-panel border-l border-steel-200 z-[100] flex flex-col animate-pin-in no-print">
      <div className="flex items-center justify-between px-5 py-4 border-b border-steel-100">
        <h3 className="font-bold text-ink-900">Detalhes da ideia</h3>
        <button onClick={onClose} className="text-steel-400 hover:text-ink-800"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Ideia</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={saveText}
            className="w-full mt-1.5 border border-steel-200 rounded-lg p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoBlock label="Autor" value={`👤 ${author}`} />
          <InfoBlock label="Horário" value={formatDateTime(idea.createdAt)} />
        </div>

        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Categoria sugerida</label>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                onClick={() => updateIdea(idea.id, { category: c.key, confidence: 1 })}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${idea.category === c.key ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-ink-700 border-steel-200 hover:bg-steel-50'}`}
              >
                {c.icon} {c.label}
              </button>
            ))}
          </div>
        </div>

        {typeof idea.confidence === 'number' && (
          <div>
            <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Confiança da IA</label>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-2 bg-steel-100 rounded-full overflow-hidden">
                <div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.round(idea.confidence * 100)}%` }} />
              </div>
              <span className="text-xs font-bold text-ink-700">{Math.round(idea.confidence * 100)}%</span>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Ideias relacionadas</label>
            <button onClick={investigate} className="text-xs font-bold text-brand-700 flex items-center gap-1">
              <Search size={12} /> {loadingSimilar ? 'Buscando...' : 'Investigar'}
            </button>
          </div>
          {similar && (
            <div className="mt-2 space-y-2">
              {similar.length === 0 && <p className="text-xs text-steel-400">Nenhuma ideia semelhante encontrada.</p>}
              {similar.map((r) => (
                <div key={r.idea.id} className="flex items-center justify-between gap-2 bg-steel-50 rounded-lg px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs text-ink-800 truncate">{r.idea.text}</p>
                    <span className="text-[10px] font-bold text-brand-600">{Math.round(r.similarity * 100)}% similaridade</span>
                  </div>
                  <button onClick={() => groupWith(r.idea.id)} className="text-[10px] font-bold text-white bg-ink-900 rounded px-2 py-1 shrink-0">Agrupar</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-steel-100 px-5 py-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => updateIdea(idea.id, { type: 'subcausa' })}><GitBranch size={14} /> Criar subcausa</Button>
        <Button variant="secondary" size="sm" onClick={investigate}><Layers size={14} /> Agrupar</Button>
        <Button variant="secondary" size="sm" onClick={saveText}><Save size={14} /> Salvar edição</Button>
        <Button variant="danger" size="sm" onClick={() => { deleteIdea(idea.id); onClose() }}><Trash2 size={14} /> Excluir</Button>
      </div>
    </div>
  )
}

function InfoBlock({ label, value }) {
  return (
    <div>
      <div className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">{label}</div>
      <div className="text-ink-800 font-medium mt-0.5">{value}</div>
    </div>
  )
}

function suggestTitleFrom(a, b) {
  return a.length <= b.length ? a : b
}
