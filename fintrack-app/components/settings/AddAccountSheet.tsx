'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { type Account } from './AccountRow'

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'cash', label: 'Dinheiro' },
]

interface AddAccountSheetProps {
  open: boolean
  onClose: () => void
  editing: Account | null
  onSave: (data: {
    name: string; bank: string | null; type: string; opening_balance: number
  }, id?: string) => Promise<unknown>
}

export function AddAccountSheet({ open, onClose, editing, onSave }: AddAccountSheetProps) {
  const [name, setName] = useState('')
  const [bank, setBank] = useState('')
  const [type, setType] = useState('checking')
  const [balanceStr, setBalanceStr] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setBank(editing.bank ?? '')
      setType(editing.type)
      setBalanceStr(String(editing.current_balance ?? 0))
    } else {
      setName(''); setBank(''); setType('checking'); setBalanceStr('0')
    }
    setError('')
  }, [editing, open])

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError('Informe o nome da conta.'); return }
    const balance = parseFloat(balanceStr.replace(',', '.')) || 0
    setLoading(true)
    const err = await onSave(
      { name: name.trim(), bank: bank.trim() || null, type, opening_balance: balance },
      editing?.account_id,
    )
    setLoading(false)
    if (err) { setError('Erro ao salvar. Tente novamente.'); return }
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar conta' : 'Nova conta'}>
      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Nome *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex: Nubank, Itaú"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
          {error && !name.trim() && <p className="text-[11px] text-[#EF4444] mt-1">{error}</p>}
        </div>

        {/* Bank */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Banco (opcional)</label>
          <input
            type="text"
            value={bank}
            onChange={e => setBank(e.target.value)}
            placeholder="Ex: Nubank, Itaú, Bradesco"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Tipo</label>
          <div className="flex gap-2">
            {ACCOUNT_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  type === t.value
                    ? 'border-[#14A085] bg-[#14A085]/15 text-[#14A085]'
                    : 'border-[#1E293B] bg-[#1C2537] text-[#475569]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opening balance */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            {editing ? 'Saldo atual' : 'Saldo inicial'}
          </label>
          <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
            <span className="text-sm text-[#475569] mr-2">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={balanceStr}
              onChange={e => setBalanceStr(e.target.value)}
              className="flex-1 bg-transparent text-sm font-semibold text-[#F8FAFC] outline-none tabular-nums"
            />
          </div>
        </div>

        {error && name.trim() && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#14A085] hover:bg-[#0D7377] transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {editing ? 'Salvar alterações' : 'Criar conta'}
        </button>
      </div>
    </BottomSheet>
  )
}
