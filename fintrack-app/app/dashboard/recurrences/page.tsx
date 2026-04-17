'use client'

import { useState } from 'react'
import { Plus, Trash2, Repeat, CreditCard, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRecurrences, type Recurrence, type Installment } from '@/hooks/useRecurrences'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { BottomNav } from '@/components/layout/BottomNav'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency } from '@/lib/utils'

// ─── Add Recurrence Sheet ────────────────────────────────────────────────────

function AddRecurrenceSheet({
  open, onClose, type, onAdd,
}: {
  open: boolean
  onClose: () => void
  type: 'income' | 'expense'
  onAdd: ReturnType<typeof useRecurrences>['addRecurrence']
}) {
  const [description, setDescription] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [frequency, setFrequency] = useState<'monthly' | 'weekly' | 'yearly'>('monthly')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const amount = parseFloat(amountStr.replace(',', '.')) || 0

  async function handleSubmit() {
    setError('')
    if (!description.trim()) { setError('Informe a descrição.'); return }
    if (amount <= 0) { setError('Informe o valor.'); return }
    setLoading(true)
    const err = await onAdd({
      description: description.trim(),
      amount,
      type,
      frequency,
      start_date: startDate,
      end_date: null,
      category_id: null,
      account_id: null,
      card_id: null,
    })
    setLoading(false)
    if (err) { setError('Erro ao salvar. Tente novamente.'); return }
    handleClose()
  }

  function handleClose() {
    setDescription('')
    setAmountStr('')
    setFrequency('monthly')
    setStartDate(new Date().toISOString().split('T')[0])
    setError('')
    onClose()
  }

  const title = type === 'income' ? 'Nova receita recorrente' : 'Novo gasto fixo'
  const color = type === 'income' ? '#22C55E' : '#EF4444'

  return (
    <BottomSheet open={open} onClose={handleClose} title={title}>
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Descrição *</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={type === 'income' ? 'Ex: Salário CLT' : 'Ex: Aluguel'}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Valor (R$) *</label>
          <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
            <span className="text-sm text-[#475569] mr-2">R$</span>
            <input
              type="number"
              inputMode="decimal"
              value={amountStr}
              onChange={e => setAmountStr(e.target.value)}
              placeholder="0,00"
              className="flex-1 bg-transparent text-base font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Frequência</label>
          <div className="grid grid-cols-3 gap-2">
            {(['monthly', 'weekly', 'yearly'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFrequency(f)}
                className="py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border"
                style={{
                  borderColor: frequency === f ? color : '#1E293B',
                  backgroundColor: frequency === f ? `${color}18` : '#1C2537',
                  color: frequency === f ? color : '#475569',
                }}
              >
                {f === 'monthly' ? 'Mensal' : f === 'weekly' ? 'Semanal' : 'Anual'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Data de início</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !description.trim() || amount <= 0}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: color }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </BottomSheet>
  )
}

// ─── Add Installment Sheet ───────────────────────────────────────────────────

function AddInstallmentSheet({
  open, onClose, onAdd,
}: {
  open: boolean
  onClose: () => void
  onAdd: ReturnType<typeof useRecurrences>['addInstallment']
}) {
  const [description, setDescription] = useState('')
  const [totalStr, setTotalStr] = useState('')
  const [installmentsStr, setInstallmentsStr] = useState('')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const totalAmount = parseFloat(totalStr.replace(',', '.')) || 0
  const totalInstallments = parseInt(installmentsStr) || 0
  const installmentAmount = totalInstallments > 0 ? totalAmount / totalInstallments : 0

  async function handleSubmit() {
    setError('')
    if (!description.trim()) { setError('Informe a descrição.'); return }
    if (totalAmount <= 0) { setError('Informe o valor total.'); return }
    if (totalInstallments < 2) { setError('Mínimo de 2 parcelas.'); return }
    setLoading(true)
    const err = await onAdd({
      description: description.trim(),
      total_amount: totalAmount,
      total_installments: totalInstallments,
      remaining_installments: totalInstallments,
      installment_amount: Math.round(installmentAmount * 100) / 100,
      start_date: startDate,
      card_id: null,
      category_id: null,
    })
    setLoading(false)
    if (err) { setError('Erro ao salvar. Tente novamente.'); return }
    handleClose()
  }

  function handleClose() {
    setDescription('')
    setTotalStr('')
    setInstallmentsStr('')
    setStartDate(new Date().toISOString().split('T')[0])
    setError('')
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={handleClose} title="Novo parcelamento">
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Descrição *</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: iPhone 15 Pro"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Valor total (R$) *</label>
            <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-3 py-3 focus-within:border-[#14A085] transition-colors duration-200">
              <span className="text-xs text-[#475569] mr-1.5">R$</span>
              <input
                type="number"
                inputMode="decimal"
                value={totalStr}
                onChange={e => setTotalStr(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-transparent text-sm font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums w-0"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Nº de parcelas *</label>
            <input
              type="number"
              inputMode="numeric"
              value={installmentsStr}
              onChange={e => setInstallmentsStr(e.target.value)}
              placeholder="12"
              className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
            />
          </div>
        </div>

        {installmentAmount > 0 && (
          <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-xl px-4 py-3">
            <p className="text-xs text-[#F59E0B]">
              Parcela mensal: <span className="font-bold">{formatCurrency(installmentAmount)}</span>
            </p>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Início das parcelas</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200"
          />
        </div>

        {error && (
          <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !description.trim() || totalAmount <= 0 || totalInstallments < 2}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#F59E0B] hover:bg-[#D97706] transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          Salvar
        </button>
      </div>
    </BottomSheet>
  )
}

// ─── Recurrence Row ──────────────────────────────────────────────────────────

function RecurrenceRow({ item, onDelete }: { item: Recurrence; onDelete: (id: string) => void }) {
  const isIncome = item.type === 'income'
  const color = isIncome ? '#22C55E' : '#EF4444'
  const freqLabel = item.frequency === 'yearly' ? '/ano' : item.frequency === 'weekly' ? '/sem' : '/mês'

  return (
    <div className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Repeat size={14} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F8FAFC] truncate">{item.description}</p>
        {item.category_name && (
          <p className="text-xs text-[#475569] truncate">{item.category_name}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold tabular-nums" style={{ color }}>
          {isIncome ? '+' : '-'} {formatCurrency(item.amount)}
        </p>
        <p className="text-[10px] text-[#475569]">{freqLabel}</p>
      </div>
      <button
        onClick={() => onDelete(item.recurrence_id)}
        className="p-1.5 text-[#475569] hover:text-[#EF4444] transition-colors shrink-0"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ─── Installment Row ─────────────────────────────────────────────────────────

function InstallmentRow({ item, onDelete }: { item: Installment; onDelete: (id: string) => void }) {
  const paid = item.total_installments - item.remaining_installments
  const pct = item.total_installments > 0 ? (paid / item.total_installments) * 100 : 0

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center shrink-0">
          <CreditCard size={14} className="text-[#F59E0B]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#F8FAFC] truncate">{item.description}</p>
          <p className="text-xs text-[#475569]">
            {paid}/{item.total_installments} pagas
            {item.card_name ? ` · ${item.card_name}` : ''}
          </p>
          {/* Progress bar */}
          <div className="mt-2 h-1 bg-[#1E293B] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F59E0B] rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-[#F59E0B] tabular-nums">
            - {formatCurrency(item.installment_amount)}
          </p>
          <p className="text-[10px] text-[#475569]">/mês</p>
        </div>
        <button
          onClick={() => onDelete(item.installment_id)}
          className="p-1.5 text-[#475569] hover:text-[#EF4444] transition-colors shrink-0"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({
  title, total, color, onAdd, addLabel,
}: {
  title: string
  total: number
  color: string
  onAdd: () => void
  addLabel: string
}) {
  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>{title}</p>
        <p className="text-sm font-semibold text-[#F8FAFC] tabular-nums mt-0.5">
          {formatCurrency(total)}/mês
        </p>
      </div>
      <button
        onClick={onAdd}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border active:scale-95"
        style={{ borderColor: `${color}40`, color, backgroundColor: `${color}10` }}
      >
        <Plus size={12} />
        {addLabel}
      </button>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function RecurrencesPage() {
  const { entityFilter, setEntityFilter, entityId } = useEntity()
  const {
    recurrences, installments, loading, totals,
    addRecurrence, deleteRecurrence,
    addInstallment, deleteInstallment,
  } = useRecurrences(entityId)

  const [addIncomeOpen, setAddIncomeOpen] = useState(false)
  const [addExpenseOpen, setAddExpenseOpen] = useState(false)
  const [addInstallmentOpen, setAddInstallmentOpen] = useState(false)

  const incomeList = recurrences.filter(r => r.type === 'income')
  const expenseList = recurrences.filter(r => r.type === 'expense')

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <span className="text-lg font-bold text-[#F8FAFC]">Recorrências</span>
            <EntityToggle value={entityFilter} onChange={setEntityFilter} />
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-5">

        {/* ── Summary card ─────────────────────────────── */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111827] border border-[#1E293B] rounded-2xl p-4"
          >
            <p className="text-[10px] font-semibold tracking-widest uppercase text-[#475569] mb-3">
              Fluxo mensal fixo
            </p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#22C55E]/15 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingUp size={15} className="text-[#22C55E]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#475569]">Receitas</p>
                  <p className="text-sm font-bold text-[#22C55E] tabular-nums">
                    +{formatCurrency(totals.monthlyIncome)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#EF4444]/15 rounded-xl flex items-center justify-center shrink-0">
                  <TrendingDown size={15} className="text-[#EF4444]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#475569]">Gastos fixos</p>
                  <p className="text-sm font-bold text-[#EF4444] tabular-nums">
                    -{formatCurrency(totals.monthlyExpenses + totals.monthlyInstallments)}
                  </p>
                </div>
              </div>
            </div>
            <div className="border-t border-[#1E293B] pt-3 flex items-center justify-between">
              <p className="text-xs text-[#475569]">Resultado fixo/mês</p>
              <p
                className="text-base font-bold tabular-nums"
                style={{ color: totals.monthlyNet >= 0 ? '#22C55E' : '#EF4444' }}
              >
                {totals.monthlyNet >= 0 ? '+' : ''}{formatCurrency(totals.monthlyNet)}
              </p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-[#111827] border border-[#1E293B] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ── Receitas Recorrentes ────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <SectionHeader
                title="Receitas recorrentes"
                total={totals.monthlyIncome}
                color="#22C55E"
                onAdd={() => setAddIncomeOpen(true)}
                addLabel="Adicionar"
              />
              {incomeList.length === 0 ? (
                <p className="text-xs text-[#475569] py-3 pl-1">Nenhuma receita recorrente.</p>
              ) : (
                <div className="space-y-2">
                  {incomeList.map(r => (
                    <RecurrenceRow key={r.recurrence_id} item={r} onDelete={deleteRecurrence} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* ── Gastos Fixos ───────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <SectionHeader
                title="Gastos fixos"
                total={totals.monthlyExpenses}
                color="#EF4444"
                onAdd={() => setAddExpenseOpen(true)}
                addLabel="Adicionar"
              />
              {expenseList.length === 0 ? (
                <p className="text-xs text-[#475569] py-3 pl-1">Nenhum gasto fixo.</p>
              ) : (
                <div className="space-y-2">
                  {expenseList.map(r => (
                    <RecurrenceRow key={r.recurrence_id} item={r} onDelete={deleteRecurrence} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* ── Parcelamentos ──────────────────────────── */}
            <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <SectionHeader
                title="Parcelamentos"
                total={totals.monthlyInstallments}
                color="#F59E0B"
                onAdd={() => setAddInstallmentOpen(true)}
                addLabel="Adicionar"
              />
              {installments.length === 0 ? (
                <p className="text-xs text-[#475569] py-3 pl-1">Nenhum parcelamento ativo.</p>
              ) : (
                <div className="space-y-2">
                  {installments.map(i => (
                    <InstallmentRow key={i.installment_id} item={i} onDelete={deleteInstallment} />
                  ))}
                </div>
              )}
            </motion.section>
          </>
        )}
      </main>

      {/* ── Sheets ──────────────────────────────────────── */}
      <AddRecurrenceSheet
        open={addIncomeOpen}
        onClose={() => setAddIncomeOpen(false)}
        type="income"
        onAdd={addRecurrence}
      />
      <AddRecurrenceSheet
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        type="expense"
        onAdd={addRecurrence}
      />
      <AddInstallmentSheet
        open={addInstallmentOpen}
        onClose={() => setAddInstallmentOpen(false)}
        onAdd={addInstallment}
      />

      <BottomNav />
    </div>
  )
}
