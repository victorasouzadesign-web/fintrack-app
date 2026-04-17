'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Recurrence {
  recurrence_id: string
  entity_id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  frequency: 'monthly' | 'weekly' | 'yearly'
  start_date: string
  end_date: string | null
  category_id: string | null
  account_id: string | null
  card_id: string | null
  is_active: boolean
  created_at: string | null
  category_name: string | null
}

export interface Installment {
  installment_id: string
  entity_id: string
  description: string
  total_amount: number
  total_installments: number
  remaining_installments: number
  installment_amount: number
  start_date: string
  card_id: string | null
  category_id: string | null
  status: string | null
  created_at: string | null
  category_name: string | null
  card_name: string | null
}

function monthlyAmount(r: Pick<Recurrence, 'amount' | 'frequency'>): number {
  if (r.frequency === 'yearly') return r.amount / 12
  if (r.frequency === 'weekly') return r.amount * 4.33
  return r.amount
}

export function useRecurrences(entityId: string) {
  const [recurrences, setRecurrences] = useState<Recurrence[]>([])
  const [installments, setInstallments] = useState<Installment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const [recRes, instRes] = await Promise.all([
      supabase
        .from('recurrences')
        .select(`
          recurrence_id, entity_id, description, amount, type, frequency,
          start_date, end_date, category_id, account_id, card_id, is_active, created_at,
          categories ( name )
        `)
        .eq('entity_id', entityId)
        .eq('is_active', true)
        .order('type', { ascending: false })
        .order('description'),

      supabase
        .from('installments')
        .select(`
          installment_id, entity_id, description, total_amount, total_installments,
          remaining_installments, installment_amount, start_date, card_id, category_id,
          status, created_at,
          categories ( name ),
          credit_cards ( name )
        `)
        .eq('entity_id', entityId)
        .eq('status', 'active')
        .order('description'),
    ])

    setRecurrences(
      (recRes.data ?? []).map((r: any) => ({
        ...r,
        category_name: r.categories?.name ?? null,
        categories: undefined,
      }))
    )

    setInstallments(
      (instRes.data ?? []).map((i: any) => ({
        ...i,
        category_name: i.categories?.name ?? null,
        card_name: i.credit_cards?.name ?? null,
        categories: undefined,
        credit_cards: undefined,
      }))
    )

    setLoading(false)
  }, [entityId])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addRecurrence = useCallback(async (payload: {
    description: string
    amount: number
    type: 'income' | 'expense'
    frequency: 'monthly' | 'weekly' | 'yearly'
    start_date: string
    end_date: string | null
    category_id: string | null
    account_id: string | null
    card_id: string | null
  }) => {
    const supabase = createClient()
    const { error } = await supabase.from('recurrences').insert({
      entity_id: entityId,
      is_active: true,
      ...payload,
    })
    if (!error) await fetchAll()
    return error
  }, [entityId, fetchAll])

  const deleteRecurrence = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('recurrences').delete().eq('recurrence_id', id)
    await fetchAll()
  }, [fetchAll])

  const addInstallment = useCallback(async (payload: {
    description: string
    total_amount: number
    total_installments: number
    remaining_installments: number
    installment_amount: number
    start_date: string
    card_id: string | null
    category_id: string | null
  }) => {
    const supabase = createClient()
    const { error } = await supabase.from('installments').insert({
      entity_id: entityId,
      status: 'active',
      ...payload,
    })
    if (!error) await fetchAll()
    return error
  }, [entityId, fetchAll])

  const deleteInstallment = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('installments').delete().eq('installment_id', id)
    await fetchAll()
  }, [fetchAll])

  const monthlyIncome = recurrences
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + monthlyAmount(r), 0)

  const monthlyExpenses = recurrences
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + monthlyAmount(r), 0)

  const monthlyInstallments = installments
    .filter(i => (i.remaining_installments ?? 0) > 0)
    .reduce((sum, i) => sum + Number(i.installment_amount), 0)

  const monthlyNet = monthlyIncome - monthlyExpenses - monthlyInstallments

  return {
    recurrences,
    installments,
    loading,
    refetch: fetchAll,
    addRecurrence,
    deleteRecurrence,
    addInstallment,
    deleteInstallment,
    totals: { monthlyIncome, monthlyExpenses, monthlyInstallments, monthlyNet },
  }
}
