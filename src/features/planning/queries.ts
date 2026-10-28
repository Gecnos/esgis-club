import type { ClubOfMonth } from './types.ts'

// Données de démonstration, à remplacer par Supabase.
export function getClubOfMonth(): ClubOfMonth {
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
  }
}
