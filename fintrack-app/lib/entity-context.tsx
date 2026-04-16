'use client'

import { createContext, useContext, useState } from 'react'
import type { EntityFilter } from '@/components/layout/EntityToggle'

export interface EntityContextValue {
  entityFilter: EntityFilter
  setEntityFilter: (f: EntityFilter) => void
  /** Resolved Supabase entity_id based on current filter */
  entityId: string
  /** All known entity IDs for 'Tudo' queries */
  allEntityIds: string[]
}

const EntityContext = createContext<EntityContextValue | null>(null)

/** UUIDs reais do seed no Supabase
 *  PF  = Lucas Ferreira        → 00000000-0000-0000-0000-000000000001
 *  PJ  = LF Consultoria LTDA   → 00000000-0000-0000-0000-000000000002
 */
const ENTITY_MAP: Record<Exclude<EntityFilter, 'Tudo'>, string> = {
  PF: '00000000-0000-0000-0000-000000000001',
  PJ: '00000000-0000-0000-0000-000000000002',
}
const ALL_IDS = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
]

export function EntityProvider({ children }: { children: React.ReactNode }) {
  const [entityFilter, setEntityFilter] = useState<EntityFilter>('Tudo')

  const entityId = entityFilter === 'Tudo' ? 'ENT-001' : ENTITY_MAP[entityFilter]

  return (
    <EntityContext.Provider value={{ entityFilter, setEntityFilter, entityId, allEntityIds: ALL_IDS }}>
      {children}
    </EntityContext.Provider>
  )
}

export function useEntity() {
  const ctx = useContext(EntityContext)
  if (!ctx) throw new Error('useEntity must be used inside <EntityProvider>')
  return ctx
}
