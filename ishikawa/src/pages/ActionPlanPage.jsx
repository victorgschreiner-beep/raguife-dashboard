import { useMemo, useState } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatDate, classNames } from '../utils/helpers'

const STATUS_OPTIONS = [
  { key: 'aberto', label: 'Aberto', color: 'bg-steel-100 text-steel-600 border-steel-200' },
  { key: 'em_andamento', label: 'Em andamento', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { key: 'concluido', label: 'Concluído', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { key: 'atrasado', label: 'Atrasado', color: 'bg-red-50 text-red-700 border-red-200' },
  { key: 'cancelado', label: 'Cancelado', color: 'bg-steel-100 text-steel-400 border-steel-200 line-through' },
]

const PRIORITY_OPTIONS = [
  { key: 'baixa', label: '🟢 Baixa' },
  { key: 'media', label: '🟡 Média' },
  { key: 'alta', label: '🟠 Alta' },
  { key: 'critica', label: '🔴 Crítica' },
]

export default function ActionPlanPage() {
  const actions = useAppStore((s) => s.actions)
  const causes = useAppStore((s) => s.causes)
  const createAction = useAppStore((s) => s.createAction)
  const updateAction = useAppStore((s) => s.updateAction)
  const deleteAction = useAppStore((s) => s.deleteAction)
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState('todos')

  const causeById = useMemo(() => Object.fromEntries(causes.map((c) => [c.id, c])), [causes])
  const filtered = statusFilter === 'todos' ? actions : actions.filter((a) => a.status === statusFilter)

  const counts = useMemo(() => {
    const c = { total: actions.length, aberto: 0, em_andamento: 0, concluido: 0, atrasado: 0 }
    actions.forEach((a) => { c[a.status] = (c[a.status] || 0) + 1 })
    return c
  }, [actions])

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center text-xl">📋</div>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">Plano de Ação</h1>
            <p className="text-sm text-steel-500">{counts.total} ações · {counts.concluido || 0} concluídas · {counts.atrasado || 0} atrasadas</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={15} /> Nova ação</Button>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto scrollbar-none">
        <Chip active={statusFilter === 'todos'} onClick={() => setStatusFilter('todos')} label={`Todas (${counts.total})`} />
        {STATUS_OPTIONS.map((s) => (
          <Chip key={s.key} active={statusFilter === s.key} onClick={() => setStatusFilter(s.key)} label={`${s.label} (${counts[s.key] || 0})`} />
        ))}
      </div>

      {showForm && (
        <NewActionForm causes={causes} onCreate={(data) => { createAction(data); setShowForm(false) }} onCancel={() => setShowForm(false)} />
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel-50 text-left text-xs font-bold text-steel-500 uppercase tracking-wide font-mono">
                <th className="px-4 py-3">Ação</th>
                <th className="px-3 py-3">Causa</th>
                <th className="px-3 py-3">Responsável</th>
                <th className="px-3 py-3">Prazo</th>
                <th className="px-3 py-3">Prioridade</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-steel-50/60 align-top">
                  <td className="px-4 py-3 max-w-[240px]">
                    <div className="font-semibold text-ink-800">{a.description}</div>
                    {a.observation && <div className="text-xs text-steel-400 mt-0.5">{a.observation}</div>}
                  </td>
                  <td className="px-3 py-3 text-xs text-steel-500 max-w-[160px] truncate">{causeById[a.causeId]?.title || '—'}</td>
                  <td className="px-3 py-3">
                    <input value={a.responsible} onChange={(e) => updateAction(a.id, { responsible: e.target.value })} className="w-28 text-xs border border-transparent hover:border-steel-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400 focus:border-transparent" />
                  </td>
                  <td className="px-3 py-3">
                    <input type="date" value={a.deadline ? a.deadline.slice(0, 10) : ''} onChange={(e) => updateAction(a.id, { deadline: e.target.value })} className="text-xs border border-transparent hover:border-steel-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400" />
                  </td>
                  <td className="px-3 py-3">
                    <select value={a.priority} onChange={(e) => updateAction(a.id, { priority: e.target.value })} className="text-xs border border-steel-200 rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-brand-400">
                      {PRIORITY_OPTIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={a.status}
                      onChange={(e) => updateAction(a.id, { status: e.target.value, ...(e.target.value === 'concluido' ? { completedAt: new Date().toISOString() } : {}) })}
                      className={classNames('text-xs font-bold rounded-full px-2.5 py-1.5 border focus:outline-none', STATUS_OPTIONS.find((s) => s.key === a.status)?.color)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <button onClick={() => deleteAction(a.id)} className="text-steel-300 hover:text-red-500"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-steel-400">Nenhuma ação registrada para este filtro.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function Chip({ active, onClick, label }) {
  return (
    <button onClick={onClick} className={classNames('shrink-0 text-xs font-bold px-3 py-1.5 rounded-full border transition-colors', active ? 'bg-ink-900 text-white border-ink-900' : 'bg-white text-ink-600 border-steel-200 hover:bg-steel-50')}>
      {label}
    </button>
  )
}

function NewActionForm({ causes, onCreate, onCancel }) {
  const [description, setDescription] = useState('')
  const [causeId, setCauseId] = useState(causes[0]?.id || '')
  const [responsible, setResponsible] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('media')

  function submit(e) {
    e.preventDefault()
    if (!description.trim()) return
    onCreate({ description: description.trim(), causeId, responsible, deadline, priority })
  }

  return (
    <Card className="p-5 mb-4">
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Ação</label>
          <input autoFocus value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Ex: Criar plano de manutenção preventiva" />
        </div>
        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Causa relacionada</label>
          <select value={causeId} onChange={(e) => setCauseId(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-400">
            {causes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Responsável</label>
          <input value={responsible} onChange={(e) => setResponsible(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Prazo</label>
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div>
          <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Prioridade</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-brand-400">
            {PRIORITY_OPTIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2 mt-1">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" size="sm">Adicionar</Button>
        </div>
      </form>
    </Card>
  )
}
