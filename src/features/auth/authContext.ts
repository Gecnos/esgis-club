import { createContext, useContext } from 'react'
import type { LoginValues } from './schemas.ts'
import type { AuthUser } from './types.ts'

export type AuthContextValue = {
  user: AuthUser | null
  /** `true` tant que la session initiale n'est pas résolue. */
  loading: boolean
  login: (values: LoginValues) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return ctx
}
