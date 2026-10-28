import { supabase } from '../../lib/supabase.ts'
import { getClubOfMonth } from '../planning/queries.ts'
import { bureauRoles, clubOverrides, clubs, genericActivities, genericObjectives, memberPool } from './data.ts'
import type { Activity, BureauMember, Category, Club, ClubDetail, FeaturedActivity, GalleryPhoto, Objective } from './types.ts'

// En mode démo (Supabase non configuré), tout vient de `data.ts`. Sinon, les tables décrites dans `supabase/schema.sql`.

type ClubRow = {
  slug: string
  name: string
  category: Category
  description: string
  members: number
  founded: number
  photo_key: string | null
  cover_photo_id: number | null
  logo_key: string | null
  schedule: string | null
  whatsapp: string | null
  long_description: string | null
  goal: string | null
  objectives: string[] | null
}

type BureauRow = { role: string; name: string; photo_key: string | null }
type PhotoRow = { id: number; label: string; key: string; ratio: number }
type ActivityRow = { type: string; title: string; text: string; photo_key: string | null }
type FeaturedRow = {
  title: string
  start_time: string
  end_time: string
  place: string
  description: string
  visual_key: string | null
  program: { time: string; label: string }[] | null
}

const toClub = (r: ClubRow): Club => ({
  slug: r.slug,
  name: r.name,
  category: r.category,
  description: r.description,
  members: r.members,
  founded: r.founded,
  photoLabel: r.name,
  photoKey: r.photo_key,
})

const hour = (t: string) => t.slice(0, 5).replace(':', 'h')

export async function getClubs(): Promise<Club[]> {
  if (!supabase) return clubs
  const { data, error } = await supabase
    .from('clubs')
    .select('slug, name, category, description, members, founded, photo_key')
    .order('name')
  if (error) throw error
  return (data as ClubRow[]).map(toClub)
}

function mockDetail(slug: string, isClubOfMonth: boolean): ClubDetail | undefined {
  const index = clubs.findIndex((c) => c.slug === slug)
  const club = clubs[index]
  if (!club) return undefined

  const o = clubOverrides[slug]
  return {
    ...club,
    cover: o?.cover ?? club.photoLabel,
    schedule: o?.schedule ?? 'Vendredi 12h – 15h',
    whatsapp: o?.whatsapp ?? '2290197000000',
    longDescription:
      o?.longDescription ??
      `Le Club ${club.name} accueille tous les étudiants de l'ESGIS, débutants comme confirmés. ${club.description}`,
    goal: o?.goal ?? `Faire progresser chaque membre et faire rayonner l'ESGIS à travers le club ${club.name}.`,
    isNew: new Date().getFullYear() - club.founded <= 1,
    objectives: o?.objectives ?? genericObjectives[club.category],
    activities:
      o?.activities ??
      genericActivities[club.category].map(([type, title, text]) => ({
        type,
        title,
        text,
        photo: `photo · ${title.toLowerCase()}`,
      })),
    featured: isClubOfMonth ? (o?.featured ?? null) : null,
    bureau:
      o?.bureau ?? bureauRoles.map((role, i) => ({ role, name: memberPool[(index * 3 + i) % memberPool.length]! })),
    photos: o?.photos ?? [],
  }
}

export async function getClub(slug: string): Promise<ClubDetail | undefined> {
  const month = await getClubOfMonth()
  const isClubOfMonth = month?.clubSlug === slug
  if (!supabase) return mockDetail(slug, isClubOfMonth)

  const [clubRes, bureauRes, photosRes, activitiesRes, featuredRes] = await Promise.all([
    supabase.from('clubs').select('*').eq('slug', slug).maybeSingle(),
    supabase.from('club_bureau').select('role, name, photo_key').eq('club_slug', slug).order('position'),
    supabase.from('club_photos').select('id, label, key, ratio').eq('club_slug', slug).order('position'),
    supabase.from('club_activities').select('type, title, text, photo_key').eq('club_slug', slug).order('position'),
    isClubOfMonth
      ? supabase.from('featured_activities').select('*').eq('club_slug', slug).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])
  for (const res of [clubRes, bureauRes, photosRes, activitiesRes, featuredRes]) if (res.error) throw res.error

  const row = clubRes.data as ClubRow | null
  if (!row) return undefined
  const photoRows = (photosRes.data ?? []) as PhotoRow[]
  const cover = photoRows.find((p) => p.id === row.cover_photo_id)
  const activityRows = (activitiesRes.data ?? []) as ActivityRow[]
  const featuredRow = featuredRes.data as FeaturedRow | null

  const objectives: Objective[] = row.objectives?.length
    ? row.objectives.map((text) => ({ icon: 'flag', text }))
    : genericObjectives[row.category]
  const activities: Activity[] = activityRows.length
    ? activityRows.map((a) => ({ type: a.type, title: a.title, text: a.text, photo: `photo · ${a.title.toLowerCase()}`, photoKey: a.photo_key }))
    : genericActivities[row.category].map(([type, title, text]) => ({ type, title, text, photo: `photo · ${title.toLowerCase()}` }))
  const featured: FeaturedActivity | null =
    featuredRow && month
      ? {
          badge: `Club du mois · ${month.monthLabel}`,
          title: featuredRow.title,
          date: month.dateLabel,
          time: `${hour(featuredRow.start_time)} – ${hour(featuredRow.end_time)}`,
          place: featuredRow.place,
          description: featuredRow.description,
          photo: 'photo · visuel de l’activité',
          visualKey: featuredRow.visual_key,
          program: featuredRow.program ?? [],
        }
      : null

  const bureau: BureauMember[] = ((bureauRes.data ?? []) as BureauRow[]).map((b) => ({ role: b.role, name: b.name, photoKey: b.photo_key }))
  const photos: GalleryPhoto[] = photoRows.map((p) => ({ label: p.label, ratio: Number(p.ratio) || 1, key: p.key }))

  return {
    ...toClub(row),
    cover: cover?.label ?? row.name,
    coverKey: cover?.key,
    logoKey: row.logo_key,
    schedule: row.schedule ?? '',
    whatsapp: row.whatsapp ?? '',
    longDescription: row.long_description ?? row.description,
    goal: row.goal ?? '',
    isNew: new Date().getFullYear() - row.founded <= 1,
    objectives,
    activities,
    featured,
    bureau,
    photos,
  }
}

/** Trois autres clubs, ceux de la même catégorie en premier. */
export async function getSimilarClubs(slug: string): Promise<Club[]> {
  const all = await getClubs()
  const current = all.find((c) => c.slug === slug)
  const others = all.filter((c) => c.slug !== slug)
  return [...others.filter((c) => c.category === current?.category), ...others.filter((c) => c.category !== current?.category)].slice(0, 3)
}
