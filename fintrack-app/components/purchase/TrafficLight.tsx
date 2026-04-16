import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

type Status = 'ok' | 'moderate' | 'critical'

const CONFIG: Record<Status, {
  Icon: React.ElementType
  color: string
  bg: string
  glow: string
  label: string
}> = {
  ok: {
    Icon: ShieldCheck,
    color: '#22C55E',
    bg: '#22C55E/15',
    glow: 'rgba(34,197,94,0.3)',
    label: 'COMPRA SEGURA',
  },
  moderate: {
    Icon: AlertTriangle,
    color: '#F59E0B',
    bg: '#F59E0B/15',
    glow: 'rgba(245,158,11,0.3)',
    label: 'ATENÇÃO',
  },
  critical: {
    Icon: XCircle,
    color: '#EF4444',
    bg: '#EF4444/15',
    glow: 'rgba(239,68,68,0.3)',
    label: 'CUIDADO',
  },
}

interface TrafficLightProps {
  status: Status
  recommendation: string
}

export function TrafficLight({ status, recommendation }: TrafficLightProps) {
  const { Icon, color, glow, label } = CONFIG[status]

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 200 }}
      className="flex flex-col items-center text-center py-6 px-4"
    >
      {/* Icon bubble */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 260, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{
          backgroundColor: `${color}20`,
          boxShadow: `0 0 40px ${glow}`,
        }}
      >
        <Icon size={40} style={{ color }} strokeWidth={1.5} />
      </motion.div>

      {/* Label */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-black tracking-widest"
        style={{ color }}
      >
        {label}
      </motion.p>

      {/* Recommendation */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-[#94A3B8] mt-2 max-w-[280px] leading-relaxed"
      >
        {recommendation}
      </motion.p>
    </motion.div>
  )
}
