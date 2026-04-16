'use client'

import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine, CartesianGrid,
} from 'recharts'
import type { NetWorthPoint } from '@/hooks/useProjection'

interface AreaProjectionChartProps {
  data: NetWorthPoint[]
  milestones?: Array<{ year: number; label: string }>
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return String(value)
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string | number
}) {
  if (!active || !payload?.length) return null

  const nw = payload.find(p => p.name === 'net_worth')
  const assets = payload.find(p => p.name === 'assets')
  const liabilities = payload.find(p => p.name === 'liabilities')

  return (
    <div className="bg-[#1C2537] border border-[#14A085]/30 rounded-xl p-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)] min-w-[160px]">
      <p className="text-xs font-semibold text-[#94A3B8] mb-2">{label}</p>
      {nw && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs text-[#94A3B8]">Patrimônio</span>
          <span className="text-xs font-bold text-[#14A085] tabular-nums">
            {formatYAxis(nw.value)}
          </span>
        </div>
      )}
      {assets && (
        <div className="flex items-center justify-between gap-4 mb-1">
          <span className="text-xs text-[#475569]">Ativos</span>
          <span className="text-xs font-semibold text-[#22C55E] tabular-nums">
            {formatYAxis(assets.value)}
          </span>
        </div>
      )}
      {liabilities && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-[#475569]">Passivos</span>
          <span className="text-xs font-semibold text-[#EF4444] tabular-nums">
            {formatYAxis(liabilities.value)}
          </span>
        </div>
      )}
    </div>
  )
}

function MilestoneLabel({ viewBox, label }: { viewBox?: { x: number; y: number }; label: string }) {
  if (!viewBox) return null
  return (
    <g transform={`translate(${viewBox.x},${viewBox.y})`}>
      <rect x={4} y={4} width={Math.max(80, label.length * 6.5)} height={22} rx={6}
        fill="#1C2537" stroke="rgba(20,160,133,0.3)" strokeWidth={1} />
      <text x={10} y={19} fontSize={9} fill="#14A085" fontWeight="600">{label}</text>
    </g>
  )
}

export function AreaProjectionChart({ data, milestones = [] }: AreaProjectionChartProps) {
  if (!data.length) return null

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="gradMint" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#14A085" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#14A085" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#22C55E" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#EF4444" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid vertical={false} stroke="#1E293B" strokeOpacity={0.6} />

        <XAxis
          dataKey="year"
          tick={{ fontSize: 10, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 10, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
          width={40}
        />

        <Tooltip content={<CustomTooltip />} />

        {milestones.map((m) => (
          <ReferenceLine
            key={m.year}
            x={m.year}
            stroke="#14A085"
            strokeDasharray="4 4"
            strokeOpacity={0.5}
            label={<MilestoneLabel label={m.label} />}
          />
        ))}

        <Area type="monotone" dataKey="liabilities" name="liabilities"
          stroke="#EF4444" strokeWidth={1.5} fill="url(#gradRed)" />
        <Area type="monotone" dataKey="assets" name="assets"
          stroke="#22C55E" strokeWidth={1.5} fill="url(#gradGreen)" />
        <Area type="monotone" dataKey="net_worth" name="net_worth"
          stroke="#14A085" strokeWidth={2.5} fill="url(#gradMint)"
          activeDot={{ r: 5, fill: '#14A085', strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
