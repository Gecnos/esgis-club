import type { Category } from '../clubs/types.ts'

export type ClubOfMonth = {
  clubSlug: string
  clubName: string
  category: Category
  members: number
  photoLabel: string
  description: string
  timeRange: string
  location: string
}
