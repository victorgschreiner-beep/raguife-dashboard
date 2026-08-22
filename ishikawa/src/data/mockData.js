// =============================================================================
// mockData.js — dados fictícios de demonstração
// =============================================================================
// Simula o que viria do backend (Firestore/Supabase). Ao integrar um banco
// real, esta é a estrutura de referência das tabelas (ver README.md §Banco de Dados).
// =============================================================================
import { generateId } from '../utils/helpers'

const now = Date.now()
const minutesAgo = (m) => new Date(now - m * 60000).toISOString()

export const DEMO_PARTICIPANTS = [
  { id: 'u1', name: 'Carlos Mendes', sector: 'Produção', role: 'Operador' },
  { id: 'u2', name: 'Maria Souza', sector: 'Qualidade', role: 'Analista' },
  { id: 'u3', name: 'João Pereira', sector: 'Manutenção', role: 'Técnico' },
  { id: 'u4', name: 'Ana Ribeiro', sector: 'Produção', role: 'Líder de linha' },
  { id: 'u5', name: 'Pedro Alves', sector: 'Engenharia', role: 'Engenheiro de Processos' },
  { id: 'u6', name: 'Fernanda Lima', sector: 'PCP', role: 'Planejadora' },
  { id: 'u7', name: 'Roberto Dias', sector: 'Manutenção', role: 'Supervisor' },
]

export const DEMO_SESSION = {
  id: 'sess_demo_01',
  code: 'BR-2026-0087',
  title: 'Baixa produtividade da extrusora Linha 04',
  problem: 'Baixa produtividade da extrusora Linha 04',
  sector: 'Produção',
  equipment: 'Extrusora 04',
  responsible: 'Ana Ribeiro',
  objective: 'Identificar e priorizar as causas-raiz da baixa produtividade e estruturar plano de ação.',
  date: new Date().toISOString(),
  status: 'ativa',
  createdAt: minutesAgo(40),
  participants: DEMO_PARTICIPANTS.map((p) => p.id),
}

const raw = [
  { text: 'Falta de manutenção preventiva', author: 'u3', category: 'maquina', confidence: 0.94 },
  { text: 'Operador sem treinamento', author: 'u1', category: 'mao_de_obra', confidence: 0.91 },
  { text: 'Setup demorado', author: 'u4', category: 'metodo', confidence: 0.88 },
  { text: 'Falta de matéria-prima', author: 'u6', category: 'material', confidence: 0.85 },
  { text: 'Máquina apresenta muitas paradas', author: 'u7', category: 'maquina', confidence: 0.9 },
  { text: 'Falta de peças de reposição', author: 'u3', category: 'maquina', confidence: 0.82 },
  { text: 'Procedimento de setup inadequado', author: 'u4', category: 'metodo', confidence: 0.87 },
  { text: 'Falta de operador na linha', author: 'u1', category: 'mao_de_obra', confidence: 0.79 },
  { text: 'Variação de matéria-prima', author: 'u2', category: 'material', confidence: 0.83 },
  { text: 'Temperatura elevada no setor', author: 'u5', category: 'meio_ambiente', confidence: 0.76 },
  { text: 'Instrumento sem calibração', author: 'u2', category: 'medicao', confidence: 0.89 },
  { text: 'Velocidade abaixo do padrão', author: 'u5', category: 'maquina', confidence: 0.72 },
]

export const DEMO_IDEAS = raw.map((r, i) => ({
  id: generateId('idea'),
  sessionId: DEMO_SESSION.id,
  text: r.text,
  authorId: r.author,
  category: r.category,
  confidence: r.confidence,
  type: i % 5 === 0 ? 'causa_raiz' : 'causa',
  color: ['yellow', 'blue', 'green', 'pink', 'orange', 'purple'][i % 6],
  rotation: (Math.sin(i * 12.9) * 6).toFixed(1),
  x: 60 + (i % 4) * 260 + (i % 2 === 0 ? 20 : -10),
  y: 110 + Math.floor(i / 4) * 230 + (i % 3) * 18,
  groupId: null,
  createdAt: minutesAgo(35 - i * 2),
  votes: [],
}))

// 3 agrupamentos de demonstração
export const DEMO_GROUPS = [
  {
    id: generateId('grp'),
    sessionId: DEMO_SESSION.id,
    title: 'Capacitação insuficiente',
    category: 'mao_de_obra',
    createdAt: minutesAgo(20),
    ideaIds: [],
  },
  {
    id: generateId('grp'),
    sessionId: DEMO_SESSION.id,
    title: 'Falhas de manutenção do equipamento',
    category: 'maquina',
    createdAt: minutesAgo(18),
    ideaIds: [],
  },
  {
    id: generateId('grp'),
    sessionId: DEMO_SESSION.id,
    title: 'Variação de matéria-prima',
    category: 'material',
    createdAt: minutesAgo(15),
    ideaIds: [],
  },
]

// Vincula algumas ideias aos grupos de demonstração
DEMO_GROUPS[0].ideaIds = [DEMO_IDEAS[1].id, DEMO_IDEAS[7].id]
DEMO_GROUPS[1].ideaIds = [DEMO_IDEAS[0].id, DEMO_IDEAS[4].id, DEMO_IDEAS[5].id]
DEMO_GROUPS[2].ideaIds = [DEMO_IDEAS[3].id, DEMO_IDEAS[8].id]
DEMO_GROUPS.forEach((g) => g.ideaIds.forEach((ideaId) => {
  const idea = DEMO_IDEAS.find((i) => i.id === ideaId)
  if (idea) idea.groupId = g.id
}))

