import { AlertTriangle } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../ui/Button'

export default function SimilarityAlert({ pending, ideasById }) {
  const resolve = useAppStore((s) => s.resolvePendingSimilarity)
  const createGroup = useAppStore((s) => s.createGroup)

  const idea = ideasById[pending.ideaId]
  if (!idea) return null

  function group() {
    const ids = [pending.ideaId, ...pending.matches.map((m) => m.idea.id)]
    createGroup(ids, idea.text.slice(0, 40), idea.category)
    resolve(pending.id)
  }

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[110] w-[92%] max-w-lg bg-white border border-amber-300 rounded-2xl shadow-panel p-4 animate-pin-in no-print">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0"><AlertTriangle size={18} /></div>
        <div className="min-w-0 flex-1">
          <div className="font-extrabold text-ink-900 text-sm">⚠️ IDEIAS SEMELHANTES</div>
          <p className="text-xs text-steel-500 mt-0.5">Estas ideias parecem representar a mesma causa.</p>

          <div className="mt-2.5 space-y-1.5">
            <div className="text-xs bg-steel-50 rounded-lg px-2.5 py-1.5 text-ink-800 font-medium">"{idea.text}"</div>
            {pending.matches.map((m) => (
              <div key={m.idea.id} className="text-xs bg-steel-50 rounded-lg px-2.5 py-1.5 text-ink-800 font-medium flex items-center justify-between gap-2">
                <span className="truncate">"{m.idea.text}"</span>
                <span className="text-[10px] font-bold text-amber-600 shrink-0">{Math.round(m.similarity * 100)}%</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={group}>Agrupar</Button>
            <Button size="sm" variant="secondary" onClick={() => resolve(pending.id)}>Manter separadas</Button>
            <Button size="sm" variant="ghost" onClick={() => resolve(pending.id)}>Ignorar</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
