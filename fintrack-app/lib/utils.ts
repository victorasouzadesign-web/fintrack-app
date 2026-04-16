import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split('T')[0].split('-')
  return `${day}/${month}/${year}`
}

export function formatRelativeDate(date: string): string {
  const target = new Date(date.split('T')[0] + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - target.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoje'
  if (diffDays === 1) return 'Ontem'

  const weekday = target.toLocaleDateString('pt-BR', { weekday: 'short' })
  const day = target.getDate()
  const month = target.toLocaleDateString('pt-BR', { month: 'short' })

  // e.g. "Seg, 15 mar"
  const weekdayFormatted = weekday.replace('.', '')
  const monthFormatted = month.replace('.', '')
  return `${weekdayFormatted.charAt(0).toUpperCase() + weekdayFormatted.slice(1)}, ${day} ${monthFormatted}`
}
