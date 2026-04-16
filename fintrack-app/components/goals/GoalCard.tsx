'use client'

import { useState } from 'react'
import { ChevronRight, TrendingUp, Calendar, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { GoalProgressRing } from '@/components/GoalProgressRing'
import { type Goal, type GoalTransfer } from '@/hooks/useGoals'
import { formatCurrency, formatDate } from '@/lib/utils'

const ICONS: Record<string, string> = {
  home: '🏠',
  car: '🚗',
  travel: '✈️',
  education: '🎓',
  health: '❤️',
  emergency: '🛡️',
  wedding: '💍',
  baby: '👶',
  tech: '💻',
  business: '💼',
  savings: '💰',
  gift: '🎁',
}

function ringColor(pct: number) {
  if (pct >= 100) return '#22C55E'
  if (pct >= 60) return '#14A085'
  if (pct >= 30) return '#F59E0B'
  return '#94A3B8'
}

interface GoalCardProps {
  goal: Goal
  onDeposit: () => void
  onWithdraw: () => void
  fetchTransfers: (id: string) => Promise<GoalTransfer[]>
}

export function GoalCard({ goal, onDeposit, onWithdraw, fetchTransfers }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [transfers, setTransfers] = useState<GoalTransfer[]>([])
  const [loadingTransfers, setLoadingTransfers] = useState(false)

  const pct = goal.progress_pct
  const color = ringColor(pct)
  const icon = goal.icon ? (ICONS[goal.icon] ?? '🎯') : '🎯'
  const completed = pct >= 100

  async function handleExpand() {
    const next = !expanded
    setExpanded(next)
    if (next && transfers.length === 0) {
      setLoadingTransfers(true)
      const result = await fetchTransfers(goal.goal_id)
      setTransfers(result)
      setLoadingTransfers(false)
    }
  }

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden">
      {/* Main row */}
      <button
        onClick={handleExpand}
        className="w-full text-left px-4 py-4 flex items-center gap-4 hover:bg-[#1C2537]/40 transition-colors duration-200 active:bg-[#1C2537]/60"
      >
        {/* Ring + icon */}
        <div className="relative flex-none">
          <GoalProgressRing
            progress={pct}
            size={56}
            strokeWidth={4}
            color={color}
          />
          <span className="absolute inset-0 flex items-center justify-center text-xl pointer-events-none">
            {icon}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#F8FAFC] truncate">{goal.name}</p>
            {completed && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E] shrink-0">
                Concluída
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[#94A3B8] tabular-nums">
              {formatCurrency(goal.balance)}
            </span>
            <span className="text-[#475569] text-xs">/</span>
            <span className="text-xs text-[#475569] tabular-nums">
              {formatCurrency(goal.target_amount)}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-1 bg-[#1E293B] rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, pct)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>

          {/* Footer stats */}
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] font-semibold tabular-nums" style={{ color }}>
              {pct.toFixed(0)}%
            </span>
            {goal.months_until !== null && !completed && (
              <>
                <span className="text-[#1E293B]">·</span>
                <span className="text-[11px] text-[#475569] flex items-center gap-1">
                  <Calendar size={10} className="shrink-0" />
                  {goal.months_until === 0
                    ? 'Este mês'
                    : `${goal.months_until} mes${goal.months_until > 1 ? 'es' : ''}`}
                </span>
              </>
            )}
            {goal.monthly_needed !== null && !completed && goal.months_until !== null && goal.months_until > 0 && (
              <>
                <span className="text-[#1E293B]">·</span>
                <span className="text-[11px] text-[#475569] flex items-center gap-1">
                  <TrendingUp size={10} className="shrink-0" />
                  {formatCurrency(goal.monthly_needed)}/mês
                </span>
              </>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronRight
          size={16}
          className={`text-[#475569] transition-transform duration-200 shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-[#1E293B] px-4 pt-3 pb-4 space-y-3">
              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={onDeposit}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#14A085]/10 text-[#14A085] text-sm font-semibold hover:bg-[#14A085]/20 active:bg-[#14A085]/30 transition-colors duration-200"
                >
                  <ArrowDownCircle size={15} />
                  Depositar
                </button>
                <button
                  onClick={onWithdraw}
                  disabled={goal.balance <= 0}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-sm font-semibold hover:bg-[#EF4444]/20 active:bg-[#EF4444]/30 transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ArrowUpCircle size={15} />
                  Retirar
                </button>
              </div>

              {/* Description */}
              {goal.description && (
                <p className="text-xs text-[#475569] leading-relaxed">{goal.description}</p>
              )}

              {/* Target date */}
              {goal.target_date && (
                <p className="text-xs text-[#94A3B8]">
                  Meta: <span className="text-[#F8FAFC] font-medium">{formatDate(goal.target_date)}</span>
                  {goal.remaining > 0 && (
                    <span className="text-[#475569]"> · Falta {formatCurrency(goal.remaining)}</span>
                  )}
                </p>
              )}

              {/* Transfers list */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-2">
                  Últimas movimentações
                </p>
                {loadingTransfers ? (
                  <div className="space-y-2">
                    {[1, 2].map(i => (
                      <div key={i} className="h-8 bg-[#1C2537] rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : transfers.length === 0 ? (
                  <p className="text-xs text-[#475569] py-2">Nenhuma movimentação ainda.</p>
                ) : (
                  <div className="space-y-1.5">
                    {transfers.map(t => (
                      <div key={t.transfer_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {t.direction === 'deposit'
                            ? <ArrowDownCircle size={13} className="text-[#14A085] shrink-0" />
                            : <ArrowUpCircle size={13} className="text-[#EF4444] shrink-0" />
                          }
                          <div>
                            <p className="text-xs text-[#94A3B8]">
                              {t.notes || (t.direction === 'deposit' ? 'Depósito' : 'Retirada')}
                            </p>
                            <p className="text-[10px] text-[#475569]">{formatDate(t.date)}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold tabular-nums ${
                          t.direction === 'deposit' ? 'text-[#14A085]' : 'text-[#EF4444]'
                        }`}>
                          {t.direction === 'deposit' ? '+' : '-'}{formatCurrency(t.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
