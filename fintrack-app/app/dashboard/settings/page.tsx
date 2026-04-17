'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, User, Building2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useEntity } from '@/lib/entity-context'
import { BottomNav } from '@/components/layout/BottomNav'
import { AccountRow, type Account } from '@/components/settings/AccountRow'
import { CardRow, type CreditCardItem } from '@/components/settings/CardRow'
import { CategoryList, type Category } from '@/components/settings/CategoryList'
import { AddAccountSheet } from '@/components/settings/AddAccountSheet'
import { AddCardSheet } from '@/components/settings/AddCardSheet'
import { BottomSheet } from '@/components/ui/BottomSheet'

interface Entity {
  entity_id: string
  name: string
  type: string
  tax_id: string | null
  is_active: boolean | null
}

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-[10px] font-semibold tracking-widest uppercase text-[#94A3B8]">{title}</p>
      {onAdd && (
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-[#14A085] font-semibold hover:text-[#0D7377] transition-colors duration-200"
        >
          <Plus size={14} />
          Adicionar
        </button>
      )}
    </div>
  )
}

// ─── Category add/edit sheet (inline, lightweight) ───────────────────────────

interface AddCategorySheetProps {
  open: boolean
  onClose: () => void
  editing: Category | null
  parentId: string | undefined
  categories: Category[]
  onSave: (data: Partial<Category>, id?: string) => Promise<unknown>
}

