'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface MonthSelectorProps {
  year: number
  month: number // 1-12
  onChange: (year: number, month: number) => void
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const prev = () => {
    if (month === 1) onChange(year - 1, 12)
    else onChange(year, month - 1)
  }

  const next = () => {
    const now = new Date()
    // Don't allow navigating beyond the current month
    if (year > now.getFullYear()) return
    if (year === now.getFullYear() && month >= now.getMonth() + 1) return
    if (month === 12) onChange(year + 1, 1)
    else onChange(year, month + 1)
  }

  const isCurrentMonth =
    year === new Date().getFullYear() && month === new Date().getMonth() + 1

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        onClick={prev}
        className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-200 p-1 rounded-lg hover:bg-[#1C2537]"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={18} />
      </button>

      <span className="text-base font-semibold text-[#F8FAFC] min-w-[140px] text-center">
        {MONTHS[month - 1]} {year}
      </span>

      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors duration-200 p-1 rounded-lg hover:bg-[#1C2537] disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Próximo mês"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
