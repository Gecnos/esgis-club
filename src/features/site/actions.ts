import { supabase } from '../../lib/supabase.ts'
import { uploadImage } from '../../lib/storage.ts'
import { demoHero } from './queries.ts'
import type { HeroPhotos } from './types.ts'

export async function uploadSitePhoto(file: File): Promise<string> {
  return (await uploadImage(file, 'site/accueil')).key
}

export async function saveHeroPhotos(photos: HeroPhotos): Promise<void> {
  if (!supabase) {
    demoHero.splice(0, demoHero.length, ...photos)
    return
  }
  const { error } = await supabase.from('site_settings').upsert({ key: 'hero_photos', value: photos })
  if (error) throw new Error(error.message)
}
