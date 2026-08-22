import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Play, Pause, Plus, Fish, Tv, Maximize2, Minimize2 } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/ui/Button'
import StatBadge from '../components/ui/StatBadge'
import FilterBar from '../components/wall/FilterBar'
import PostIt from '../components/wall/PostIt'
import GroupCluster from '../components/wall/GroupCluster'
import IdeaDetailPanel from '../components/wall/IdeaDetailPanel'
import SimilarityAlert from '../components/wall/SimilarityAlert'
import AIOrganizeModal from '../components/wall/AIOrganizeModal'
import NewIdeaModal from '../components/wall/NewIdeaModal'

export default function BrainstormWall() {
  const navigate = useNavigate()
  const session = useAppStore((s) => s.session)
  const ideas = useAppStore((s) => s.ideas)
  const groups = useAppStore((s) => s.groups)
  const participants = useAppStore((s) => s.participants)
  const pendingSimilarity = useAppStore((s) => s.pendingSimilarity)
  const simulationRunning = useAppStore((s) => s.simulationRunning)
  const setSimulationRunning = useAppStore((s) => s.setSimulationRunning)
  const simulateIncomingIdea = useAppStore((s) => s.simulateIncomingIdea)
  const updateIdeaPosition = useAppStore((s) => s.updateIdeaPosition)
  const runAIOrganize = useAppStore((s) => s.runAIOrganize)
  const dismissAISuggestions = useAppStore((s) => s.dismissAISuggestions)
  const aiSuggestions = useAppStore((s) => s.aiSuggestions)
  const buildIshikawaFromWall = useAppStore((s) => s.buildIshikawaFromWall)

  const wallRef = useRef(null)
  const [filter, setFilter] = useState('todas')
  const [selectedIdea, setSelectedIdea] = useState(null)
  const [showNewIdea, setShowNewIdea] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [presentation, setPresentation] = useState(false)

  const participantsById = useMemo(() => Object.fromEntries(participants.map((p) => [p.id, p])), [participants])
  const ideasById = useMemo(() => Object.fromEntries(ideas.map((i) => [i.id, i])), [ideas])

  // ------------------------------------------------------------------
  // Simulação de brainstorm em tempo real (para demonstração comercial)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!simulationRunning) return
    let cancelled = false
    function tick() {
      if (cancelled) return
      const bounds = wallRef.current ? { width: wallRef.current.scrollWidth || 1400, height: wallRef.current.scrollHeight || 1000 } : { width: 1400, height: 1000 }
      simulateIncomingIdea(bounds)
      const delay = 3000 + Math.random() * 2000
      setTimeout(tick, delay)
    }
    const initialDelay = 1200
    const t = setTimeout(tick, initialDelay)
    return () => { cancelled = true; clearTimeout(t) }
  }, [simulationRunning, simulateIncomingIdea])

  const groupedIds = useMemo(() => new Set(groups.flatMap((g) => g.ideaIds)), [groups])

  const visibleIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      if (groupedIds.has(idea.id)) return false // ideias agrupadas aparecem no cluster, não soltas
      switch (filter) {
        case 'todas': return true
        case 'sem_classificacao': return !idea.category
        case 'agrupadas': return false
        case 'prioritarias': return idea.type === 'causa_raiz'
        case 'sugestoes_ia': return typeof idea.confidence === 'number' && idea.confidence >= 0.8
        default: return idea.category === filter
      }
    })
  }, [ideas, filter, groupedIds])

  const visibleGroups = filter === 'todas' || filter === 'agrupadas' ? groups : groups.filter((g) => g.category === filter)

  async function handleOrganize() {
    setAnalyzing(true)
    await runAIOrganize()
    setAnalyzing(false)
  }

  function handleDragEnd(ideaId, info) {
    const idea = ideasById[ideaId]
    if (!idea) return
    const nextX = Math.max(0, idea.x + info.offset.x)
    const nextY = Math.max(0, idea.y + info.offset.y)
    updateIdeaPosition(ideaId, nextX, nextY)
  }

  function handleBuildIshikawa() {
    buildIshikawaFromWall()
    navigate(`/sessao/${session.id}/ishikawa`)
  }

  const wallHeight = Math.max(1100, ...ideas.map((i) => i.y + 260))
  const wallWidth = Math.max(1400, ...ideas.map((i) => i.x + 260))

  const content = (
    <div className={presentation ? 'fixed inset-0 z-[250] bg-ink-950 flex flex-col' : 'flex flex-col h-[calc(100vh-61px)]'}>
      <div className={presentation ? 'px-6 py-4 flex items-center justify-between' : 'px-5 py-3 flex items-center justify-between border-b border-steel-200 bg-white'}>
        <div className="flex items-center gap-2 flex-wrap">
          <StatBadge icon="🧠" value={ideas.length} label="ideias" tone={presentation ? 'live' : 'default'} />
          <StatBadge icon="👥" value={participants.length} label="participantes" tone={presentation ? 'live' : 'default'} />
          <StatBadge icon="🔗" value={groups.length} label="grupos" tone={presentation ? 'live' : 'default'} />
          <StatBadge icon="🤖" value={ideas.filter((i) => i.category).length} label="classificadas por IA" tone={presentation ? 'live' : 'default'} />
        </div>

        <div className="flex items-center gap-2 no-print">
          {!presentation && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setShowNewIdea(true)}><Plus size={14} /> Adicionar ideia</Button>
              <Button size="sm" variant={simulationRunning ? 'danger' : 'secondary'} onClick={() => setSimulationRunning(!simulationRunning)}>
                {simulationRunning ? <><Pause size={14} /> Pausar simulação</> : <><Play size={14} /> Simular Brainstorm</>}
              </Button>
              <Button size="sm" variant="dark" onClick={handleOrganize} disabled={analyzing}>
                <Sparkles size={14} /> {analyzing ? 'Analisando...' : 'Organizar com IA'}
              </Button>
              <Button size="sm" onClick={handleBuildIshikawa}><Fish size={14} /> Construir Ishikawa</Button>
            </>
          )}
          <button onClick={() => setPresentation((v) => !v)} className={presentation ? 'text-white/70 hover:text-white p-2' : 'text-steel-500 hover:text-ink-800 p-2'}>
            {presentation ? <Minimize2 size={18} /> : <Tv size={18} />}
          </button>
        </div>
      </div>

      {!presentation && (
        <div className="px-5 py-2.5 border-b border-steel-200 bg-white no-print">
          <FilterBar active={filter} onChange={setFilter} />
        </div>
      )}

      {presentation && (
        <div className="px-6 pb-3">
          <div className="text-white/60 text-xs font-bold uppercase tracking-wide font-mono">Problema em análise</div>
          <div className="text-white text-lg font-bold">{session.problem}</div>
        </div>
      )}

      <div className="flex-1 overflow-auto wall-surface" onClick={() => setSelectedIdea(null)}>
        <div ref={wallRef} className="relative" style={{ width: wallWidth, height: wallHeight, minHeight: '100%' }}>
          {visibleGroups.map((g) => (
            <GroupCluster
              key={g.id}
              group={g}
              ideas={ideas.filter((i) => g.ideaIds.includes(i.id))}
              participantsById={participantsById}
              wallRef={wallRef}
              onIdeaClick={(idea) => setSelectedIdea(idea)}
            />
          ))}

          {visibleIdeas.map((idea) => (
            <div key={`${idea.id}:${Math.round(idea.x)}:${Math.round(idea.y)}`} onClick={(e) => e.stopPropagation()}>
              <PostIt
                idea={idea}
                author={participantsById[idea.authorId]?.name || idea.authorName || 'Anônimo'}
                wallRef={wallRef}
                onDragEnd={handleDragEnd}
                onClick={setSelectedIdea}
                selected={selectedIdea?.id === idea.id}
              />
            </div>
          ))}

          {ideas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-center px-6">
              <div>
                <div className="text-5xl mb-3">🧠</div>
                <p className="text-steel-400 font-medium">A parede está vazia. Compartilhe o QR Code ou clique em "Adicionar ideia".</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {content}
      {selectedIdea && !presentation && (
        <IdeaDetailPanel idea={selectedIdea} participantsById={participantsById} allIdeas={ideas} onClose={() => setSelectedIdea(null)} />
      )}
      {pendingSimilarity.length > 0 && !presentation && (
        <SimilarityAlert pending={pendingSimilarity[0]} ideasById={ideasById} />
      )}
      {aiSuggestions && !presentation && (
        <AIOrganizeModal suggestions={aiSuggestions} ideasById={ideasById} onClose={dismissAISuggestions} />
      )}
      {showNewIdea && (
        <NewIdeaModal bounds={{ width: wallWidth, height: wallHeight }} onClose={() => setShowNewIdea(false)} />
      )}
    </>
  )
}
