import { Sparkles, X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../ui/Button'
import { categoryIcon, categoryLabel } from '../../utils/helpers'

export default function AIOrganizeModal({ suggestions, ideasById, onClose }) {
  const applyAll = useAppStore((s) => s.applyAllAISuggestions)

  return (
    <div className="fixed inset-0 z-[120] bg-ink-950/50 flex items-center justify-center p-4 no-print">
      <div className="bg-white rounded-2xl shadow-panel max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="px-6 py-5 border-b border-steel-100 flex items-start justify-between bg-gradient-to-br from-brand-600 to-brand-800 text-white">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0"><Sparkles size={20} /></div>
            <div>
              <h3 className="font-extrabold">Organização com IA concluída</h3>
              <p className="text-sm text-white/85 mt-0.5">
                Encontramos {suggestions.groupsFound} {suggestions.groupsFound === 1 ? 'grupo' : 'grupos'} de ideias semelhantes e {suggestions.classificationSuggestions} sugestões de classificação.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white shrink-0"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {suggestions.groups.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono mb-2">Grupos sugeridos</h4>
              <div className="space-y-2">
                {suggestions.groups.map((g, i) => (
                  <div key={i} className="bg-steel-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-ink-900">{g.suggestedTitle}</span>
                      <span className="text-[10px] font-bold text-brand-600">{Math.round(g.avgSimilarity * 100)}% sim.</span>
                    </div>
                    <ul className="mt-1.5 space-y-0.5">
                      {g.ideaIds.map((id) => (
                        <li key={id} className="text-xs text-steel-600 truncate">• {ideasById[id]?.text}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.classifications.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono mb-2">Classificações sugeridas</h4>
              <div className="space-y-1.5">
                {suggestions.classifications.map((c) => (
                  <div key={c.ideaId} className="flex items-center justify-between text-xs bg-steel-50 rounded-lg px-3 py-2">
                    <span className="truncate text-steel-700 flex-1">{ideasById[c.ideaId]?.text}</span>
                    <span className="font-semibold text-ink-700 shrink-0 ml-2">{categoryIcon(c.category)} {categoryLabel(c.category)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {suggestions.groups.length === 0 && suggestions.classifications.length === 0 && (
            <p className="text-sm text-steel-500 text-center py-6">Nenhuma sugestão nova — a parede já está bem organizada.</p>
          )}
        </div>

        <div className="border-t border-steel-100 px-6 py-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="secondary" onClick={onClose}>Revisar uma por uma</Button>
          <Button onClick={() => { applyAll(); onClose() }}>Aplicar todas</Button>
        </div>
      </div>
    </div>
  )
}
