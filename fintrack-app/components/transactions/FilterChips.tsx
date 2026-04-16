'use client'

import { cn } from '@/lib/utils'
import type { TransactionFilter } from '@/hooks/useTransactions'

const FILTERS: TransactionFilter[] = ['Todos', 'Receitas', 'Despesas', 'Cartão', 'Planejado', 'Pago']

interface FilterChipsProps {
  value: TransactionFilter
  onChange: (f: TransactionFilter) => void
}

export function FilterChips({ value, onChange }: FilterChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {FILTERS.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            'flex-none rounded-full px-3 py-1 text-xs font-medium border transition-all duration-200',
            value === f
              ? 'bg-[#14A085]/10 text-[#14A085] border-[#14A085]/30'
              : 'bg-[#111827] text-[#94A3B8] border-[#1E293B] hover:text-[#F8FAFC] hover:border-[#1C3A50]'
          )}
        >
          {f}
        </button>
      ))}
    </div>
  )
}
