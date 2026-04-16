'use client'

import { useState, useCallback, useEffect } from 'react'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useTransactions, type TransactionFilter } from '@/hooks/useTransactions'
import { TransactionList, TransactionSkeleton } from '@/components/transactions/TransactionList'
import { MonthSelector } from '@/components/transactions/MonthSelector'
import { FilterChips } from '@/components/transactions/FilterChips'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { BottomNav } from '@/components/layout/BottomNav'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency, cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

export default function TransactionsPage() {
  const { entityFilter, setEntityFilter, entityId } = useEntity()

  // Default to the month of the most recent transaction so mock data is visible.
  // Falls back to current month if no transactions exist.
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [initialised, setInitialised] = useState(false)

  useEffect(() => {
    if (initialised) return
    const supabase = createClient()
    supabase
      .from('transactions')
      .select('due_date')
      .eq('entity_id', entityId)
      .not('type', 'in', '(transfer,savings_transfer)')
      .order('due_date', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]?.due_date) {
          const d = new Date(data[0].due_date + 'T00:00:00')
          setYear(d.getFullYear())
          setMonth(d.getMonth() + 1)
        }
        setInitialised(true)
      })
  }, [entityId, initialised])
  const [filter, setFilter] = useState<TransactionFilter>('Todos')
  const [search, setSearch] = useState('')

  const { transactions, loading, totals, refetch } = useTransactions({
    entityId,
    year,
    month,
    filter,
    search,
  })

  const handleDelete = useCallback(async (id: string) => {
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('transaction_id', id)
    await refetch()
  }, [refetch])

  const handleMonthChange = (y: number, m: number) => {
    setYear(y)
    setMonth(m)
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto px-4">

          {/* Row 1: title + toggle */}
          <div className="flex items-center justify-between h-14">
            <span className="text-lg font-bold text-[#F8FAFC]">Transações</span>
          <EntityToggle value={entityFilter} onChange={setEntityFilter} />
          </div>

          {/* Row 2: month selector */}
          <MonthSelector year={year} month={month} onChange={handleMonthChange} />

          {/* Row 3: summary bar */}
          <div className="flex items-center justify-around py-2.5 border-t border-[#1E293B]/60">
            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-0.5">
                Receitas
              </p>
              <p className="text-sm font-semibold text-[#22C55E] tabular-nums">
                {formatCurrency(totals.income)}
              </p>
            </div>

            <div className="w-px h-8 bg-[#1E293B]" />

            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-0.5">
                Despesas
              </p>
              <p className="text-sm font-semibold text-[#EF4444] tabular-nums">
                {formatCurrency(totals.expense)}
              </p>
            </div>

            <div className="w-px h-8 bg-[#1E293B]" />

            <div className="text-center">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-0.5">
                Saldo
              </p>
              <p className={cn(
                'text-sm font-semibold tabular-nums',
                totals.balance >= 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'
              )}>
                {totals.balance >= 0 ? '+' : ''}{formatCurrency(totals.balance)}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Filters ─────────────────────────────────────── */}
      <div className="max-w-md mx-auto px-4 mt-3 space-y-2">
        <FilterChips value={filter} onChange={setFilter} />

        {/* Search */}
        <div className="flex items-center gap-2 bg-[#111827] border border-[#1E293B] rounded-lg px-3 focus-within:border-[#14A085] transition-colors duration-200">
          <Search size={15} className="text-[#94A3B8] flex-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar transações..."
            className="flex-1 bg-transparent py-2.5 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#475569] hover:text-[#94A3B8] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── List ────────────────────────────────────────── */}
      <main className="max-w-md mx-auto px-4 mt-4">
        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => (
              <TransactionSkeleton key={i} />
            ))}
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
          />
        )}
      </main>

      {/* ── FAB ─────────────────────────────────────────── */}
      <Link
        href="/dashboard/quick-input"
        className="fixed bottom-20 right-4 w-14 h-14 bg-[#14A085] hover:bg-[#0D7377] rounded-full flex items-center justify-center shadow-[0_0_24px_rgba(20,160,133,0.5)] hover:scale-110 active:scale-95 transition-all duration-200 z-40"
        aria-label="Adicionar transação"
      >
        <Plus size={24} className="text-white" />
      </Link>

      <BottomNav />
    </div>
  )
}
