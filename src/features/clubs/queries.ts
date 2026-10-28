import { bureauRoles, clubOverrides, clubs, genericActivities, genericObjectives, memberPool } from './data.ts'
import type { Club, ClubDetail } from './types.ts'

export function getClubs(): Club[] {
  return clubs
}

export function getClub(slug: string): ClubDetail | undefined {
  const index = clubs.findIndex((c) => c.slug === slug)
  const club = clubs[index]
  if (!club) return undefined

  const o = clubOverrides[slug]
  return {
    ...club,
    cover: o?.cover ?? club.photoLabel,
    schedule: o?.schedule ?? 'Vendredi 12h – 15h',
    whatsapp: o?.whatsapp ?? '2290197000000',
    longDescription:
      o?.longDescription ??
      `Le Club ${club.name} accueille tous les étudiants de l'ESGIS, débutants comme confirmés. ${club.description}`,
    goal: o?.goal ?? `Faire progresser chaque membre et faire rayonner l'ESGIS à travers le club ${club.name}.`,
    isNew: club.founded >= 2025,
    objectives: o?.objectives ?? genericObjectives[club.category],
    activities:
      o?.activities ??
      genericActivities[club.category].map(([type, title, text]) => ({
        type,
        title,
        text,
        photo: `photo · ${title.toLowerCase()}`,
      })),
    featured: o?.featured ?? null,
    bureau:
      o?.bureau ?? bureauRoles.map((role, i) => ({ role, name: memberPool[(index * 3 + i) % memberPool.length] })),
    photos: o?.photos ?? [],
  }
}

/** Trois autres clubs, ceux de la même catégorie en premier. */
export function getSimilarClubs(slug: string): Club[] {
  const current = clubs.find((c) => c.slug === slug)
  const others = clubs.filter((c) => c.slug !== slug)
  return [...others.filter((c) => c.category === current?.category), ...others.filter((c) => c.category !== current?.category)].slice(0, 3)
}
