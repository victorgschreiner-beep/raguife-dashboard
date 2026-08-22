import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Send, CheckCircle2, User } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/ui/Button'

export default function CollaboratorPage() {
  useParams() // sessionId reservado para roteamento multi-sessão futuro
  const session = useAppStore((s) => s.session)
  const currentUser = useAppStore((s) => s.currentUser)
  const identifyParticipant = useAppStore((s) => s.identifyParticipant)
  const addIdea = useAppStore((s) => s.addIdea)

  const [name, setName] = useState(currentUser?.name || '')
  const [idea, setIdea] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  const identified = Boolean(currentUser)

  function handleIdentify(e) {
    e.preventDefault()
    if (!name.trim()) return
    identifyParticipant(name.trim())
  }

  async function handleSend(e) {
    e.preventDefault()
    if (!idea.trim() || sending) return
    setSending(true)
    await addIdea({ text: idea.trim(), authorId: currentUser.id, authorName: currentUser.name, bounds: { width: 1400, height: 1000 } })
    setSending(false)
    setSent(true)
    setSentCount((c) => c + 1)
    setIdea('')
    setTimeout(() => setSent(false), 2200)
  }

  return (
    <div className="min-h-screen bg-raguife-header flex flex-col">
      <header className="px-5 pt-8 pb-5 text-center">
        <div className="text-3xl mb-1">🐟</div>
        <div className="text-white font-extrabold tracking-tight">ISHIKAWA <span className="text-olive-300">AI</span></div>
        <div className="text-steel-400 text-xs mt-0.5">{session.code}</div>
      </header>

      <main className="flex-1 bg-steel-50 rounded-t-[32px] px-5 pt-7 pb-10 flex flex-col">
        <div className="text-center mb-6">
          <div className="inline-block text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-full px-3 py-1 uppercase tracking-wide font-mono">Brainstorm</div>
        </div>

        <div className="bg-white rounded-2xl border border-steel-200 shadow-card p-4 mb-6">
          <div className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono mb-1">Problema</div>
          <div className="font-bold text-ink-900 leading-snug">{session.problem}</div>
          {session.equipment && <div className="text-xs text-steel-500 mt-1.5">{session.sector} · {session.equipment}</div>}
        </div>

        {!identified ? (
          <form onSubmit={handleIdentify} className="flex flex-col gap-3">
            <label className="text-sm font-bold text-ink-800">Seu nome</label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite seu nome"
              className="w-full bg-white border border-steel-200 rounded-xl px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <Button type="submit" size="lg" disabled={!name.trim()} className="mt-2">
              <User size={18} /> Continuar
            </Button>
          </form>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-4 text-sm">
              <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </span>
              <span className="text-steel-600">Enviando como <b className="text-ink-800">{currentUser.name}</b></span>
            </div>

            <form onSubmit={handleSend} className="flex flex-col gap-3 flex-1">
              <label className="text-sm font-bold text-ink-800">Qual é sua ideia ou possível causa?</label>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ex: Falta de manutenção preventiva na extrusora"
                className="w-full bg-white border border-steel-200 rounded-xl px-4 py-4 text-base min-h-[140px] focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
              <Button type="submit" size="lg" disabled={!idea.trim() || sending}>
                <Send size={18} /> {sending ? 'Enviando...' : 'ENVIAR IDEIA'}
              </Button>

              {sent && (
                <div className="flex items-center gap-2 justify-center text-emerald-600 font-semibold text-sm mt-1 animate-pin-in">
                  <CheckCircle2 size={17} /> Ideia enviada com sucesso!
                </div>
              )}

              {sentCount > 0 && (
                <div className="text-center text-xs text-steel-400 mt-2">
                  Você já enviou {sentCount} {sentCount === 1 ? 'ideia' : 'ideias'} nesta sessão.
                </div>
              )}
            </form>
          </>
        )}
      </main>
    </div>
  )
}
