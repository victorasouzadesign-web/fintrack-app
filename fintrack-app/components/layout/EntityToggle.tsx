'use client'

import { cn } from '@/lib/utils'

export type EntityFilter = 'PF' | 'PJ' | 'Tudo'

interface EntityToggleProps {
  value: EntityFilter
  onChange: (value: EntityFilter) => void
}

const OPTIONS: EntityFilter[] = ['PF', 'PJ', 'Tudo']

export function EntityToggle({ value, onChange }: EntityToggleProps) {
  return (
    <div className="bg-[#111827] rounded-full p-0.5 flex gap-0.5 border border-[#1E293B]">
      {OPTIONS.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={cn(
            'px-3 py-1 text-xs rounded-full transition-all duration-200',
            value === option
              ? 'bg-[#14A085] text-white font-semibold shadow-[0_0_10px_rgba(20,160,133,0.3)]'
              : 'text-[#94A3B8] hover:text-white font-medium'
          )}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
