'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'

const ICONS = [
  { key: 'home', label: '🏠' },
  { key: 'car', label: '🚗' },
  { key: 'travel', label: '✈️' },
  { key: 'education', label: '🎓' },
  { key: 'health', label: '❤️' },
  { key: 'emergency', label: '🛡️' },
  { key: 'wedding', label: '💍' },
  { key: 'baby', label: '👶' },
  { key: 'tech', label: '💻' },
  { key: 'business', label: '💼' },
  { key: 'savings', label: '💰' },
  { key: 'gift', label: '🎁' },
]

interface AddGoalSheetProps {
  open: boolean
  onClose: () => void
  entityId: string
  onAdd: (entityId: string, payload: {
    name: string
    target_amount: number
    target_date: string | null
    icon: string | null
    description: string | null
  }) => Promise<unknown>
}

export function AddGoalSheet({ open, onClose, entityId, onAdd }: AddGoalSheetProps) {
  const [name, setName] = useState('')
  const [targetStr, setTargetStr] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const targetAmount = parseFloat(targetStr.replace(',', '.')) || 0

  async function handleSubmit() {
    setError('')
    if (!name.trim()) { setError('Dê um nome para a meta.'); return }
    if (targetAmount <= 0) { setError('Informe o valor da meta.'); return }
    setLoading(true)
    const err = await onAdd(entityId, {
      name: name.trim(),
      target_amount: targetAmount,
      target_date: targetDate || null,
      icon: icon || null,
      description: description.trim() || null,
    })
    setLoading(false)
    if (err) { setError('Erro ao criar meta. Tente novamente.'); return }
    handleClose()
  }

  function handleClose() {
    setName('')
    setTargetStr('')
    setTargetDate('')
    setIcon(null)
    setDescription('')
    setError('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nova meta">
      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Icon picker */}
        <div>
          <p className="text-xs font-semibold text-[#94A3B8] mb-2">Ícone</p>
          <div className="grid grid-cols-6 gap-2">
            {ICONS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setIcon(icon === key ? null : key)}
                className="aspect-square flex items-center justify-center text-xl rounded-xl border transition-all duration-200"
                style={{
                  borderColor: icon === key ? '#14A085' : '#1E293B',
                  backgroundColor: icon === key ? '#14A085/10' : '#1C2537',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Nome da meta *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Reserva de emergência"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Target amount */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Valor alvo (R$) *
          </label>
          <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
            <span className="text-sm text-[#475569] mr-2">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              placeholder="0,00"
              className="flex-1 bg-transparent text-base font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Target date */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Data alvo (opcional)
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Descrição (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: 6 meses de custos fixos"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={loading || !name.trim() || targetAmount <= 0}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#14A085] hover:bg-[#0D7377] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Criar meta
        </button>
      </div>
    </BottomSheet>
  )
}
