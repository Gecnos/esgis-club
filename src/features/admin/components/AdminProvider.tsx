import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { dismissToast } from '../actions.ts'
import { AdminContext } from '../adminContext.ts'
import { getInitialState } from '../queries.ts'
import type { AdminState } from '../types.ts'

export default function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>(getInitialState)

  const apply = useCallback((transition: (s: AdminState) => AdminState) => setState(transition), [])

  useEffect(() => {
    if (!state.toast) return
    const id = setTimeout(() => setState(dismissToast), 5000)
    return () => clearTimeout(id)
  }, [state.toast])

  const value = useMemo(() => ({ state, apply }), [state, apply])
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
