'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/database.types'

type NetWorthSnapshot = Database['public']['Tables']['net_worth_snapshots']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type SavingsGoal = Database['public']['Tables']['savings_goals']['Row']

export interface HomeData {
  snapshots: NetWorthSnapshot[]
  transactions: Transaction[]
  goals: SavingsGoal[]
}

export function useHomeData(entityId: string) {
  const [data, setData] = useState<HomeData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      // 1. Fetch snapshots first to determine the reference month for the sparkline.
      //    The seed data lives in March 2025 — using the latest snapshot date prevents
      //    the sparkline from being empty when the current calendar month has no data.
      const { data: snapshots, error: snapErr } = await supabase
        .from('net_worth_snapshots')
        .select('net_worth, total_assets, total_liabilities, date, snapshot_id, entity_id, notes, created_at')
        .eq('entity_id', entityId)
        .order('date', { ascending: false })
        .limit(2)

      if (snapErr) throw snapErr

      // Derive the month to query transactions from.
      // Priority: latest snapshot month → fallback to current month.
      const latestDate = snapshots?.[0]?.date
      const referenceDate = latestDate ? new Date(latestDate + 'T00:00:00') : new Date()
      const refYear = referenceDate.getFullYear()
      const refMonth = referenceDate.getMonth() // 0-indexed

      const startOfMonth = new Date(refYear, refMonth, 1).toISOString().split('T')[0]
      const endOfMonth = new Date(refYear, refMonth + 1, 0).toISOString().split('T')[0]

      // 2. Transactions and goals in parallel
      const [transactionsRes, goalsRes] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('entity_id', entityId)
          .gte('due_date', startOfMonth)
          .lte('due_date', endOfMonth)
          .not('type', 'in', '(transfer,savings_transfer)')
          .order('due_date', { ascending: true }),

        supabase
          .from('savings_goals')
          .select('*')
          .eq('entity_id', entityId)
          .eq('status', 'active')
          .order('created_at', { ascending: true }),
      ])

      if (transactionsRes.error) throw transactionsRes.error
      if (goalsRes.error) throw goalsRes.error

      setData({
        snapshots: snapshots ?? [],
        transactions: transactionsRes.data ?? [],
        goals: goalsRes.data ?? [],
      })
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar dados'))
    } finally {
      setLoading(false)
    }
  }, [entityId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
