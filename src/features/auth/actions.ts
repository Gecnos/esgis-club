import { env, useMocks } from '../../lib/env.ts'
import { supabase } from '../../lib/supabase.ts'
import { DEMO_SESSION_KEY, demoAccounts } from './mocks.ts'
import { getCurrentUser } from './queries.ts'
import type { AuthUser } from './types.ts'
import type { LoginValues } from './schemas.ts'

const INVALID = 'Email ou mot de passe incorrect.'

/** Connecte l'utilisateur et renvoie son profil. Lève une `Error` au message affichable. */
export async function signIn({ email, password }: LoginValues): Promise<AuthUser> {
  if (useMocks || !supabase) {
    if (!env.isDev) throw new Error('La connexion est momentanément indisponible.')
    const account = demoAccounts.find((a) => a.email === email.trim().toLowerCase() && a.password === password)
    if (!account) throw new Error(INVALID)
    sessionStorage.setItem(DEMO_SESSION_KEY, account.id)
    const user = await getCurrentUser()
    if (!user) throw new Error(INVALID)
    return user
  }

  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw new Error(INVALID)

  const user = await getCurrentUser()
  if (!user) {
    await supabase.auth.signOut()
    throw new Error("Ce compte n'a pas encore d'accès à l'espace admin. Contacte le Comité.")
  }
  return user
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
  sessionStorage.removeItem(DEMO_SESSION_KEY)
}

/** Envoie un email de réinitialisation du mot de passe (sans révéler si le compte existe). */
export async function requestPasswordReset(email: string): Promise<void> {
  if (!supabase) return
  await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/connexion` })
}
