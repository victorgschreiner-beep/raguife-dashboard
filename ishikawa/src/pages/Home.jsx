import { useNavigate } from 'react-router-dom'
import { PlusCircle, LogIn, History, LayoutDashboard, ArrowRight } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import { formatDate } from '../utils/helpers'
import { useState } from 'react'

export default function Home() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const history = useAppStore((s) => s.history)
  const openSession = useAppStore((s) => s.openSession)
  const [code, setCode] = useState('')

  function handleEnter() {
    const found = history.find((h) => h.code.toLowerCase() === code.trim().toLowerCase())
    if (found) {
      openSession(found.id)
      navigate(`/sessao/${found.id}/painel`)
    } else {
      openSession(session.id)
      navigate(`/sessao/${session.id}/painel`)
    }
  }

  return (
    <div className="min-h-screen wall-surface">
      <header className="flex items-center justify-between px-6 lg:px-10 py-6">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">🐟</span>
          <div>
            <div className="font-extrabold text-xl tracking-tight text-ink-900 leading-none">ISHIKAWA <span className="text-olive-500">AI</span></div>
            <div className="text-xs text-steel-500 leading-none mt-1">Plataforma industrial de causa-raiz com IA</div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-steel-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-soft" /> Ambiente de demonstração
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 lg:px-10 pb-16">
        <div className="mt-6 mb-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-ink-900 tracking-tight max-w-2xl">
            Transforme a parede de post-its em análise inteligente de causa-raiz.
          </h1>
          <p className="text-steel-500 mt-3 max-w-xl">
            QR Code → Colaboradores → Parede de Post-its → IA → Ishikawa → 5 Porquês → Priorização → Pareto → Plano de Ação.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <ActionCard
            icon={<PlusCircle size={22} />}
            title="Nova sessão"
            desc="Crie um novo brainstorm industrial: defina o problema, setor e equipamento envolvidos."
            action={() => navigate('/nova-sessao')}
            tone="brand"
          />
          <ActionCard
            icon={<LogIn size={22} />}
            title="Entrar em sessão"
            desc="Acesse uma sessão ativa pelo código (ex: BR-2026-0087) para continuar o trabalho."
            tone="dark"
          >
            <div className="flex gap-2 mt-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="BR-2026-0087"
                className="flex-1 bg-white border border-steel-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <Button onClick={handleEnter} size="md">Entrar</Button>
            </div>
          </ActionCard>
        </div>

        <div className="grid md:grid-cols-2 gap-5 mt-5">
          <ActionCard
            icon={<History size={22} />}
            title="Histórico de sessões"
            desc={`${history.length} sessões registradas — reabra análises anteriores e acompanhe planos de ação.`}
            action={() => navigate('/historico')}
          />
          <ActionCard
            icon={<LayoutDashboard size={22} />}
            title="Sessão em andamento"
            desc={`${session.code} · ${session.problem}`}
            action={() => { openSession(session.id); navigate(`/sessao/${session.id}/painel`) }}
          />
        </div>

        <Card className="mt-10 p-6">
          <h2 className="font-bold text-ink-900 mb-4">Sessões recentes</h2>
          <div className="divide-y divide-steel-100">
            {history.slice(0, 5).map((h) => (
              <button
                key={h.id}
                onClick={() => { openSession(h.id); navigate(`/sessao/${h.id}/painel`) }}
                className="w-full flex items-center justify-between py-3 text-left hover:bg-steel-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded px-1.5 py-0.5">{h.code}</span>
                    <span className="font-semibold text-ink-800 truncate">{h.title}</span>
                  </div>
                  <div className="text-xs text-steel-500 mt-1">{h.sector} · {formatDate(h.date)}</div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusPill status={h.status} />
                  <ArrowRight size={16} className="text-steel-400" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}

function ActionCard({ icon, title, desc, action, tone = 'default', children }) {
  const tones = {
    default: 'bg-white border-steel-200',
    brand: 'bg-gradient-to-br from-brand-600 to-brand-800 border-transparent text-white',
    dark: 'bg-white border-steel-200',
  }
  const isColored = tone === 'brand'
  return (
    <div className={`rounded-2xl border shadow-card p-6 flex flex-col ${tones[tone]}`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isColored ? 'bg-white/15' : 'bg-brand-50 text-brand-700'}`}>
        {icon}
      </div>
      <h3 className={`font-bold text-lg ${isColored ? 'text-white' : 'text-ink-900'}`}>{title}</h3>
      <p className={`text-sm mt-1.5 flex-1 ${isColored ? 'text-white/80' : 'text-steel-500'}`}>{desc}</p>
      {children}
      {action && (
        <button onClick={action} className={`mt-4 inline-flex items-center gap-1.5 text-sm font-bold self-start ${isColored ? 'text-white' : 'text-brand-700'}`}>
          Acessar <ArrowRight size={15} />
        </button>
      )}
    </div>
  )
}

function StatusPill({ status }) {
  const map = {
    ativa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    concluida: 'bg-steel-100 text-steel-600 border-steel-200',
    arquivada: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return <span className={`text-[10px] font-bold uppercase tracking-wide font-mono border rounded px-1.5 py-0.5 ${map[status] || map.concluida}`}>{status}</span>
}
