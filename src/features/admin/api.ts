import { supabase } from '../../lib/supabase.ts'
import type { ClubDraft, Dossier, Photo } from './types.ts'

// Écritures de l'espace admin. Sans Supabase (mode démo), elles ne font rien : l'état en mémoire
// (`actions.ts`) suffit. Avec Supabase, les politiques RLS de `supabase/schema.sql` décident qui peut écrire quoi.

const pad = (n: number) => String(n).padStart(2, '0')

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message)
}

/** `+229 01 96 11 22 33` → `2290196112233`. */
function toWhatsappDigits(field: string): string {
  const digits = field.replace(/\D/g, '')
  return `229${digits.startsWith('229') ? digits.slice(3) : digits}`
}

/** Enregistre la fiche du club (identité, présentation, bureau, activité phare). Non atomique : le bureau est réécrit. */
export async function saveClub(slug: string, draft: ClubDraft, authorName: string, logText: string, logIcon: string) {
  if (!supabase) return

  const clubUpdate = await supabase
    .from('clubs')
    .update({
      schedule: draft.horaire,
      long_description: draft.description,
      goal: draft.but,
      objectives: draft.objectifs.filter((o) => o.trim()),
      whatsapp: toWhatsappDigits(draft.wa),
      socials: draft.socials,
      logo_key: draft.logoKey,
    })
    .eq('slug', slug)
  check(clubUpdate.error)

  const removed = await supabase.from('club_bureau').delete().eq('club_slug', slug)
  check(removed.error)
  if (draft.bureau.length > 0) {
    const inserted = await supabase.from('club_bureau').insert(
      draft.bureau.map((m, i) => ({
        club_slug: slug,
        role: m.role,
        name: m.name,
        filiere: m.filiere,
        photo_key: m.photoKey,
        fixed: m.fixed,
        position: i,
      })),
    )
    check(inserted.error)
  }

  const p = draft.phare
  const featured = await supabase.from('featured_activities').upsert({
    club_slug: slug,
    title: p.titre,
    start_time: p.debut || '12:00',
    end_time: p.fin || '17:00',
    place: p.lieu,
    description: p.desc,
    visual_key: p.visuelKey,
    program: p.programme.filter((s) => s.h || s.l).map((s) => ({ time: s.h, label: s.l })),
  })
  check(featured.error)

  const log = await supabase.from('club_log').insert({ club_slug: slug, icon: logIcon, text: logText, who: authorName })
  check(log.error)
}

/** Ajoute des photos à la galerie et renvoie les lignes créées (avec leur identifiant). */
export async function addPhotos(
  slug: string,
  items: { label: string; key: string; ratio: number }[],
  firstPosition: number,
): Promise<Photo[]> {
  if (!supabase) {
    const base = Date.now()
    return items.map((it, i) => ({ id: base + i, label: it.label, key: it.key, ratio: it.ratio }))
  }
  const { data, error } = await supabase
    .from('club_photos')
    .insert(items.map((it, i) => ({ club_slug: slug, label: it.label, key: it.key, ratio: it.ratio, position: firstPosition + i })))
    .select('id, label, key, ratio')
  check(error)
  return (data ?? []).map((r) => ({ id: r.id as number, label: r.label as string, key: r.key as string, ratio: Number(r.ratio) || 1 }))
}

export async function updatePhotoLabel(id: number, label: string) {
  if (!supabase) return
  check((await supabase.from('club_photos').update({ label }).eq('id', id)).error)
}

export async function setCoverPhoto(slug: string, photoId: number) {
  if (!supabase) return
  check((await supabase.from('clubs').update({ cover_photo_id: photoId }).eq('slug', slug)).error)
}

export async function deletePhoto(id: number) {
  if (!supabase) return
  check((await supabase.from('club_photos').delete().eq('id', id)).error)
}

/** Annulation d'une suppression : réinsère les photos retirées avec leur identifiant d'origine. */
export async function restorePhotos(slug: string, photos: Photo[], cover: number) {
  if (!supabase) return
  const rows = photos.map((p, i) => ({ id: p.id, club_slug: slug, label: p.label, key: p.key ?? '', ratio: p.ratio, position: i }))
  check((await supabase.from('club_photos').upsert(rows)).error)
  check((await supabase.from('clubs').update({ cover_photo_id: cover || null }).eq('slug', slug)).error)
}

type DossierPatch = Partial<Pick<Dossier, 'statut' | 'soutenance' | 'decisionDate' | 'motif'>>

export async function updateDossier(id: number, patch: DossierPatch) {
  if (!supabase) return
  const row: Record<string, unknown> = {}
  if (patch.statut) row.status = patch.statut
  if (patch.soutenance) row.defense_at = new Date(patch.soutenance).toISOString()
  if (patch.decisionDate) row.decided_at = patch.decisionDate.toISOString()
  if (patch.motif !== undefined) row.motif = patch.motif
  check((await supabase.from('dossiers').update(row).eq('id', id)).error)
}

/** Programme (ou libère) le club d'un mois. `monthKey` vaut `année-mois` avec le mois de 0 à 11. */
export async function setPlanningMonth(monthKey: string, slug: string) {
  if (!supabase) return
  const [y, m] = monthKey.split('-').map(Number)
  const month = `${y}-${pad((m ?? 0) + 1)}-01`
  if (!slug) return check((await supabase.from('planning').delete().eq('month', month)).error)
  const vacation = slug === '__vac'
  check((await supabase.from('planning').upsert({ month, club_slug: vacation ? null : slug, vacation })).error)
}
