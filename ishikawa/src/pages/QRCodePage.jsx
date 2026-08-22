import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { ArrowRight, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/ui/Button'

export default function QRCodePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const session = useAppStore((s) => s.session)
  const [copied, setCopied] = useState(false)

  // URL de participação — em produção, aponta para o domínio público da aplicação.
  // Usa hash routing (#/...) de propósito: funciona em qualquer host estático,
  // inclusive GitHub Pages servindo a partir de um subcaminho de projeto.
  const participationUrl = `${window.location.origin}${window.location.pathname}#/colaborador/${session.id}`

  function copyLink() {
    navigator.clipboard?.writeText(participationUrl).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="min-h-screen wall-surface flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-2xl">🐟</span>
          <span className="font-extrabold text-ink-900 tracking-tight">ISHIKAWA <span className="text-olive-500">AI</span></span>
        </div>
        <h1 className="text-2xl font-extrabold text-ink-900 mb-1">PARTICIPE DO BRAINSTORM</h1>
        <p className="text-steel-500 text-sm mb-8">Escaneie o QR Code com o celular para enviar suas ideias.</p>

        <div className="bg-white rounded-3xl shadow-panel border border-steel-200 p-8 inline-block">
          <QRCodeSVG value={participationUrl} size={260} level="M" fgColor="#111a2e" bgColor="#ffffff" />
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="text-sm text-steel-500">Código:</span>
          <span className="text-lg font-extrabold text-brand-700 tracking-wide">{session.code}</span>
        </div>

        <button onClick={copyLink} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-steel-500 hover:text-brand-700 mx-auto">
          {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Link copiado!' : 'Copiar link de participação'}
        </button>

        <div className="mt-2 text-[11px] text-steel-400 break-all px-4">{participationUrl}</div>

        <div className="mt-10 bg-raguife-header text-white rounded-2xl p-5 text-left">
          <div className="text-xs font-bold text-steel-400 uppercase tracking-wide font-mono mb-1">Problema em análise</div>
          <div className="font-semibold">{session.problem}</div>
          <div className="text-xs text-steel-400 mt-2">{session.sector} {session.equipment && `· ${session.equipment}`}</div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/')}>Voltar ao início</Button>
          <Button onClick={() => navigate(`/sessao/${session.id}/painel`)}>
            Ir para o painel do facilitador <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
