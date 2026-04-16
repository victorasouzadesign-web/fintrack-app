'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { type Goal } from '@/hooks/useGoals'
import { formatCurrency } from '@/lib/utils'

interface GoalDepositSheetProps {
  open: boolean
  onClose: () => void
  goal: Goal | null
  mode: 'deposit' | 'withdraw'
  entityId: string
  onDeposit: (goalId: string, entityId: string, amount: number, date: string, notes: string) => Promise<unknown>
  onWithdraw: (goalId: string, entityId: string, amount: number, date: string, notes: string) => Promise<unknown>
}

export function GoalDepositSheet({
  open, onClose, goal, mode, entityId, onDeposit, onWithdraw,
}: GoalDepositSheetProps) {
  const [amountStr, setAmountStr] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!goal) return null

  const amount = parseFloat(amountStr.replace(',', '.')) || 0
  const isDeposit = mode === 'deposit'
  const accentColor = isDeposit ? '#14A085' : '#EF4444'
  const title = isDeposit ? `Depositar em ${goal.name}` : `Retirar de ${goal.name}`
  const maxWithdraw = goal.balance

  async function handleSubmit() {
    setError('')
    if (amount <= 0) { setError('Informe um valor válido.'); return }
    if (!isDeposit && amount > maxWithdraw) {
      setError(`Saldo insuficiente (${formatCurrency(maxWithdraw)}).`)
      return
    }
    setLoading(true)
    const fn = isDeposit ? onDeposit : onWithdraw
    const err = await fn(goal.goal_id, entityId, amount, date, notes)
    setLoading(false)
    if (err) { setError('Erro ao salvar. Tente novamente.'); return }
    setAmountStr('')
    setNotes('')
    onClose()
  }

  function handleClose() {
    setAmountStr('')
    setNotes('')
    setError('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      <div className="px-4 pt-3 pb-6 space-y-4">
        {/* Balance info */}
        <div className="flex items-center justify-between bg-[#1C2537] rounded-xl px-4 py-3">
          <span className="text-xs text-[#475569]">Saldo atual</span>
          <span className="text-sm font-semibold text-[#F8FAFC] tabular-nums">
            {formatCurrency(goal.balance)}
          </span>
        </div>

        {/* Amount input */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Valor (R$)
          </label>
          <div
            className="flex items-center bg-[#1C2537] border rounded-xl px-4 py-3 transition-colors duration-200"
            style={{ borderColor: amountStr ? accentColor : '#1E293B' }}
          >
            <span className="text-sm text-[#475569] mr-2">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0,00"
              className="flex-1 bg-transparent text-base font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
            />
          </div>
          {!isDeposit && amount > 0 && amount <= maxWithdraw && (
            <p className="text-[11px] text-[#475569] mt-1 tabular-nums">
              Saldo após retirada: {formatCurrency(maxWithdraw - amount)}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
            Observação (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex: Guardei do salário de março"
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
          disabled={loading || amount <= 0}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {isDeposit ? 'Confirmar depósito' : 'Confirmar retirada'}
        </button>
      </div>
    </BottomSheet>
  )
}
