'use client'

import Link from 'next/link'
import { Plus, Receipt } from 'lucide-react'
import { TransactionRow } from './TransactionRow'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { TransactionRow as TRow } from '@/hooks/useTransactions'

interface TransactionListProps {
  transactions: TRow[]
  onDelete?: (id: string) => void
}

interface DayGroup {
  date: string
  label: string
  items: TRow[]
  dayBalance: number
}

function groupByDay(transactions: TRow[]): DayGroup[] {
  const map = new Map<string, TRow[]>()

  for (const t of transactions) {
    const existing = map.get(t.due_date) ?? []
    map.set(t.due_date, [...existing, t])
  }

  return Array.from(map.entries()).map(([date, items]) => {
    const dayBalance = items.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount)
    }, 0)

    return {
      date,
      label: formatRelativeDate(date),
      items,
      dayBalance,
    }
  })
}

// Skeleton for loading state
function TransactionSkeleton() {
  return (
    <div className="bg-[#111827] rounded-xl p-3.5 border border-[#1E293B] mb-2 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-[#1C2537] animate-pulse flex-none" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-[#1C2537] rounded animate-pulse w-3/4" />
        <div className="h-3 bg-[#1C2537] rounded animate-pulse w-1/2" />
      </div>
      <div className="space-y-2 flex-none">
        <div className="h-3.5 bg-[#1C2537] rounded animate-pulse w-20" />
        <div className="h-3 bg-[#1C2537] rounded animate-pulse w-12 ml-auto" />
      </div>
    </div>
  )
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#1C2537] flex items-center justify-center mb-4">
          <Receipt size={28} className="text-[#475569]" />
        </div>
        <p className="text-sm font-medium text-[#94A3B8] mb-1">
          Nenhuma transação neste período
        </p>
        <p className="text-xs text-[#475569] mb-6">
          Adicione sua primeira transação para começar
        </p>
        <Link
          href="/dashboard/quick-input"
          className="inline-flex items-center gap-2 bg-[#14A085] hover:bg-[#0D7377] text-white text-sm font-semibold rounded-lg px-4 py-2.5 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus size={16} />
          Adicionar transação
        </Link>
      </div>
    )
  }

  const groups = groupByDay(transactions)

  return (
    <div>
      {groups.map((group) => (
        <div key={group.date} className="mb-4">
          {/* Day header */}
          <div className="flex items-center justify-between mb-2 px-0.5">
            <span className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
              {group.label}
            </span>
            <span className={cn(
              'text-xs font-semibold tabular-nums',
              group.dayBalance >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
            )}>
              {group.dayBalance >= 0 ? '+' : ''}{formatCurrency(group.dayBalance)}
            </span>
          </div>

          {/* Rows */}
          {group.items.map((t) => (
            <TransactionRow key={t.transaction_id} transaction={t} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  )
}

export { TransactionSkeleton }
