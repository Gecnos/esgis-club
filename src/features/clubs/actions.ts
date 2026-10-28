import { useMocks } from '../../lib/env.ts'
import { supabase } from '../../lib/supabase.ts'
import { uploadImage } from '../../lib/storage.ts'
import { clubs } from './data.ts'
import { slugify } from './schemas.ts'
import type { ClubFormValues } from './schemas.ts'
import type { Club } from './types.ts'

// Postes obligatoires du bureau, créés vides avec chaque nouveau club (le responsable les remplit).
const FIXED_ROLES = ['Président', 'Secrétaire', 'Trésorier', 'Communication']

function check(error: { message: string; code?: string } | null) {
  if (!error) return
  if (error.code === '23505') throw new Error('Un club porte déjà ce nom.')
  throw new Error(error.message)
}

/** Ajoute un club. Le slug (adresse de sa page) est déduit du nom. */
export async function createClub(values: ClubFormValues, photoKey: string | null, slug = slugify(values.name)): Promise<Club> {
  if (!slug) throw new Error('Ce nom ne permet pas de créer une adresse de page.')
  const club: Club = {
    slug,
    name: values.name.trim(),
    category: values.category,
    description: values.description.trim(),
    members: values.members,
    founded: new Date().getFullYear(),
    photoLabel: values.name.trim(),
    photoKey,
  }

  if (useMocks || !supabase) {
    if (clubs.some((c) => c.slug === slug)) throw new Error('Un club porte déjà ce nom.')
    clubs.push(club)
    return club
  }

  check(
    (
      await supabase.from('clubs').insert({
        slug,
        name: club.name,
        category: club.category,
        description: club.description,
        members: club.members,
        founded: club.founded,
        photo_key: photoKey,
      })
    ).error,
  )
  const bureau = await supabase
    .from('club_bureau')
    .insert(FIXED_ROLES.map((role, position) => ({ club_slug: slug, role, name: '', filiere: '', fixed: true, position })))
  if (bureau.error) {
    await supabase.from('clubs').delete().eq('slug', slug) // pas de club sans bureau
    check(bureau.error)
  }
  return club
}

/** Modifie la présentation d'un club (carte de la page d'accueil). Le slug ne change jamais. */
export async function updateClub(slug: string, values: ClubFormValues, photoKey: string | null): Promise<Club> {
  const updated: Club = {
    slug,
    name: values.name.trim(),
    category: values.category,
    description: values.description.trim(),
    members: values.members,
    founded: clubs.find((c) => c.slug === slug)?.founded ?? new Date().getFullYear(),
    photoLabel: values.name.trim(),
    photoKey,
  }

  if (useMocks || !supabase) {
    const i = clubs.findIndex((c) => c.slug === slug)
    if (i >= 0) clubs[i] = { ...clubs[i]!, ...updated }
    return updated
  }

  const { data, error } = await supabase
    .from('clubs')
    .update({ name: updated.name, category: updated.category, description: updated.description, members: updated.members, photo_key: photoKey })
    .eq('slug', slug)
    .select('founded')
    .single<{ founded: number }>()
  check(error)
  return { ...updated, founded: data?.founded ?? updated.founded }
}

/** Envoie la photo de la carte d'un club vers R2 et renvoie sa clé. */
export async function uploadClubPhoto(slug: string, file: File): Promise<string> {
  return (await uploadImage(file, `clubs/${slug}/cover`)).key
}
