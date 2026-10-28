import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from '../../auth/authContext.ts'
import { dismissToast } from '../actions.ts'
import { AdminContext } from '../adminContext.ts'
import { loadAdminState } from '../queries.ts'
import type { AdminState } from '../types.ts'

export default function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [state, setState] = useState<AdminState | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!user) return
    let active = true
    loadAdminState(user)
      .then((s) => active && setState(s))
      .catch((e: unknown) => active && setLoadError(e instanceof Error ? e.message : 'Chargement impossible.'))
    return () => {
      active = false
    }
  }, [user])

  const apply = useCallback((transition: (s: AdminState) => AdminState) => {
    setState((s) => (s ? transition(s) : s))
  }, [])

  const toast = state?.toast
  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setState((s) => (s ? dismissToast(s) : s)), 5000)
    return () => clearTimeout(id)
  }, [toast])

  const value = useMemo(() => (state ? { state, apply } : null), [state, apply])

  if (loadError) {
    return (
      <div role="alert" className="flex min-h-screen flex-col items-center justify-center gap-3 bg-soft p-6 text-center text-navy">
        <h1 className="m-0 text-2xl font-semibold">Impossible de charger l'espace admin</h1>
        <p className="m-0 text-muted">{loadError}</p>
      </div>
    )
  }
  if (!value) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-soft text-muted">
        Chargement…
      </div>
    )
  }
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}
