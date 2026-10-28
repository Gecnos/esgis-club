import { useMocks } from '../../lib/env.ts'
import { supabase } from '../../lib/supabase.ts'
import { demoAccounts } from '../auth/mocks.ts'
import type { Account } from './types.ts'

// En mode démo, la liste vit en mémoire le temps de la session.
export const demoStore: Account[] = demoAccounts.map(({ id, email, name, role, clubSlug }) => ({
  id,
  email,
  name,
  role,
  clubSlug,
  createdAt: '2026-09-01T08:00:00Z',
}))

/** Appelle la fonction `admin-users` (réservée au Comité) et renvoie sa réponse. */
export async function callAdminUsers<T>(body: Record<string, unknown>): Promise<T> {
  if (!supabase) throw new Error('Supabase non configuré')
  const { data, error } = await supabase.functions.invoke<T & { error?: string }>('admin-users', { body })
  if (error) {
    // Le message utile est dans le corps de la réponse d'erreur.
    const detail = await (error as { context?: Response }).context?.json?.().catch(() => null)
    throw new Error(detail?.error ?? 'Le service de comptes est momentanément indisponible.')
  }
  if (!data) throw new Error('Réponse vide du service de comptes.')
  if (data.error) throw new Error(data.error)
  return data
}

export async function listAccounts(): Promise<Account[]> {
  if (useMocks) return [...demoStore]
  const { accounts } = await callAdminUsers<{ accounts: Account[] }>({ action: 'list' })
  return accounts.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}
