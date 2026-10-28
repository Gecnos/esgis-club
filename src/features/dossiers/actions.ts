import { validateDossier } from './schemas.ts'
import type { DossierForm } from './types.ts'

// Simulation : à remplacer par l'insertion Supabase et l'envoi des fichiers vers R2.
export async function submitDossier(form: DossierForm): Promise<{ reference: string }> {
  if (Object.keys(validateDossier(form)).length > 0) throw new Error('Dossier invalide')
  await new Promise((resolve) => setTimeout(resolve, 400))
  const n = String(Math.floor(Math.random() * 900) + 100)
  return { reference: `CC-${new Date().getFullYear()}-${n}` }
}
