import { fmt, lastFridayOf } from '../../lib/dates.ts'
import { supabase } from '../../lib/supabase.ts'
import { capitalize } from '../../lib/text.ts'
import type { Category } from '../clubs/types.ts'
import type { ClubOfMonth } from './types.ts'

type PlanningRow = { club_slug: string | null; vacation: boolean }
type ClubRow = { slug: string; name: string; category: Category; members: number; photo_key: string | null }
type FeaturedRow = { description: string; place: string; start_time: string; end_time: string; visual_key: string | null }

const hour = (t: string) => t.slice(0, 5).replace(':', 'h')
const pad = (n: number) => String(n).padStart(2, '0')

/** Club à l'honneur ce mois-ci, ou `null` si aucun n'est programmé (ou vacances). */
export async function getClubOfMonth(): Promise<ClubOfMonth | null> {
  const now = new Date()
  const friday = lastFridayOf(now.getFullYear(), now.getMonth())
  const monthLabel = capitalize(fmt(friday, { month: 'long' }))
  const dateLabel = capitalize(fmt(friday, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

  if (!supabase) {
    // Données de démonstration.
    return {
      clubSlug: 'robotique',
      clubName: 'Club Robotique',
      category: 'Tech',
      members: 48,
      photoLabel: 'démonstration de robots, Club Robotique',
      description:
        "Démonstration des robots suiveurs de ligne conçus par les membres, puis atelier d'initiation Arduino ouvert à tous les étudiants.",
      timeRange: '12h00 – 17h00',
      location: 'Hall principal, campus ESGIS Cotonou',
      monthLabel,
      dateLabel,
    }
  }

  const month = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`
  const { data: plan, error } = await supabase.from('planning').select('club_slug, vacation').eq('month', month).maybeSingle<PlanningRow>()
  if (error) throw error
  if (!plan?.club_slug || plan.vacation) return null

  const [clubRes, featuredRes] = await Promise.all([
    supabase.from('clubs').select('slug, name, category, members, photo_key').eq('slug', plan.club_slug).single<ClubRow>(),
    supabase.from('featured_activities').select('description, place, start_time, end_time, visual_key').eq('club_slug', plan.club_slug).maybeSingle<FeaturedRow>(),
  ])
  if (clubRes.error) throw clubRes.error
  if (featuredRes.error) throw featuredRes.error
  const club = clubRes.data
  const featured = featuredRes.data

  return {
    clubSlug: club.slug,
    clubName: `Club ${club.name}`,
    category: club.category,
    members: club.members,
    photoLabel: `Club ${club.name}`,
    photoKey: featured?.visual_key ?? club.photo_key,
    description: featured?.description ?? '',
    timeRange: featured ? `${hour(featured.start_time)} – ${hour(featured.end_time)}` : '',
    location: featured?.place ?? '',
    monthLabel,
    dateLabel,
  }
}
