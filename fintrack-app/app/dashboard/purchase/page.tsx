'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { PurchaseForm } from '@/components/purchase/PurchaseForm'
import { PurchaseResult } from '@/components/purchase/PurchaseResult'
import { usePurchaseDecision, type PurchaseInput } from '@/hooks/usePurchaseDecision'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency } from '@/lib/utils'
import { BottomNav } from '@/components/layout/BottomNav'

function StatusIcon({ status }: { status: 'ok' | 'moderate' | 'critical' }) {
  if (status === 'ok') return <ShieldCheck size={14} className="text-[#22C55E]" />
  if (status === 'moderate') return <AlertTriangle size={14} className="text-[#F59E0B]" />
  return <XCircle size={14} className="text-[#EF4444]" />
}

function statusColor(status: 'ok' | 'moderate' | 'critical') {
  if (status === 'ok') return '#22C55E'
  if (status === 'moderate') return '#F59E0B'
  return '#EF4444'
}

export default function PurchasePage() {
  const { entityId } = useEntity()
  const {
    result, analyzing, history, loadingHistory, saving, usingFallback,
    analyze, saveDecision, fetchHistory, reset,
  } = usePurchaseDecision(entityId)

  const [currentInput, setCurrentInput] = useState<PurchaseInput | null>(null)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  useEffect(() => { fetchHistory() }, [fetchHistory])

  async function handleAnalyze(input: PurchaseInput) {
    setCurrentInput(input)
    await analyze(input)
  }

  async function handleSave() {
    if (!currentInput || !result) return
    const key = `${currentInput.item_name}-${currentInput.item_cost}`
    if (savedIds.has(key)) return
    await saveDecision(currentInput, result)
    setSavedIds(prev => new Set(prev).add(key))
  }

  function handleReset() {
    reset()
    setCurrentInput(null)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center h-14 gap-3">
            <Link
              href="/dashboard"
              className="text-[#475569] hover:text-[#F8FAFC] transition-colors p-1 rounded-lg hover:bg-[#1C2537]"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </Link>
            <span className="text-base font-bold text-[#F8FAFC]">Devo Comprar Isso?</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* ── Form / Result toggle ─────────────────────── */}
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <PurchaseForm onAnalyze={handleAnalyze} analyzing={analyzing} />
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentInput && (
                <PurchaseResult
                  result={result}
                  input={currentInput}
                  saving={saving}
                  onSave={handleSave}
                  onReset={handleReset}
                  usingFallback={usingFallback}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── History ─────────────────────────────────── */}
        {(history.length > 0 || loadingHistory) && (
          <div className="pt-2 pb-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-3">
              Análises anteriores
            </p>

            {loadingHistory ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-14 bg-[#111827] border border-[#1E293B] rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="flex items-center justify-between bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StatusIcon status={item.impact_status} />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#F8FAFC] truncate">{item.item_name}</p>
                        <p className="text-xs text-[#475569] tabular-nums">
                          {formatCurrency(item.item_cost)} · {item.impact_pct.toFixed(1)}% da renda
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          color: statusColor(item.impact_status),
                          backgroundColor: `${statusColor(item.impact_status)}20`,
                        }}
                      >
                        {item.impact_status === 'ok' ? 'SEGURO'
                          : item.impact_status === 'moderate' ? 'ATENCÃO'
                          : 'CRÍTICO'}
                      </span>
                      <p className="text-[10px] text-[#475569] shrink-0">
                        {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
