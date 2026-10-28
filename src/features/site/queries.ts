import { supabase } from '../../lib/supabase.ts'
import { HERO_SLOTS } from './types.ts'
import type { HeroPhotos } from './types.ts'

// En mode démo, les photos vivent en mémoire le temps de la session.
export const demoHero: HeroPhotos = Array.from({ length: HERO_SLOTS }, () => null)

export async function getHeroPhotos(): Promise<HeroPhotos> {
  if (!supabase) return [...demoHero]
  const { data, error } = await supabase.from('site_settings').select('value').eq('key', 'hero_photos').maybeSingle<{ value: (string | null)[] }>()
  if (error) throw error
  const stored = data?.value ?? []
  return Array.from({ length: HERO_SLOTS }, (_, i) => stored[i] ?? null)
}