// 5 causas priorizadas (para Ishikawa / Pareto / Votação)
export const DEMO_CAUSES = [
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'maquina', title: 'Falta de manutenção preventiva', type: 'causa_raiz', votes: 32, ideaCount: 3, confidence: 0.94, impact: 5, frequency: 5, severity: 4, urgency: 4, cost: 3, ease: 2 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'metodo', title: 'Setup demorado', type: 'causa', votes: 24, ideaCount: 2, confidence: 0.88, impact: 4, frequency: 5, severity: 3, urgency: 3, cost: 2, ease: 4 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'mao_de_obra', title: 'Falta de treinamento', type: 'causa', votes: 21, ideaCount: 2, confidence: 0.91, impact: 4, frequency: 3, severity: 3, urgency: 3, cost: 2, ease: 4 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'material', title: 'Variação de matéria-prima', type: 'causa', votes: 13, ideaCount: 2, confidence: 0.83, impact: 3, frequency: 3, severity: 3, urgency: 2, cost: 3, ease: 3 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'medicao', title: 'Instrumento sem calibração', type: 'causa', votes: 9, ideaCount: 1, confidence: 0.89, impact: 2, frequency: 2, severity: 3, urgency: 2, cost: 1, ease: 5 },
]

// Subcausas de exemplo para a causa "Falta de manutenção preventiva" (hierarquia)
export const DEMO_SUBCAUSES = [
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: DEMO_CAUSES[0].id, category: 'maquina', title: 'Paradas frequentes', type: 'causa', votes: 18, ideaCount: 2, confidence: 0.85 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'maquina', title: 'Falha de rolamento', type: 'causa', votes: 11, ideaCount: 1, confidence: 0.8 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'maquina', title: 'Lubrificação inadequada', type: 'causa', votes: 8, ideaCount: 1, confidence: 0.77 },
  { id: generateId('cause'), sessionId: DEMO_SESSION.id, parentId: null, category: 'maquina', title: 'Plano de lubrificação não executado', type: 'causa_raiz', votes: 6, ideaCount: 1, confidence: 0.9 },
]
DEMO_SUBCAUSES[1].parentId = DEMO_SUBCAUSES[0].id
DEMO_SUBCAUSES[2].parentId = DEMO_SUBCAUSES[1].id
DEMO_SUBCAUSES[3].parentId = DEMO_SUBCAUSES[2].id

export const DEMO_ACTIONS = [
  { id: generateId('act'), sessionId: DEMO_SESSION.id, causeId: DEMO_CAUSES[0].id, description: 'Criar plano de manutenção preventiva da extrusora', responsible: 'João Pereira', deadline: addDays(10), priority: 'critica', status: 'em_andamento', evidence: '', observation: 'Levantamento de criticidade de componentes em andamento.', createdAt: minutesAgo(10) },
  { id: generateId('act'), sessionId: DEMO_SESSION.id, causeId: DEMO_CAUSES[1].id, description: 'Padronizar procedimento de setup (SMED)', responsible: 'Ana Ribeiro', deadline: addDays(20), priority: 'alta', status: 'aberto', evidence: '', observation: '', createdAt: minutesAgo(8) },
  { id: generateId('act'), sessionId: DEMO_SESSION.id, causeId: DEMO_CAUSES[2].id, description: 'Treinar operadores da Linha 04', responsible: 'Fernanda Lima', deadline: addDays(15), priority: 'alta', status: 'concluido', evidence: 'Lista de presença anexada', observation: '', createdAt: minutesAgo(30) },
  { id: generateId('act'), sessionId: DEMO_SESSION.id, causeId: DEMO_CAUSES[3].id, description: 'Auditar fornecedor de matéria-prima', responsible: 'Maria Souza', deadline: addDays(-2), priority: 'media', status: 'atrasado', evidence: '', observation: 'Aguardando retorno do fornecedor.', createdAt: minutesAgo(25) },
]

function addDays(days) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// Histórico de sessões (para tela de Histórico)
export const DEMO_HISTORY = [
  { id: DEMO_SESSION.id, code: DEMO_SESSION.code, title: DEMO_SESSION.title, sector: DEMO_SESSION.sector, date: DEMO_SESSION.date, status: 'ativa' },
  { id: 'sess_demo_02', code: 'BR-2026-0071', title: 'Retrabalho excessivo na linha de embalagem', sector: 'Embalagem', date: addDays(-12), status: 'concluida' },
  { id: 'sess_demo_03', code: 'BR-2026-0058', title: 'Alto índice de refugo — Injetora 02', sector: 'Produção', date: addDays(-25), status: 'concluida' },
  { id: 'sess_demo_04', code: 'BR-2026-0044', title: 'Atrasos recorrentes na expedição', sector: 'Logística', date: addDays(-40), status: 'arquivada' },
]

export const SIMULATED_NAMES = ['Carlos', 'Maria', 'João', 'Ana', 'Pedro', 'Fernanda', 'Roberto', 'Juliana', 'Marcos', 'Patrícia']

export const SIMULATED_IDEAS_POOL = [
  'Falta de padronização na troca de bobina',
  'Sensor de temperatura descalibrado',
  'Falta de check-list no início do turno',
  'Rotatividade alta de operadores',
  'Fornecedor entrega matéria-prima fora de especificação',
  'Falta de indicador visual de status da máquina',
  'Tempo de resposta da manutenção corretiva alto',
  'Ferramentas de setup não organizadas (5S)',
  'Falta de plano de contingência para parada não programada',
  'Comunicação falha entre turnos',
]
