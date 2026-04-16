import { EntityProvider } from '@/lib/entity-context'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <EntityProvider>{children}</EntityProvider>
}
