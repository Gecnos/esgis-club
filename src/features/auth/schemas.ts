import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Ton email est requis.').regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'Cet email semble incomplet (ex. prenom.nom@gmail.com).'),
  password: z.string().min(1, 'Ton mot de passe est requis.'),
})

export type LoginValues = z.infer<typeof loginSchema>

export type LoginErrors = Partial<Record<keyof LoginValues, string>>

export function validateLogin(values: LoginValues): LoginErrors {
  const result = loginSchema.safeParse(values)
  if (result.success) return {}
  const errors: LoginErrors = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof LoginValues
    errors[key] ??= issue.message
  }
  return errors
}
