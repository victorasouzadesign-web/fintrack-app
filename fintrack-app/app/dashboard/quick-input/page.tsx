'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { TypeSelector, TYPE_LABELS, type TransactionType } from '@/components/quick-input/TypeSelector'
import { NumericKeypad, keypadReducer, parseAmount } from '@/components/quick-input/NumericKeypad'
import { CategoryBottomSheet, type Category } from '@/components/quick-input/CategoryBottomSheet'
import { AccountSelector, type Account, type CreditCardOption } from '@/components/quick-input/AccountSelector'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EntityToggle } from '@/components/layout/EntityToggle'
import { useEntity } from '@/lib/entity-context'
import { formatCurrency, cn } from '@/lib/utils'

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type }: { message: string; type: 'success' | 'error' }) {
  return (
    <motion.div
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 max-w-[calc(100vw-32px)]',
        type === 'success'
          ? 'bg-[#22C55E] text-white'
          : 'bg-[#EF4444] text-white'
      )}
      initial={{ opacity: 0, y: -16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      {type === 'success' ? <CheckCircle size={16} /> : null}
      {message}
    </motion.div>
  )
}

// ─── Field button ─────────────────────────────────────────────────────────────
function FieldButton({ label, value, placeholder, onPress, accent = false }: {
  label: string; value?: string; placeholder: string; onPress: () => void; accent?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium text-[#475569] mb-1.5">{label}</p>
      <button
        onClick={onPress}
        className={cn(
          'w-full flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-200',
          value
            ? 'bg-[#1C2537] border-[#14A085]/30 text-[#F8FAFC]'
            : 'bg-[#111827] border-[#1E293B] text-[#475569] hover:border-[#1C3A50]'
        )}
      >
        <span className={cn('text-sm', value ? 'text-[#F8FAFC]' : 'text-[#475569]')}>
          {value ?? placeholder}
        </span>
        <ChevronRight size={16} className="text-[#475569]" />
      </button>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function QuickInputPage() {
  const router = useRouter()
  const { entityFilter, setEntityFilter, entityId: ENTITY_ID } = useEntity()

  // Form state
  const [type, setType] = useState<TransactionType>('expense')
  const [rawValue, setRawValue] = useState('0')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [accountId, setAccountId] = useState<string | null>(null)
  const [cardId, setCardId] = useState<string | null>(null)
  const [toAccountId, setToAccountId] = useState<string | null>(null)
  const [goalId, setGoalId] = useState<string | null>(null)
  const [status, setStatus] = useState<'paid' | 'planned'>('paid')
  const [isEstimated, setIsEstimated] = useState(false)
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])

  // UI state
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showCategorySheet, setShowCategorySheet] = useState(false)
  const [showAccountSheet, setShowAccountSheet] = useState(false)
  const [showToAccountSheet, setShowToAccountSheet] = useState(false)
  const [showGoalSheet, setShowGoalSheet] = useState(false)
  const [showDateSheet, setShowDateSheet] = useState(false)

  // Data
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<CreditCardOption[]>([])
  const [expenseCategories, setExpenseCategories] = useState<Category[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [goals, setGoals] = useState<Array<{ goal_id: string; name: string; balance: number | null; target_amount: number; icon: string | null }>>([])

  // Load reference data on mount
  useEffect(() => {
    const supabase = createClient()

    Promise.all([
      supabase.from('accounts').select('account_id, name, type, current_balance').eq('entity_id', ENTITY_ID).order('name'),
      supabase.from('credit_cards').select('card_id, name, bank, limit_total').eq('entity_id', ENTITY_ID).eq('is_active', true),
      supabase.from('categories').select('category_id, name, icon, color_hex').eq('type', 'expense').eq('is_active', true).order('name'),
      supabase.from('categories').select('category_id, name, icon, color_hex').eq('type', 'income').eq('is_active', true).order('name'),
      supabase.from('savings_goals').select('goal_id, name, balance, target_amount, icon').eq('entity_id', ENTITY_ID).eq('status', 'active'),
    ]).then(([accRes, cardRes, expCatRes, incCatRes, goalRes]) => {
      if (accRes.data) setAccounts(accRes.data as Account[])
      if (cardRes.data) setCards(cardRes.data as CreditCardOption[])
      if (expCatRes.data) setExpenseCategories(expCatRes.data as Category[])
      if (incCatRes.data) setIncomeCategories(incCatRes.data as Category[])
      if (goalRes.data) setGoals(goalRes.data)
    })
  }, [])

  // Reset category when switching type
  useEffect(() => { setCategoryId(null) }, [type])

  const amount = parseAmount(rawValue)
  const categories = type === 'income' ? incomeCategories : expenseCategories

  const selectedCategoryName = categories.find(c => c.category_id === categoryId)?.name
  const selectedCategoryIcon = categories.find(c => c.category_id === categoryId)?.icon
  const selectedAccountName = accounts.find(a => a.account_id === accountId)?.name
  const selectedCardName = cards.find(c => c.card_id === cardId)?.name
  const selectedToAccountName = accounts.find(a => a.account_id === toAccountId)?.name
  const selectedGoalName = goals.find(g => g.goal_id === goalId)?.name

  const canSave = amount > 0

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const resetForm = () => {
    setRawValue('0')
    setDescription('')
    setCategoryId(null)
    setAccountId(null)
    setCardId(null)
    setToAccountId(null)
    setGoalId(null)
    setStatus('paid')
    setIsEstimated(false)
    setDate(new Date().toISOString().split('T')[0])
  }

  const handleSave = useCallback(async () => {
    if (!canSave || saving) return
    setSaving(true)

    try {
      const supabase = createClient()

      let dbType = type as string
      if (type === 'savings') dbType = 'savings_transfer'

      const payload: Record<string, unknown> = {
        entity_id: ENTITY_ID,
        description: description.trim() || null,
        amount,
        type: dbType,
        due_date: date,
        payment_date: status === 'paid' ? date : null,
        status,
        is_estimated: isEstimated,
        estimated_amount: isEstimated ? amount : null,
        category_id: categoryId,
        account_id: type === 'expense' && cardId ? null : accountId,
        card_id: type === 'expense' ? cardId : null,
      }

      const { error } = await supabase.from('transactions').insert(payload)
      if (error) throw error

      // Vibrate on success (mobile)
      if (navigator.vibrate) navigator.vibrate(50)

      showToast('Transação salva!', 'success')
      resetForm()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      showToast(msg, 'error')
    } finally {
      setSaving(false)
    }
  }, [canSave, saving, type, description, amount, date, status, isEstimated, categoryId, accountId, cardId])

  const handleKey = (key: string) => {
    setRawValue((prev) => keypadReducer(prev, key))
  }

  const formattedAmount = amount === 0
    ? 'R$ 0,00'
    : formatCurrency(amount)

  const typeColor = {
    expense:  'text-[#EF4444]',
    income:   'text-[#22C55E]',
    transfer: 'text-[#14A085]',
    savings:  'text-[#F59E0B]',
  }[type]

  return (
    <div className="fixed inset-0 bg-[#0A0F1E] flex flex-col">

      {/* ── Toast ──────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      {/* ── Header ─────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-4 py-4 flex-none">
        <button
          onClick={() => router.back()}
          className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 rounded-lg hover:bg-[#1C2537]"
          aria-label="Fechar"
        >
          <X size={22} />
        </button>
        <h1 className={cn('text-base font-semibold', typeColor)}>
          {TYPE_LABELS[type]}
        </h1>
        <EntityToggle value={entityFilter} onChange={setEntityFilter} />
      </header>

      {/* ── Scrollable body ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 pb-4 space-y-4">

          {/* Type selector */}
          <TypeSelector value={type} onChange={setType} />

          {/* Value display */}
          <div className="text-center py-4">
            <motion.p
              key={rawValue}
              className={cn('text-5xl font-bold tabular-nums tracking-tight', typeColor)}
              initial={{ scale: 0.97 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {formattedAmount}
            </motion.p>
            {(selectedCategoryName || selectedAccountName || selectedCardName) && (
              <p className="text-sm text-[#94A3B8] mt-2">
                {selectedCategoryIcon && <span className="mr-1">{selectedCategoryIcon}</span>}
                {selectedCategoryName}
                {(selectedAccountName || selectedCardName) && selectedCategoryName && ' · '}
                {selectedCardName ?? selectedAccountName}
              </p>
            )}
          </div>

          {/* ── Conditional fields ──────────────────────────── */}

          {/* Category (expense / income) */}
          {(type === 'expense' || type === 'income') && (
            <motion.div
              key={`cat-${type}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FieldButton
                label="Categoria"
                value={selectedCategoryName ? `${selectedCategoryIcon ?? ''} ${selectedCategoryName}` : undefined}
                placeholder="Selecionar categoria"
                onPress={() => setShowCategorySheet(true)}
              />
            </motion.div>
          )}

          {/* Account / Card (expense) */}
          {type === 'expense' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
              <FieldButton
                label="Conta / Cartão"
                value={selectedCardName ?? selectedAccountName}
                placeholder="Selecionar conta ou cartão"
                onPress={() => setShowAccountSheet(true)}
              />
            </motion.div>
          )}

          {/* Account (income) */}
          {type === 'income' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.05 }}>
              <FieldButton
                label="Conta de destino"
                value={selectedAccountName}
                placeholder="Selecionar conta"
                onPress={() => setShowAccountSheet(true)}
              />
            </motion.div>
          )}

          {/* Income: estimated toggle */}
          {type === 'income' && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: 0.1 }}>
              <p className="text-xs font-medium text-[#475569] mb-1.5">Tipo de receita</p>
              <div className="flex gap-2">
                {[false, true].map((est) => (
                  <button
                    key={String(est)}
                    onClick={() => setIsEstimated(est)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                      isEstimated === est
                        ? 'bg-[#14A085]/10 border-[#14A085]/30 text-[#14A085]'
                        : 'bg-[#111827] border-[#1E293B] text-[#94A3B8]'
                    )}
                  >
                    {est ? 'Estimada' : 'Confirmada'}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Transfer: from + to accounts */}
          {type === 'transfer' && (
            <motion.div className="space-y-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <FieldButton
                label="Da conta"
                value={selectedAccountName}
                placeholder="Conta de origem"
                onPress={() => setShowAccountSheet(true)}
              />
              <FieldButton
                label="Para conta"
                value={selectedToAccountName}
                placeholder="Conta de destino"
                onPress={() => setShowToAccountSheet(true)}
              />
            </motion.div>
          )}

          {/* Savings: from account + goal */}
          {type === 'savings' && (
            <motion.div className="space-y-3" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <FieldButton
                label="Da conta"
                value={selectedAccountName}
                placeholder="Conta de origem"
                onPress={() => setShowAccountSheet(true)}
              />
              <FieldButton
                label="Para meta"
                value={selectedGoalName}
                placeholder="Selecionar meta"
                onPress={() => setShowGoalSheet(true)}
              />
            </motion.div>
          )}

          {/* Date */}
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1.5">Data</p>
            <button
              onClick={() => setShowDateSheet(true)}
              className="w-full flex items-center gap-2 bg-[#111827] border border-[#1E293B] hover:border-[#1C3A50] rounded-xl px-4 py-3 transition-all duration-200"
            >
              <Calendar size={15} className="text-[#94A3B8]" />
              <span className="text-sm text-[#F8FAFC]">
                {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </span>
            </button>
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1.5">Status</p>
            <div className="flex gap-2">
              {(['paid', 'planned'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all duration-200',
                    status === s
                      ? 'bg-[#14A085]/10 border-[#14A085]/30 text-[#14A085]'
                      : 'bg-[#111827] border-[#1E293B] text-[#94A3B8]'
                  )}
                >
                  {s === 'paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {s === 'paid' ? 'Pago' : 'Planejado'}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-medium text-[#475569] mb-1.5">Descrição</p>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              className="w-full bg-[#0A0F1E] border border-[#1E293B] focus:border-[#14A085] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none transition-colors duration-200"
            />
          </div>

        </div>
      </div>

      {/* ── Keypad (fixed at bottom) ────────────────────────── */}
      <div className="flex-none max-w-md mx-auto w-full">
        <NumericKeypad
          onKey={handleKey}
          onSave={handleSave}
          canSave={canSave}
          saving={saving}
        />
      </div>

      {/* ── Bottom Sheets ───────────────────────────────────── */}

      <CategoryBottomSheet
        open={showCategorySheet}
        onClose={() => setShowCategorySheet(false)}
        categories={categories}
        selected={categoryId}
        onSelect={setCategoryId}
      />

      <AccountSelector
        open={showAccountSheet}
        onClose={() => setShowAccountSheet(false)}
        label={type === 'expense' ? 'Conta / Cartão' : 'Conta'}
        accounts={accounts}
        cards={cards}
        selectedAccount={accountId}
        selectedCard={cardId}
        onSelectAccount={(id) => { setAccountId(id); setCardId(null) }}
        onSelectCard={(id) => { setCardId(id); setAccountId(null) }}
        showCards={type === 'expense'}
      />

      <AccountSelector
        open={showToAccountSheet}
        onClose={() => setShowToAccountSheet(false)}
        label="Conta de destino"
        accounts={accounts.filter(a => a.account_id !== accountId)}
        cards={[]}
        selectedAccount={toAccountId}
        selectedCard={null}
        onSelectAccount={setToAccountId}
        onSelectCard={() => {}}
        showCards={false}
      />

      {/* Goal picker bottom sheet */}
      <BottomSheet open={showGoalSheet} onClose={() => setShowGoalSheet(false)} title="Meta de poupança">
        <div className="px-4 pt-2 pb-4 space-y-2 max-h-[50vh] overflow-y-auto">
          {goals.map((g) => {
            const progress = g.target_amount > 0 ? Math.min(100, ((g.balance ?? 0) / g.target_amount) * 100) : 0
            return (
              <button
                key={g.goal_id}
                onClick={() => { setGoalId(g.goal_id); setShowGoalSheet(false) }}
                className={cn(
                  'w-full flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200',
                  goalId === g.goal_id
                    ? 'bg-[#14A085]/10 border-[#14A085]/30'
                    : 'bg-[#1C2537] border-[#1E293B] hover:border-[#1C3A50]'
                )}
              >
                <span className="text-2xl">{g.icon ?? '🎯'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F8FAFC] truncate">{g.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-[#1E293B] rounded-full h-1">
                      <div className="bg-[#14A085] rounded-full h-1" style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-[10px] text-[#94A3B8] tabular-nums">{Math.round(progress)}%</span>
                  </div>
                </div>
              </button>
            )
          })}
          {goals.length === 0 && (
            <p className="text-sm text-[#475569] text-center py-6">Nenhuma meta ativa</p>
          )}
        </div>
      </BottomSheet>

      {/* Date picker bottom sheet */}
      <BottomSheet open={showDateSheet} onClose={() => setShowDateSheet(false)} title="Data">
        <div className="px-4 pt-3 pb-6">
          <input
            type="date"
            value={date}
            max={new Date().toISOString().split('T')[0]}
            onChange={(e) => { setDate(e.target.value); setShowDateSheet(false) }}
            className="w-full bg-[#0A0F1E] border border-[#1E293B] focus:border-[#14A085] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none transition-colors duration-200"
          />
        </div>
      </BottomSheet>

    </div>
  )
}
