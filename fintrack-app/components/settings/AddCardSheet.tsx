'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { type CreditCardItem } from './CardRow'

const NETWORKS = ['Visa', 'Mastercard', 'Elo', 'Amex', 'Hipercard', 'Outro']

const PRESET_COLORS = [
  '#14A085', '#6366F1', '#EC4899', '#F59E0B',
  '#3B82F6', '#8B5CF6', '#EF4444', '#10B981',
]

interface AddCardSheetProps {
  open: boolean
  onClose: () => void
  editing: CreditCardItem | null
  onSave: (data: {
    name: string; bank: string | null; network: string | null
    limit_total: number; closing_day: number; due_day: number
    color_hex: string | null
  }, id?: string) => Promise<unknown>
}

export function AddCardSheet({ open, onClose, editing, onSave }: AddCardSheetProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [network, setNetwork] = useState('Visa')
  const [limitStr, setLimitStr] = useState('')
  const [closingDay, setClosingDay] = useState('5')
  const [dueDay, setDueDay] = useState('12')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setBank(editing.bank ?? '')
      setNetwork(editing.network ?? 'Visa')
      setLimitStr(String(editing.limit_total ?? ''))
      setClosingDay(String(editing.closing_day ?? 5))
      setDueDay(String(editing.due_day ?? 12))
      setColor(editing.color_hex ?? PRESET_COLORS[0])
    } else {
      setName(''); setBank(''); setNetwork('Visa')
      setLimitStr(''); setClosingDay('5'); setDueDay('12')
      setColor(PRESET_COLORS[0])
    }
    setError('')
  }, [editing, open])

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError('Informe o nome do cartão.'); return }
    const limit = parseFloat(limitStr.replace(',', '.')) || 0
    const closing = parseInt(closingDay) || 5
    const due = parseInt(dueDay) || 12
    if (closing < 1 || closing > 31) { setError('Dia de fechamento inválido (1–31).'); return }
    if (due < 1 || due > 31) { setError('Dia de vencimento inválido (1–31).'); return }
    setLoading(true)
    const err = await onSave(
      {
        name: name.trim(),
        bank: bank.trim() || null,
        network: network || null,
        limit_total: limit,
        closing_day: closing,
        due_day: due,
        color_hex: color,
      },
      editing?.card_id,
    )
    setLoading(false)
    if (err) { setError('Erro ao salvar. Tente novamente.'); return }
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar cartão' : 'Novo cartão'}>
      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Nome do cartão *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Nubank Roxinho"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Bank */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Banco (opcional)</label>
          <input
            type="text"
            value={bank}
            onChange={e => setBank(e.target.value)}
            placeholder="Ex: Nubank, Itaú, XP"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Network */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Bandeira</label>
          <div className="flex gap-2 flex-wrap">
            {NETWORKS.map(n => (
              <button
                key={n}
                onClick={() => setNetwork(n)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  network === n
                    ? 'border-[#14A085] bg-[#14A085]/15 text-[#14A085]'
                    : 'border-[#1E293B] bg-[#1C2537] text-[#475569]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Limit */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Limite total</label>
          <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
            <span className="text-sm text-[#475569] mr-2">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={limitStr}
              onChange={e => setLimitStr(e.target.value)}
              placeholder="0,00"
              className="flex-1 bg-transparent text-sm font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
            />
          </div>
        </div>

        {/* Closing day + Due day */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Fechamento (dia)</label>
            <input
              type="number"
              inputMode="numeric"
              value={closingDay}
              onChange={e => setClosingDay(e.target.value)}
              min={1} max={31}
              className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200 tabular-nums"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Vencimento (dia)</label>
            <input
              type="number"
              inputMode="numeric"
              value={dueDay}
              onChange={e => setDueDay(e.target.value)}
              min={1} max={31}
              className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200 tabular-nums"
            />
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Cor do cartão</label>
          <div className="flex gap-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-transform duration-150 hover:scale-110"
                style={{
                  backgroundColor: c,
                  boxShadow: color === c ? `0 0 0 2px #111827, 0 0 0 4px ${c}` : 'none',
                  transform: color === c ? 'scale(1.1)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#14A085] hover:bg-[#0D7377] transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {editing ? 'Salvar alterações' : 'Criar cartão'}
        </button>
      </div>
    </BottomSheet>
  )
}
