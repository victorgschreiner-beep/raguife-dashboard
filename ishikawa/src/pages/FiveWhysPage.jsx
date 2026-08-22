import { useMemo, useState } from 'react'
import { HelpCircle, Sparkles, AlertCircle, CheckCircle2, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { AIService } from '../services/AIService'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import CategoryBadge from '../components/ui/CategoryBadge'

export default function FiveWhysPage() {
  const allCauses = useAppStore((s) => s.causes)
  const setFiveWhys = useAppStore((s) => s.setFiveWhys)
  const updateCause = useAppStore((s) => s.updateCause)
  const causes = useMemo(() => allCauses.filter((c) => !c.parentId), [allCauses])
  const [selectedId, setSelectedId] = useState(causes[0]?.id || null)
  const [loading, setLoading] = useState(false)
  const [rootCause, setRootCause] = useState(null)

  const selected = causes.find((c) => c.id === selectedId)
  const chain = selected?.fiveWhys || []

  async function generateChain() {
    if (!selected) return
    setLoading(true)
    setRootCause(null)
    const suggested = await AIService.suggestFiveWhys(selected.title)
    setFiveWhys(selected.id, suggested)
    setLoading(false)
  }

  function updateAnswer(index, value) {
    const next = chain.map((w, i) => (i === index ? { ...w, answer: value } : w))
    setFiveWhys(selected.id, next)
  }

  function addWhy() {
    const next = [...chain, { whyNumber: chain.length + 1, question: 'Por quê?', answer: '' }]
    setFiveWhys(selected.id, next)
  }

  function removeWhy(index) {
    const next = chain.filter((_, i) => i !== index).map((w, i) => ({ ...w, whyNumber: i + 1 }))
    setFiveWhys(selected.id, next)
  }

  async function concludeRootCause() {
    const result = await AIService.suggestRootCause(chain)
    setRootCause(result)
  }

  function confirmRootCause() {
    if (!rootCause) return
    updateCause(selected.id, { type: 'causa_raiz' })
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl">🔎</div>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">5 Porquês</h1>
          <p className="text-sm text-steel-500">Investigação estruturada da causa raiz</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-5">
        <Card className="p-3 h-fit">
          <h3 className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono px-2 mb-1.5">Selecione uma causa</h3>
          <div className="space-y-1">
            {causes.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelectedId(c.id); setRootCause(null) }}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedId === c.id ? 'bg-brand-600 text-white' : 'hover:bg-steel-50 text-ink-700'}`}
              >
                {c.title}
                {c.fiveWhys?.length > 0 && <span className={`ml-1.5 text-[10px] font-bold ${selectedId === c.id ? 'text-white/80' : 'text-emerald-600'}`}>✓</span>}
              </button>
            ))}
            {causes.length === 0 && <p className="text-xs text-steel-400 px-2">Nenhuma causa disponível. Construa o Ishikawa primeiro.</p>}
          </div>
        </Card>

        {selected ? (
          <Card className="p-6">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CategoryBadge category={selected.category} size="sm" />
                </div>
                <h2 className="font-extrabold text-lg text-ink-900">{selected.title}</h2>
              </div>
              <Button size="sm" variant="dark" onClick={generateChain} disabled={loading}>
                <Sparkles size={14} /> {loading ? 'Gerando...' : 'Sugerir com IA'}
              </Button>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4 mb-5">
              <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800">Sugestões geradas pela IA. Valide antes de concluir.</p>
            </div>

            <div className="space-y-3">
              {chain.map((why, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-extrabold text-sm flex items-center justify-center shrink-0 mt-0.5">{why.whyNumber}</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono mb-1">Por quê?</div>
                    <div className="flex gap-2">
                      <textarea
                        value={why.answer}
                        onChange={(e) => updateAnswer(i, e.target.value)}
                        className="flex-1 border border-steel-200 rounded-lg px-3 py-2 text-sm min-h-[54px] focus:outline-none focus:ring-2 focus:ring-brand-400"
                      />
                      <button onClick={() => removeWhy(i)} className="text-steel-300 hover:text-red-500 shrink-0"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {chain.length === 0 && (
              <div className="text-center py-10 text-steel-400">
                <HelpCircle size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Clique em "Sugerir com IA" ou adicione o primeiro "Por quê?" manualmente.</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={addWhy}>+ Adicionar Por quê</Button>
              {chain.length > 0 && <Button size="sm" onClick={concludeRootCause}>Concluir investigação</Button>}
            </div>

            {rootCause && (
              <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                  <CheckCircle2 size={16} /> Possível causa raiz identificada
                </div>
                <p className="text-sm text-emerald-900">{rootCause.rootCause}</p>
                <p className="text-xs text-emerald-600 mt-1">Confiança da IA: {Math.round(rootCause.confidence * 100)}%</p>
                <Button size="sm" className="mt-3" onClick={confirmRootCause}>Confirmar como causa raiz</Button>
              </div>
            )}
          </Card>
        ) : (
          <Card className="p-10 text-center text-steel-400">Selecione uma causa para iniciar os 5 Porquês.</Card>
        )}
      </div>
    </div>
  )
}
