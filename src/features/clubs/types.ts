export const categories = ['Sport', 'Tech', 'Arts & Culture', 'Business & Langues'] as const

export type Category = (typeof categories)[number]

export type Club = {
  slug: string
  name: string
  category: Category
  description: string
  members: number
  founded: number
  photoLabel: string
}

export type Objective = { icon: string; text: string }

export type Activity = { type: string; title: string; text: string; photo: string }

export type FeaturedActivity = {
  badge: string
  title: string
  date: string
  time: string
  place: string
  description: string
  photo: string
  program: { time: string; label: string }[]
}

export type BureauMember = { role: string; name: string }

export type GalleryPhoto = { label: string; ratio: number }

export type ClubDetail = Club & {
  cover: string
  schedule: string
  whatsapp: string
  longDescription: string
  goal: string
  isNew: boolean
  objectives: Objective[]
  activities: Activity[]
  featured: FeaturedActivity | null
  bureau: BureauMember[]
  photos: GalleryPhoto[]
}
