'use client'

import { useState } from 'react'
import { Plus, Target, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useGoals, type Goal } from '@/hooks/useGoals'
import { GoalCard } from '@/components/goals/GoalCard'
import { GoalDepositSheet } from '@/components/goals/GoalDepositSheet'
import { AddGoalSheet } from '@/components/goals/AddGoalSheet'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency } from '@/lib/utils'

export default function GoalsPage() {
  const { entityFilter, setEntityFilter, entityId } = useEntity()
  const { goals, loading, fetchTransfers, deposit, withdraw, addGoal, totals } = useGoals(entityId)

  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [sheetMode, setSheetMode] = useState<'deposit' | 'withdraw'>('deposit')
  const [depositSheetOpen, setDepositSheetOpen] = useState(false)
  const [addSheetOpen, setAddSheetOpen] = useState(false)

  function openDeposit(goal: Goal) {
    setSelectedGoal(goal)
    setSheetMode('deposit')
    setDepositSheetOpen(true)
  }

  function openWithdraw(goal: Goal) {
    setSelectedGoal(goal)
    setSheetMode('withdraw')
    setDepositSheetOpen(true)
  }

  const overallPct = totals.target > 0 ? Math.min(100, (totals.saved / totals.target) * 100) : 0
  const activeGoals = goals.filter(g => g.status === 'active')
  const completedGoals = goals.filter(g => g.progress_pct >= 100)

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <span className="text-lg font-bold text-[#F8FAFC]">Caixinhas</span>
            <EntityToggle value={entityFilter} onChange={setEntityFilter} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* ── Summary card ─────────────────────────────── */}
        {!loading && goals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-1">
                  Total guardado
                </p>
                <p className="text-2xl font-bold text-[#F8FAFC] tabular-nums">
                  {formatCurrency(totals.saved)}
                </p>
                <p className="text-xs text-[#475569] tabular-nums mt-0.5">
                  de {formatCurrency(totals.target)} em metas
                </p>
              </div>
              <div className="flex items-center gap-3 text-right">
                <div>
                  <p className="text-[10px] text-[#475569]">Metas ativas</p>
                  <p className="text-lg font-bold text-[#14A085]">{activeGoals.length}</p>
                </div>
                {completedGoals.length > 0 && (
                  <div>
                    <p className="text-[10px] text-[#475569]">Concluídas</p>
                    <p className="text-lg font-bold text-[#22C55E]">{completedGoals.length}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Overall progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-[#475569]">Progresso geral</span>
                <span className="text-[11px] font-semibold text-[#14A085] tabular-nums">
                  {overallPct.toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[#14A085] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Goals list ───────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#111827] border border-[#1E293B] rounded-2xl h-24 animate-pulse" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-[#1C2537] rounded-full flex items-center justify-center mb-4">
              <Target size={28} className="text-[#475569]" />
            </div>
            <p className="text-base font-semibold text-[#94A3B8] mb-1">Nenhuma meta ainda</p>
            <p className="text-sm text-[#475569] mb-6 max-w-[200px] leading-relaxed">
              Crie sua primeira caixinha e comece a guardar dinheiro com um objetivo
            </p>
            <button
              onClick={() => setAddSheetOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#14A085] text-white text-sm font-semibold rounded-xl hover:bg-[#0D7377] active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              Criar meta
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            {/* Active goals */}
            {activeGoals.filter(g => g.progress_pct < 100).length > 0 && (
              <div className="space-y-3">
                {activeGoals.filter(g => g.progress_pct < 100).map((goal, i) => (
                  <motion.div
                    key={goal.goal_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <GoalCard
                      goal={goal}
                      onDeposit={() => openDeposit(goal)}
                      onWithdraw={() => openWithdraw(goal)}
                      fetchTransfers={fetchTransfers}
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Completed goals */}
            {completedGoals.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pt-1">
                  <TrendingUp size={13} className="text-[#22C55E]" />
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-[#22C55E]">
                    Concluídas
                  </p>
                </div>
                {completedGoals.map((goal, i) => (
                  <motion.div
                    key={goal.goal_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <GoalCard
                      goal={goal}
                      onDeposit={() => openDeposit(goal)}
                      onWithdraw={() => openWithdraw(goal)}
                      fetchTransfers={fetchTransfers}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* ── FAB ─────────────────────────────────────────── */}
      {goals.length > 0 && (
        <button
          onClick={() => setAddSheetOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#14A085] hover:bg-[#0D7377] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(20,160,133,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 z-40"
          aria-label="Nova meta"
        >
          <Plus size={24} className="text-white" />
        </button>
      )}

      {/* ── Sheets ──────────────────────────────────────── */}
      <GoalDepositSheet
        open={depositSheetOpen}
        onClose={() => { setDepositSheetOpen(false); setSelectedGoal(null) }}
        goal={selectedGoal}
        mode={sheetMode}
        entityId={entityId}
        onDeposit={deposit}
        onWithdraw={withdraw}
      />

      <AddGoalSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        entityId={entityId}
        onAdd={addGoal}
      />

      <BottomNav />
    </div>
  )
}
