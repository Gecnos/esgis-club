import type { Category } from '../clubs/types.ts'

export type ClubOfMonth = {
  clubSlug: string
  clubName: string
  category: Category
  members: number
  photoLabel: string
  photoKey?: string | null
  description: string
  timeRange: string
  location: string
  /** Nom du mois (ex. « Octobre »). */
  monthLabel: string
  /** Date de l'activité (ex. « Vendredi 30 octobre 2026 »). */
  dateLabel: string
}
