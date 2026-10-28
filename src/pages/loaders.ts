import type { LoaderFunctionArgs } from 'react-router'
import { getLeaderboard } from '../features/challenge/queries.ts'
import { getClub, getClubs, getSimilarClubs } from '../features/clubs/queries.ts'
import { getCommittee } from '../features/committee/queries.ts'
import { getClubOfMonth } from '../features/planning/queries.ts'

// Les données des pages publiques sont chargées avant le rendu (Supabase, ou démo si non configuré).

export async function accueilLoader() {
  const [clubs, clubOfMonth, committee, board] = await Promise.all([
    getClubs(),
    getClubOfMonth(),
    getCommittee(),
    getLeaderboard(),
  ])
  return { clubs, clubOfMonth, committee, board }
}

export async function clubLoader({ params }: LoaderFunctionArgs) {
  const slug = params.slug ?? ''
  const [club, similar, clubOfMonth] = await Promise.all([getClub(slug), getSimilarClubs(slug), getClubOfMonth()])
  return { club, similar, clubOfMonthSlug: clubOfMonth?.clubSlug }
}
