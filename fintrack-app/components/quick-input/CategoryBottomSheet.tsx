'use client'

import { BottomSheet } from '@/components/ui/BottomSheet'

export interface Category {
  category_id: string
  name: string
  icon: string | null
  color_hex: string | null
}

interface CategoryBottomSheetProps {
  open: boolean
  onClose: () => void
  categories: Category[]
  selected: string | null
  onSelect: (id: string) => void
}

export function CategoryBottomSheet({
  open, onClose, categories, selected, onSelect,
}: CategoryBottomSheetProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Categoria">
      <div className="px-4 pt-3 pb-4 max-h-[60vh] overflow-y-auto">
        {categories.length === 0 ? (
          <p className="text-sm text-[#475569] text-center py-8">
            Nenhuma categoria disponível
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {categories.map((cat) => {
              const bg = cat.color_hex ? `${cat.color_hex}26` : '#14A08526'
              const color = cat.color_hex ?? '#14A085'
              const isSelected = selected === cat.category_id

              return (
                <button
                  key={cat.category_id}
                  onClick={() => { onSelect(cat.category_id); onClose() }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-[#14A085]' : ''
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: isSelected ? `${color}40` : bg, color }}
                  >
                    {cat.icon ?? '📦'}
                  </div>
                  <span className="text-[10px] text-[#94A3B8] text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </BottomSheet>
  )
}
