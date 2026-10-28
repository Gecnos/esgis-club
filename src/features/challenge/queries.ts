import type { Leaderboard } from './types.ts'

// Données de démonstration, à remplacer par Supabase.
export function getLeaderboard(): Leaderboard {
  return {
    updatedAt: '16 octobre 2026',
    entries: [
      { name: 'Robotique', category: 'Tech', points: 1240 },
      { name: 'Danse', category: 'Arts & Culture', points: 1105 },
      { name: 'Entrepreneuriat', category: 'Business & Langues', points: 980 },
      { name: 'Football', category: 'Sport', points: 920 },
      { name: 'Dev', category: 'Tech', points: 870 },
    ],
  }
}
