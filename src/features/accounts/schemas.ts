import { z } from 'zod'

export const accountSchema = z
  .object({
    name: z.string().trim().min(2, 'Le nom est requis.'),
    email: z.string().trim().regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Cet email semble incomplet (ex. prenom.nom@gmail.com).'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères.'),
    role: z.enum(['club', 'comite']),
    clubSlug: z.string(),
  })
  .refine((v) => v.role !== 'club' || v.clubSlug !== '', { path: ['clubSlug'], message: 'Choisis le club à gérer.' })

export type AccountValues = z.infer<typeof accountSchema>

export type AccountErrors = Partial<Record<keyof AccountValues, string>>

export function validateAccount(values: AccountValues): AccountErrors {
  const result = accountSchema.safeParse(values)
  if (result.success) return {}
  const errors: AccountErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof AccountValues
    errors[key] ??= issue.message
  }
  return errors
}

/** Mot de passe provisoire lisible (sans caractères ambigus), à transmettre au responsable. */
export function generatePassword(length = 12): string {
  const alphabet = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(length))
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
}
