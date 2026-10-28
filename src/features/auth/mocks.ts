import type { AuthUser } from './types.ts'

// Comptes de démonstration, utilisés uniquement en développement tant que Supabase n'est pas configuré.
export const demoAccounts: (AuthUser & { password: string })[] = [
  {
    id: 'demo-club',
    email: 'club@esgis.bj',
    password: 'demo1234',
    name: 'Wilfried Ahouandjinou',
    role: 'club',
    clubSlug: 'robotique',
  },
  {
    id: 'demo-comite',
    email: 'comite@esgis.bj',
    password: 'demo1234',
    name: 'Grâce Dossou',
    role: 'comite',
    clubSlug: null,
  },
]

export const DEMO_SESSION_KEY = 'esgis-demo-user'
