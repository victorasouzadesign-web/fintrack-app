'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import {
  Area, AreaChart, Tooltip,
  ResponsiveContainer, ReferenceDot,
} from 'recharts'
import { AlertCircle, X, ChevronRight, TrendingUp, TrendingDown, ShoppingCart, Target, BarChart2, SlidersHorizontal } from 'lucide-react'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { useHomeData } from '@/hooks/useHomeData'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency } from '@/lib/utils'

// ─── Animated counter ────────────────────────────────────────────────────────

function AnimatedValue({ value }: { value: number }) {
  const motionVal = useMotionValue(0)
  const [display, setDisplay] = useState('R$ 0,00')

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(formatCurrency(v)),
    })
    return controls.stop
  }, [value, motionVal])

  return (
    <span className="text-5xl font-bold text-[#F8FAFC] tabular-nums tracking-tight">
      {display}
    </span>
  )
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#1C2537] rounded ${className ?? ''}`} />
  )
}

// ─── Custom tooltip ──────────────────────────────────────────────────────────

function SparkTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number }> }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#1C2537] border border-[#1E293B] rounded-lg px-2.5 py-1.5 text-xs text-[#F8FAFC] tabular-nums shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
      {formatCurrency(payload[0].value)}
    </div>
  )
}

// ─── Goal card ───────────────────────────────────────────────────────────────

