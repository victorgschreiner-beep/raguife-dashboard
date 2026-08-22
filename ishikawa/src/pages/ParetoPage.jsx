import { useMemo } from 'react'
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BarChart3 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'

export default function ParetoPage() {
  const allCauses = useAppStore((s) => s.causes)
  const causes = useMemo(() => allCauses.filter((c) => !c.parentId), [allCauses])

  const data = useMemo(() => {
    const sorted = [...causes].sort((a, b) => (b.votes || 0) - (a.votes || 0))
    const total = sorted.reduce((acc, c) => acc + (c.votes || 0), 0) || 1
    let cumulative = 0
    return sorted.map((c) => {
      cumulative += c.votes || 0
      return {
        name: c.title.length > 22 ? c.title.slice(0, 22) + '…' : c.title,
        fullName: c.title,
        quantidade: c.votes || 0,
        percentual: Number((((c.votes || 0) / total) * 100).toFixed(1)),
        acumulado: Number(((cumulative / total) * 100).toFixed(1)),
      }
    })
  }, [causes])

  const vitalFew = data.filter((d) => d.acumulado <= 80.01)

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center text-xl">📊</div>
        <div>
          <h1 className="text-xl font-extrabold text-ink-900">Gráfico de Pareto</h1>
          <p className="text-sm text-steel-500">Os poucos vitais — {vitalFew.length} de {data.length} causas respondem por ~80% dos votos</p>
        </div>
      </div>

      <Card className="p-5 mb-5">
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e7ecf3" />
            <XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} height={80} tick={{ fontSize: 11, fill: '#5c7396' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#5c7396' }} label={{ value: 'Votos', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#5c7396' }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 11, fill: '#5c7396' }} label={{ value: '% acumulado', angle: 90, position: 'insideRight', fontSize: 11, fill: '#5c7396' }} />
            <Tooltip
              formatter={(value, name) => [name === 'acumulado' ? `${value}%` : value, name === 'acumulado' ? '% Acumulado' : name === 'percentual' ? '% do total' : 'Quantidade']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
              contentStyle={{ borderRadius: 10, border: '1px solid #e7ecf3', fontSize: 12 }}
            />
            <Bar yAxisId="left" dataKey="quantidade" fill="#1f83f7" radius={[6, 6, 0, 0]} barSize={38} />
            <Line yAxisId="right" type="monotone" dataKey="acumulado" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-steel-50 text-left text-xs font-bold text-steel-500 uppercase tracking-wide font-mono">
              <th className="px-4 py-3">Causa</th>
              <th className="px-3 py-3 text-center">Quantidade</th>
              <th className="px-3 py-3 text-center">% do total</th>
              <th className="px-3 py-3 text-center">% acumulado</th>
              <th className="px-3 py-3 text-center">Classe</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel-100">
            {data.map((d, i) => (
              <tr key={i} className={vitalFew.includes(d) ? 'bg-brand-50/40' : ''}>
                <td className="px-4 py-3 font-semibold text-ink-800">{d.fullName}</td>
                <td className="px-3 py-3 text-center tabular-nums">{d.quantidade}</td>
                <td className="px-3 py-3 text-center tabular-nums">{d.percentual}%</td>
                <td className="px-3 py-3 text-center tabular-nums font-bold">{d.acumulado}%</td>
                <td className="px-3 py-3 text-center">
                  {vitalFew.includes(d)
                    ? <span className="text-[10px] font-bold bg-brand-100 text-brand-700 rounded-full px-2 py-1">POUCOS VITAIS</span>
                    : <span className="text-[10px] font-bold bg-steel-100 text-steel-500 rounded-full px-2 py-1">MUITOS TRIVIAIS</span>}
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-steel-400">Nenhum dado de votação disponível ainda.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
