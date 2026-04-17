'use client'

import { useState, useRef } from 'react'
import { Pencil, PowerOff, CreditCard } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const NETWORK_COLORS: Record<string, string> = {
  visa: '#1A1F71',
  mastercard: '#EB001B',
  elo: '#FFD700',
  amex: '#006FCF',
  hipercard: '#CC0000',
}

export interface CreditCardItem {
  card_id: string
  name: string
  bank: string | null
  network: string | null
  limit_total: number | null
  closing_day: number | null
  due_day: number | null
  color_hex: string | null
  is_active: boolean | null
}

interface CardRowProps {
  card: CreditCardItem
  onEdit: (c: CreditCardItem) => void
  onToggle: (c: CreditCardItem) => void
}

export function CardRow({ card, onEdit, onToggle }: CardRowProps) {
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(0)
  const limit = card.limit_total ?? 0
  const cardColor = card.color_hex ?? (card.network ? NETWORK_COLORS[card.network.toLowerCase()] : null) ?? '#1C2537'

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Action buttons */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <button
          onClick={() => { setSwiped(false); onEdit(card) }}
          className="h-full px-4 bg-[#14A085]/20 text-[#14A085] flex items-center gap-1.5 text-xs font-semibold"
        >
          <Pencil size={14} />
          Editar
        </button>
        <button
          onClick={() => { setSwiped(false); onToggle(card) }}
          className="h-full px-4 bg-[#EF4444]/20 text-[#EF4444] flex items-center gap-1.5 text-xs font-semibold rounded-r-xl"
        >
          <PowerOff size={14} />
          {card.is_active ? 'Desativar' : 'Ativar'}
        </button>
      </div>

      {/* Main row */}
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
        {/* Card icon with brand color */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${cardColor}40` }}
        >
          <CreditCard size={18} style={{ color: cardColor === '#1C2537' ? '#94A3B8' : cardColor }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#F8FAFC] truncate">{card.name}</p>
            {!card.is_active && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#475569]/20 text-[#475569] shrink-0">
                Inativo
              </span>
            )}
          </div>
          <p className="text-xs text-[#475569]">
            {card.bank ? `${card.bank}` : ''}
            {card.network ? ` · ${card.network}` : ''}
            {card.closing_day ? ` · fecha dia ${card.closing_day}` : ''}
            {card.due_day ? ` · vence dia ${card.due_day}` : ''}
          </p>
        </div>

        {limit > 0 && (
          <div className="text-right shrink-0">
            <p className="text-sm font-semibold text-[#F8FAFC] tabular-nums">{formatCurrency(limit)}</p>
            <p className="text-[10px] text-[#475569]">limite</p>
          </div>
        )}
      </div>
    </div>
  )
}
