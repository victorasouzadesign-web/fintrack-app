'use client'

import { useState } from 'react'
import { Loader2, ShoppingBag, Wallet, TrendingUp } from 'lucide-react'
import { type PurchaseInput } from '@/hooks/usePurchaseDecision'

interface PurchaseFormProps {
  onAnalyze: (input: PurchaseInput) => void
  analyzing: boolean
}

export function PurchaseForm({ onAnalyze, analyzing }: PurchaseFormProps) {
  const [itemName, setItemName] = useState('')
  const [costStr, setCostStr] = useState('')
  const [incomeStr, setIncomeStr] = useState('')
  const [rateStr, setRateStr] = useState('7')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const errs: Record<string, string> = {}
    if (!itemName.trim()) errs.name = 'Informe o nome do item.'
    const cost = parseFloat(costStr.replace(',', '.'))
    if (!cost || cost <= 0) errs.cost = 'Informe um valor válido.'
    const income = parseFloat(incomeStr.replace(',', '.'))
    if (!income || income <= 0) errs.income = 'Informe sua renda disponível.'
    const rate = parseFloat(rateStr.replace(',', '.'))
    if (isNaN(rate) || rate < 0 || rate > 100) errs.rate = 'Taxa inválida (0–100).'
    return errs
  }

  function handleSubmit() {
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onAnalyze({
      item_name: itemName.trim(),
      item_cost: parseFloat(costStr.replace(',', '.')),
      available_monthly_income: parseFloat(incomeStr.replace(',', '.')),
      annual_return_rate: parseFloat(rateStr.replace(',', '.')) / 100,
    })
  }

  return (
    <div className="bg-[#111827] border border-[#1E293B] rounded-2xl p-5 space-y-5">
      {/* Item name */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] mb-2">
          <ShoppingBag size={12} />
          Nome do item
        </label>
        <input
          type="text"
          value={itemName}
          onChange={e => setItemName(e.target.value)}
          placeholder="MacBook Pro 14"
          className="w-full bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#475569] outline-none focus:border-[#14A085] transition-colors duration-200"
        />
        {errors.name && <p className="text-[11px] text-[#EF4444] mt-1">{errors.name}</p>}
      </div>

      {/* Item cost */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] mb-2">
          Quanto custa?
        </label>
        <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
          <span className="text-sm text-[#475569] mr-2 shrink-0">R$</span>
          <input
            type="number"
            inputMode="decimal"
            value={costStr}
            onChange={e => setCostStr(e.target.value)}
            placeholder="0,00"
            className="flex-1 bg-transparent text-3xl font-bold text-[#F8FAFC] placeholder:text-[#1E293B] outline-none tabular-nums"
          />
        </div>
        {errors.cost && <p className="text-[11px] text-[#EF4444] mt-1">{errors.cost}</p>}
      </div>

      {/* Monthly income */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] mb-2">
          <Wallet size={12} />
          Sua renda disponível/mês
        </label>
        <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
          <span className="text-sm text-[#475569] mr-2 shrink-0">R$</span>
          <input
            type="number"
            inputMode="decimal"
            value={incomeStr}
            onChange={e => setIncomeStr(e.target.value)}
            placeholder="0,00"
            className="flex-1 bg-transparent text-sm font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
          />
        </div>
        <p className="text-[11px] text-[#475569] mt-1">
          Quanto sobra por mês após gastos fixos
        </p>
        {errors.income && <p className="text-[11px] text-[#EF4444] mt-1">{errors.income}</p>}
      </div>

      {/* Annual rate */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#94A3B8] mb-2">
          <TrendingUp size={12} />
          Taxa de retorno anual (%)
        </label>
        <div className="flex items-center bg-[#1C2537] border border-[#1E293B] rounded-xl px-4 py-3 focus-within:border-[#14A085] transition-colors duration-200">
          <input
            type="number"
            inputMode="decimal"
            value={rateStr}
            onChange={e => setRateStr(e.target.value)}
            placeholder="7"
            className="flex-1 bg-transparent text-sm font-semibold text-[#F8FAFC] placeholder:text-[#475569] outline-none tabular-nums"
          />
          <span className="text-sm text-[#475569] ml-2 shrink-0">% a.a.</span>
        </div>
        <p className="text-[11px] text-[#475569] mt-1">Ex: Tesouro IPCA+, CDB</p>
        {errors.rate && <p className="text-[11px] text-[#EF4444] mt-1">{errors.rate}</p>}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={analyzing}
        className="w-full bg-[#14A085] hover:bg-[#0D7377] rounded-xl py-4 text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {analyzing ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Analisando...
          </>
        ) : (
          'Analisar'
        )}
      </button>
    </div>
  )
}
