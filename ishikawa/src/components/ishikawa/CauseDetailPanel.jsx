import { useState } from 'react'
import { X, Trash2, HelpCircle, ClipboardPlus, GitBranch } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../store/useAppStore'
import { CATEGORIES, categoryLabel } from '../../utils/helpers'
import Button from '../ui/Button'

export default function CauseDetailPanel({ cause, onClose }) {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const updateCause = useAppStore((s) => s.updateCause)
  const deleteCause = useAppStore((s) => s.deleteCause)
  const createAction = useAppStore((s) => s.createAction)
  const causes = useAppStore((s) => s.causes)
  const [title, setTitle] = useState(cause.title)

  const ideaCount = cause.ideaCount || 0
  const subcauseCount = causes.filter((c) => c.parentId === cause.id).length

  function saveTitle() {
    updateCause(cause.id, { title })
  }

  function createActionFromCause() {
    createAction({ causeId: cause.id, description: `Plano de ação para: ${cause.title}`, priority: 'alta' })
    navigate(`/sessao/${session.id}/plano-de-acao`)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white shadow-panel border-l border-steel-200 z-[100] flex flex-col animate-pin-in no-print">
      <div className="flex items-center justify-between px-5 py-4 border-b border-steel-100">
        <h3 className="font-bold text-ink-900">Detalhes da causa</h3>
        <button onClick={onClose} className="text-steel-400 hover:text-ink-800"><X size={20} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Causa</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={saveTitle} className="w-full mt-1.5 border border-steel-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>

        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Categoria</label>
          <select value={cause.category} onChange={(e) => updateCause(cause.id, { category: e.target.value })} className="w-full mt-1.5 border border-steel-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400">
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <Metric label="Ideias" value={ideaCount} />
          <Metric label="Votos" value={cause.votes || 0} />
          <Metric label="Confiança IA" value={`${Math.round((cause.confidence || 0) * 100)}%`} />
        </div>

        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Tipo</label>
          <div className="flex gap-1.5 mt-1.5">
            {['sintoma', 'causa', 'subcausa', 'causa_raiz'].map((t) => (
              <button key={t} onClick={() => updateCause(cause.id, { type: t })} className={`text-[11px] font-bold px-2 py-1.5 rounded-lg border ${cause.type === t ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-600 border-steel-200'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {subcauseCount > 0 && (
          <div className="text-xs text-steel-500 bg-steel-50 rounded-lg px-3 py-2">
            <GitBranch size={12} className="inline mr-1" /> {subcauseCount} subcausa(s) vinculada(s)
          </div>
        )}
      </div>

      <div className="border-t border-steel-100 px-5 py-4 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => navigate(`/sessao/${session.id}/5porques`)}><HelpCircle size={14} /> 5 Porquês</Button>
        <Button variant="secondary" size="sm" onClick={createActionFromCause}><ClipboardPlus size={14} /> Criar ação</Button>
        <Button variant="danger" size="sm" className="col-span-2" onClick={() => { deleteCause(cause.id); onClose() }}><Trash2 size={14} /> Excluir causa</Button>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div className="bg-steel-50 rounded-lg py-2.5">
      <div className="font-extrabold text-ink-900">{value}</div>
      <div className="text-[10px] text-steel-500 font-medium mt-0.5">{label}</div>
    </div>
  )
}
