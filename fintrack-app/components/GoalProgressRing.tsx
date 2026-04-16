interface GoalProgressRingProps {
  progress: number   // 0–100
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  label?: string
}

export function GoalProgressRing({
  progress,
  size = 40,
  strokeWidth = 4,
  color = '#14A085',
  trackColor = '#1E293B',
  label,
}: GoalProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference
  const center = size / 2

  return (
    <svg width={size} height={size} className="flex-none -rotate-90">
      {/* Track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={trackColor}
        strokeWidth={strokeWidth}
      />
      {/* Progress */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
      {/* Label — counter-rotate so text is upright */}
      {label !== undefined && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size < 48 ? 9 : 11}
          fontWeight="700"
          fill="#F8FAFC"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${center}px ${center}px` }}
        >
          {label}
        </text>
      )}
    </svg>
  )
}
