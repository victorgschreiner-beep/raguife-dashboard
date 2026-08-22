import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { LayoutDashboard, FileText } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card, CardHeader } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { CATEGORIES, formatDate } from '../utils/helpers'

const PIE_COLORS = ['#1f83f7', '#a855f7', '#f59e0b', '#22c55e', '#06b6d4', '#84cc16']

export default function SessionDashboard() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const ideas = useAppStore((s) => s.ideas)
  const groups = useAppStore((s) => s.groups)
  const participants = useAppStore((s) => s.participants)
  const allCauses = useAppStore((s) => s.causes)
  const actions = useAppStore((s) => s.actions)
  const causes = useMemo(() => allCauses.filter((c) => !c.parentId), [allCauses])

  const sessionParticipants = participants.filter((p) => session.participants.includes(p.id))

  const categoryData = useMemo(() => {
    return CATEGORIES.map((c) => ({ name: c.label, value: causes.filter((cs) => cs.category === c.key).length })).filter((d) => d.value > 0)
  }, [causes])

  const topCauses = useMemo(() => [...causes].sort((a, b) => (b.votes || 0) - (a.votes || 0)).slice(0, 5), [causes])

  const actionStatusCounts = useMemo(() => {
    const map = { aberto: 0, em_andamento: 0, concluido: 0, atrasado: 0, cancelado: 0 }
    actions.forEach((a) => { map[a.status] = (map[a.status] || 0) + 1 })
    return map
  }, [actions])

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center"><LayoutDashboard size={20} /></div>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">Dashboard Geral</h1>
            <p className="text-sm text-steel-500">Visão consolidada da sessão {session.code}</p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate(`/sessao/${session.id}/relatorio`)}><FileText size={15} /> Ver relatório completo</Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat icon="🧠" label="Ideias coletadas" value={ideas.length} />
        <Stat icon="👥" label="Participantes" value={sessionParticipants.length} />
        <Stat icon="🔗" label="Agrupamentos" value={groups.length} />
        <Stat icon="🐟" label="Causas mapeadas" value={causes.length} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <CardHeader title="Sessão" subtitle="Contexto do problema" />
          <div className="px-5 pb-5 space-y-1.5 text-sm">
            <Row label="Problema" value={session.problem} />
            <Row label="Setor" value={session.sector} />
            <Row label="Equipamento" value={session.equipment || '—'} />
            <Row label="Responsável" value={session.responsible} />
            <Row label="Data" value={formatDate(session.date)} />
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Causas por categoria" subtitle="Distribuição no Ishikawa" />
          <div className="px-3 pb-3">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={72}>
                    {categoryData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-steel-400 text-center py-16">Sem causas classificadas ainda.</p>}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <CardHeader title="Principais causas" subtitle="Top 5 por votação" />
          <div className="px-3 pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCauses} layout="vertical" margin={{ left: 10, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#5c7396' }} />
                <YAxis type="category" dataKey="title" width={140} tick={{ fontSize: 10, fill: '#334262' }} tickFormatter={(v) => (v.length > 18 ? v.slice(0, 18) + '…' : v)} />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Bar dataKey="votes" fill="#1f83f7" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <CardHeader title="Plano de ação" subtitle={`${actions.length} ações registradas`} />
          <div className="px-5 pb-5 grid grid-cols-2 gap-3">
            <ActionStat label="Abertas" value={actionStatusCounts.aberto} color="text-steel-600" />
            <ActionStat label="Em andamento" value={actionStatusCounts.em_andamento} color="text-blue-600" />
            <ActionStat label="Concluídas" value={actionStatusCounts.concluido} color="text-emerald-600" />
            <ActionStat label="Atrasadas" value={actionStatusCounts.atrasado} color="text-red-600" />
          </div>
        </Card>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }) {
  return (
    <Card className="p-4 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-xl font-extrabold text-ink-900 leading-none tabular-nums">{value}</div>
        <div className="text-xs text-steel-500 font-medium mt-1">{label}</div>
      </div>
    </Card>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-steel-400 font-medium">{label}</span>
      <span className="text-ink-800 font-semibold text-right">{value}</span>
    </div>
  )
}

function ActionStat({ label, value, color }) {
  return (
    <div className="bg-steel-50 rounded-xl p-3 text-center">
      <div className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</div>
      <div className="text-xs text-steel-500 font-medium mt-1">{label}</div>
    </div>
  )
}
