'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Plus, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface Category {
  category_id: string
  name: string
  type: string
  icon: string | null
  color_hex: string | null
  parent_id: string | null
  is_active: boolean | null
}

interface CategoryListProps {
  categories: Category[]
  onAdd: (parentId?: string) => void
  onEdit: (cat: Category) => void
}

function buildTree(categories: Category[]) {
  const parents = categories.filter(c => !c.parent_id)
  const children = categories.filter(c => c.parent_id)
  return parents.map(p => ({
    ...p,
    children: children.filter(c => c.parent_id === p.category_id),
  }))
}

interface ParentGroupProps {
  parent: Category & { children: Category[] }
  onEdit: (cat: Category) => void
  onAdd: (parentId: string) => void
}

function ParentGroup({ parent, onEdit, onAdd }: ParentGroupProps) {
  const [open, setOpen] = useState(true)
  const color = parent.color_hex ?? '#475569'

  return (
    <div>
      {/* Parent row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(v => !v)}
        onKeyDown={e => e.key === 'Enter' && setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-1 py-2 group cursor-pointer"
      >
        <div
          className="w-1 h-5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-xs font-bold tracking-widest uppercase flex-1 text-left"
          style={{ color }}
        >
          {parent.icon ? `${parent.icon} ` : ''}{parent.name}
        </span>
        <span className="text-[10px] text-[#475569] mr-1">
          {parent.children.length}
        </span>
        {open
          ? <ChevronDown size={13} className="text-[#475569]" />
          : <ChevronRight size={13} className="text-[#475569]" />
        }
        <button
          onClick={e => { e.stopPropagation(); onEdit(parent) }}
          className="opacity-0 group-hover:opacity-100 p-1 text-[#475569] hover:text-[#94A3B8] transition-all"
        >
          <Pencil size={12} />
        </button>
      </div>

      {/* Children */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 space-y-1 pb-1">
              {parent.children.map(child => (
                <div
                  key={child.category_id}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#1C2537]/50 group hover:bg-[#1C2537] transition-colors duration-150"
                >
                  {child.icon ? (
                    <span className="text-base shrink-0">{child.icon}</span>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-md shrink-0"
                      style={{ backgroundColor: (child.color_hex ?? '#475569') + '30' }}
                    />
                  )}
                  <span className="flex-1 text-sm text-[#94A3B8]">{child.name}</span>
                  {!child.is_active && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#475569]/20 text-[#475569]">
                      Inativa
                    </span>
                  )}
                  <button
                    onClick={() => onEdit(child)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#475569] hover:text-[#94A3B8] transition-all"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              ))}

              {/* Add sub-category */}
              <button
                onClick={() => onAdd(parent.category_id)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#475569] hover:text-[#14A085] transition-colors duration-150"
              >
                <Plus size={12} />
                Adicionar subcategoria
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function CategoryList({ categories, onAdd, onEdit }: CategoryListProps) {
  const [tab, setTab] = useState<'expense' | 'income'>('expense')

  const filtered = categories.filter(c => c.type === tab)
  const tree = buildTree(filtered)

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 bg-[#1C2537] rounded-xl p-1 mb-4">
        {(['expense', 'income'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
              tab === t
                ? 'bg-[#111827] text-[#F8FAFC] shadow-sm'
                : 'text-[#475569] hover:text-[#94A3B8]'
            }`}
          >
            {t === 'expense' ? 'Despesa' : 'Receita'}
          </button>
        ))}
      </div>

      {tree.length === 0 ? (
        <p className="text-sm text-[#475569] text-center py-6">
          Nenhuma categoria de {tab === 'expense' ? 'despesa' : 'receita'}.
        </p>
      ) : (
        <div className="space-y-1">
          {tree.map(parent => (
            <ParentGroup
              key={parent.category_id}
              parent={parent}
              onEdit={onEdit}
              onAdd={onAdd}
            />
          ))}
        </div>
      )}
    </div>
  )
}
