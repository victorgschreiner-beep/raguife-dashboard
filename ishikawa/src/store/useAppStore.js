// =============================================================================
// useAppStore — estado global da aplicação (Zustand)
// =============================================================================
// Centraliza sessão ativa, ideias, participantes, grupos, causas, votos,
// ações e configurações de IA. Em produção, cada "set" aqui corresponderia
// a uma escrita no banco (Firestore/Supabase) e cada leitura a uma
// subscription em tempo real — ver README.md §Tempo Real / §Banco de Dados.
// A store foi desenhada para que essa troca não exija reescrever as telas:
// as páginas só chamam as ações (actions) da store, nunca manipulam dados
// diretamente.
// =============================================================================
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AIService } from '../services/AIService'
import {
  DEMO_SESSION, DEMO_IDEAS, DEMO_PARTICIPANTS, DEMO_GROUPS,
  DEMO_CAUSES, DEMO_SUBCAUSES, DEMO_ACTIONS, DEMO_HISTORY,
  SIMULATED_NAMES, SIMULATED_IDEAS_POOL,
} from '../data/mockData'
import {
  generateId, generateSessionCode, randomPostitColor, randomRotation,
} from '../utils/helpers'

const DEFAULT_AI_CONFIG = {
  minSimilarity: 0.35,
  minConfidence: 0.6,
  categories: ['maquina', 'metodo', 'mao_de_obra', 'material', 'medicao', 'meio_ambiente'],
  maxSuggestions: 5,
  autoGrouping: false,
  fiveWhysEnabled: true,
  rootCauseSuggestion: true,
}

const DEFAULT_PRIORITY_FORMULA = {
  criteria: ['impact', 'frequency', 'severity'],
  label: 'Impacto × Frequência × Gravidade',
}

