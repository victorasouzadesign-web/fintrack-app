'use client'

import { Loader2, Save, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { TrafficLight } from './TrafficLight'
import { type PurchaseResult as Result, type PurchaseInput } from '@/hooks/usePurchaseDecision'
import { formatCurrency } from '@/lib/utils'

const MONTHS_LABELS: Record<string, { label: string; badge: string; color: string }> = {
  fast: { label: 'Poupando 100% (rápido)', badge: 'RÁPIDO', color: '#22C55E' },
  moderate: { label: 'Poupando 50% (moderado)', badge: 'MÉDIO', color: '#F59E0B' },
  safe: { label: 'Poupando 25% (seguro)', badge: 'LONGO', color: '#EF4444' },
}

function monthLabel(m: number): string {
  if (m <= 0) return '< 1 mês'
  return `${m} ${m === 1 ? 'mês' : 'meses'}`
}

function impactColor(status: string) {
  if (status === 'ok') return '#22C55E'
  if (status === 'moderate') return '#F59E0B'
  return '#EF4444'
}

function impactBadge(status: string) {
  if (status === 'ok') return 'SEGURO'
  if (status === 'moderate') return 'MODERADO'
  return 'CRÍTICO'
}

interface PurchaseResultProps {
  result: Result
  input: PurchaseInput
  saving: boolean
  onSave: () => void
  onReset: () => void
  usingFallback: boolean
}

export function PurchaseResult({ result, input, saving, onSave, onReset, usingFallback }: PurchaseResultProps) {
  const ic = impactColor(result.impact_status)
  const ib = impactBadge(result.impact_status)

  const oppRows = [
    { label: '1 ano', value: result.opp_cost_1y },
    { label: '5 anos', value: result.opp_cost_5y },
    { label: '10 anos', value: result.opp_cost_10y },
    { label: '20 anos', value: result.opp_cost_20y },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-4"
    >
      {usingFallback && (
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-[#F59E0B] text-xs font-semibold">Análise local</span>
          <span className="text-[#94A3B8] text-xs">· Edge Function não disponível, usando cálculo local</span>
        </div>
      )}

      {/* Traffic light */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl overflow-hidden">
        <TrafficLight status={result.impact_status} recommendation={result.recommendation} />
      </div>

      {/* Impact card */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569]">
          Impacto na renda
        </p>

        {/* Impact pct row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#94A3B8]">% da renda comprometida</span>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tabular-nums" style={{ color: ic }}>
              {result.impact_pct.toFixed(1)}%
            </span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ color: ic, backgroundColor: `${ic}20` }}
            >
              {ib}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-[#1E293B] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: ic }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, result.impact_pct)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>

        {/* Divider */}
        <div className="border-t border-[#1E293B]" />

        {/* Months rows */}
        {(['fast', 'moderate', 'safe'] as const).map(key => {
          const cfg = MONTHS_LABELS[key]
          const months = key === 'fast' ? result.months_fast
            : key === 'moderate' ? result.months_moderate
            : result.months_safe
          return (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">{cfg.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#F8FAFC] tabular-nums">
                  {monthLabel(months)}
                </span>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ color: cfg.color, backgroundColor: `${cfg.color}20` }}
                >
                  {cfg.badge}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Opportunity cost card */}
      <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-4">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569]">
            Custo de oportunidade
          </p>
          <p className="text-xs text-[#475569] mt-0.5">
            Se você investir {formatCurrency(input.item_cost)} em vez de comprar
          </p>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-3 gap-2 pb-1 border-b border-[#1E293B]">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#475569]">Prazo</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] text-right">Valor</span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] text-right">Ganho</span>
        </div>

        {oppRows.map(({ label, value }) => {
          const gain = value - input.item_cost
          return (
            <div key={label} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm text-[#94A3B8]">{label}</span>
              <span className="text-sm font-semibold text-[#F8FAFC] tabular-nums text-right">
                {formatCurrency(value)}
              </span>
              <div className="flex justify-end">
                <span className="text-xs font-bold tabular-nums px-2 py-0.5 rounded-full bg-[#22C55E]/15 text-[#22C55E]">
                  +{formatCurrency(gain)}
                </span>
              </div>
            </div>
          )
        })}

        <p className="text-[11px] text-[#475569]">
          Baseado em taxa de {(input.annual_return_rate * 100).toFixed(0)}% ao ano
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pb-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#111827] border border-[#1E293B] text-sm font-semibold text-[#94A3B8] hover:border-[#14A085] hover:text-[#14A085] transition-all duration-200 active:scale-95 disabled:opacity-40"
        >
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Salvar análise
        </button>
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#14A085] hover:bg-[#0D7377] text-sm font-bold text-white transition-all duration-200 active:scale-95"
        >
          <RefreshCw size={15} />
          Nova análise
        </button>
      </div>
    </motion.div>
  )
}
