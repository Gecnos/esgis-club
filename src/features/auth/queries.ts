import { env, useMocks } from '../../lib/env.ts'
import { supabase } from '../../lib/supabase.ts'
import { DEMO_SESSION_KEY, demoAccounts } from './mocks.ts'
import type { AuthUser, Role } from './types.ts'

type ProfileRow = { full_name: string | null; role: Role; club_slug: string | null }

function readDemoUser(): AuthUser | null {
  // Le mode démo n'existe qu'en développement : jamais en production.
  if (!env.isDev) return null
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY)
    if (!raw) return null
    const account = demoAccounts.find((a) => a.id === raw)
    if (!account) return null
    const { password: _password, ...user } = account
    return user
  } catch {
    return null
  }
}

/** Utilisateur connecté (session Supabase + ligne `profiles`), ou `null`. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (useMocks || !supabase) return readDemoUser()

  const { data: sessionData } = await supabase.auth.getSession()
  const authUser = sessionData.session?.user
  if (!authUser) return null

  const { data } = await supabase
    .from('profiles')
    .select('full_name, role, club_slug')
    .eq('id', authUser.id)
    .maybeSingle<ProfileRow>()
  if (!data) return null

  return {
    id: authUser.id,
    email: authUser.email ?? '',
    name: data.full_name ?? authUser.email ?? '',
    role: data.role,
    clubSlug: data.club_slug,
  }
}

/** Écoute les changements de session (connexion, déconnexion, expiration). Renvoie la fonction de désabonnement. */
export function onAuthChange(callback: () => void): () => void {
  if (!supabase) return () => {}
  const { data } = supabase.auth.onAuthStateChange(() => callback())
  return () => data.subscription.unsubscribe()
}
