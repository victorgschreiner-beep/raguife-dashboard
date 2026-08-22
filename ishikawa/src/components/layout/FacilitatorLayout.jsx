import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, StickyNote, Fish, HelpCircle, Vote, Target, BarChart3,
  ClipboardList, LayoutDashboard, FileText, History, Settings, Tv, ChevronLeft,
} from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import { classNames } from '../../utils/helpers'

const NAV_ITEMS = [
  { to: 'painel', label: 'Painel do Facilitador', icon: LayoutGrid },
  { to: 'parede', label: 'Parede de Post-its', icon: StickyNote },
  { to: 'ishikawa', label: 'Ishikawa', icon: Fish },
  { to: '5porques', label: '5 Porquês', icon: HelpCircle },
  { to: 'votacao', label: 'Votação', icon: Vote },
  { to: 'priorizacao', label: 'Priorização', icon: Target },
  { to: 'pareto', label: 'Pareto', icon: BarChart3 },
  { to: 'plano-de-acao', label: 'Plano de Ação', icon: ClipboardList },
  { to: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: 'relatorio', label: 'Relatório', icon: FileText },
]

export default function FacilitatorLayout() {
  const { id } = useParams()
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const ideas = useAppStore((s) => s.ideas)
  const participants = useAppStore((s) => s.participants)
  const groups = useAppStore((s) => s.groups)

  return (
    <div className="min-h-screen flex bg-steel-50">
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-raguife-header text-white min-h-screen shadow-[2px_0_16px_rgba(2,79,43,0.25)]">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 text-left">
          <span className="text-2xl">🐟</span>
          <div>
            <div className="font-extrabold tracking-tight leading-none">ISHIKAWA <span className="text-olive-300">AI</span></div>
            <div className="text-[11px] text-steel-400 leading-none mt-1">Melhoria Contínua Inteligente</div>
          </div>
        </button>

        <nav className="flex-1 overflow-y-auto py-3 px-2.5 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={`/sessao/${id}/${item.to}`}
              className={({ isActive }) => classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors',
                isActive ? 'bg-brand-600 text-white' : 'text-steel-300 hover:bg-white/5 hover:text-white'
              )}
            >
              <item.icon size={17} strokeWidth={2.2} />
              {item.label}
            </NavLink>
          ))}
          <div className="h-px bg-white/10 my-3" />
          <NavLink to="/historico" className={({ isActive }) => classNames('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1', isActive ? 'bg-white/10 text-white' : 'text-steel-300 hover:bg-white/5 hover:text-white')}>
            <History size={17} strokeWidth={2.2} /> Histórico
          </NavLink>
          <NavLink to="/configuracoes-ia" className={({ isActive }) => classNames('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1', isActive ? 'bg-white/10 text-white' : 'text-steel-300 hover:bg-white/5 hover:text-white')}>
            <Settings size={17} strokeWidth={2.2} /> Configurações da IA
          </NavLink>
        </nav>

        <button
          onClick={() => navigate(`/sessao/${id}/parede`)}
          className="mx-3 mb-4 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-2.5 rounded-lg"
        >
          <Tv size={16} /> Modo Apresentação
        </button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-steel-200 px-4 lg:px-6 py-3 flex items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => navigate('/')} className="lg:hidden text-steel-500"><ChevronLeft size={20} /></button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded px-1.5 py-0.5">{session.code}</span>
                <span className={classNames('text-[11px] font-mono font-bold rounded px-1.5 py-0.5 uppercase tracking-wide font-mono', session.status === 'ativa' ? 'bg-olive-100 text-olive-600 border border-olive-200' : 'bg-steel-100 text-steel-500 border border-steel-200')}>
                  {session.status === 'ativa' ? '● AO VIVO' : session.status}
                </span>
              </div>
              <h1 className="font-bold text-ink-900 truncate">{session.problem}</h1>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <StatMini icon="🧠" value={ideas.length} label="ideias" />
            <StatMini icon="👥" value={participants.length} label="participantes" />
            <StatMini icon="🔗" value={groups.length} label="grupos" />
          </div>
        </header>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function StatMini({ icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 bg-steel-100 rounded-lg px-2.5 py-1.5 text-xs font-bold text-ink-700">
      <span>{icon}</span><span className="tabular-nums font-mono">{value}</span><span className="font-mono text-[10px] uppercase tracking-wide font-mono text-steel-500">{label}</span>
    </div>
  )
}
