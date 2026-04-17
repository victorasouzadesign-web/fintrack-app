'use client'

import { useRef, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import type { TransactionRow as TRow } from '@/hooks/useTransactions'

interface TransactionRowProps {
  transaction: TRow
  onDelete?: (id: string) => void
}

function CategoryIcon({ icon, colorHex }: { icon: string | null; colorHex: string | null }) {
  const bg = colorHex ? `${colorHex}26` : '#14A08526' // 15% opacity fallback
  const color = colorHex ?? '#14A085'

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center flex-none text-lg"
      style={{ backgroundColor: bg, color }}
    >
      {icon ?? '💳'}
    </div>
  )
}

function TransferIcon({ type }: { type: string }) {
  if (type === 'savings_transfer') {
    return (
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none text-lg bg-[#F59E0B26]">
        🎯
      </div>
    )
  }
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-none bg-[#14A08526]">
      <span className="text-[#14A085] text-xl">⇄</span>
    </div>
  )
}

export function TransactionRow({ transaction: t, onDelete }: TransactionRowProps) {
  const isIncome = t.type === 'income'
  const isTransfer = t.type === 'transfer' || t.type === 'savings_transfer'
  const [swiped, setSwiped] = useState(false)
  const startX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = startX.current - e.changedTouches[0].clientX
    if (delta > 60) setSwiped(true)
    if (delta < -20) setSwiped(false)
  }

  const subtitle = t.card_name
    ? `Cartão • ${t.card_name}`
    : t.account_name
    ? t.account_name
    : t.category_name ?? '—'

  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      {/* Delete action revealed on swipe */}
      <div
        className={cn(
          'absolute inset-y-0 right-0 flex items-center justify-center bg-[#EF4444] transition-all duration-200',
          swiped ? 'w-16 opacity-100' : 'w-0 opacity-0'
        )}
      >
        <button
          onClick={() => onDelete?.(t.transaction_id)}
          className="flex items-center justify-center w-full h-full"
          aria-label="Excluir"
        >
          <Trash2 size={18} className="text-white" />
        </button>
      </div>

      {/* Main row */}
      <div
        className={cn(
          'bg-[#111827] p-3.5 border border-[#1E293B] hover:border-[#1C3A50] transition-all duration-200 cursor-pointer flex items-center gap-3 rounded-xl',
          swiped && 'translate-x-[-64px]'
        )}
        style={{ transition: 'transform 200ms ease, border-color 200ms ease' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {isTransfer
          ? <TransferIcon type={t.type} />
          : <CategoryIcon icon={t.category_icon} colorHex={t.color_hex} />
        }

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F8FAFC] truncate">
            {t.description ?? 'Sem descrição'}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-xs text-[#475569] truncate">{subtitle}</span>
            {t.status === 'planned' && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                Planejado
              </span>
            )}
            {t.is_estimated && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                Estimado
              </span>
            )}
            {t.is_recurring && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-[#14A085]/10 text-[#14A085] border border-[#14A085]/20">
                Recorrente
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex-none">
          <p className={cn(
            'text-sm font-semibold tabular-nums',
            isIncome ? 'text-[#22C55E]' : isTransfer ? 'text-[#F59E0B]' : 'text-[#EF4444]'
          )}>
            {isIncome ? '+' : isTransfer ? '' : '-'} {formatCurrency(t.amount)}
          </p>
          <p className="text-xs text-[#475569] mt-0.5">
            {new Date(t.due_date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
          </p>
        </div>
      </div>
    </div>
  )
}
