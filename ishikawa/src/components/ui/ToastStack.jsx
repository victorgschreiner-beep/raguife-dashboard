import { useAppStore } from '../../store/useAppStore'

export default function ToastStack() {
  const toasts = useAppStore((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 no-print">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-pin-in bg-ink-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-panel border border-ink-700"
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
