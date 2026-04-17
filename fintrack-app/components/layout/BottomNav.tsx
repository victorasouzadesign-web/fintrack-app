'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ArrowLeftRight, Plus, TrendingUp, Settings, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/dashboard/transactions', icon: ArrowLeftRight, label: 'Transações' },
  { href: '/dashboard/quick-input', icon: Plus, label: '', isCenter: true },
  { href: '/dashboard/recurrences', icon: Repeat, label: 'Fixos' },
  { href: '/dashboard/projection', icon: TrendingUp, label: 'Projeção' },
  { href: '/dashboard/settings', icon: Settings, label: 'Ajustes' },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div
        className="w-full max-w-md bg-[#111827]/90 backdrop-blur-md border-t border-[#1E293B]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            if (item.isCenter) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-center w-12 h-12 bg-[#14A085] rounded-full -mt-6 shadow-[0_0_20px_rgba(20,160,133,0.4)] hover:bg-[#0D7377] transition-all duration-200 active:scale-95"
                  aria-label="Quick Input"
                >
                  <Icon size={22} className="text-white" />
                </Link>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 px-3 py-1 min-w-[48px]"
              >
                <Icon
                  size={20}
                  className={cn(
                    'transition-colors duration-200',
                    isActive ? 'text-[#14A085]' : 'text-[#475569]'
                  )}
                />
                {item.label && (
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors duration-200',
                      isActive ? 'text-[#14A085]' : 'text-[#475569]'
                    )}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
