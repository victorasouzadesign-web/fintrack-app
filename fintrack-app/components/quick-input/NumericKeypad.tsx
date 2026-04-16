'use client'

import { Delete } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NumericKeypadProps {
  onKey: (key: string) => void
  onSave: () => void
  canSave: boolean
  saving: boolean
}

const KEYS = ['1','2','3','4','5','6','7','8','9',',','0','del']

export function NumericKeypad({ onKey, onSave, canSave, saving }: NumericKeypadProps) {
  return (
    <div
      className="bg-[#111827] border-t border-[#1E293B]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-3 gap-1 p-2">
        {KEYS.map((key) => (
          <button
            key={key}
            onClick={() => onKey(key)}
            className={cn(
              'h-14 flex items-center justify-center rounded-xl text-2xl font-light',
              'text-[#F8FAFC] hover:bg-[#1C2537] active:bg-[#263347]',
              'transition-colors duration-150 select-none'
            )}
          >
            {key === 'del' ? (
              <Delete size={22} className="text-[#94A3B8]" />
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {/* Save button */}
      <div className="px-2 pb-2">
        <button
          onClick={onSave}
          disabled={!canSave || saving}
          className={cn(
            'w-full rounded-xl py-3.5 text-base font-semibold transition-all duration-200',
            canSave && !saving
              ? 'bg-[#14A085] hover:bg-[#0D7377] text-white active:scale-[0.98] shadow-[0_0_20px_rgba(20,160,133,0.3)]'
              : 'bg-[#1C2537] text-[#475569] cursor-not-allowed opacity-50'
          )}
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Salvando...
            </span>
          ) : 'Salvar'}
        </button>
      </div>
    </div>
  )
}

/** Parse keypad inputs into a numeric value */
export function keypadReducer(current: string, key: string): string {
  if (key === 'del') return current.slice(0, -1) || '0'
  if (key === ',') {
    if (current.includes(',')) return current
    return current + ','
  }
  // Prevent more than 2 decimal places
  const commaIdx = current.indexOf(',')
  if (commaIdx !== -1 && current.length - commaIdx > 2) return current
  // Prevent leading zeros
  if (current === '0') return key
  return current + key
}

export function parseAmount(str: string): number {
  return parseFloat(str.replace(',', '.')) || 0
}
