'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { type ScenarioChange } from '@/hooks/useScenarios'

const TYPES = [
  { value: 'income',     label: 'Receita',      emoji: '💰', sign: '+' },
  { value: 'expense',    label: 'Despesa',      emoji: '💸', sign: '-' },
  { value: 'savings',    label: 'Poupança',     emoji: '🏦', sign: '-' },
  { value: 'investment', label: 'Investimento', emoji: '📈', sign: '-' },
]

const FREQUENCIES = [
  { value: 'monthly',  label: 'Mensal' },
  { value: 'yearly',   label: 'Anual' },
  { value: 'one_time', label: 'Único' },
]

interface AddChangeSheetProps {
  open: boolean
  onClose: () => void
  scenarioId: string
  onAdd: (payload: Omit<ScenarioChange, 'change_id'>) => Promise<unknown>
}

export function AddChangeSheet({ open, onClose, scenarioId, onAdd }: AddChangeSheetProps) {
  const [type, setType] = useState('income')
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [sign, setSign] = useState('+')
  const [frequency, setFrequency] = useState('monthly')
  const [startDate, setStartDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleTypeChange(t: typeof TYPES[0]) {
    setType(t.value)
    setSign(t.sign)
  }

  async function handleSave() {
    setError('')
    const amount = parseFloat(amountStr.replace(',', '.'))
    if (!amount || amount <= 0) { setError('Informe um valor válido.'); return }
    setLoading(true)
    const err = await onAdd({
      scenario_id: scenarioId,
      entity_id: '',           // filled in hook
      type,
      description: description.trim() || null,
      amount,
      impact_sign: sign,
      frequency,
      start_date: startDate || null,
      end_date: null,
      category_id: null,
    })
    setLoading(false)
    if (err) { setError('Erro ao adicionar mudança.'); return }
    setDescription(''); setAmountStr(''); setFrequency('monthly'); setStartDate('')
    onClose()
  }

  function handleClose() {
    setType('income'); setDescription(''); setAmountStr('')
    setSign('+'); setFrequency('monthly'); setStartDate(''); setError('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Nova mudança no cenário">
      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Tipo de mudança</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => handleTypeChange(t)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  type === t.value
                    ? 'border-[#14A085] bg-[#14A085]/15 text-[#14A085]'
                    : 'border-[#1E293B] bg-[#1C2537] text-[#475569]'
                }`}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Descrição (opcional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Aumento salarial de 20%"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Amount + sign */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Valor *</label>
          <div className="flex gap-2">
            {/* Sign toggle */}
            <button
              onClick={() => setSign(s => s === '+' ? '-' : '+')}
              className={`w-12 shrink-0 rounded-xl border text-base font-bold transition-all duration-200 ${
                sign === '+'
                  ? 'border-[#22C55E] bg-[#22C55E]/15 text-[#22C55E]'
                  : 'border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444]'
              }`}
            >
              {sign}
            </button>
            <div className="flex-1 flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
              <span className="text-sm text-[#475569] mr-2">R$</span>
              <input
                type="number"
                inputMode="decimal"
                value={amountStr}
                onChange={e => setAmountStr(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-transparent text-sm font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
              />
            </div>
          </div>
          <p className="text-[11px] text-[#475569] mt-1">
            Toque no {sign === '+' ? '+' : '−'} para inverter o sinal
          </p>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Frequência</label>
          <div className="flex gap-2">
            {FREQUENCIES.map(f => (
              <button
                key={f.value}
                onClick={() => setFrequency(f.value)}
                className={`flex-1 py-2.5 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                  frequency === f.value
                    ? 'border-[#14A085] bg-[#14A085]/15 text-[#14A085]'
                    : 'border-[#1E293B] bg-[#1C2537] text-[#475569]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start date */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">A partir de (opcional)</label>
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
          disabled={loading || !amountStr}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#14A085] hover:bg-[#0D7377] transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Adicionar mudança
        </button>
      </div>
    </BottomSheet>
  )
}
