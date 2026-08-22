import { useNavigate } from 'react-router-dom'
import { ChevronLeft, History as HistoryIcon } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'
import { formatDate, classNames } from '../utils/helpers'

const STATUS_MAP = {
  ativa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  concluida: 'bg-steel-100 text-steel-600 border-steel-200',
  arquivada: 'bg-amber-50 text-amber-700 border-amber-200',
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const history = useAppStore((s) => s.history)
  const openSession = useAppStore((s) => s.openSession)

  function open(h) {
    openSession(h.id)
    navigate(`/sessao/${h.id}/painel`)
  }

  return (
    <div className="min-h-screen wall-surface">
      <header className="px-6 lg:px-10 py-5 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-steel-500 hover:text-ink-800"><ChevronLeft size={22} /></button>
        <div className="flex items-center gap-2">
          <HistoryIcon size={18} className="text-brand-700" />
          <h1 className="font-bold text-ink-900">Histórico de Sessões</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pb-16">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-steel-50 text-left text-xs font-bold text-steel-500 uppercase tracking-wide font-mono">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Sessão / Problema</th>
                <th className="px-4 py-3">Setor</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel-100">
              {history.map((h) => (
                <tr key={h.id} onClick={() => open(h)} className="cursor-pointer hover:bg-steel-50/60">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-brand-700">{h.code}</td>
                  <td className="px-4 py-3 font-semibold text-ink-800">{h.title}</td>
                  <td className="px-4 py-3 text-steel-500">{h.sector}</td>
                  <td className="px-4 py-3 text-steel-500">{formatDate(h.date)}</td>
                  <td className="px-4 py-3">
                    <span className={classNames('text-[10px] font-bold uppercase tracking-wide font-mono border rounded px-2 py-1', STATUS_MAP[h.status])}>{h.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  )
}
