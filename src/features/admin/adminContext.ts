import { createContext, useContext } from 'react'
import type { AdminState } from './types.ts'

export type AdminContextValue = {
  state: AdminState
  /** Applique une transition d'état (voir `actions.ts`). */
  apply: (transition: (s: AdminState) => AdminState) => void
}

export const AdminContext = createContext<AdminContextValue | null>(null)

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin doit être utilisé dans <AdminProvider>')
  return ctx
}
