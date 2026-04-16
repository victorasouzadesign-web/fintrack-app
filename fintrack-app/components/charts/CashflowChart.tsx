'use client'

import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts'
import type { CashflowPoint } from '@/hooks/useProjection'

function formatY(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
  label?: string
}) {
  if (!active || !payload?.length) return null

  const income = payload.find(p => p.name === 'income')
  const expenses = payload.find(p => p.name === 'expenses')
  const net = payload.find(p => p.name === 'net')

  return (
    <div className="bg-[#1C2537] border border-[#14A085]/30 rounded-xl p-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)] min-w-[160px]">
      <p className="text-xs font-semibold text-[#94A3B8] mb-2 capitalize">{label}</p>
      {income && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-xs text-[#475569]">Receitas</span>
          <span className="text-xs font-semibold text-[#22C55E] tabular-nums">
            +{formatY(income.value)}
          </span>
        </div>
      )}
      {expenses && (
        <div className="flex justify-between gap-4 mb-1">
          <span className="text-xs text-[#475569]">Despesas</span>
          <span className="text-xs font-semibold text-[#EF4444] tabular-nums">
            -{formatY(expenses.value)}
          </span>
        </div>
      )}
      {net && (
        <div className="flex justify-between gap-4 pt-1.5 border-t border-[#1E293B]">
          <span className="text-xs text-[#94A3B8]">Saldo líquido</span>
          <span className={`text-xs font-bold tabular-nums ${net.value >= 0 ? 'text-[#14A085]' : 'text-[#EF4444]'}`}>
            {net.value >= 0 ? '+' : ''}{formatY(net.value)}
          </span>
        </div>
      )}
    </div>
  )
}

export function CashflowChart({ data }: { data: CashflowPoint[] }) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <ComposedChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#1E293B" strokeOpacity={0.6} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 10, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatY}
          tick={{ fontSize: 10, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={0} stroke="#1E293B" strokeWidth={1.5} />
        <Bar dataKey="income" name="income" fill="#22C55E" fillOpacity={0.7}
          radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Bar dataKey="expenses" name="expenses" fill="#EF4444" fillOpacity={0.7}
          radius={[4, 4, 0, 0]} maxBarSize={20} />
        <Line type="monotone" dataKey="net" name="net"
          stroke="#14A085" strokeWidth={2.5} dot={false}
          activeDot={{ r: 4, fill: '#14A085', strokeWidth: 0 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