function GoalCard({ goal }: { goal: { goal_id: string; name: string; balance: number | null; target_amount: number; icon: string | null } }) {
  const balance = goal.balance ?? 0
  const progress = Math.min(100, goal.target_amount > 0 ? (balance / goal.target_amount) * 100 : 0)

  return (
    <Link
      href="/dashboard/goals"
      className="flex-none min-w-[160px] max-w-[160px] bg-[#111827] rounded-xl p-4 border border-[#1E293B] hover:border-[#14A085]/40 transition-colors duration-200 cursor-pointer block"
    >
      <div className="text-2xl mb-2">{goal.icon ?? '🎯'}</div>
      <p className="text-sm font-medium text-[#F8FAFC] truncate mb-1">{goal.name}</p>
      <div className="bg-[#1E293B] rounded-full h-1.5 mb-2">
        <div
          className="bg-[#14A085] rounded-full h-1.5 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[#94A3B8] tabular-nums">
        {formatCurrency(balance)} / {formatCurrency(goal.target_amount)}
      </p>
      <p className="text-xs font-semibold text-[#14A085] mt-1">{Math.round(progress)}%</p>
    </Link>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function HomeClient() {
  const { entityFilter, setEntityFilter, entityId } = useEntity()
  const [alertDismissed, setAlertDismissed] = useState(false)
  const { data, loading, refetch } = useHomeData(entityId)

  // Pull-to-refresh state
  const startY = useRef(0)
  const [refreshing, setRefreshing] = useState(false)

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }
  const handleTouchEnd = async (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].clientY - startY.current
    if (delta > 80 && !refreshing) {
      setRefreshing(true)
      await refetch()
      setRefreshing(false)
    }
  }

  // Derived values
  const current = data?.snapshots[0]
  const previous = data?.snapshots[1]
  const netWorth = current?.net_worth ?? 0
  const variation = previous ? netWorth - previous.net_worth : null

  // Build sparkline data from transactions
  const sparkData = (() => {
    if (!data?.transactions.length) return []
    let cumulative = previous?.net_worth ?? 0
    return data.transactions.map((t) => {
      const delta = t.type === 'income' ? (t.amount ?? 0) : -(t.amount ?? 0)
      cumulative += delta
      return { date: t.due_date, value: cumulative }
    })
  })()

  const sparkFirst = sparkData[0]
  const sparkLast = sparkData[sparkData.length - 1]

  // Estimated remaining (income - expenses in current month)
  const income = data?.transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + (t.amount ?? 0), 0) ?? 0
  const expenses = data?.transactions
    .filter((t) => t.type !== 'income')
    .reduce((s, t) => s + (t.amount ?? 0), 0) ?? 0
  const estimated = income - expenses

  // Alert: overdue transactions
  const overdue = data?.transactions.filter(
    (t) => t.status === 'pending' && t.due_date < new Date().toISOString().split('T')[0]
  ) ?? []

  return (
    <div
      className="min-h-screen bg-[#0A0F1E] pb-24"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh indicator */}
      {refreshing && (
        <div className="flex justify-center pt-4">
          <div className="w-5 h-5 border-2 border-[#14A085] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 h-14">
          <span className="text-lg font-bold text-[#14A085] tracking-tight">FinTrack</span>
          <EntityToggle value={entityFilter} onChange={setEntityFilter} />
        </div>
      </header>

      <main className="max-w-md mx-auto px-4">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="pt-6 pb-4 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#94A3B8] mb-2">
            Patrimônio Líquido
          </p>

          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Skeleton className="h-12 w-56 mx-auto" />
              <Skeleton className="h-5 w-32 mx-auto" />
            </div>
          ) : (
            <>
              <AnimatedValue value={netWorth} />

              {variation !== null && (
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  {variation >= 0 ? (
                    <TrendingUp size={14} className="text-[#22C55E]" />
                  ) : (
                    <TrendingDown size={14} className="text-[#EF4444]" />
                  )}
                  <span
                    className={`text-sm font-medium ${variation >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}
                  >
                    {variation >= 0 ? '+' : ''}{formatCurrency(variation)} este mês
                  </span>
                </div>
              )}

              <div className="inline-flex items-center mt-3 bg-[#1C2537] rounded-full px-3 py-1 border border-[#1E293B]">
                <span className="text-xs text-[#94A3B8]">
                  Est. restante: <span className="text-[#F8FAFC] font-medium tabular-nums">{formatCurrency(estimated)}</span>
                </span>
              </div>
            </>
          )}
        </section>

        {/* ── Sparkline ──────────────────────────────────────── */}
        <section className="mt-4">
          <div className="bg-[#111827] rounded-xl p-4 border border-[#1E293B] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#94A3B8] mb-3">
              Este Mês
            </p>

            {loading ? (
              <Skeleton className="h-20 w-full" />
            ) : sparkData.length > 1 ? (
              <>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={sparkData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                    <defs>
                      <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14A085" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#14A085" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip content={<SparkTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#14A085"
                      strokeWidth={2}
                      fill="url(#sparkGradient)"
                      dot={false}
                      activeDot={{ r: 4, fill: '#14A085', strokeWidth: 0 }}
                    />
                    {sparkLast && (
                      <ReferenceDot
                        x={sparkLast.date}
                        y={sparkLast.value}
                        r={4}
                        fill="#14A085"
                        stroke="none"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>

                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#475569]">
                    {sparkFirst?.date ? new Date(sparkFirst.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : ''}{' '}
                    <span className="tabular-nums">{sparkFirst ? formatCurrency(sparkFirst.value) : ''}</span>
                  </span>
                  <span className="text-xs text-[#94A3B8] tabular-nums">
                    {sparkLast?.date ? new Date(sparkLast.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' }) : ''}{' '}
                    {sparkLast ? formatCurrency(sparkLast.value) : ''}
                  </span>
                </div>
              </>
            ) : (
              <div className="h-20 flex items-center justify-center">
                <p className="text-xs text-[#475569]">Sem transações este mês</p>
              </div>
            )}
          </div>
        </section>

        {/* ── Caixinhas ──────────────────────────────────────── */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#94A3B8]">
              Caixinhas
            </p>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-0.5 text-xs text-[#14A085] hover:text-[#0D7377] transition-colors duration-200"
            >
              Ver todas <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="flex-none min-w-[160px] h-[140px] rounded-xl" />
              ))}
            </div>
          ) : data?.goals.length ? (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {data.goals.map((goal) => (
                <GoalCard key={goal.goal_id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="bg-[#111827] rounded-xl p-4 border border-[#1E293B] text-center">
              <p className="text-sm text-[#475569]">Nenhuma meta ativa</p>
              <Link
                href="/dashboard/goals"
                className="text-xs text-[#14A085] mt-1 inline-block hover:text-[#0D7377] transition-colors"
              >
                Criar primeira meta →
              </Link>
            </div>
          )}
        </section>

        {/* ── Ferramentas ────────────────────────────────────── */}
        <section className="mt-6">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#94A3B8] mb-3">
            Ferramentas
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/dashboard/purchase"
              className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3.5 hover:border-[#14A085]/40 active:scale-95 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-[#14A085]/15 flex items-center justify-center shrink-0">
                <ShoppingCart size={18} className="text-[#14A085]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC] leading-tight">Devo comprar?</p>
                <p className="text-[11px] text-[#475569] mt-0.5">Analise o impacto</p>
              </div>
            </Link>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3.5 hover:border-[#14A085]/40 active:scale-95 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-[#22C55E]/15 flex items-center justify-center shrink-0">
                <Target size={18} className="text-[#22C55E]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC] leading-tight">Caixinhas</p>
                <p className="text-[11px] text-[#475569] mt-0.5">Metas de poupança</p>
              </div>
            </Link>
            <Link
              href="/dashboard/projection"
              className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3.5 hover:border-[#14A085]/40 active:scale-95 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center shrink-0">
                <BarChart2 size={18} className="text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC] leading-tight">Projeção</p>
                <p className="text-[11px] text-[#475569] mt-0.5">Futuro financeiro</p>
              </div>
            </Link>
            <Link
              href="/dashboard/scenarios"
              className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3.5 hover:border-[#1E293B] active:scale-95 transition-all duration-200 opacity-50"
              aria-disabled="true"
              onClick={e => e.preventDefault()}
            >
              <div className="w-9 h-9 rounded-xl bg-[#475569]/15 flex items-center justify-center shrink-0">
                <SlidersHorizontal size={18} className="text-[#475569]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC] leading-tight">Cenários</p>
                <p className="text-[11px] text-[#475569] mt-0.5">Em breve</p>
              </div>
            </Link>
          </div>
        </section>

        {/* ── Alerta ─────────────────────────────────────────── */}
        {!loading && !alertDismissed && overdue.length > 0 && (
          <motion.section
            className="mt-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-3 flex items-start gap-3">
              <AlertCircle size={16} className="text-[#EF4444] mt-0.5 flex-none" />
              <p className="text-sm text-[#EF4444] flex-1">
                {overdue.length === 1
                  ? '1 transação em atraso'
                  : `${overdue.length} transações em atraso`}
              </p>
              <button
                onClick={() => setAlertDismissed(true)}
                className="text-[#EF4444]/60 hover:text-[#EF4444] transition-colors duration-200"
                aria-label="Fechar alerta"
              >
                <X size={14} />
              </button>
            </div>
          </motion.section>
        )}

      </main>

      <BottomNav />
    </div>
  )
}
