import { useMemo, useState } from 'react'
import { Vote, Check, Trophy } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { Card } from '../components/ui/Card'
import CategoryBadge from '../components/ui/CategoryBadge'
import { classNames } from '../utils/helpers'

export default function VotingPage() {
  const allCauses = useAppStore((s) => s.causes)
  const participants = useAppStore((s) => s.participants)
  const currentUser = useAppStore((s) => s.currentUser)
  const castVote = useAppStore((s) => s.castVote)
  const hasVoted = useAppStore((s) => s.hasVoted)
  const causes = useMemo(() => allCauses.filter((c) => !c.parentId), [allCauses])
  const [voterId, setVoterId] = useState(currentUser?.id || participants[0]?.id || '')

  const ranking = useMemo(() => [...causes].sort((a, b) => (b.votes || 0) - (a.votes || 0)), [causes])
  const totalVotes = causes.reduce((acc, c) => acc + (c.votes || 0), 0)
  const maxVotes = Math.max(1, ...ranking.map((c) => c.votes || 0))

  function vote(causeId) {
    if (!voterId) return
    const ok = castVote(causeId, voterId)
    if (!ok) return // já votou — impedido pela store
  }

  return (
    <div className="p-5 lg:p-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-pink-50 text-pink-700 flex items-center justify-center text-xl">🗳️</div>
          <div>
            <h1 className="text-xl font-extrabold text-ink-900">Votação</h1>
            <p className="text-sm text-steel-500">{totalVotes} votos registrados · {causes.length} causas em disputa</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-steel-500">Votando como:</label>
          <select value={voterId} onChange={(e) => setVoterId(e.target.value)} className="text-sm border border-steel-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-400">
            {participants.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <Card className="p-5">
        <div className="space-y-3">
          {ranking.map((cause, idx) => {
            const voted = voterId && hasVoted(cause.id, voterId)
            return (
              <div key={cause.id} className="flex items-center gap-4">
                <div className={classNames('w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0',
                  idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-steel-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'bg-steel-100 text-steel-500')}>
                  {idx === 0 ? <Trophy size={13} /> : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-ink-900 text-sm truncate">{cause.title}</span>
                    <CategoryBadge category={cause.category} size="sm" />
                  </div>
                  <div className="h-2.5 bg-steel-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all" style={{ width: `${((cause.votes || 0) / maxVotes) * 100}%` }} />
                  </div>
                </div>
                <div className="w-16 text-right shrink-0">
                  <span className="font-extrabold text-ink-900 tabular-nums">{cause.votes || 0}</span>
                  <span className="text-xs text-steel-400"> votos</span>
                </div>
                <button
                  onClick={() => vote(cause.id)}
                  disabled={voted || !voterId}
                  className={classNames(
                    'shrink-0 flex items-center gap-1 text-xs font-bold px-3 py-2 rounded-lg border transition-colors',
                    voted ? 'bg-emerald-50 text-emerald-600 border-emerald-200 cursor-default' : 'bg-ink-900 text-white border-ink-900 hover:bg-ink-800'
                  )}
                >
                  {voted ? <><Check size={13} /> Votado</> : <><Vote size={13} /> Votar</>}
                </button>
              </div>
            )
          })}
          {causes.length === 0 && <p className="text-sm text-steel-400 text-center py-8">Nenhuma causa disponível para votação ainda.</p>}
        </div>
      </Card>

      <p className="text-xs text-steel-400 mt-3 text-center">Cada participante pode votar apenas uma vez em cada causa — o sistema impede voto duplicado.</p>
    </div>
  )
}
