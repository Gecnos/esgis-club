import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { signIn, signOut } from '../actions.ts'
import { AuthContext } from '../authContext.ts'
import { getCurrentUser, onAuthChange } from '../queries.ts'
import type { LoginValues } from '../schemas.ts'
import type { AuthUser } from '../types.ts'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const refresh = () =>
      getCurrentUser()
        .then((u) => active && setUser(u))
        .catch(() => active && setUser(null))
        .finally(() => active && setLoading(false))
    void refresh()
    const unsubscribe = onAuthChange(() => void refresh())
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const login = useCallback(async (values: LoginValues) => {
    const u = await signIn(values)
    setUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
