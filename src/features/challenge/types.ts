import type { Category } from '../clubs/types.ts'

export type Ranking = {
  name: string
  category: Category
  points: number
}

export type Leaderboard = {
  updatedAt: string
  entries: Ranking[]
}
