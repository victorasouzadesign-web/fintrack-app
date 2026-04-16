'use client'

import { cn } from '@/lib/utils'

export type TransactionType = 'expense' | 'income' | 'transfer' | 'savings'

interface TypeConfig {
  type: TransactionType
  icon: string
  label: string
  activeColor: string
  activeBg: string
}

const TYPES: TypeConfig[] = [
  { type: 'expense',  icon: '↓',  label: 'Despesa',       activeColor: 'text-[#EF4444]', activeBg: 'bg-[#EF4444]' },
  { type: 'income',   icon: '↑',  label: 'Receita',       activeColor: 'text-[#22C55E]', activeBg: 'bg-[#22C55E]' },
  { type: 'transfer', icon: '⇄',  label: 'Transferência', activeColor: 'text-[#14A085]', activeBg: 'bg-[#14A085]' },
  { type: 'savings',  icon: '🎯', label: 'Poupança',      activeColor: 'text-[#F59E0B]', activeBg: 'bg-[#F59E0B]' },
]

interface TypeSelectorProps {
  value: TransactionType
  onChange: (type: TransactionType) => void
}

export function TypeSelector({ value, onChange }: TypeSelectorProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {TYPES.map(({ type, icon, label, activeColor, activeBg }) => {
        const isActive = value === type
        return (
          <button
            key={type}
            onClick={() => onChange(type)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all duration-200 border',
              isActive
                ? `${activeBg} border-transparent text-white shadow-lg`
                : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:border-[#1C3A50] hover:text-[#F8FAFC]'
            )}
          >
            <span className={cn('text-xl leading-none', isActive ? 'text-white' : activeColor)}>
              {icon}
            </span>
            <span className="text-[10px] font-semibold leading-none">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export const TYPE_LABELS: Record<TransactionType, string> = {
  expense:  'Nova Despesa',
  income:   'Nova Receita',
  transfer: 'Transferência',
  savings:  'Poupar',
}
