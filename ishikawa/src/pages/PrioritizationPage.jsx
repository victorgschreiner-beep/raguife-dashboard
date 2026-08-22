import { useMemo, useState } from 'react'
import { Target, Info } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'
import CategoryBadge from '../components/ui/CategoryBadge'
import { classNames } from '../utils/helpers'

const CRITERIA = [
  { key: 'impact', label: 'Impacto' },
  { key: 'frequency', label: 'Frequência' },
  { key: 'severity', label: 'Gravidade' },
  { key: 'urgency', label: 'Urgência' },
  { key: 'cost', label: 'Custo' },
  { key: 'ease', label: 'Facilidade de solução' },
]

function levelFor(score, max) {
  const pct = score / max
  if (pct >= 0.75) return { label: 'Crítica', color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: '🔴' }
  if (pct >= 0.5) return { label: 'Alta', color: 'bg-orange-400', text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200', icon: '🟠' }
  if (pct >= 0.25) return { label: 'Média', color: 'bg-amber-400', text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: '🟡' }
  return { label: 'Baixa', color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: '🟢' }
}

export default function PrioritizationPage() {
  const allCauses = useAppStore((s) => s.causes)
  const updateCause = useAppStore((s) => s.updateCause)
  const priorityFormula = useAppStore((s) => s.priorityFormula)
  const updatePriorityFormula = useAppStore((s) => s.updatePriorityFormula)
  const causes = useMemo(() => allCauses.filter((c) => !c.parentId), [allCauses])

  const [selectedCriteria, setSelectedCriteria] = useState(priorityFormula.criteria)

  function toggleCriterion(key) {
    const next = selectedCriteria.includes(key) ? selectedCriteria.filter((k) => k !== key) : [...selectedCriteria, key]
    if (next.length === 0) return
    setSelectedCriteria(next)
    updatePriorityFormula({ criteria: next, label: next.map((k) => CRITERIA.find((c) => c.key === k)?.label).join(' × ') })
  }

  const scored = useMemo(() => {
    return causes.map((c) => {
      const score = selectedCriteria.reduce((acc, key) => acc * (c[key] || 1), 1)
      return { ...c, score }
    }).sort((a, b) => b.score - a.score)
  }, [causes, selectedCriteria])

  const maxScore = Math.max(1, ...scored.map((c) => c.score))

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl">🎯</div>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Matriz de Priorização</h1>
          <p className="text-sm text-steel-500">Prioridade = {selectedCriteria.map((k) => CRITERIA.find((c) => c.key === k)?.label).join(' × ') || '—'}</p>
        </div>
      </div>

      <Card className="p-5 mb-5">
        <div className="flex items-start gap-2 mb-3">
          <Info size={14} className="text-steel-400 mt-0.5 shrink-0" />
          <p className="text-xs text-steel-500">Selecione os critérios que compõem a fórmula de priorização. O score é o produto dos critérios escolhidos (escala 1–5 cada).</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {CRITERIA.map((c) => (
            <button
              key={c.key}
              onClick={() => toggleCriterion(c.key)}
              className={classNames('text-xs font-bold px-3 py-1.5 rounded-full border transition-colors',
                selectedCriteria.includes(c.key) ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-600 border-steel-200 hover:bg-steel-50')}
            >
              {c.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel-50 text-left text-xs font-bold text-steel-500 uppercase tracking-wide font-mono">
                <th className="px-4 py-3">Causa</th>
                <th className="px-3 py-3">Categoria</th>
                {selectedCriteria.map((k) => <th key={k} className="px-2 py-3 text-center w-16">{CRITERIA.find((c) => c.key === k)?.label}</th>)}
                <th className="px-3 py-3 text-center">Score</th>
                <th className="px-3 py-3 text-center">Prioridade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {scored.map((c) => {
                const level = levelFor(c.score, maxScore)
                return (
                  <tr key={c.id} className="hover:bg-steel-50/60">
                    <td className="px-4 py-3 font-semibold text-ink-800 max-w-[220px] truncate">{c.title}</td>
                    <td className="px-3 py-3"><CategoryBadge category={c.category} size="sm" /></td>
                    {selectedCriteria.map((key) => (
                      <td key={key} className="px-2 py-3 text-center">
                        <select
                          value={c[key] || 3}
                          onChange={(e) => updateCause(c.id, { [key]: Number(e.target.value) })}
                          className="w-12 text-center border border-steel-200 rounded px-1 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-brand-400"
                        >
                          {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center font-extrabold text-ink-900 tabular-nums">{c.score}</td>
                    <td className="px-3 py-3">
                      <span className={classNames('inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border mx-auto', level.bg, level.text, level.border)}>
                        {level.icon} {level.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {scored.length === 0 && (
                <tr><td colSpan={selectedCriteria.length + 4} className="px-4 py-10 text-center text-steel-400">Nenhuma causa disponível para priorizar.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
