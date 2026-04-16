'use client'

import { useState } from 'react'
import { motion, animate, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'
import Link from 'next/link'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useEntity } from '@/lib/entity-context'
import { useProjection } from '@/hooks/useProjection'
import { AreaProjectionChart } from '@/components/charts/AreaProjectionChart'
import { CashflowChart } from '@/components/charts/CashflowChart'
import { GoalProgressRing } from '@/components/GoalProgressRing'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { formatCurrency, cn } from '@/lib/utils'

// ─── Horizon options ──────────────────────────────────────────────────────────
const HORIZONS = [5, 10, 20, 25, 50]

// ─── Tabs ────────────────────────────────────────────────────────────────────
type ChartTab = 'acumulado' | 'cashflow'

// ─── Category filters ─────────────────────────────────────────────────────────
const CATEGORY_FILTERS = [
  { id: 'dinheiro',     label: 'Dinheiro',     color: '#14A085' },
  { id: 'investimentos',label: 'Investimentos',color: '#8B5CF6' },
  { id: 'patrimonio',   label: 'Patrimônio',   color: '#F59E0B' },
  { id: 'divida',       label: 'Dívida',       color: '#EF4444' },
]

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '' }: { value: number; prefix?: string }) {
  const motionVal = useMotionValue(0)
  const [display, setDisplay] = useState('R$ 0')

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.4,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(prefix + formatCurrency(v)),
    })
    return controls.stop
  }, [value, prefix, motionVal])

  return <span>{display}</span>
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ChartSkeleton() {
  return (
    <div className="h-[220px] w-full bg-[#1C2537] animate-pulse rounded-xl" />
  )
}

function StatSkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="h-12 w-48 bg-[#1C2537] animate-pulse rounded-lg mx-auto" />
      <div className="h-4 w-32 bg-[#1C2537] animate-pulse rounded mx-auto" />
      <div className="h-3 w-24 bg-[#1C2537] animate-pulse rounded mx-auto" />
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProjectionPage() {
  const { entityFilter, setEntityFilter, entityId } = useEntity()
  const [horizon, setHorizon] = useState(10)
  const [tab, setTab] = useState<ChartTab>('acumulado')
  const [activeCategories, setActiveCategories] = useState<Set<string>>(
    new Set(CATEGORY_FILTERS.map(f => f.id))
  )

  const { netWorthData, cashflowData, goals, loading, usingFallback, stats } =
    useProjection({ entityId, years: horizon })

  const toggleCategory = (id: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // Auto-generate milestones from net worth data
  const milestones = (() => {
    const marks: Array<{ year: number; label: string }> = []
    const thresholds = [250_000, 500_000, 1_000_000, 2_000_000, 5_000_000]
    for (const threshold of thresholds) {
      const point = netWorthData.find(p => p.net_worth >= threshold)
      if (point && point.year > new Date().getFullYear()) {
        marks.push({
          year: point.year,
          label: threshold >= 1_000_000
            ? `R$${(threshold / 1_000_000).toFixed(0)}M`
            : `R$${(threshold / 1_000).toFixed(0)}K`,
        })
      }
    }
    return marks.slice(0, 3) // max 3 milestones
  })()

  const growthPositive = stats.absoluteGrowth >= 0

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[#F8FAFC]">Projeção</span>
            <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 rounded-full px-3 py-1 text-xs font-medium">
              E Se?
            </span>
          </div>
          <EntityToggle value={entityFilter} onChange={setEntityFilter} />
        </div>
      </header>

      <main className="max-w-md mx-auto">

        {/* ── Hero stats ─────────────────────────────────────── */}
        <section className="px-4 pt-6 pb-4 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#94A3B8] mb-3">
            Patrimônio Líquido Projetado
          </p>

          {loading ? <StatSkeleton /> : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-5xl font-bold text-[#F8FAFC] tabular-nums tracking-tight">
                <AnimatedNumber value={stats.projectedValue} />
              </p>

              <div className="flex items-center justify-center gap-1.5 mt-2">
                {growthPositive
                  ? <TrendingUp size={14} className="text-[#22C55E]" />
                  : <TrendingDown size={14} className="text-[#EF4444]" />}
                <span className={`text-sm font-medium ${growthPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                  {growthPositive ? '+' : ''}{formatCurrency(stats.absoluteGrowth)}{' '}
                  ({growthPositive ? '+' : ''}{stats.pctGrowth.toFixed(0)}%)
                </span>
              </div>

              <p className="text-xs text-[#475569] mt-1">
                de {formatCurrency(stats.currentValue)} atual em {horizon} anos
              </p>

              {usingFallback && (
                <p className="text-[10px] text-[#475569] mt-2 bg-[#1C2537] rounded-full px-3 py-1 inline-block">
                  Edge Function não implantada — usando projeção estimada
                </p>
              )}
            </motion.div>
          )}
        </section>

        {/* ── Horizon selector ───────────────────────────────── */}
        <section className="px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {HORIZONS.map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={cn(
                  'flex-none rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 border',
                  horizon === h
                    ? 'bg-[#14A085] text-white border-transparent shadow-[0_0_12px_rgba(20,160,133,0.3)]'
                    : 'bg-[#111827] border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-[#1C3A50]'
                )}
              >
                {h}A
              </button>
            ))}
          </div>
        </section>

        {/* ── Tabs ───────────────────────────────────────────── */}
        <section className="px-4 mt-4">
          <div className="flex border-b border-[#1E293B]">
            {(['acumulado', 'cashflow'] as ChartTab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'px-4 pb-2.5 text-sm font-semibold transition-all duration-200 border-b-2 -mb-px',
                  tab === t
                    ? 'border-[#14A085] text-[#F8FAFC]'
                    : 'border-transparent text-[#94A3B8] hover:text-[#F8FAFC]'
                )}
              >
                {t === 'acumulado' ? 'Acumulado' : 'Fluxo de Caixa'}
              </button>
            ))}
          </div>
        </section>

        {/* ── Chart ──────────────────────────────────────────── */}
        <section className="mt-4">
          {loading ? (
            <div className="px-4">
              <ChartSkeleton />
            </div>
          ) : (
            <motion.div
              key={`${tab}-${horizon}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {tab === 'acumulado' ? (
                <AreaProjectionChart data={netWorthData} milestones={milestones} />
              ) : (
                <CashflowChart data={cashflowData} />
              )}
            </motion.div>
          )}
        </section>

        {/* ── Category filter pills ──────────────────────────── */}
        <section className="px-4 mt-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORY_FILTERS.map(({ id, label, color }) => {
              const isActive = activeCategories.has(id)
              return (
                <button
                  key={id}
                  onClick={() => toggleCategory(id)}
                  className={cn(
                    'flex-none flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all duration-200',
                    isActive
                      ? 'text-white border-transparent'
                      : 'bg-[#111827] border-[#1E293B] text-[#475569]'
                  )}
                  style={isActive ? { backgroundColor: `${color}20`, borderColor: `${color}40`, color } : {}}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-none"
                    style={{ backgroundColor: isActive ? color : '#475569' }}
                  />
                  {label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Goals list ─────────────────────────────────────── */}
        <section className="px-4 mt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-[#94A3B8]">Metas</p>
            <Link
              href="/dashboard/goals"
              className="flex items-center gap-1 text-xs text-[#14A085] hover:text-[#0D7377] transition-colors"
            >
              <Plus size={12} />
              Adicionar
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="h-16 bg-[#1C2537] animate-pulse rounded-xl" />
              ))}
            </div>
          ) : goals.length === 0 ? (
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl p-4 text-center">
              <p className="text-sm text-[#475569]">Nenhuma meta ativa</p>
              <Link href="/dashboard/goals" className="text-xs text-[#14A085] mt-1 inline-block">
                Criar primeira meta →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {goals.map((goal) => {
                const pct = goal.target_amount > 0
                  ? Math.min(100, Math.round(((goal.balance ?? 0) / goal.target_amount) * 100))
                  : 0
                const targetDateStr = goal.target_date
                  ? new Date(goal.target_date + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
                  : null

                return (
                  <div
                    key={goal.goal_id}
                    className="bg-[#111827] border border-[#1E293B] rounded-xl p-3.5 flex items-center gap-3 hover:border-[#1C3A50] transition-colors duration-200"
                  >
                    <GoalProgressRing
                      progress={pct}
                      size={44}
                      strokeWidth={4}
                      label={`${pct}%`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {goal.icon && <span className="text-base leading-none">{goal.icon}</span>}
                        <p className="text-sm font-medium text-[#F8FAFC] truncate">{goal.name}</p>
                      </div>
                      <p className="text-xs text-[#475569] mt-0.5 tabular-nums">
                        {formatCurrency(goal.balance ?? 0)} / {formatCurrency(goal.target_amount)}
                        {targetDateStr && <span className="ml-1.5">· {targetDateStr}</span>}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold tabular-nums px-2 py-1 rounded-full',
                        pct >= 100
                          ? 'bg-[#22C55E]/10 text-[#22C55E]'
                          : 'bg-[#14A085]/10 text-[#14A085]'
                      )}
                    >
                      {pct}%
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </main>

      <BottomNav />
    </div>
  )
}
