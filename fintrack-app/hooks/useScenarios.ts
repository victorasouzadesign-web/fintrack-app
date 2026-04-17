'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Scenario {
  scenario_id: string
  name: string
  description: string | null
  start_date: string | null
  status: string | null
  created_at: string | null
  // computed after fetching changes
  net_monthly: number
  changes_count: number
}

export interface ScenarioChange {
  change_id: string
  scenario_id: string
  type: string          // 'income' | 'expense' | 'savings' | 'investment'
  description: string | null
  amount: number | null
  impact_sign: string | null  // '+' | '-'
  frequency: string | null    // 'monthly' | 'one_time' | 'yearly'
  start_date: string | null
  end_date: string | null
  category_id: string | null
}

export function useScenarios(entityId: string) {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [loading, setLoading] = useState(true)

  const fetchScenarios = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data: scenariosData } = await supabase
      .from('scenarios')
      .select('scenario_id, name, description, start_date, status, created_at')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false })

    if (!scenariosData?.length) {
      setScenarios([])
      setLoading(false)
      return
    }

    const ids = scenariosData.map(s => s.scenario_id)
    const { data: changesData } = await supabase
      .from('scenario_changes')
      .select('scenario_id, amount, impact_sign, frequency')
      .in('scenario_id', ids)

    const changesByScenario = (changesData ?? []).reduce<Record<string, typeof changesData>>((acc, c) => {
      if (!acc[c.scenario_id]) acc[c.scenario_id] = []
      acc[c.scenario_id]!.push(c)
      return acc
    }, {})

    setScenarios(scenariosData.map(s => {
      const changes = changesByScenario[s.scenario_id] ?? []
      const net_monthly = changes.reduce((sum, c) => {
        const amount = c.amount ?? 0
        const sign = c.impact_sign === '-' ? -1 : 1
        const freq = c.frequency
        const monthly = freq === 'yearly' ? amount / 12 : freq === 'one_time' ? 0 : amount
        return sum + sign * monthly
      }, 0)
      return { ...s, net_monthly, changes_count: changes.length }
    }))

    setLoading(false)
  }, [entityId])

  useEffect(() => { fetchScenarios() }, [fetchScenarios])

  const fetchChanges = useCallback(async (scenarioId: string): Promise<ScenarioChange[]> => {
    const supabase = createClient()
    const { data } = await supabase
      .from('scenario_changes')
      .select('change_id, scenario_id, type, description, amount, impact_sign, frequency, start_date, end_date, category_id')
      .eq('scenario_id', scenarioId)
      .order('created_at', { ascending: true })
    return (data ?? []) as ScenarioChange[]
  }, [])

  const addScenario = useCallback(async (payload: {
    name: string; description: string | null; start_date: string | null
  }) => {
    const supabase = createClient()
    const { error } = await supabase.from('scenarios').insert({
      entity_id: entityId, ...payload, status: 'draft',
    })
    if (!error) await fetchScenarios()
    return error
  }, [entityId, fetchScenarios])

  const deleteScenario = useCallback(async (scenarioId: string) => {
    const supabase = createClient()
    await supabase.from('scenario_changes').delete().eq('scenario_id', scenarioId)
    await supabase.from('scenarios').delete().eq('scenario_id', scenarioId)
    await fetchScenarios()
  }, [fetchScenarios])

  const addChange = useCallback(async (payload: Omit<ScenarioChange, 'change_id'>) => {
    const supabase = createClient()
    const { error } = await supabase.from('scenario_changes').insert({
      entity_id: entityId, ...payload,
    })
    if (!error) await fetchScenarios()
    return error
  }, [entityId, fetchScenarios])

  const deleteChange = useCallback(async (changeId: string) => {
    const supabase = createClient()
    await supabase.from('scenario_changes').delete().eq('change_id', changeId)
    await fetchScenarios()
  }, [fetchScenarios])

  return {
    scenarios, loading, refetch: fetchScenarios,
    fetchChanges, addScenario, deleteScenario, addChange, deleteChange,
  }
}
