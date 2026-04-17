'use client'

import { useState } from 'react'
import { Plus, SlidersHorizontal, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { useScenarios } from '@/hooks/useScenarios'
import { ScenarioCard } from '@/components/scenarios/ScenarioCard'
import { AddScenarioSheet } from '@/components/scenarios/AddScenarioSheet'
import { AddChangeSheet } from '@/components/scenarios/AddChangeSheet'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency } from '@/lib/utils'

export default function ScenariosPage() {
  const { entityFilter, setEntityFilter, entityId } = useEntity()
  const {
    scenarios, loading, fetchChanges,
    addScenario, deleteScenario, addChange, deleteChange,
  } = useScenarios(entityId)

  const [addScenarioOpen, setAddScenarioOpen] = useState(false)
  const [addChangeOpen, setAddChangeOpen] = useState(false)
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null)

  function openAddChange(scenarioId: string) {
    setActiveScenarioId(scenarioId)
    setAddChangeOpen(true)
  }

  async function handleDeleteChange(changeId: string) {
    await deleteChange(changeId)
  }

  // Summary: total positive vs negative net impact across all scenarios
  const totalPositive = scenarios.filter(s => s.net_monthly > 0).reduce((s, sc) => s + sc.net_monthly, 0)
  const totalNegative = scenarios.filter(s => s.net_monthly < 0).reduce((s, sc) => s + sc.net_monthly, 0)

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <span className="text-lg font-bold text-[#F8FAFC]">Cenários</span>
            <EntityToggle value={entityFilter} onChange={setEntityFilter} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* ── Summary card ─────────────────────────────── */}
        {!loading && scenarios.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4"
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-3">
              Visão geral dos cenários
            </p>
            <div className="flex items-center justify-around">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#22C55E]/15 rounded-xl flex items-center justify-center">
                  <TrendingUp size={16} className="text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#475569]">Cenários positivos</p>
                  <p className="text-sm font-bold text-[#22C55E] tabular-nums">
                    +{formatCurrency(totalPositive)}/mês
                  </p>
                </div>
              </div>
              <div className="w-px h-10 bg-[#1E293B]" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EF4444]/15 rounded-xl flex items-center justify-center">
                  <TrendingDown size={16} className="text-[#EF4444]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#475569]">Cenários negativos</p>
                  <p className="text-sm font-bold text-[#EF4444] tabular-nums">
                    {formatCurrency(totalNegative)}/mês
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── List ─────────────────────────────────────── */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-[#111827] border border-[#1E293B] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : scenarios.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 bg-[#1C2537] rounded-full flex items-center justify-center mb-4">
              <SlidersHorizontal size={28} className="text-[#475569]" />
            </div>
            <p className="text-base font-semibold text-[#94A3B8] mb-1">Nenhum cenário ainda</p>
            <p className="text-sm text-[#475569] mb-6 max-w-[220px] leading-relaxed">
              Simule situações como troca de emprego, nova despesa ou investimento
            </p>
            <button
              onClick={() => setAddScenarioOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#14A085] text-white text-sm font-semibold rounded-xl hover:bg-[#0D7377] active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              Criar cenário
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {scenarios.map((scenario, i) => (
              <motion.div
                key={scenario.scenario_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ScenarioCard
                  scenario={scenario}
                  onDelete={deleteScenario}
                  onAddChange={openAddChange}
                  onDeleteChange={handleDeleteChange}
                  fetchChanges={fetchChanges}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* ── FAB ─────────────────────────────────────────── */}
      {scenarios.length > 0 && (
        <button
          onClick={() => setAddScenarioOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-[#14A085] hover:bg-[#0D7377] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(20,160,133,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 z-40"
          aria-label="Novo cenário"
        >
          <Plus size={24} className="text-white" />
        </button>
      )}

      {/* ── Sheets ──────────────────────────────────────── */}
      <AddScenarioSheet
        open={addScenarioOpen}
        onClose={() => setAddScenarioOpen(false)}
        onAdd={addScenario}
      />

      <AddChangeSheet
        open={addChangeOpen}
        onClose={() => { setAddChangeOpen(false); setActiveScenarioId(null) }}
        scenarioId={activeScenarioId ?? ''}
        onAdd={addChange}
      />

      <BottomNav />
    </div>
  )
}
