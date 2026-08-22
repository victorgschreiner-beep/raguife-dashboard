import { Bot, Info } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card, CardHeader } from '../components/ui/Card'
import { CATEGORIES } from '../utils/helpers'

export default function AISettingsPage() {
  const aiConfig = useAppStore((s) => s.aiConfig)
  const updateAIConfig = useAppStore((s) => s.updateAIConfig)

  function toggleCategory(key) {
    const next = aiConfig.categories.includes(key) ? aiConfig.categories.filter((k) => k !== key) : [...aiConfig.categories, key]
    updateAIConfig({ categories: next })
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-ink-900 text-white flex items-center justify-center"><Bot size={20} /></div>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Configurações da IA</h1>
          <p className="text-sm text-steel-500">Ajuste como o AIService analisa e sugere durante a sessão</p>
        </div>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 mb-6">
        <Info size={15} className="text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800">Modo atual: <b>MOCK</b> (heurística local). A arquitetura do AIService está pronta para receber uma API de IA real — ver README.md.</p>
      </div>

      <Card className="p-6 mb-5">
        <CardHeader title="Limiares de análise" subtitle="Controlam sensibilidade da IA" />
        <div className="px-5 pb-5 space-y-5">
          <SliderField
            label="Similaridade mínima para sugerir agrupamento"
            value={aiConfig.minSimilarity}
            onChange={(v) => updateAIConfig({ minSimilarity: v })}
          />
          <SliderField
            label="Confiança mínima para classificação automática"
            value={aiConfig.minConfidence}
            onChange={(v) => updateAIConfig({ minConfidence: v })}
          />
          <div>
            <label className="text-sm font-semibold text-ink-800">Número máximo de sugestões simultâneas</label>
            <input
              type="number" min={1} max={20}
              value={aiConfig.maxSuggestions}
              onChange={(e) => updateAIConfig({ maxSuggestions: Number(e.target.value) })}
              className="w-24 mt-1.5 border border-steel-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-5">
        <CardHeader title="Categorias Ishikawa ativas" subtitle="Categorias consideradas pelo classificador" />
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              onClick={() => toggleCategory(c.key)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${aiConfig.categories.includes(c.key) ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-500 border-steel-200'}`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <CardHeader title="Funcionalidades automáticas" />
        <div className="px-5 pb-5 space-y-3">
          <ToggleRow label="Agrupamento automático (sem confirmação manual)" hint="Não recomendado — viola a regra de controle final do facilitador." checked={aiConfig.autoGrouping} onChange={(v) => updateAIConfig({ autoGrouping: v })} />
          <ToggleRow label="Sugestão de 5 Porquês habilitada" checked={aiConfig.fiveWhysEnabled} onChange={(v) => updateAIConfig({ fiveWhysEnabled: v })} />
          <ToggleRow label="Sugestão de causa raiz habilitada" checked={aiConfig.rootCauseSuggestion} onChange={(v) => updateAIConfig({ rootCauseSuggestion: v })} />
        </div>
      </Card>
    </div>
  )
}

function SliderField({ label, value, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-semibold text-ink-800">{label}</label>
        <span className="text-sm font-extrabold text-brand-700">{Math.round(value * 100)}%</span>
      </div>
      <input type="range" min={0} max={1} step={0.05} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-brand-600" />
    </div>
  )
}

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 w-4 h-4 accent-brand-600" />
      <div>
        <div className="text-sm font-medium text-ink-800">{label}</div>
        {hint && <div className="text-xs text-amber-600 mt-0.5">{hint}</div>}
      </div>
    </label>
  )
}
