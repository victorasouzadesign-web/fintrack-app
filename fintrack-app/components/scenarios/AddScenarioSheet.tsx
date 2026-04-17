'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface AddScenarioSheetProps {
  open: boolean
  onClose: () => void
  onAdd: (payload: {
    name: string
    description: string | null
    start_date: string | null
  }) => Promise<unknown>
}

export function AddScenarioSheet({ open, onClose, onAdd }: AddScenarioSheetProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError('Dê um nome para o cenário.'); return }
    setLoading(true)
    const err = await onAdd({
      name: name.trim(),
      description: description.trim() || null,
      start_date: startDate || null,
    })
    setLoading(false)
    if (err) { setError('Erro ao criar cenário.'); return }
    setName(''); setDescription(''); setStartDate('')
    onClose()
  }

  function handleClose() {
    setName(''); setDescription(''); setStartDate(''); setError('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Novo cenário">
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Nome do cenário *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Se eu trocar de emprego"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Descrição (opcional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Novo emprego com salário maior mas sem benefícios"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Data de início (opcional)</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#14A085] hover:bg-[#0D7377] transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Criar cenário
        </button>
      </div>
    </BottomSheet>
  )
}
