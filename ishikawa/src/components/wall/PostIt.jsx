import { motion } from 'framer-motion'
import { categoryIcon, categoryLabel, formatTime, classNames } from '../../utils/helpers'

const COLOR_BG = {
  yellow: 'bg-postit-yellow',
  blue: 'bg-postit-blue',
  green: 'bg-postit-green',
  pink: 'bg-postit-pink',
  orange: 'bg-postit-orange',
  purple: 'bg-postit-purple',
}

export default function PostIt({ idea, author, onDragEnd, onClick, wallRef, selected }) {
  const rot = Number(idea.rotation || 0)

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.05}
      dragConstraints={wallRef}
      onDragEnd={(e, info) => onDragEnd(idea.id, info)}
      initial={idea.isNew ? { opacity: 0, y: -60, scale: 0.5, rotate: 0 } : false}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: rot }}
      whileHover={{ scale: 1.06, zIndex: 40, boxShadow: '0 14px 30px rgba(15,23,42,0.3)' }}
      whileDrag={{ scale: 1.08, zIndex: 50, cursor: 'grabbing' }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      onClick={() => onClick(idea)}
      style={{ position: 'absolute', left: idea.x, top: idea.y, width: 188, touchAction: 'none' }}
      className={classNames(
        'select-none cursor-grab rounded-[3px] p-3.5 shadow-postit paper-edge border border-black/5',
        COLOR_BG[idea.color] || COLOR_BG.yellow,
        selected && 'ring-2 ring-brand-500 ring-offset-2'
      )}
    >
      <p className="text-[13.5px] leading-snug font-medium text-ink-900 line-clamp-5 break-words" style={{ fontFamily: "'Inter', sans-serif" }}>
        {idea.text}
      </p>

      <div className="flex items-center justify-between mt-3 pt-2 border-t border-black/10">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-ink-800/80 truncate">
          <span>👤</span><span className="truncate max-w-[80px]">{author}</span>
        </div>
        <div className="text-[10px] font-medium text-ink-800/60">{formatTime(idea.createdAt)}</div>
      </div>

      {idea.category ? (
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold text-ink-800/70">{categoryIcon(idea.category)} {categoryLabel(idea.category)}</span>
          {typeof idea.confidence === 'number' && (
            <span className="text-[10px] font-bold text-ink-800/50">{Math.round(idea.confidence * 100)}%</span>
          )}
        </div>
      ) : (
        <div className="mt-1.5 text-[10px] font-bold text-ink-800/40 italic">analisando com IA...</div>
      )}
    </motion.div>
  )
}
