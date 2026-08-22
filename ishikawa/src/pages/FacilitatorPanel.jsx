import { useNavigate } from 'react-router-dom'
import { StickyNote, Fish, HelpCircle, Vote, Target, BarChart3, ClipboardList, FileText, ArrowRight, Users } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card, CardHeader } from '../components/ui/Card'
import { formatDate, formatDateTime } from '../utils/helpers'

const STEPS = [
  { to: 'parede', icon: StickyNote, title: 'Parede de Post-its', desc: 'Receba e organize ideias em tempo real.', color: 'bg-amber-50 text-amber-700' },
  { to: 'ishikawa', icon: Fish, title: 'Diagrama de Ishikawa', desc: 'Classifique as causas nas 6 categorias (6M).', color: 'bg-blue-50 text-blue-700' },
  { to: '5porques', icon: HelpCircle, title: '5 Porquês', desc: 'Investigue a causa raiz com apoio da IA.', color: 'bg-purple-50 text-purple-700' },
  { to: 'votacao', icon: Vote, title: 'Votação', desc: 'Participantes elegem as causas mais relevantes.', color: 'bg-pink-50 text-pink-700' },
  { to: 'priorizacao', icon: Target, title: 'Priorização', desc: 'Matriz de impacto, frequência e gravidade.', color: 'bg-emerald-50 text-emerald-700' },
  { to: 'pareto', icon: BarChart3, title: 'Pareto', desc: 'Identifique os poucos vitais (80/20).', color: 'bg-cyan-50 text-cyan-700' },
  { to: 'plano-de-acao', icon: ClipboardList, title: 'Plano de Ação', desc: 'Transforme causas em ações rastreáveis.', color: 'bg-orange-50 text-orange-700' },
  { to: 'relatorio', icon: FileText, title: 'Relatório', desc: 'Exporte a análise completa da sessão.', color: 'bg-steel-100 text-steel-700' },
]

export default function FacilitatorPanel() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const ideas = useAppStore((s) => s.ideas)
  const participants = useAppStore((s) => s.participants)
  const groups = useAppStore((s) => s.groups)
  const causes = useAppStore((s) => s.causes)
  const actions = useAppStore((s) => s.actions)

  const sessionParticipants = participants.filter((p) => session.participants.includes(p.id))

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto">
      <Card className="p-6 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Problema</div>
            <h1 className="text-xl font-extrabold text-ink-900 mt-0.5">{session.problem}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-sm text-steel-500">
              <span><b className="text-ink-700">Setor:</b> {session.sector}</span>
              {session.equipment && <span><b className="text-ink-700">Equipamento:</b> {session.equipment}</span>}
              <span><b className="text-ink-700">Responsável:</b> {session.responsible}</span>
              <span><b className="text-ink-700">Data:</b> {formatDate(session.date)}</span>
            </div>
            {session.objective && <p className="text-sm text-steel-500 mt-2 italic">"{session.objective}"</p>}
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => navigate(`/sessao/${session.id}/qrcode`)} className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2 hover:bg-brand-100">
              Ver QR Code
            </button>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Ideias" value={ideas.length} icon="🧠" />
        <MiniStat label="Participantes" value={sessionParticipants.length} icon="👥" />
        <MiniStat label="Grupos" value={groups.length} icon="🔗" />
        <MiniStat label="Causas mapeadas" value={causes.length} icon="🐟" />
      </div>

      <h2 className="font-bold text-ink-900 mb-3">Fluxo da sessão</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STEPS.map((step) => (
          <button key={step.to} onClick={() => navigate(`/sessao/${session.id}/${step.to}`)} className="text-left bg-white rounded-2xl border border-steel-200 shadow-card p-4 hover:shadow-panel transition-shadow">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${step.color}`}><step.icon size={18} /></div>
            <div className="font-bold text-ink-900 text-sm">{step.title}</div>
            <div className="text-xs text-steel-500 mt-1">{step.desc}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-brand-700 mt-2.5">Acessar <ArrowRight size={12} /></div>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader icon={<Users size={20} className="text-brand-700" />} title="Participantes" subtitle={`${sessionParticipants.length} pessoas nesta sessão`} />
        <div className="px-5 pb-5 flex flex-wrap gap-2">
          {sessionParticipants.map((p) => (
            <div key={p.id} className="flex items-center gap-2 bg-steel-50 border border-steel-200 rounded-full pl-1 pr-3 py-1">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-[11px] font-bold flex items-center justify-center">{p.name.charAt(0)}</span>
              <span className="text-xs font-semibold text-ink-700">{p.name}</span>
            </div>
          ))}
          {sessionParticipants.length === 0 && <p className="text-sm text-steel-400">Nenhum participante entrou ainda. Compartilhe o QR Code.</p>}
        </div>
      </Card>
    </div>
  )
}

function MiniStat({ label, value, icon }) {
  return (
    <div className="bg-white rounded-2xl border border-steel-200 shadow-card p-4 flex items-center gap-3">
      <div className="text-2xl">{icon}</div>
      <div>
        <div className="text-xl font-extrabold text-ink-900 leading-none tabular-nums">{value}</div>
        <div className="text-xs text-steel-500 font-medium mt-1">{label}</div>
      </div>
    </div>
  )
}
