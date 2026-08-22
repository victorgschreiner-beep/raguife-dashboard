// =============================================================================
// AIService — camada de inteligência artificial do ISHIKAWA AI
// =============================================================================
// Esta é a ÚNICA camada que deve conhecer "IA". Nenhum componente de UI deve
// implementar lógica de classificação, similaridade ou sugestão diretamente —
// tudo passa por aqui, para que a troca do MOCK por uma API real (OpenAI,
// Anthropic, Azure Cognitive, modelo próprio, etc.) exija alterar apenas
// este arquivo.
//
// MODO ATUAL: MOCK determinístico baseado em palavras-chave + heurísticas.
// Para conectar uma IA real, implemente as mesmas assinaturas de função
// chamando sua API (ver README.md, seção "Conectar IA").
// =============================================================================

import { CATEGORIES } from '../utils/helpers'

// ---------------------------------------------------------------------------
// Dicionário de palavras-chave por categoria Ishikawa (6M).
// Usado pelo classificador MOCK. Numa IA real isso seria substituído por
// embeddings + classificação supervisionada/few-shot.
// ---------------------------------------------------------------------------
const KEYWORD_MAP = {
  maquina: ['máquina', 'maquina', 'equipamento', 'extrusora', 'motor', 'rolamento', 'quebra', 'parada', 'manutenção', 'manutencao', 'peça', 'peca', 'desgaste', 'falha mecânica', 'calibração de máquina', 'vibração'],
  metodo: ['método', 'metodo', 'procedimento', 'processo', 'setup', 'instrução', 'instrucao', 'padrão', 'padrao', 'sequência', 'fluxo', 'troca de ferramenta'],
  mao_de_obra: ['operador', 'treinamento', 'capacitação', 'capacitacao', 'mão de obra', 'mao de obra', 'equipe', 'funcionário', 'funcionario', 'falta de pessoal', 'ausência', 'ausencia', 'experiência', 'experiencia'],
  material: ['matéria-prima', 'materia-prima', 'material', 'insumo', 'fornecedor', 'lote', 'peças', 'pecas', 'estoque', 'qualidade do material'],
  medicao: ['instrumento', 'calibração', 'calibracao', 'medição', 'medicao', 'sensor', 'aferição', 'afericao', 'tolerância', 'tolerancia', 'balança', 'balanca'],
  meio_ambiente: ['temperatura', 'umidade', 'iluminação', 'iluminacao', 'ruído', 'ruido', 'layout', 'espaço', 'espaco', 'clima', 'ambiente', 'ventilação', 'ventilacao'],
}

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function tokenize(text) {
  return normalize(text)
    .replace(/[^\w\sáéíóúâêôãõçü]/gi, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2)
}

// Similaridade léxica simples (Jaccard sobre tokens) — placeholder para
// similaridade semântica real via embeddings (cosine similarity).
export function calculateSimilarity(textA, textB) {
  const a = new Set(tokenize(textA))
  const b = new Set(tokenize(textB))
  if (a.size === 0 || b.size === 0) return 0
  let intersection = 0
  a.forEach((tok) => { if (b.has(tok)) intersection += 1 })
  const union = new Set([...a, ...b]).size
  const jaccard = intersection / union

  // pequeno boost para pares curtos com forte sobreposição semântica de sinônimos comuns
  const synonymBoost = SYNONYM_GROUPS.some((group) => {
    const inA = group.some((w) => normalize(textA).includes(w))
    const inB = group.some((w) => normalize(textB).includes(w))
    return inA && inB
  }) ? 0.28 : 0

  return Math.min(1, jaccard + synonymBoost)
}

const SYNONYM_GROUPS = [
  ['treinamento', 'capacitação', 'capacitacao', 'capacitar', 'treinado', 'qualificação', 'qualificacao'],
  ['manutenção', 'manutencao', 'preventiva', 'preventivo'],
  ['parada', 'para', 'paralisação', 'paralisacao', 'interrupção', 'interrupcao'],
  ['setup', 'troca de ferramenta', 'ajuste de máquina', 'preparação', 'preparacao'],
  ['matéria-prima', 'materia-prima', 'insumo', 'material'],
  ['calibração', 'calibracao', 'aferição', 'afericao'],
]

function classify(text) {
  const norm = normalize(text)
  let best = { category: null, score: 0 }
  for (const cat of Object.keys(KEYWORD_MAP)) {
    const hits = KEYWORD_MAP[cat].filter((kw) => norm.includes(normalize(kw))).length
    if (hits > best.score) best = { category: cat, score: hits }
  }
  if (!best.category) {
    // fallback: distribui com leve viés e baixa confiança para nunca deixar "sem categoria" travado
    const keys = Object.keys(KEYWORD_MAP)
    const idx = Math.abs(hashString(norm)) % keys.length
    return { category: keys[idx], confidence: 0.42 + Math.random() * 0.1 }
  }
  const confidence = Math.min(0.98, 0.62 + best.score * 0.12 + Math.random() * 0.06)
  return { category: best.category, confidence: Number(confidence.toFixed(2)) }
}

