import { useMemo, useState } from 'react'
import { Fish, Plus } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { CATEGORIES } from '../utils/helpers'
import CauseNode from '../components/ishikawa/CauseNode'
import CauseDetailPanel from '../components/ishikawa/CauseDetailPanel'
import Button from '../components/ui/Button'

const TOP = ['maquina', 'metodo', 'mao_de_obra']
const BOTTOM = ['material', 'medicao', 'meio_ambiente']

export default function IshikawaPage() {
  const session = useAppStore((s) => s.session)
  const causes = useAppStore((s) => s.causes)
  const createCause = useAppStore((s) => s.createCause)
  const buildIshikawaFromWall = useAppStore((s) => s.buildIshikawaFromWall)
  const [selected, setSelected] = useState(null)

  const topLevelByCategory = useMemo(() => {
    const map = {}
    CATEGORIES.forEach((c) => { map[c.key] = causes.filter((cs) => cs.category === c.key && !cs.parentId) })
    return map
  }, [causes])

  function addCause(categoryKey) {
    const title = window.prompt('Nova causa:')
    if (title && title.trim()) {
      const c = createCause({ title: title.trim(), category: categoryKey })
      setSelected(c)
    }
  }

  function addSub(parent) {
    const title = window.prompt(`Subcausa de "${parent.title}":`)
    if (title && title.trim()) {
      createCause({ title: title.trim(), category: parent.category, parentId: parent.id, type: 'subcausa' })
    }
  }

  // Renderização recursiva da hierarquia Problema → Causa → Subcausa → Causa raiz.
  // Sempre busca filhos no array COMPLETO de causas (não apenas no nível superior).
  function renderChildren(parentId, depth) {
    return causes
      .filter((c) => c.parentId === parentId)
      .map((c) => (
        <CauseNode key={c.id} cause={c} selected={selected} onSelect={setSelected} onAddSub={addSub} depth={depth}>
          {renderChildren(c.id, depth + 1)}
        </CauseNode>
      ))
  }

  return (
    <div className="p-5 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl">🐟</div>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">Diagrama de Ishikawa</h1>
            <p className="text-sm text-steel-500">Causa e efeito — 6M</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => buildIshikawaFromWall()}><Fish size={15} /> Reimportar da parede de post-its</Button>
      </div>

      {/* Cabeça do peixe: problema */}
      <div className="flex justify-center mb-4">
        <div className="bg-raguife-header text-white rounded-2xl px-6 py-4 shadow-panel text-center max-w-md">
          <div className="text-[11px] font-bold text-steel-400 uppercase tracking-wide font-mono">Problema</div>
          <div className="font-extrabold text-lg leading-snug mt-0.5">{session.problem}</div>
        </div>
      </div>

      {/* Espinha central */}
      <div className="relative">
        <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92%] h-0.5 bg-ink-300" />

        <div className="grid lg:grid-cols-3 gap-4 mb-4">
          {TOP.map((key) => (
            <Bone key={key} categoryKey={key} topLevelCauses={topLevelByCategory[key]} onAdd={addCause} renderChildren={renderChildren} selected={selected} onSelect={setSelected} onAddSub={addSub} />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {BOTTOM.map((key) => (
            <Bone key={key} categoryKey={key} topLevelCauses={topLevelByCategory[key]} onAdd={addCause} renderChildren={renderChildren} selected={selected} onSelect={setSelected} onAddSub={addSub} />
          ))}
        </div>
      </div>

      {selected && <CauseDetailPanel cause={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function Bone({ categoryKey, topLevelCauses, onAdd, renderChildren, selected, onSelect, onAddSub }) {
  const cat = CATEGORIES.find((c) => c.key === categoryKey)
  return (
    <div className="bg-white rounded-2xl border border-steel-200 shadow-card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-lg">{cat.icon}</span>
          <span className="font-extrabold text-ink-900 text-sm uppercase tracking-wide font-mono">{cat.label}</span>
        </div>
        <button onClick={() => onAdd(categoryKey)} className="text-steel-400 hover:text-brand-600"><Plus size={16} /></button>
      </div>
      <div className="min-h-[60px]">
        {topLevelCauses.length === 0 && <p className="text-xs text-steel-400 italic">Nenhuma causa classificada ainda.</p>}
        {topLevelCauses.map((c) => (
          <CauseNode key={c.id} cause={c} selected={selected} onSelect={onSelect} onAddSub={onAddSub} depth={0}>
            {renderChildren(c.id, 1)}
          </CauseNode>
        ))}
      </div>
    </div>
  )
}
