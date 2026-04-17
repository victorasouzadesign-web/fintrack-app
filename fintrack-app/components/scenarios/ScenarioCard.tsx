'use client'

import { useState } from 'react'
import { ChevronRight, Plus, Trash2, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Scenario, type ScenarioChange } from '@/hooks/useScenarios'
import { formatCurrency } from '@/lib/utils'

const TYPE_CONFIG: Record<string, { label: string; emoji: string }> = {
  income:     { label: 'Receita',      emoji: '💰' },
  expense:    { label: 'Despesa',      emoji: '💸' },
  savings:    { label: 'Poupança',     emoji: '🏦' },
  investment: { label: 'Investimento', emoji: '📈' },
}

const FREQ_LABELS: Record<string, string> = {
  monthly:  '/mês',
  yearly:   '/ano',
  one_time: 'único',
}

interface ScenarioCardProps {
  scenario: Scenario
  onDelete: (id: string) => void
  onAddChange: (scenarioId: string) => void
  onDeleteChange: (changeId: string, scenarioId: string) => Promise<void>
  fetchChanges: (id: string) => Promise<ScenarioChange[]>
}

export function ScenarioCard({
  scenario, onDelete, onAddChange, onDeleteChange, fetchChanges,
}: ScenarioCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [changes, setChanges] = useState<ScenarioChange[]>([])
  const [loadingChanges, setLoadingChanges] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const net = scenario.net_monthly
  const isPositive = net >= 0

  async function handleExpand() {
    const next = !expanded
    setExpanded(next)
    if (next && changes.length === 0) {
      setLoadingChanges(true)
      const result = await fetchChanges(scenario.scenario_id)
      setChanges(result)
      setLoadingChanges(false)
    }
  }

  async function handleDeleteChange(changeId: string) {
    setDeletingId(changeId)
    await onDeleteChange(changeId, scenario.scenario_id)
    setChanges(prev => prev.filter(c => c.change_id !== changeId))
    setDeletingId(null)
  }

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={handleExpand}
        className="w-full text-left px-4 py-4 flex items-center gap-3 hover:bg-[#1C2537]/40 transition-colors duration-200 active:bg-[#1C2537]/60"
      >
        {/* Net impact badge */}
        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${isPositive ? 'bg-[#22C55E]/15' : 'bg-[#EF4444]/15'}`}>
          {isPositive
            ? <TrendingUp size={20} className="text-[#22C55E]" />
            : <TrendingDown size={20} className="text-[#EF4444]" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F8FAFC] truncate">{scenario.name}</p>
          {scenario.description && (
            <p className="text-xs text-[#475569] truncate mt-0.5">{scenario.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs font-bold tabular-nums ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {isPositive ? '+' : ''}{formatCurrency(net)}/mês
            </span>
            <span className="text-[#1E293B]">·</span>
            <span className="text-xs text-[#475569]">{scenario.changes_count} mudança{scenario.changes_count !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <ChevronRight
          size={16}
          className={`text-[#475569] transition-transform duration-200 shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded changes */}
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

              {/* Changes list */}
              {loadingChanges ? (
                <div className="space-y-2">
                  {[1, 2].map(i => <div key={i} className="h-12 bg-[#1C2537] rounded-xl animate-pulse" />)}
                </div>
              ) : changes.length === 0 ? (
                <p className="text-xs text-[#475569] py-1">Nenhuma mudança adicionada ainda.</p>
              ) : (
                <div className="space-y-2">
                  {changes.map(change => {
                    const cfg = TYPE_CONFIG[change.type] ?? { label: change.type, emoji: '📌' }
                    const sign = change.impact_sign === '-' ? -1 : 1
                    const amount = (change.amount ?? 0) * sign
                    const freq = FREQ_LABELS[change.frequency ?? ''] ?? ''
                    return (
                      <div key={change.change_id} className="flex items-center gap-3 bg-[#1C2537] rounded-xl px-3 py-2.5">
                        <span className="text-base shrink-0">{cfg.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#F8FAFC] truncate">
                            {change.description || cfg.label}
                          </p>
                          <p className="text-[10px] text-[#475569]">{cfg.label}{freq ? ` · ${freq}` : ''}</p>
                        </div>
                        <span className={`text-xs font-bold tabular-nums shrink-0 ${amount >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                          {amount >= 0 ? '+' : ''}{formatCurrency(amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteChange(change.change_id)}
                          disabled={deletingId === change.change_id}
                          className="p-1.5 text-[#475569] hover:text-[#EF4444] transition-colors duration-150 shrink-0"
                        >
                          {deletingId === change.change_id
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Net summary */}
              {changes.length > 0 && (
                <div className="flex items-center justify-between bg-[#0A0F1E] rounded-xl px-3 py-2.5">
                  <span className="text-xs font-semibold text-[#94A3B8]">Impacto mensal líquido</span>
                  <span className={`text-sm font-bold tabular-nums ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(net)}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => onAddChange(scenario.scenario_id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#14A085]/10 text-[#14A085] text-xs font-semibold hover:bg-[#14A085]/20 transition-colors duration-200"
                >
                  <Plus size={13} />
                  Adicionar mudança
                </button>
                <button
                  onClick={() => onDelete(scenario.scenario_id)}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#EF4444]/10 text-[#EF4444] text-xs font-semibold hover:bg-[#EF4444]/20 transition-colors duration-200"
                >
                  <Trash2 size={13} />
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
