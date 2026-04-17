'use client'

import { useState, useRef } from 'react'
import { Pencil, PowerOff, Wallet, Landmark, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const TYPE_LABELS: Record<string, { label: string; Icon: React.ElementType }> = {
  checking: { label: 'Corrente', Icon: Landmark },
  savings: { label: 'Poupança', Icon: Wallet },
  cash: { label: 'Dinheiro', Icon: DollarSign },
}

export interface Account {
  account_id: string
  name: string
  bank: string | null
  type: string
  current_balance: number | null
  is_active: boolean | null
}

interface AccountRowProps {
  account: Account
  onEdit: (a: Account) => void
  onToggle: (a: Account) => void
}

export function AccountRow({ account, onEdit, onToggle }: AccountRowProps) {
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(0)
  const { label: typeLabel, Icon: TypeIcon } = TYPE_LABELS[account.type] ?? { label: account.type, Icon: Wallet }
  const balance = account.current_balance ?? 0

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons behind the row */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={() => { setSwiped(false); onEdit(account) }}
          className="h-full px-4 bg-[#14A085]/20 text-[#14A085] flex items-center gap-1.5 text-xs font-semibold"
        >
          <Pencil size={14} />
          Editar
        </button>
        <button
          onClick={() => { setSwiped(false); onToggle(account) }}
          className="h-full px-4 bg-[#EF4444]/20 text-[#EF4444] flex items-center gap-1.5 text-xs font-semibold rounded-r-xl"
        >
          <PowerOff size={14} />
          {account.is_active ? 'Desativar' : 'Ativar'}
        </button>
      </div>

      {/* Main row — slides left on swipe */}
      <div
        className="relative bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3.5 flex items-center gap-3 transition-transform duration-200 cursor-pointer select-none"
        style={{ transform: swiped ? 'translateX(-140px)' : 'translateX(0)' }}
        onTouchStart={e => { startX.current = e.touches[0].clientX }}
        onTouchEnd={e => {
          const dx = startX.current - e.changedTouches[0].clientX
          if (dx > 50) setSwiped(true)
          else if (dx < -20) setSwiped(false)
        }}
        onClick={() => { if (swiped) setSwiped(false) }}
      >
        <div className="w-9 h-9 rounded-xl bg-[#1C2537] flex items-center justify-center shrink-0">
          <TypeIcon size={18} className="text-[#94A3B8]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#F8FAFC] truncate">{account.name}</p>
            {!account.is_active && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#475569]/20 text-[#475569] shrink-0">
                Inativa
              </span>
            )}
          </div>
          <p className="text-xs text-[#475569]">
            {account.bank ? `${account.bank} · ` : ''}{typeLabel}
          </p>
        </div>
        <p className={`text-sm font-semibold tabular-nums shrink-0 ${balance >= 0 ? 'text-[#F8FAFC]' : 'text-[#EF4444]'}`}>
          {formatCurrency(balance)}
        </p>
      </div>
    </div>
  )
}
