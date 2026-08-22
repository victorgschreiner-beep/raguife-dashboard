import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, Factory } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Card'

const SECTORS = ['Produção', 'Qualidade', 'Manutenção', 'Engenharia', 'Logística', 'PCP', 'Embalagem', 'Expedição']

const inputCls = 'w-full bg-white border border-steel-200 rounded-lg px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent placeholder:text-steel-400'

export default function NewSession() {
  const navigate = useNavigate()
  const createSession = useAppStore((s) => s.createSession)
  const [form, setForm] = useState({
    title: '', problem: '', sector: SECTORS[0], equipment: '', responsible: '', date: new Date().toISOString().slice(0, 10), objective: '',
  })
  const [errors, setErrors] = useState({})

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const nextErrors = {}
    if (!form.problem.trim()) nextErrors.problem = 'Descreva o problema a ser investigado.'
    if (!form.sector) nextErrors.sector = 'Selecione o setor.'
    if (!form.responsible.trim()) nextErrors.responsible = 'Informe o responsável pela sessão.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const session = createSession({ ...form, title: form.title || form.problem })
    navigate(`/sessao/${session.id}/qrcode`)
  }

  return (
    <div className="min-h-screen wall-surface">
      <header className="px-6 lg:px-10 py-5 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-steel-500 hover:text-ink-800"><ChevronLeft size={22} /></button>
        <div className="flex items-center gap-2">
          <Factory size={18} className="text-brand-700" />
          <h1 className="font-bold text-ink-900">Nova Sessão de Brainstorm</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-16">
        <Card className="p-6 lg:p-8">
          <p className="text-sm text-steel-500 mb-6">
            Defina o contexto do problema. Estas informações aparecerão para todos os colaboradores que entrarem pelo QR Code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Nome da sessão (opcional)" hint="Se vazio, usaremos a descrição do problema.">
              <input className={inputCls} value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Ex: Brainstorm Produtividade Linha 04" />
            </Field>

            <Field label="Problema" required error={errors.problem}>
              <textarea className={`${inputCls} min-h-[80px]`} value={form.problem} onChange={(e) => set('problem', e.target.value)} placeholder="Ex: Baixa produtividade da extrusora Linha 04" />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Setor" required error={errors.sector}>
                <select className={inputCls} value={form.sector} onChange={(e) => set('sector', e.target.value)}>
                  {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Linha / Equipamento">
                <input className={inputCls} value={form.equipment} onChange={(e) => set('equipment', e.target.value)} placeholder="Ex: Extrusora 04" />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Responsável" required error={errors.responsible}>
                <input className={inputCls} value={form.responsible} onChange={(e) => set('responsible', e.target.value)} placeholder="Ex: Ana Ribeiro" />
              </Field>
              <Field label="Data">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => set('date', e.target.value)} />
              </Field>
            </div>

            <Field label="Objetivo da sessão">
              <textarea className={`${inputCls} min-h-[70px]`} value={form.objective} onChange={(e) => set('objective', e.target.value)} placeholder="Ex: Identificar e priorizar causas-raiz da baixa produtividade" />
            </Field>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => navigate('/')}>Cancelar</Button>
              <Button type="submit">Criar sessão e gerar QR Code</Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-800 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-steel-400 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
    </div>
  )
}
