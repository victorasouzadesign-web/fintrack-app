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

// Fallback data when Edge Functions are not deployed yet
function buildFallbackNetWorth(years: number, baseNetWorth = 175514): NetWorthPoint[] {
  const points: NetWorthPoint[] = []
  const annualGrowthRate = 0.12
  for (let y = 0; y <= years; y++) {
    const nw = baseNetWorth * Math.pow(1 + annualGrowthRate, y)
    points.push({
      year: new Date().getFullYear() + y,
      net_worth: Math.round(nw),
      assets: Math.round(nw * 1.15),
      liabilities: Math.round(nw * 0.15),
    })
  }
  return points
}

function buildFallbackCashflow(): CashflowPoint[] {
  const points: CashflowPoint[] = []
  const now = new Date()
  for (let m = 0; m < 12; m++) {
    const d = new Date(now.getFullYear(), now.getMonth() + m, 1)
    const income = 15000 + Math.random() * 3000
    const expenses = 9000 + Math.random() * 2000
    points.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      income: Math.round(income),
      expenses: Math.round(expenses),
      net: Math.round(income - expenses),
      running_balance: 0,
    })
  }
  // cumulative balance
  let bal = 175514
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

    // Goals query (always works)
    const goalsPromise = supabase
      .from('savings_goals')
      .select('goal_id, name, balance, target_amount, target_date, icon')
      .eq('entity_id', entityId)
      .eq('status', 'active')

    // Edge Functions (may not be deployed yet)
    const nwPromise = supabase.functions.invoke('net-worth-projection', {
      body: { entity_id: entityId, years },
    })
    const cfPromise = supabase.functions.invoke('cashflow-projection', {
      body: { entity_id: entityId, months: 12 },
    })

    const [goalsRes, nwRes, cfRes] = await Promise.allSettled([goalsPromise, nwPromise, cfPromise])

    // Goals
    if (goalsRes.status === 'fulfilled' && goalsRes.value.data) {
      setGoals(goalsRes.value.data as ProjectionGoal[])
    }

    // Net worth — fallback if Edge Function not deployed
    if (
      nwRes.status === 'fulfilled' &&
      nwRes.value.data &&
      !nwRes.value.error
    ) {
      setNetWorthData(nwRes.value.data as NetWorthPoint[])
      setUsingFallback(false)
    } else {
      setNetWorthData(buildFallbackNetWorth(years))
      setUsingFallback(true)
    }

    // Cashflow — fallback if Edge Function not deployed
    if (
      cfRes.status === 'fulfilled' &&
      cfRes.value.data &&
      !cfRes.value.error
    ) {
      setCashflowData(cfRes.value.data as CashflowPoint[])
    } else {
      setCashflowData(buildFallbackCashflow())
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
