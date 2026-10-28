export const categories = ['Sport', 'Tech', 'Arts & Culture', 'Business & Langues'] as const

export type Category = (typeof categories)[number]

// Les champs `…Key` sont des clés d'objet R2 (voir `lib/storage.ts`) : absents tant qu'il n'y a pas de vraie photo.

export type Club = {
  slug: string
  name: string
  category: Category
  description: string
  members: number
  founded: number
  photoLabel: string
  photoKey?: string | null
}

export type Objective = { icon: string; text: string }

export type Activity = { type: string; title: string; text: string; photo: string; photoKey?: string | null }

export type FeaturedActivity = {
  badge: string
  title: string
  date: string
  time: string
  place: string
  description: string
  photo: string
  visualKey?: string | null
  program: { time: string; label: string }[]
}

export type BureauMember = { role: string; name: string; photoKey?: string | null }

export type GalleryPhoto = { label: string; ratio: number; key?: string | null }

export type ClubDetail = Club & {
  cover: string
  coverKey?: string | null
  logoKey?: string | null
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
