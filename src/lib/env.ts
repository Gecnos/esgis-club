/** Variables d'environnement du front (voir `.env.example`). Toutes sont publiques : ne jamais y mettre de clé secrète. */
export const env = {
  supabaseUrl: (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '',
  supabaseAnonKey: (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '',
  /** Domaine public du bucket R2, sans slash final (ex. https://images.esgis-clubs.bj). */
  r2PublicUrl: ((import.meta.env.VITE_R2_PUBLIC_URL as string | undefined) ?? '').replace(/\/$/, ''),
  isDev: import.meta.env.DEV,
}

/** Tant que Supabase n'est pas configuré, l'app utilise les données de démonstration. */
export const useMocks = !env.supabaseUrl || !env.supabaseAnonKey