function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return hash
}

// ---------------------------------------------------------------------------
// API pública do AIService
// ---------------------------------------------------------------------------
export const AIService = {
  /**
   * Analisa uma ideia recém-criada: classifica categoria Ishikawa, estima
   * confiança e tenta inferir o "tipo" (sintoma, causa, subcausa...).
   */
  async analyzeIdea(idea, context = {}) {
    await mockLatency()
    const { category, confidence } = classify(idea.text)
    const causeType = identifyCauseTypeInternal(idea.text)
    return {
      category,
      confidence,
      causeType,
      suggestedTags: extractTags(idea.text),
    }
  },

  /**
   * Compara uma ideia com todas as demais ideias de uma sessão e retorna
   * as mais similares acima de um limiar de similaridade.
   */
  async findSimilarIdeas(idea, allIdeas, threshold = 0.35) {
    await mockLatency()
    return allIdeas
      .filter((other) => other.id !== idea.id)
      .map((other) => ({ idea: other, similarity: calculateSimilarity(idea.text, other.text) }))
      .filter((r) => r.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
  },

  calculateSimilarity,

  async classifyIshikawaCategory(text) {
    await mockLatency()
    return classify(text)
  },

  async identifyCauseType(text) {
    await mockLatency()
    return identifyCauseTypeInternal(text)
  },

  /**
   * Varre toda a parede de post-its e sugere agrupamentos, classificações
   * e possíveis duplicidades — usado pelo botão "Organizar com IA".
   */
  async suggestGrouping(ideas, threshold = 0.35) {
    await mockLatency(400)
    const visited = new Set()
    const groups = []
    const classifications = []

    for (const idea of ideas) {
      if (!idea.category) {
        const { category, confidence } = classify(idea.text)
        classifications.push({ ideaId: idea.id, category, confidence })
      }
    }

    for (const idea of ideas) {
      if (visited.has(idea.id) || idea.groupId) continue
      const cluster = [idea]
      visited.add(idea.id)
      for (const other of ideas) {
        if (visited.has(other.id) || other.groupId) continue
        const sim = calculateSimilarity(idea.text, other.text)
        if (sim >= threshold) {
          cluster.push(other)
          visited.add(other.id)
        }
      }
      if (cluster.length > 1) {
        groups.push({
          suggestedTitle: suggestGroupTitle(cluster),
          ideaIds: cluster.map((c) => c.id),
          avgSimilarity: Number(
            (cluster.slice(1).reduce((acc, c) => acc + calculateSimilarity(idea.text, c.text), 0) / (cluster.length - 1)).toFixed(2)
          ),
        })
      }
    }

    return { groups, classifications }
  },

  /**
   * Sugere uma cadeia de "Por quês" a partir de uma causa selecionada.
   * Numa IA real, isso viria de um LLM com prompt estruturado de causa-raiz.
   */
  async suggestFiveWhys(causeTitle) {
    await mockLatency(500)
    const chain = FIVE_WHYS_TEMPLATES[pickTemplateKey(causeTitle)] || FIVE_WHYS_TEMPLATES.default
    return chain.map((answer, i) => ({
      whyNumber: i + 1,
      question: 'Por quê?',
      answer: answer.replace('{causa}', causeTitle.toLowerCase()),
    }))
  },

  async suggestRootCause(fiveWhysChain) {
    await mockLatency()
    const last = fiveWhysChain[fiveWhysChain.length - 1]
    return {
      rootCause: last?.answer || 'Causa raiz não identificada — complete a cadeia de 5 Porquês.',
      confidence: 0.7 + Math.random() * 0.2,
    }
  },

  async suggestActions(cause) {
    await mockLatency()
    const base = ACTION_TEMPLATES[cause.category] || ACTION_TEMPLATES.default
    return base.map((tpl) => tpl.replace('{causa}', cause.title))
  },

  /**
   * Análise completa da parede — usada pelo botão "✨ Organizar com IA".
   * Combina classificação + agrupamento em um único resumo para o facilitador.
   */
  async analyzeWall(ideas, threshold = 0.35) {
    await mockLatency(600)
    const { groups, classifications } = await this.suggestGrouping(ideas, threshold)
    return {
      groupsFound: groups.length,
      classificationSuggestions: classifications.length,
      groups,
      classifications,
    }
  },
}

function mockLatency(ms) {
  const t = ms ?? 250 + Math.random() * 250
  return new Promise((resolve) => setTimeout(resolve, t))
}

function extractTags(text) {
  const tokens = tokenize(text)
  return [...new Set(tokens)].slice(0, 4)
}

function identifyCauseTypeInternal(text) {
  const norm = normalize(text)
  const symptomWords = ['baixa', 'alta demais', 'excesso', 'muitas paradas', 'lentidão', 'lentidao', 'queda de produtividade', 'para frequentemente']
  const rootWords = ['não executado', 'nao executado', 'não existe', 'nao existe', 'falta de plano', 'nunca foi', 'ausência de', 'ausencia de']
  if (rootWords.some((w) => norm.includes(w))) return 'causa_raiz'
  if (symptomWords.some((w) => norm.includes(w))) return 'sintoma'
  return 'causa'
}

function suggestGroupTitle(cluster) {
  const allTokens = cluster.flatMap((c) => tokenize(c.text))
  const freq = {}
  allTokens.forEach((t) => { freq[t] = (freq[t] || 0) + 1 })
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
  const topWords = sorted.slice(0, 2).map(([w]) => w)
  if (topWords.length === 0) return 'Grupo de ideias relacionadas'
  const title = topWords.join(' ')
  return title.charAt(0).toUpperCase() + title.slice(1)
}

function pickTemplateKey(text) {
  const norm = normalize(text)
  if (norm.includes('manuten')) return 'manutencao'
  if (norm.includes('setup') || norm.includes('troca')) return 'setup'
  if (norm.includes('trein') || norm.includes('capacit')) return 'treinamento'
  if (norm.includes('materia') || norm.includes('material') || norm.includes('fornecedor')) return 'material'
  return 'default'
}

const FIVE_WHYS_TEMPLATES = {
  manutencao: [
    'Porque o equipamento apresenta falhas mecânicas recorrentes relacionadas a {causa}.',
    'Porque os componentes críticos estão sofrendo desgaste acima do esperado.',
    'Porque não há um plano de manutenção preventiva ativo para este equipamento.',
    'Porque a manutenção preventiva não é tratada como prioridade no planejamento da produção.',
    'Porque não existe um indicador de acompanhamento que force a execução do plano preventivo.',
  ],
  setup: [
    'Porque o procedimento de {causa} não está padronizado.',
    'Porque os operadores utilizam métodos diferentes para a mesma troca.',
    'Porque não há um procedimento operacional padrão (POP) documentado e validado.',
    'Porque a equipe não recebeu treinamento formal sobre o método ideal de setup.',
    'Porque não existe rotina de auditoria para garantir a aderência ao método padronizado.',
  ],
  treinamento: [
    'Porque o operador não foi capacitado adequadamente para {causa}.',
    'Porque não existe um programa estruturado de treinamento para novos operadores.',
    'Porque a matriz de habilidades (skill matrix) da área não é acompanhada.',
    'Porque o RH e a produção não têm um processo integrado de capacitação técnica.',
    'Porque a capacitação não é tratada como pré-requisito formal para operar o equipamento.',
  ],
  material: [
    'Porque há variação na qualidade relacionada a {causa}.',
    'Porque o fornecedor não segue um padrão de especificação constante.',
    'Porque não existe controle de recebimento (inspeção) para este insumo.',
    'Porque os critérios de aceitação do material não estão formalizados no contrato de fornecimento.',
    'Porque não há indicador de desempenho do fornecedor sendo monitorado.',
  ],
  default: [
    'Porque existe uma falha relacionada a {causa} no processo atual.',
    'Porque não há controle suficiente sobre esta etapa do processo.',
    'Porque o processo não prevê verificação ou validação neste ponto.',
    'Porque não existe padronização documentada para esta atividade.',
    'Porque a causa raiz ainda não foi validada com dados de campo — recomenda-se investigação adicional.',
  ],
}

const ACTION_TEMPLATES = {
  maquina: [
    'Elaborar e implementar plano de manutenção preventiva para {causa}.',
    'Realizar inspeção técnica detalhada do equipamento relacionado a {causa}.',
  ],
  metodo: [
    'Padronizar e documentar procedimento operacional para {causa}.',
    'Treinar equipe no novo método padronizado relacionado a {causa}.',
  ],
  mao_de_obra: [
    'Estruturar programa de capacitação para {causa}.',
    'Avaliar dimensionamento de equipe relacionado a {causa}.',
  ],
  material: [
    'Revisar critérios de qualidade com fornecedor sobre {causa}.',
    'Implementar inspeção de recebimento para mitigar {causa}.',
  ],
  medicao: [
    'Estabelecer plano de calibração periódica para {causa}.',
    'Validar instrumentos de medição relacionados a {causa}.',
  ],
  meio_ambiente: [
    'Avaliar condições ambientais associadas a {causa}.',
    'Implementar controle de condições de trabalho para {causa}.',
  ],
  default: [
    'Investigar e definir plano de ação para {causa}.',
  ],
}

export { CATEGORIES }
