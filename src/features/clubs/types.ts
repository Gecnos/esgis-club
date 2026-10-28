export const categories = ['Sport', 'Tech', 'Arts & Culture', 'Business & Langues'] as const

export type Category = (typeof categories)[number]

export type Club = {
  slug: string
  name: string
  category: Category
  description: string
  members: number
  photoLabel: string
}
