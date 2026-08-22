// Utilitários gerais — geração de IDs, datas e cores.
// Mantidos isolados para facilitar troca por geração de ID no backend (uuid v4, nanoid, etc.)

let counter = 0
export function generateId(prefix = 'id') {
  counter += 1
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`
}

export function generateSessionCode(date = new Date()) {
  const year = date.getFullYear()
  const seq = String(Math.floor(1000 + Math.random() * 9000)).slice(0, 4)
  return `BR-${year}-${seq}`
}

export function formatTime(dateInput) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(dateInput) {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(dateInput) {
  return `${formatDate(dateInput)} ${formatTime(dateInput)}`
}

export const POSTIT_COLORS = ['yellow', 'blue', 'green', 'pink', 'orange', 'purple']

export function randomPostitColor() {
  return POSTIT_COLORS[Math.floor(Math.random() * POSTIT_COLORS.length)]
}

export function randomRotation() {
  // Rotação sutil entre -6 e 6 graus
  return (Math.random() * 12 - 6).toFixed(1)
}

export function randomScale() {
  return (0.94 + Math.random() * 0.14).toFixed(3)
}

// Gera posição orgânica evitando sobreposição excessiva usando amostragem
// por distância mínima (simples "Poisson-ish" sampling) dentro dos limites do container.
export function generateOrganicPosition(existingPositions, bounds, options = {}) {
  const { minDistance = 130, maxAttempts = 40, postitSize = 190 } = options
  const { width, height } = bounds
  let best = null
  let bestDist = -1

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x = Math.random() * Math.max(width - postitSize, 100)
    const y = Math.random() * Math.max(height - postitSize, 100)

    let minFound = Infinity
    for (const p of existingPositions) {
      const dx = p.x - x
      const dy = p.y - y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < minFound) minFound = dist
    }
    if (existingPositions.length === 0) return { x, y }
    if (minFound >= minDistance) return { x, y }
    if (minFound > bestDist) {
      bestDist = minFound
      best = { x, y }
    }
  }
  return best || { x: Math.random() * width, y: Math.random() * height }
}

export const CATEGORIES = [
  { key: 'maquina', label: 'Máquina', icon: '🏭' },
  { key: 'metodo', label: 'Método', icon: '📋' },
  { key: 'mao_de_obra', label: 'Mão de obra', icon: '👷' },
  { key: 'material', label: 'Material', icon: '📦' },
  { key: 'medicao', label: 'Medição', icon: '📏' },
  { key: 'meio_ambiente', label: 'Meio ambiente', icon: '🌡️' },
]

export function categoryLabel(key) {
  return CATEGORIES.find((c) => c.key === key)?.label || 'Sem classificação'
}

export function categoryIcon(key) {
  return CATEGORIES.find((c) => c.key === key)?.icon || '❔'
}

export function classNames(...list) {
  return list.filter(Boolean).join(' ')
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}
