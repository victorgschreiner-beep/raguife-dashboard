import { classNames } from '../../utils/helpers'

export function Card({ children, className, ...props }) {
  return (
    <div className={classNames('bg-white rounded-2xl border border-steel-200 shadow-card', className)} {...props}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, action, icon }) {
  return (
    <div className="flex items-start justify-between p-5 pb-3">
      <div className="flex items-start gap-3">
        {icon && <div className="text-2xl leading-none mt-0.5">{icon}</div>}
        <div>
          <h3 className="font-bold text-ink-900 text-base">{title}</h3>
          {subtitle && <p className="text-sm text-steel-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
