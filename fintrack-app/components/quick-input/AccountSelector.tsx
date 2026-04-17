'use client'

import { useState, useEffect } from 'react'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { formatCurrency, cn } from '@/lib/utils'
import { Building2, CreditCard } from 'lucide-react'

export interface Account {
  account_id: string
  name: string
  type: string
  current_balance: number | null
}

export interface CreditCardOption {
  card_id: string
  name: string
  bank: string | null
  limit_total: number | null
}

interface AccountSelectorProps {
  open: boolean
  onClose: () => void
  label?: string
  accounts: Account[]
  cards?: CreditCardOption[]
  selectedAccount: string | null
  selectedCard: string | null
  onSelectAccount: (id: string) => void
  onSelectCard: (id: string) => void
  showCards?: boolean
}

type Tab = 'conta' | 'cartao'

export function AccountSelector({
  open, onClose, label = 'Conta',
  accounts, cards = [],
  selectedAccount, selectedCard,
  onSelectAccount, onSelectCard,
  showCards = false,
}: AccountSelectorProps) {
  const [activeTab, setActiveTab] = useState<Tab>(selectedCard ? 'cartao' : 'conta')

  // Sync tab when sheet opens or selection changes from outside
  useEffect(() => {
    if (open) setActiveTab(selectedCard ? 'cartao' : 'conta')
  }, [open, selectedCard])

  return (
    <BottomSheet open={open} onClose={onClose} title={label}>
      <div className="px-4 pt-2 pb-4">
        {showCards && cards.length > 0 && (
          <div className="flex gap-1 bg-[#0A0F1E] rounded-lg p-1 mb-4">
            {(['conta', 'cartao'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  'flex-1 rounded-md py-2 text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5',
                  activeTab === t
                    ? 'bg-[#111827] text-[#F8FAFC] shadow'
                    : 'text-[#475569] hover:text-[#94A3B8]'
                )}
              >
                {t === 'conta' ? <Building2 size={12} /> : <CreditCard size={12} />}
                {t === 'conta' ? 'Conta' : 'Cartão'}
              </button>
            ))}
          </div>
        )}

        {/* Accounts list */}
        {(!showCards || activeTab === 'conta') && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {accounts.map((acc) => (
              <button
                key={acc.account_id}
                onClick={() => { onSelectAccount(acc.account_id); onClose() }}
                className={cn(
                  'w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200',
                  selectedAccount === acc.account_id
                    ? 'bg-[#14A085]/10 border-[#14A085]/30 text-[#14A085]'
                    : 'bg-[#1C2537] border-[#1E293B] text-[#F8FAFC] hover:border-[#1C3A50]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selectedAccount === acc.account_id ? 'bg-[#14A085]/20' : 'bg-[#111827]'
                  )}>
                    <Building2 size={14} className={selectedAccount === acc.account_id ? 'text-[#14A085]' : 'text-[#94A3B8]'} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{acc.name}</p>
                    <p className="text-xs text-[#475569]">{acc.type}</p>
                  </div>
                </div>
                {acc.current_balance !== null && (
                  <span className="text-xs font-semibold tabular-nums text-[#94A3B8]">
                    {formatCurrency(acc.current_balance)}
                  </span>
                )}
              </button>
            ))}
            {accounts.length === 0 && (
              <p className="text-sm text-[#475569] text-center py-6">
                Nenhuma conta cadastrada
              </p>
            )}
          </div>
        )}

        {/* Cards list */}
        {showCards && activeTab === 'cartao' && (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {cards.map((card) => (
              <button
                key={card.card_id}
                onClick={() => { onSelectCard(card.card_id); onClose() }}
                className={cn(
                  'w-full flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200',
                  selectedCard === card.card_id
                    ? 'bg-[#14A085]/10 border-[#14A085]/30 text-[#14A085]'
                    : 'bg-[#1C2537] border-[#1E293B] text-[#F8FAFC] hover:border-[#1C3A50]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selectedCard === card.card_id ? 'bg-[#14A085]/20' : 'bg-[#111827]'
                  )}>
                    <CreditCard size={14} className={selectedCard === card.card_id ? 'text-[#14A085]' : 'text-[#94A3B8]'} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">{card.name}</p>
                    <p className="text-xs text-[#475569]">{card.bank ?? '—'}</p>
                  </div>
                </div>
                {card.limit_total !== null && (
                  <span className="text-xs font-semibold tabular-nums text-[#94A3B8]">
                    Lim. {formatCurrency(card.limit_total)}
                  </span>
                )}
              </button>
            ))}
            {cards.length === 0 && (
              <p className="text-sm text-[#475569] text-center py-6">
                Nenhum cartão cadastrado
              </p>
            )}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
