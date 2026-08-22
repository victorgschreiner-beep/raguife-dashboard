import { useMemo, useState } from 'react'
import { FileDown, Printer } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { ExportService } from '../services/ExportService'
import { Card } from '../components/ui/Card'
import Button from '../components/ui/Button'
import CategoryBadge from '../components/ui/CategoryBadge'
import { formatDate, formatDateTime, CATEGORIES } from '../utils/helpers'

export default function ReportPage() {
  const session = useAppStore((s) => s.session)
  const ideas = useAppStore((s) => s.ideas)
  const groups = useAppStore((s) => s.groups)
  const participants = useAppStore((s) => s.participants)
  const allCauses = useAppStore((s) => s.causes)
  const actions = useAppStore((s) => s.actions)
  const causes = useMemo(() => allCauses.filter((c) => !c.parentId), [allCauses])
  const [exporting, setExporting] = useState(false)

  const sessionParticipants = participants.filter((p) => session.participants.includes(p.id))
  const ranking = [...causes].sort((a, b) => (b.votes || 0) - (a.votes || 0))
  const totalVotes = causes.reduce((acc, c) => acc + (c.votes || 0), 0) || 1
  let cumulative = 0
  const pareto = ranking.map((c) => {
    cumulative += c.votes || 0
    return { ...c, pct: Math.round(((c.votes || 0) / totalVotes) * 100), cum: Math.round((cumulative / totalVotes) * 100) }
  })

  async function handleExportPDF() {
    setExporting(true)
    try {
      await ExportService.exportElementToPDF('report-content', `relatorio-${session.code}.pdf`)
    } catch (e) {
      alert('Não foi possível gerar o PDF automaticamente. Use "Imprimir" como alternativa.')
    }
    setExporting(false)
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Relatório da Sessão</h1>
          <p className="text-sm text-steel-500">Documento completo pronto para exportação</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => ExportService.printCurrentPage()}><Printer size={15} /> Imprimir</Button>
          <Button onClick={handleExportPDF} disabled={exporting}><FileDown size={15} /> {exporting ? 'Gerando PDF...' : 'Exportar PDF'}</Button>
        </div>
      </div>

      <div id="report-content" className="bg-white">
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🐟</span>
            <span className="font-extrabold text-ink-900">ISHIKAWA AI — Relatório de Melhoria Contínua</span>
          </div>
          <div className="text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded px-2 py-1 inline-block mb-3">{session.code}</div>
          <h2 className="text-lg font-extrabold text-ink-900">{session.problem}</h2>
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-steel-600">
            <span><b>Setor:</b> {session.sector}</span>
            <span><b>Equipamento:</b> {session.equipment || '—'}</span>
            <span><b>Responsável:</b> {session.responsible}</span>
            <span><b>Data:</b> {formatDate(session.date)}</span>
          </div>
        </Card>

        <ReportSection title="1. Participantes" subtitle={`${sessionParticipants.length} colaboradores`}>
          <div className="flex flex-wrap gap-2">
            {sessionParticipants.map((p) => <span key={p.id} className="text-xs font-semibold bg-steel-50 border border-steel-200 rounded-full px-3 py-1">{p.name}</span>)}
          </div>
        </ReportSection>

        <ReportSection title="2. Brainstorm" subtitle={`${ideas.length} ideias coletadas · ${groups.length} agrupamentos`}>
          <div className="grid sm:grid-cols-2 gap-2">
            {ideas.map((i) => (
              <div key={i.id} className="text-xs bg-steel-50 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                <span className="truncate">{i.text}</span>
                <CategoryBadge category={i.category} size="sm" />
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="3. Ideias agrupadas" subtitle={`${groups.length} grupos`}>
          {groups.map((g) => (
            <div key={g.id} className="mb-2">
              <div className="text-sm font-bold text-ink-800">{g.title}</div>
              <div className="text-xs text-steel-500">{g.ideaIds.length} ideias vinculadas</div>
            </div>
          ))}
          {groups.length === 0 && <p className="text-xs text-steel-400">Nenhum agrupamento realizado.</p>}
        </ReportSection>

        <ReportSection title="4. Diagrama de Ishikawa" subtitle="Causas por categoria">
          <div className="grid sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const list = causes.filter((c) => c.category === cat.key)
              if (list.length === 0) return null
              return (
                <div key={cat.key}>
                  <div className="text-xs font-bold text-ink-700">{cat.icon} {cat.label} ({list.length})</div>
                  <ul className="mt-1 space-y-0.5">
                    {list.map((c) => <li key={c.id} className="text-xs text-steel-500">• {c.title}</li>)}
                  </ul>
                </div>
              )
            })}
          </div>
        </ReportSection>

        <ReportSection title="5. 5 Porquês">
          {causes.filter((c) => c.fiveWhys?.length > 0).map((c) => (
            <div key={c.id} className="mb-3">
              <div className="text-sm font-bold text-ink-800">{c.title}</div>
              <ol className="mt-1 space-y-0.5 list-decimal list-inside">
                {c.fiveWhys.map((w, i) => <li key={i} className="text-xs text-steel-500">{w.answer}</li>)}
              </ol>
            </div>
          ))}
          {causes.every((c) => !c.fiveWhys?.length) && <p className="text-xs text-steel-400">Nenhuma investigação de 5 Porquês registrada.</p>}
        </ReportSection>

        <ReportSection title="6. Ranking de votação">
          <ol className="space-y-1">
            {ranking.map((c, i) => (
              <li key={c.id} className="text-sm text-ink-700 flex justify-between">
                <span>{i + 1}. {c.title}</span>
                <span className="font-bold">{c.votes || 0} votos</span>
              </li>
            ))}
          </ol>
        </ReportSection>

        <ReportSection title="7. Pareto (poucos vitais)">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-steel-400 font-bold uppercase"><th className="py-1">Causa</th><th>%</th><th>Acumulado</th></tr></thead>
            <tbody>
              {pareto.map((c) => (
                <tr key={c.id} className="border-t border-steel-100">
                  <td className="py-1.5">{c.title}</td>
                  <td>{c.pct}%</td>
                  <td className="font-bold">{c.cum}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        <ReportSection title="8. Causas prioritárias">
          {causes.filter((c) => c.type === 'causa_raiz').map((c) => (
            <div key={c.id} className="text-sm text-red-700 font-semibold">🎯 {c.title}</div>
          ))}
          {causes.every((c) => c.type !== 'causa_raiz') && <p className="text-xs text-steel-400">Nenhuma causa raiz confirmada ainda.</p>}
        </ReportSection>

        <ReportSection title="9. Plano de ação">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-steel-400 font-bold uppercase"><th className="py-1">Ação</th><th>Responsável</th><th>Prazo</th><th>Status</th></tr></thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id} className="border-t border-steel-100">
                  <td className="py-1.5 max-w-[180px]">{a.description}</td>
                  <td>{a.responsible || '—'}</td>
                  <td>{a.deadline ? formatDate(a.deadline) : '—'}</td>
                  <td className="font-bold uppercase">{a.status.replace('_', ' ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        <p className="text-[10px] text-steel-400 text-center mt-6">Relatório gerado automaticamente pelo ISHIKAWA AI em {formatDateTime(new Date())}.</p>
      </div>
    </div>
  )
}

function ReportSection({ title, subtitle, children }) {
  return (
    <Card className="p-6 mb-4 break-inside-avoid">
      <h3 className="font-extrabold text-ink-900 text-sm uppercase tracking-wide font-mono">{title}</h3>
      {subtitle && <p className="text-xs text-steel-400 mb-3">{subtitle}</p>}
      <div className={subtitle ? '' : 'mt-3'}>{children}</div>
    </Card>
  )
}
