'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface PurchaseInput {
  item_name: string
  item_cost: number
  available_monthly_income: number
  annual_return_rate: number
}

export interface PurchaseResult {
  impact_pct: number
  impact_status: 'ok' | 'moderate' | 'critical'
  months_fast: number
  months_moderate: number
  months_safe: number
  opp_cost_1y: number
  opp_cost_5y: number
  opp_cost_10y: number
  opp_cost_20y: number
  recommendation: string
}

export interface PurchaseHistory {
  id: string
  item_name: string
  item_cost: number
  impact_pct: number
  impact_status: 'ok' | 'moderate' | 'critical'
  created_at: string
}

function computeLocally(input: PurchaseInput): PurchaseResult {
  const { item_cost, available_monthly_income, annual_return_rate } = input
  const impact_pct = available_monthly_income > 0
    ? (item_cost / available_monthly_income) * 100
    : 0

  let impact_status: 'ok' | 'moderate' | 'critical'
  if (impact_pct <= 50) impact_status = 'ok'
  else if (impact_pct <= 150) impact_status = 'moderate'
  else impact_status = 'critical'

  const months_fast = available_monthly_income > 0 ? Math.ceil(item_cost / available_monthly_income) : 0
  const months_moderate = available_monthly_income > 0 ? Math.ceil(item_cost / (available_monthly_income * 0.5)) : 0
  const months_safe = available_monthly_income > 0 ? Math.ceil(item_cost / (available_monthly_income * 0.25)) : 0

  const r = annual_return_rate / 12
  function fv(months: number) {
    if (r === 0) return item_cost
    return item_cost * Math.pow(1 + r, months)
  }

  const opp_cost_1y = fv(12)
  const opp_cost_5y = fv(60)
  const opp_cost_10y = fv(120)
  const opp_cost_20y = fv(240)

  let recommendation: string
  if (impact_status === 'ok') {
    recommendation = `Compra segura. Representa ${impact_pct.toFixed(0)}% da sua renda disponível — dentro do limite confortável.`
  } else if (impact_status === 'moderate') {
    recommendation = `Atenção. Compromete ${impact_pct.toFixed(0)}% da renda disponível. Considere parcelar ou aguardar alguns meses poupando.`
  } else {
    recommendation = `Cuidado! Isso equivale a ${impact_pct.toFixed(0)}% da sua renda disponível. Avalie se é realmente necessário agora.`
  }

  return {
    impact_pct,
    impact_status,
    months_fast,
    months_moderate,
    months_safe,
    opp_cost_1y,
    opp_cost_5y,
    opp_cost_10y,
    opp_cost_20y,
    recommendation,
  }
}

export function usePurchaseDecision(entityId: string) {
  const [result, setResult] = useState<PurchaseResult | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [history, setHistory] = useState<PurchaseHistory[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [saving, setSaving] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)

  const analyze = useCallback(async (input: PurchaseInput): Promise<PurchaseResult> => {
    setAnalyzing(true)
    setUsingFallback(false)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.functions.invoke('purchase-decision', { body: input })
      if (!error && data) {
        setResult(data)
        setAnalyzing(false)
        return data
      }
    } catch {
      // fall through to local computation
    }
    // Fallback: compute locally
    const local = computeLocally(input)
    setUsingFallback(true)
    setResult(local)
    setAnalyzing(false)
    return local
  }, [])

  const saveDecision = useCallback(async (input: PurchaseInput, res: PurchaseResult) => {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('purchase_decisions').insert({
      entity_id: entityId,
      item_name: input.item_name,
      item_cost: input.item_cost,
      available_income: input.available_monthly_income,
      impact_pct: res.impact_pct,
      months_fast: res.months_fast,
      months_moderate: res.months_moderate,
      months_safe: res.months_safe,
      opp_cost_1y: res.opp_cost_1y,
      opp_cost_5y: res.opp_cost_5y,
      opp_cost_10y: res.opp_cost_10y,
    })
    setSaving(false)
    fetchHistory()
  }, [entityId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('purchase_decisions')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setHistory(data.map(row => ({
        id: row.decision_id ?? row.id ?? String(Math.random()),
        item_name: row.item_name,
        item_cost: row.item_cost,
        impact_pct: row.impact_pct,
        impact_status: impactStatus(row.impact_pct),
        created_at: row.created_at,
      })))
    }
    setLoadingHistory(false)
  }, [entityId])

  const reset = useCallback(() => {
    setResult(null)
    setUsingFallback(false)
  }, [])

  return {
    result, analyzing, history, loadingHistory, saving, usingFallback,
    analyze, saveDecision, fetchHistory, reset,
  }
}

function impactStatus(pct: number): 'ok' | 'moderate' | 'critical' {
  if (pct <= 50) return 'ok'
  if (pct <= 150) return 'moderate'
  return 'critical'
}
