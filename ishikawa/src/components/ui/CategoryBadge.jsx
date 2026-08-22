import { CATEGORIES } from '../../utils/helpers'
import { classNames } from '../../utils/helpers'

const CAT_STYLES = {
  maquina: 'bg-blue-50 text-blue-700 border-blue-200',
  metodo: 'bg-purple-50 text-purple-700 border-purple-200',
  mao_de_obra: 'bg-amber-50 text-amber-700 border-amber-200',
  material: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medicao: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  meio_ambiente: 'bg-lime-50 text-lime-700 border-lime-200',
}

export default function CategoryBadge({ category, size = 'md' }) {
  const cat = CATEGORIES.find((c) => c.key === category)
  if (!cat) {
    return (
      <span className={classNames('inline-flex items-center gap-1 rounded-full border font-semibold bg-steel-100 text-steel-500 border-steel-200', size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1')}>
        ❔ Sem classificação
      </span>
    )
  }
  return (
    <span className={classNames('inline-flex items-center gap-1 rounded-full border font-semibold', CAT_STYLES[category], size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1')}>
      {cat.icon} {cat.label}
    </span>
  )
}