export const useAppStore = create(
  persist(
    (set, get) => ({
      // ---------------------------------------------------------------
      // ESTADO
      // ---------------------------------------------------------------
      session: DEMO_SESSION,
      history: DEMO_HISTORY,
      participants: DEMO_PARTICIPANTS,
      ideas: DEMO_IDEAS,
      groups: DEMO_GROUPS,
      causes: [...DEMO_CAUSES, ...DEMO_SUBCAUSES],
      actions: DEMO_ACTIONS,
      votes: {}, // { [causeId]: Set(userId) } — serializado como array no persist
      aiConfig: DEFAULT_AI_CONFIG,
      priorityFormula: DEFAULT_PRIORITY_FORMULA,

      // estado de UI / sessão do colaborador atual (dispositivo local)
      currentUser: null, // { id, name } — participante identificado no celular
      simulationRunning: false,
      presentationMode: false,
      aiSuggestions: null, // resultado do último "Organizar com IA"
      pendingSimilarity: [], // fila de alertas "⚠️ Ideias semelhantes" aguardando decisão do facilitador
      toasts: [],

      // ---------------------------------------------------------------
      // SESSÃO
      // ---------------------------------------------------------------
      createSession(data) {
        const id = generateId('sess')
        const code = generateSessionCode()
        const session = {
          id,
          code,
          title: data.title || data.problem,
          problem: data.problem,
          sector: data.sector,
          equipment: data.equipment,
          responsible: data.responsible,
          objective: data.objective,
          date: data.date || new Date().toISOString(),
          status: 'ativa',
          createdAt: new Date().toISOString(),
          participants: [],
        }
        set((state) => ({
          session,
          ideas: [],
          groups: [],
          causes: [],
          actions: [],
          votes: {},
          aiSuggestions: null,
          history: [{ id, code, title: session.title, sector: session.sector, date: session.date, status: 'ativa' }, ...state.history],
        }))
        return session
      },

      openSession(sessionId) {
        const item = get().history.find((h) => h.id === sessionId)
        if (item && item.id === DEMO_SESSION.id) {
          set({ session: DEMO_SESSION, ideas: DEMO_IDEAS, groups: DEMO_GROUPS, causes: [...DEMO_CAUSES, ...DEMO_SUBCAUSES], actions: DEMO_ACTIONS })
        }
        // Sessões históricas (não-demo) apenas trocam o cabeçalho — dados
        // completos viriam do backend numa integração real.
        else if (item) {
          set({ session: { ...DEMO_SESSION, ...item, id: item.id } })
        }
      },

      // ---------------------------------------------------------------
      // PARTICIPANTES / COLABORADOR
      // ---------------------------------------------------------------
      identifyParticipant(name) {
        const existing = get().participants.find((p) => p.name.toLowerCase() === name.toLowerCase())
        const user = existing || { id: generateId('u'), name, sector: 'Não informado', role: 'Colaborador' }
        set((state) => ({
          currentUser: user,
          participants: existing ? state.participants : [...state.participants, user],
          session: state.session.participants.includes(user.id)
            ? state.session
            : { ...state.session, participants: [...state.session.participants, user.id] },
        }))
        return user
      },

      // ---------------------------------------------------------------
      // IDEIAS / PAREDE DE POST-ITS
      // ---------------------------------------------------------------
      async addIdea({ text, authorId, authorName, bounds }) {
        const id = generateId('idea')
        const position = randomOrganicPosition(get().ideas, bounds)
        const idea = {
          id,
          sessionId: get().session.id,
          text,
          authorId: authorId || null,
          authorName: authorName || get().participants.find((p) => p.id === authorId)?.name || 'Anônimo',
          category: null,
          confidence: null,
          type: 'causa',
          color: randomPostitColor(),
          rotation: randomRotation(),
          x: position.x,
          y: position.y,
          groupId: null,
          createdAt: new Date().toISOString(),
          isNew: true,
        }
        set((state) => ({ ideas: [...state.ideas, idea] }))
        get().pushToast(`✨ Nova ideia de ${idea.authorName}`)

        // limpa a flag "isNew" após a animação de entrada
        setTimeout(() => {
          set((state) => ({ ideas: state.ideas.map((i) => (i.id === id ? { ...i, isNew: false } : i)) }))
        }, 900)

        // Análise assíncrona pela IA (não bloqueia o envio da ideia)
        const analysis = await AIService.analyzeIdea(idea)
        set((state) => ({
          ideas: state.ideas.map((i) => (i.id === id ? { ...i, ...analysis } : i)),
        }))

        // REGRA: a IA nunca decide sozinha — apenas sinaliza possível duplicidade
        // para o facilitador confirmar (agrupar / manter separadas / ignorar).
        const threshold = get().aiConfig.minSimilarity
        const matches = await AIService.findSimilarIdeas({ ...idea, ...analysis }, get().ideas, threshold)
        const relevant = matches.filter((m) => !m.idea.groupId)
        if (relevant.length > 0) {
          set((state) => ({
            pendingSimilarity: [
              ...state.pendingSimilarity.filter((p) => p.ideaId !== id),
              { id: generateId('sim'), ideaId: id, matches: relevant.slice(0, 3) },
            ],
          }))
        }
        return idea
      },

      resolvePendingSimilarity(pendingId) {
        set((state) => ({ pendingSimilarity: state.pendingSimilarity.filter((p) => p.id !== pendingId) }))
      },

      updateIdeaPosition(ideaId, x, y) {
        set((state) => ({ ideas: state.ideas.map((i) => (i.id === ideaId ? { ...i, x, y } : i)) }))
      },

      updateIdea(ideaId, patch) {
        set((state) => ({ ideas: state.ideas.map((i) => (i.id === ideaId ? { ...i, ...patch } : i)) }))
      },

      deleteIdea(ideaId) {
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== ideaId) }))
      },

      // ---------------------------------------------------------------
      // AGRUPAMENTO
      // ---------------------------------------------------------------
      createGroup(ideaIds, title, category) {
        const id = generateId('grp')
        const group = { id, sessionId: get().session.id, title: title || 'Novo grupo', category: category || null, ideaIds, createdAt: new Date().toISOString() }
        set((state) => ({
          groups: [...state.groups, group],
          ideas: state.ideas.map((i) => (ideaIds.includes(i.id) ? { ...i, groupId: id, category: category || i.category } : i)),
        }))
        return group
      },

      renameGroup(groupId, title) {
        set((state) => ({ groups: state.groups.map((g) => (g.id === groupId ? { ...g, title } : g)) }))
      },

      addIdeaToGroup(groupId, ideaId) {
        set((state) => ({
          groups: state.groups.map((g) => (g.id === groupId ? { ...g, ideaIds: [...new Set([...g.ideaIds, ideaId])] } : g)),
          ideas: state.ideas.map((i) => (i.id === ideaId ? { ...i, groupId } : i)),
        }))
      },

      dissolveGroup(groupId) {
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          ideas: state.ideas.map((i) => (i.groupId === groupId ? { ...i, groupId: null } : i)),
        }))
      },

      async runAIOrganize() {
        const threshold = get().aiConfig.minSimilarity
        const result = await AIService.analyzeWall(get().ideas, threshold)
        set({ aiSuggestions: result })
        return result
      },

      applyAllAISuggestions() {
        const suggestions = get().aiSuggestions
        if (!suggestions) return
        suggestions.groups.forEach((g) => {
          get().createGroup(g.ideaIds, g.suggestedTitle)
        })
        suggestions.classifications.forEach((c) => {
          get().updateIdea(c.ideaId, { category: c.category, confidence: c.confidence })
        })
        set({ aiSuggestions: null })
      },

      dismissAISuggestions() {
        set({ aiSuggestions: null })
      },

      // ---------------------------------------------------------------
      // CAUSAS / ISHIKAWA / 5 PORQUÊS
      // ---------------------------------------------------------------
      createCause({ title, category, parentId = null, type = 'causa' }) {
        const id = generateId('cause')
        const cause = {
          id, sessionId: get().session.id, parentId, category, title, type,
          votes: 0, ideaCount: 0, confidence: 0.7,
          impact: 3, frequency: 3, severity: 3, urgency: 3, cost: 3, ease: 3,
          fiveWhys: [],
        }
        set((state) => ({ causes: [...state.causes, cause] }))
        return cause
      },

      buildIshikawaFromWall() {
        const { ideas, groups, causes } = get()
        const existingTitles = new Set(causes.map((c) => c.title))
        const newCauses = []

        groups.forEach((g) => {
          if (existingTitles.has(g.title)) return
          newCauses.push({
            id: generateId('cause'),
            sessionId: get().session.id,
            parentId: null,
            category: g.category || ideas.find((i) => i.groupId === g.id)?.category || 'metodo',
            title: g.title,
            type: 'causa',
            votes: 0,
            ideaCount: g.ideaIds.length,
            confidence: 0.8,
          })
        })

        ideas.filter((i) => !i.groupId && i.category).forEach((i) => {
          if (existingTitles.has(i.text)) return
          newCauses.push({
            id: generateId('cause'),
            sessionId: get().session.id,
            parentId: null,
            category: i.category,
            title: i.text,
            type: i.type || 'causa',
            votes: 0,
            ideaCount: 1,
            confidence: i.confidence || 0.6,
          })
        })

        set((state) => ({ causes: [...state.causes, ...newCauses] }))
        return newCauses
      },

      updateCause(causeId, patch) {
        set((state) => ({ causes: state.causes.map((c) => (c.id === causeId ? { ...c, ...patch } : c)) }))
      },

      deleteCause(causeId) {
        set((state) => ({ causes: state.causes.filter((c) => c.id !== causeId && c.parentId !== causeId) }))
      },

      setFiveWhys(causeId, chain) {
        set((state) => ({ causes: state.causes.map((c) => (c.id === causeId ? { ...c, fiveWhys: chain } : c)) }))
      },

      // ---------------------------------------------------------------
      // VOTAÇÃO
      // ---------------------------------------------------------------
      castVote(causeId, userId) {
        const votes = { ...get().votes }
        const set_ = new Set(votes[causeId] || [])
        if (set_.has(userId)) return false // já votou — impede duplicidade
        set_.add(userId)
        votes[causeId] = [...set_]
        set((state) => ({
          votes,
          causes: state.causes.map((c) => (c.id === causeId ? { ...c, votes: (votes[causeId] || []).length } : c)),
        }))
        return true
      },

      hasVoted(causeId, userId) {
        return (get().votes[causeId] || []).includes(userId)
      },

      // ---------------------------------------------------------------
      // PLANO DE AÇÃO
      // ---------------------------------------------------------------
      createAction(data) {
        const action = {
          id: generateId('act'),
          sessionId: get().session.id,
          causeId: data.causeId,
          description: data.description,
          responsible: data.responsible || '',
          deadline: data.deadline || '',
          priority: data.priority || 'media',
          status: 'aberto',
          evidence: '',
          observation: data.observation || '',
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ actions: [...state.actions, action] }))
        return action
      },

      updateAction(actionId, patch) {
        set((state) => ({ actions: state.actions.map((a) => (a.id === actionId ? { ...a, ...patch } : a)) }))
      },

      deleteAction(actionId) {
        set((state) => ({ actions: state.actions.filter((a) => a.id !== actionId) }))
      },

      // ---------------------------------------------------------------
      // CONFIGURAÇÕES DE IA / PRIORIZAÇÃO
      // ---------------------------------------------------------------
      updateAIConfig(patch) {
        set((state) => ({ aiConfig: { ...state.aiConfig, ...patch } }))
      },

      updatePriorityFormula(formula) {
        set({ priorityFormula: formula })
      },

      // ---------------------------------------------------------------
      // SIMULAÇÃO DE BRAINSTORM EM TEMPO REAL
      // ---------------------------------------------------------------
      setSimulationRunning(v) {
        set({ simulationRunning: v })
      },

      simulateIncomingIdea(bounds) {
        const name = SIMULATED_NAMES[Math.floor(Math.random() * SIMULATED_NAMES.length)]
        const text = SIMULATED_IDEAS_POOL[Math.floor(Math.random() * SIMULATED_IDEAS_POOL.length)]
        get().addIdea({ text, authorName: name, bounds })
      },

      // ---------------------------------------------------------------
      // UI helpers
      // ---------------------------------------------------------------
      setPresentationMode(v) {
        set({ presentationMode: v })
      },

      pushToast(message) {
        const id = generateId('toast')
        set((state) => ({ toasts: [...state.toasts, { id, message }] }))
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
        }, 3200)
      },
    }),
    {
      name: 'ishikawa-ai-storage',
      partialize: (state) => ({
        session: state.session,
        history: state.history,
        participants: state.participants,
        ideas: state.ideas,
        groups: state.groups,
        causes: state.causes,
        actions: state.actions,
        votes: state.votes,
        aiConfig: state.aiConfig,
        priorityFormula: state.priorityFormula,
        currentUser: state.currentUser,
      }),
    }
  )
)

function randomOrganicPosition(existingIdeas, bounds) {
  const b = bounds || { width: 1200, height: 900 }
  const positions = existingIdeas.map((i) => ({ x: i.x, y: i.y }))
  let best = null
  let bestDist = -1
  for (let attempt = 0; attempt < 30; attempt++) {
    const x = 20 + Math.random() * Math.max(b.width - 220, 100)
    const y = 20 + Math.random() * Math.max(b.height - 220, 100)
    if (positions.length === 0) return { x, y }
    let minFound = Infinity
    positions.forEach((p) => {
      const d = Math.hypot(p.x - x, p.y - y)
      if (d < minFound) minFound = d
    })
    if (minFound >= 150) return { x, y }
    if (minFound > bestDist) { bestDist = minFound; best = { x, y } }
  }
  return best || { x: Math.random() * b.width, y: Math.random() * b.height }
}
