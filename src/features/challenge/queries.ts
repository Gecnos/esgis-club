import { fmt } from '../../lib/dates.ts'
import { supabase } from '../../lib/supabase.ts'
import type { Category } from '../clubs/types.ts'
import type { Leaderboard } from './types.ts'

type ScoreRow = { points: number; updated_at: string; clubs: { name: string; category: Category } | null }

// Données de démonstration (mode sans Supabase).
const mockBoard: Leaderboard = {
  updatedAt: '16 octobre 2026',
  entries: [
    { name: 'Robotique', category: 'Tech', points: 1240 },
    { name: 'Danse', category: 'Arts & Culture', points: 1105 },
    { name: 'Entrepreneuriat', category: 'Business & Langues', points: 980 },
    { name: 'Football', category: 'Sport', points: 920 },
    { name: 'Dev', category: 'Tech', points: 870 },
  ],
}

export async function getLeaderboard(): Promise<Leaderboard> {
  if (!supabase) return mockBoard
  const { data, error } = await supabase
    .from('challenge_scores')
    .select('points, updated_at, clubs(name, category)')
    .order('points', { ascending: false })
    .limit(5)
  if (error) throw error
  const rows = (data as unknown as ScoreRow[]).filter((r) => r.clubs)
  const latest = rows.map((r) => r.updated_at).sort().at(-1)
  return {
    updatedAt: latest ? fmt(new Date(latest), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    entries: rows.map((r) => ({ name: r.clubs!.name, category: r.clubs!.category, points: r.points })),
  }
}
