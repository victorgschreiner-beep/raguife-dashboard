import { classNames } from '../../utils/helpers'

const variants = {
  primary: 'bg-brand-600 hover:bg-[#036038] text-white shadow-card',
  secondary: 'bg-white hover:bg-steel-50 text-ink-800 border border-steel-200',
  ghost: 'bg-transparent hover:bg-steel-100 text-ink-700',
  danger: 'bg-red-50 hover:bg-red-100 text-raguife-red border border-red-200',
  success: 'bg-olive-500 hover:bg-olive-600 text-white',
  dark: 'bg-brand-700 hover:bg-brand-800 text-white',
}

const sizes = {
  sm: 'text-xs px-2.5 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-3.5 py-2 rounded-lg gap-2',
  lg: 'text-base px-5 py-3 rounded-xl gap-2.5',
}

export default function Button({ children, variant = 'primary', size = 'md', className, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={classNames(
        'inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98]',
        variants[variant], sizes[size],
        disabled && 'opacity-50 cursor-not-allowed active:scale-100',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