function AddCategorySheet({ open, onClose, editing, parentId, categories, onSave }: AddCategorySheetProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [parent, setParent] = useState<string | undefined>(undefined)
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('#14A085')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const PRESET_COLORS = ['#14A085','#6366F1','#EC4899','#F59E0B','#3B82F6','#EF4444','#10B981','#8B5CF6']

  useEffect(() => {
    if (editing) {
      setName(editing.name); setType(editing.type as 'expense' | 'income')
      setParent(editing.parent_id ?? undefined); setIcon(editing.icon ?? '')
      setColor(editing.color_hex ?? '#14A085')
    } else {
      setName(''); setType('expense'); setParent(parentId); setIcon(''); setColor('#14A085')
    }
    setError('')
  }, [editing, parentId, open])

  const parents = categories.filter(c => !c.parent_id && c.type === type)

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError('Informe o nome.'); return }
    setLoading(true)
    const err = await onSave(
      { name: name.trim(), type, parent_id: parent ?? null, icon: icon || null, color_hex: color },
      editing?.category_id,
    )
    setLoading(false)
    if (err) { setError('Erro ao salvar.'); return }
    onClose()
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={editing ? 'Editar categoria' : 'Nova categoria'}>
      <div className="px-4 pt-3 pb-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Nome *</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="Ex: Alimentação"
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200" />
        </div>

        {!editing && (
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {(['expense','income'] as const).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${type === t ? 'border-[#14A085] bg-[#14A085]/15 text-[#14A085]' : 'border-[#1E293B] bg-[#1C2537] text-[#475569]'}`}>
                  {t === 'expense' ? 'Despesa' : 'Receita'}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Categoria pai (opcional)</label>
          <select value={parent ?? ''} onChange={e => setParent(e.target.value || undefined)}
            className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] outline-none focus:border-[#14A085] transition-colors duration-200">
            <option value="">Nenhuma (categoria principal)</option>
            {parents.map(p => <option key={p.category_id} value={p.category_id}>{p.name}</option>)}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Ícone (emoji)</label>
            <input type="text" value={icon} onChange={e => setIcon(e.target.value)} placeholder="🍕"
              className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200 text-center text-xl" />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">Cor</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform duration-150"
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px #111827, 0 0 0 3.5px ${c}` : 'none', transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-[#EF4444] bg-[#EF4444]/10 px-3 py-2 rounded-lg">{error}</p>}

        <button onClick={handleSave} disabled={loading}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-[#14A085] hover:bg-[#0D7377] transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2">
          {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {editing ? 'Salvar alterações' : 'Criar categoria'}
        </button>
      </div>
    </BottomSheet>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const { entityId } = useEntity()

  const [entities, setEntities] = useState<Entity[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [cards, setCards] = useState<CreditCardItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  // Sheet states
  const [accountSheet, setAccountSheet] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [cardSheet, setCardSheet] = useState(false)
  const [editingCard, setEditingCard] = useState<CreditCardItem | null>(null)
  const [categorySheet, setCategorySheet] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryParentId, setCategoryParentId] = useState<string | undefined>(undefined)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [entRes, accRes, carRes, catRes] = await Promise.all([
      supabase.from('entities').select('entity_id, name, type, tax_id, is_active').order('type'),
      supabase.from('accounts').select('account_id, name, bank, type, current_balance, is_active').eq('entity_id', entityId).order('name'),
      supabase.from('credit_cards').select('card_id, name, bank, network, limit_total, closing_day, due_day, color_hex, is_active').eq('entity_id', entityId).order('name'),
      supabase.from('categories').select('category_id, name, type, icon, color_hex, parent_id, is_active').order('type').order('name'),
    ])
    setEntities((entRes.data ?? []) as Entity[])
    setAccounts((accRes.data ?? []) as Account[])
    setCards((carRes.data ?? []) as CreditCardItem[])
    setCategories((catRes.data ?? []) as Category[])
    setLoading(false)
  }, [entityId])

  useEffect(() => { fetchAll() }, [fetchAll])

  // ── Account CRUD ────────────────────────────────────────────────────────────
  async function saveAccount(data: { name: string; bank: string | null; type: string; opening_balance: number }, id?: string) {
    const supabase = createClient()
    if (id) {
      const { error } = await supabase.from('accounts').update({ name: data.name, bank: data.bank, type: data.type, current_balance: data.opening_balance }).eq('account_id', id)
      if (error) return error
    } else {
      const { error } = await supabase.from('accounts').insert({ entity_id: entityId, name: data.name, bank: data.bank, type: data.type, opening_balance: data.opening_balance, current_balance: data.opening_balance })
      if (error) return error
    }
    await fetchAll()
  }

  async function toggleAccount(account: Account) {
    const supabase = createClient()
    await supabase.from('accounts').update({ is_active: !account.is_active }).eq('account_id', account.account_id)
    await fetchAll()
  }

  // ── Card CRUD ───────────────────────────────────────────────────────────────
  async function saveCard(data: { name: string; bank: string | null; network: string | null; limit_total: number; closing_day: number; due_day: number; color_hex: string | null }, id?: string) {
    const supabase = createClient()
    if (id) {
      const { error } = await supabase.from('credit_cards').update(data).eq('card_id', id)
      if (error) return error
    } else {
      const { error } = await supabase.from('credit_cards').insert({ entity_id: entityId, ...data })
      if (error) return error
    }
    await fetchAll()
  }

  async function toggleCard(card: CreditCardItem) {
    const supabase = createClient()
    await supabase.from('credit_cards').update({ is_active: !card.is_active }).eq('card_id', card.card_id)
    await fetchAll()
  }

  // ── Category CRUD ───────────────────────────────────────────────────────────
  async function saveCategory(data: Partial<Category>, id?: string) {
    const supabase = createClient()
    if (id) {
      const { error } = await supabase.from('categories').update(data).eq('category_id', id)
      if (error) return error
    } else {
      const { error } = await supabase.from('categories').insert({ name: data.name!, type: data.type!, parent_id: data.parent_id ?? null, icon: data.icon ?? null, color_hex: data.color_hex ?? null })
      if (error) return error
    }
    await fetchAll()
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] pb-24">

      {/* ── Header ──────────────────────────────────────── */}
      <header className="sticky top-0 z-10 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-[#1E293B]/50">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center h-14">
            <span className="text-lg font-bold text-[#F8FAFC]">Ajustes</span>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 pt-4 space-y-8">

        {/* ── Entidades ───────────────────────────────── */}
        <section>
          <SectionHeader title="Entidades" />
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-16 bg-[#111827] border border-[#1E293B] rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="space-y-2">
              {entities.map((entity, i) => (
                <motion.div
                  key={entity.entity_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-3.5"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${entity.type === 'PF' ? 'bg-[#22C55E]/15' : 'bg-[#3B82F6]/15'}`}>
                    {entity.type === 'PF'
                      ? <User size={18} className="text-[#22C55E]" />
                      : <Building2 size={18} className="text-[#3B82F6]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#F8FAFC] truncate">{entity.name}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${entity.type === 'PF' ? 'bg-[#22C55E]/15 text-[#22C55E]' : 'bg-[#3B82F6]/15 text-[#3B82F6]'}`}>
                        {entity.type}
                      </span>
                    </div>
                    {entity.tax_id && (
                      <p className="text-xs text-[#475569]">{entity.tax_id}</p>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-[#475569] shrink-0" />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Contas ──────────────────────────────────── */}
        <section>
          <SectionHeader title="Contas" onAdd={() => { setEditingAccount(null); setAccountSheet(true) }} />
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-16 bg-[#111827] border border-[#1E293B] rounded-xl animate-pulse" />)}
            </div>
          ) : accounts.length === 0 ? (
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-[#475569] mb-3">Nenhuma conta cadastrada</p>
              <button onClick={() => { setEditingAccount(null); setAccountSheet(true) }}
                className="text-xs text-[#14A085] font-semibold hover:text-[#0D7377] transition-colors">
                + Adicionar conta
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {accounts.map((acc, i) => (
                <motion.div key={acc.account_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <AccountRow
                    account={acc}
                    onEdit={a => { setEditingAccount(a); setAccountSheet(true) }}
                    onToggle={toggleAccount}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Cartões ─────────────────────────────────── */}
        <section>
          <SectionHeader title="Cartões de crédito" onAdd={() => { setEditingCard(null); setCardSheet(true) }} />
          {loading ? (
            <div className="space-y-2">
              {[1].map(i => <div key={i} className="h-16 bg-[#111827] border border-[#1E293B] rounded-xl animate-pulse" />)}
            </div>
          ) : cards.length === 0 ? (
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl px-4 py-6 text-center">
              <p className="text-sm text-[#475569] mb-3">Nenhum cartão cadastrado</p>
              <button onClick={() => { setEditingCard(null); setCardSheet(true) }}
                className="text-xs text-[#14A085] font-semibold hover:text-[#0D7377] transition-colors">
                + Adicionar cartão
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {cards.map((card, i) => (
                <motion.div key={card.card_id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <CardRow
                    card={card}
                    onEdit={c => { setEditingCard(c); setCardSheet(true) }}
                    onToggle={toggleCard}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Categorias ──────────────────────────────── */}
        <section>
          <SectionHeader title="Categorias" onAdd={() => { setEditingCategory(null); setCategoryParentId(undefined); setCategorySheet(true) }} />
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-[#111827] border border-[#1E293B] rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <CategoryList
              categories={categories}
              onAdd={parentId => { setEditingCategory(null); setCategoryParentId(parentId); setCategorySheet(true) }}
              onEdit={cat => { setEditingCategory(cat); setCategorySheet(true) }}
            />
          )}
        </section>

      </main>

      {/* ── Sheets ──────────────────────────────────────── */}
      <AddAccountSheet
        open={accountSheet}
        onClose={() => setAccountSheet(false)}
        editing={editingAccount}
        onSave={saveAccount}
      />
      <AddCardSheet
        open={cardSheet}
        onClose={() => setCardSheet(false)}
        editing={editingCard}
        onSave={saveCard}
      />
      <AddCategorySheet
        open={categorySheet}
        onClose={() => setCategorySheet(false)}
        editing={editingCategory}
        parentId={categoryParentId}
        categories={categories}
        onSave={saveCategory}
      />

      <BottomNav />
    </div>
  )
}
