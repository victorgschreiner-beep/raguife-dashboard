import { useState } from 'react'
import { X } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'
import Button from '../ui/Button'

export default function NewIdeaModal({ onClose, bounds }) {
  const addIdea = useAppStore((s) => s.addIdea)
  const currentUser = useAppStore((s) => s.currentUser)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState(currentUser?.name || 'Facilitador')

  async function submit(e) {
    e.preventDefault()
    if (!text.trim()) return
    await addIdea({ text: text.trim(), authorName: author.trim() || 'Facilitador', bounds })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[120] bg-ink-950/50 flex items-center justify-center p-4 no-print">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow-panel max-w-sm w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-ink-900">Adicionar ideia manualmente</h3>
          <button type="button" onClick={onClose} className="text-steel-400 hover:text-ink-800"><X size={18} /></button>
        </div>
        <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Autor</label>
        <input value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 mb-3 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        <label className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono">Ideia</label>
        <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} className="w-full border border-steel-200 rounded-lg px-3 py-2 text-sm mt-1 min-h-[90px] focus:outline-none focus:ring-2 focus:ring-brand-400" placeholder="Digite a ideia ou possível causa..." />
        <Button type="submit" className="w-full mt-4" disabled={!text.trim()}>Adicionar à parede</Button>
      </form>
    </div>
  )
}
