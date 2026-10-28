import { z } from 'zod'
import { categories } from './types.ts'

export const clubFormSchema = z.object({
  name: z.string().trim().min(2, 'Le nom du club est requis.').max(40, '40 caractères maximum.'),
  category: z.enum(categories, { error: 'Choisis une catégorie.' }),
  description: z.string().trim().min(10, 'Décris le club en une phrase (10 caractères minimum).').max(140, '140 caractères maximum.'),
  members: z.number().int().min(0, 'Le nombre de membres ne peut pas être négatif.'),
})

export type ClubFormValues = z.infer<typeof clubFormSchema>

export type ClubFormErrors = Partial<Record<keyof ClubFormValues, string>>

export function validateClubForm(values: ClubFormValues): ClubFormErrors {
  const result = clubFormSchema.safeParse(values)
  if (result.success) return {}
  const errors: ClubFormErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof ClubFormValues
    errors[key] ??= issue.message
  }
  return errors
}

/** `Art & Déco` → `art-deco` : identifiant utilisé dans l'adresse de la page du club. */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
