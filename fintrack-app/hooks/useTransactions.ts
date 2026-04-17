'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface TransactionRow {
  transaction_id: string
  description: string | null
  amount: number
  type: string
  due_date: string
  payment_date: string | null
  status: string
  is_estimated: boolean | null
  is_recurring: boolean | null
  is_installment: boolean | null
  category_name: string | null
  category_icon: string | null
  color_hex: string | null
  account_name: string | null
  card_name: string | null
}

export type TransactionFilter = 'Todos' | 'Receitas' | 'Despesas' | 'Cartão' | 'Planejado' | 'Pago'

interface UseTransactionsParams {
  entityId: string
  year: number
  month: number // 1-12
  filter: TransactionFilter
  search: string
}

export function useTransactions({ entityId, year, month, filter, search }: UseTransactionsParams) {
  const [transactions, setTransactions] = useState<TransactionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`

      let query = supabase
        .from('transactions')
        .select(`
          transaction_id,
          description,
          amount,
          type,
          due_date,
          payment_date,
          status,
          is_estimated,
          is_recurring,
          is_installment,
          categories ( name, icon, color_hex ),
          accounts ( name ),
          credit_cards ( name )
        `)
        .eq('entity_id', entityId)
        .gte('due_date', start)
        .lte('due_date', end)
        .not('type', 'eq', 'transfer')
        .order('due_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filter === 'Receitas') query = query.eq('type', 'income')
      if (filter === 'Despesas') query = query.eq('type', 'expense')
      if (filter === 'Cartão') query = query.not('card_id', 'is', null)
      if (filter === 'Planejado') query = query.eq('status', 'planned')
      if (filter === 'Pago') query = query.eq('status', 'paid')

      if (search.trim()) {
        query = query.ilike('description', `%${search.trim()}%`)
      }

      const { data, error: qErr } = await query

      if (qErr) throw qErr

      // Flatten joined fields
      const rows: TransactionRow[] = (data ?? []).map((t: any) => ({
        transaction_id: t.transaction_id,
        description: t.description,
        amount: t.amount,
        type: t.type,
        due_date: t.due_date,
        payment_date: t.payment_date,
        status: t.status,
        is_estimated: t.is_estimated,
        is_recurring: t.is_recurring,
        is_installment: t.is_installment,
        category_name: t.categories?.name ?? null,
        category_icon: t.categories?.icon ?? null,
        color_hex: t.categories?.color_hex ?? null,
        account_name: t.accounts?.name ?? null,
        card_name: t.credit_cards?.name ?? null,
      }))

      setTransactions(rows)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar transações'))
    } finally {
      setLoading(false)
    }
  }, [entityId, year, month, filter, search])

  // Initial fetch + re-fetch on param changes
  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Supabase Realtime
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions', filter: `entity_id=eq.${entityId}` },
        () => { fetchTransactions() }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [entityId, fetchTransactions])

  // Derived totals
  const totals = transactions.reduce(
    (acc, t) => {
      if (t.status === 'paid') {
        if (t.type === 'income') acc.income += t.amount
        else if (t.type === 'expense') acc.expense += t.amount
        // savings_transfer não afeta receitas/despesas
      }
      return acc
    },
    { income: 0, expense: 0 }
  )

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    totals: { ...totals, balance: totals.income - totals.expense },
  }
}
