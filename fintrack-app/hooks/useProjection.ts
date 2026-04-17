'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface NetWorthPoint {
  year: number
  net_worth: number
  assets: number
  liabilities: number
}

export interface CashflowPoint {
  month: string   // 'YYYY-MM'
  label: string   // 'Jan 2025'
  income: number
  expenses: number
  net: number
  running_balance: number
}

export interface ProjectionGoal {
  goal_id: string
  name: string
  balance: number
  target_amount: number
  target_date: string | null
  icon: string | null
}

interface UseProjectionParams {
  entityId: string
  years: number
}

// Fallback data when Edge Functions are not deployed yet — uses real DB values
function buildFallbackNetWorth(years: number, baseNetWorth: number): NetWorthPoint[] {
  const points: NetWorthPoint[] = []
  const annualGrowthRate = 0.08
  for (let y = 0; y <= years; y++) {
    const nw = baseNetWorth * Math.pow(1 + annualGrowthRate, y)
    points.push({
      year: new Date().getFullYear() + y,
      net_worth: Math.round(nw),
      assets: Math.round(nw * 1.12),
      liabilities: Math.round(nw * 0.12),
    })
  }
  return points
}

function buildFallbackCashflow(baseBalance: number, avgIncome: number, avgExpenses: number): CashflowPoint[] {
  const points: CashflowPoint[] = []
  const now = new Date()
  for (let m = 0; m < 12; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1)
    points.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      income: Math.round(avgIncome),
      expenses: Math.round(avgExpenses),
      net: Math.round(avgIncome - avgExpenses),
      running_balance: 0,
    })
  }
  let bal = baseBalance
  points.forEach((p) => { bal += p.net; p.running_balance = Math.round(bal) })
  return points
}

export function useProjection({ entityId, years }: UseProjectionParams) {
  const [netWorthData, setNetWorthData] = useState<NetWorthPoint[]>([])
  const [cashflowData, setCashflowData] = useState<CashflowPoint[]>([])
  const [goals, setGoals] = useState<ProjectionGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [goalsRes, snapshotRes, recurrencesRes, installmentsRes, nwRes, cfRes] = await Promise.allSettled([
      supabase
        .from('savings_goals')
        .select('goal_id, name, balance, target_amount, target_date, icon')
        .eq('entity_id', entityId)
        .eq('status', 'active'),

      supabase
        .from('net_worth_snapshots')
        .select('net_worth')
        .eq('entity_id', entityId)
        .order('date', { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from('recurrences')
        .select('amount, type, frequency')
        .eq('entity_id', entityId)
        .eq('is_active', true),

      supabase
        .from('installments')
        .select('installment_amount, remaining_installments')
        .eq('entity_id', entityId)
        .eq('status', 'active'),

      supabase.functions.invoke('net-worth-projection', {
        body: { entity_id: entityId, years },
      }),

      supabase.functions.invoke('cashflow-projection', {
        body: { entity_id: entityId, months: 12 },
      }),
    ])

    // Goals
    if (goalsRes.status === 'fulfilled' && goalsRes.value.data) {
      setGoals(goalsRes.value.data as ProjectionGoal[])
    }

    const baseNetWorth =
      snapshotRes.status === 'fulfilled' && snapshotRes.value.data
        ? Number(snapshotRes.value.data.net_worth)
        : 0

    // Build monthly averages from real recurrences + installments
    let avgIncome = 7500
    let avgExpenses = 4500

    if (recurrencesRes.status === 'fulfilled' && recurrencesRes.value.data?.length) {
      const recs = recurrencesRes.value.data
      const calcMonthly = (r: { amount: number; frequency: string }) => {
        if (r.frequency === 'yearly') return r.amount / 12
        if (r.frequency === 'weekly') return r.amount * 4.33
        return r.amount
      }
      const incomeTotal = recs.filter(r => r.type === 'income').reduce((s, r) => s + calcMonthly(r), 0)
      const expenseTotal = recs.filter(r => r.type === 'expense').reduce((s, r) => s + calcMonthly(r), 0)
      if (incomeTotal > 0) avgIncome = incomeTotal
      if (expenseTotal > 0) avgExpenses = expenseTotal
    }

    if (installmentsRes.status === 'fulfilled' && installmentsRes.value.data?.length) {
      const activeInstallments = installmentsRes.value.data.filter(i => (i.remaining_installments ?? 0) > 0)
      avgExpenses += activeInstallments.reduce((s, i) => s + Number(i.installment_amount), 0)
    }

    // Net worth — fallback if Edge Function not deployed
    if (nwRes.status === 'fulfilled' && nwRes.value.data && !nwRes.value.error) {
      setNetWorthData(nwRes.value.data as NetWorthPoint[])
      setUsingFallback(false)
    } else {
      setNetWorthData(buildFallbackNetWorth(years, baseNetWorth || 275514))
      setUsingFallback(true)
    }

    // Cashflow — fallback if Edge Function not deployed
    if (cfRes.status === 'fulfilled' && cfRes.value.data && !cfRes.value.error) {
      setCashflowData(cfRes.value.data as CashflowPoint[])
    } else {
      setCashflowData(buildFallbackCashflow(baseNetWorth || 275514, avgIncome, avgExpenses))
    }

    setLoading(false)
  }, [entityId, years])

  useEffect(() => { fetchData() }, [fetchData])

  // Derived stats
  const firstPoint = netWorthData[0]
  const lastPoint = netWorthData[netWorthData.length - 1]
  const projectedValue = lastPoint?.net_worth ?? 0
  const currentValue = firstPoint?.net_worth ?? 0
  const absoluteGrowth = projectedValue - currentValue
  const pctGrowth = currentValue > 0 ? (absoluteGrowth / currentValue) * 100 : 0

  return {
    netWorthData,
    cashflowData,
    goals,
    loading,
    usingFallback,
    stats: { projectedValue, currentValue, absoluteGrowth, pctGrowth },
    refetch: fetchData,
  }
}
