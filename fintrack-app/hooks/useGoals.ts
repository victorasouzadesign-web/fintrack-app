'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Goal {
  goal_id: string
  name: string
  description: string | null
  balance: number
  target_amount: number
  target_date: string | null
  icon: string | null
  status: string | null
  created_at: string | null
  // computed
  progress_pct: number
  remaining: number
  months_until: number | null
  monthly_needed: number | null
}

export interface GoalTransfer {
  transfer_id: string
  amount: number
  direction: string
  date: string
  notes: string | null
}

function computeGoal(raw: Omit<Goal, 'progress_pct' | 'remaining' | 'months_until' | 'monthly_needed'>): Goal {
  const balance = raw.balance ?? 0
  const target = raw.target_amount ?? 0
  const progress_pct = target > 0 ? Math.min(100, (balance / target) * 100) : 0
  const remaining = Math.max(0, target - balance)

  let months_until: number | null = null
  let monthly_needed: number | null = null

  if (raw.target_date) {
    const now = new Date()
    const target_dt = new Date(raw.target_date + 'T00:00:00')
    const diff = (target_dt.getFullYear() - now.getFullYear()) * 12 + (target_dt.getMonth() - now.getMonth())
    months_until = Math.max(0, diff)
    monthly_needed = months_until > 0 ? remaining / months_until : remaining
  }

  return { ...raw, progress_pct, remaining, months_until, monthly_needed }
}

export function useGoals(entityId: string) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('savings_goals')
      .select('goal_id, name, description, balance, target_amount, target_date, icon, status, created_at')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: true })

    setGoals((data ?? []).map(computeGoal))
    setLoading(false)
  }, [entityId])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const fetchTransfers = useCallback(async (goalId: string): Promise<GoalTransfer[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from('savings_transfers')
      .select('transfer_id, amount, direction, date, notes')
      .or(`from_goal_id.eq.${goalId},to_goal_id.eq.${goalId}`)
      .order('date', { ascending: false })
      .limit(10)
    return (data ?? []) as GoalTransfer[]
  }, [])

  const deposit = useCallback(async (goalId: string, entityId: string, amount: number, date: string, notes: string) => {
    const supabase = createClient()
    const goal = goals.find(g => g.goal_id === goalId)
    if (!goal) return

    const [, updateRes] = await Promise.all([
      supabase.from('savings_transfers').insert({
        entity_id: entityId,
        to_goal_id: goalId,
        amount,
        direction: 'deposit',
        date,
        notes: notes || null,
      }),
      supabase
        .from('savings_goals')
        .update({ balance: goal.balance + amount })
        .eq('goal_id', goalId),
    ])

    if (!updateRes.error) await fetchGoals()
    return updateRes.error
  }, [goals, fetchGoals])

  const withdraw = useCallback(async (goalId: string, entityId: string, amount: number, date: string, notes: string) => {
    const supabase = createClient()
    const goal = goals.find(g => g.goal_id === goalId)
    if (!goal) return

    const [, updateRes] = await Promise.all([
      supabase.from('savings_transfers').insert({
        entity_id: entityId,
        from_goal_id: goalId,
        amount,
        direction: 'withdrawal',
        date,
        notes: notes || null,
      }),
      supabase
        .from('savings_goals')
        .update({ balance: Math.max(0, goal.balance - amount) })
        .eq('goal_id', goalId),
    ])

    if (!updateRes.error) await fetchGoals()
    return updateRes.error
  }, [goals, fetchGoals])

  const addGoal = useCallback(async (entityId: string, payload: {
    name: string; target_amount: number; target_date: string | null
    icon: string | null; description: string | null
  }) => {
    const supabase = createClient()
    const { error } = await supabase.from('savings_goals').insert({
      entity_id: entityId,
      ...payload,
      balance: 0,
      status: 'active',
    })
    if (!error) await fetchGoals()
    return error
  }, [fetchGoals])

  const totals = goals.reduce(
    (acc, g) => ({ saved: acc.saved + g.balance, target: acc.target + g.target_amount }),
    { saved: 0, target: 0 }
  )

  return { goals, loading, refetch: fetchGoals, fetchTransfers, deposit, withdraw, addGoal, totals }
}
