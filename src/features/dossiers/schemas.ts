import { z } from 'zod'
import type { DossierForm, ErrorKey, FieldErrors } from './types.ts'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Les champs sont validés dans superRefine pour que toutes les erreurs remontent en une passe.
const dossierSchema = z
  .object({
    nom: z.string(),
    filiere: z.string(),
    email: z.string(),
    wa: z.string(),
    club: z.string(),
    contexte: z.string(),
    vision: z.string(),
    objectifs: z.array(z.string()),
    reglMode: z.enum(['file', 'text']),
    reglFile: z.object({ name: z.string(), size: z.string() }).nullable(),
    reglText: z.string(),
    calMode: z.enum(['file', 'table']),
    calFile: z.object({ name: z.string(), size: z.string() }).nullable(),
    calRows: z.array(z.object({ date: z.string(), activity: z.string() })),
    docFile: z.object({ name: z.string(), size: z.string() }).nullable(),
    engage: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const fail = (path: ErrorKey, message: string) => ctx.addIssue({ code: 'custom', path: [path], message })

    if (!v.nom.trim()) fail('nom', 'Indique ton nom et ton prénom.')
    if (!v.filiere.trim()) fail('filiere', 'Précise ta filière et ton niveau (ex. Génie logiciel – Licence 2).')

    if (!v.email.trim()) fail('email', 'Ton email est requis.')
    else if (!EMAIL.test(v.email.trim())) fail('email', 'Cet email semble incomplet (ex. prenom.nom@gmail.com).')

    const digits = v.wa.replace(/\D/g, '')
    const local = digits.startsWith('229') ? digits.slice(3) : digits
    if (!digits) fail('wa', 'Ton numéro WhatsApp est requis.')
    else if (local.length < 8 || local.length > 10)
      fail('wa', 'Numéro incomplet : 10 chiffres après +229 (ex. 01 96 45 21 08).')

    if (!v.club.trim()) fail('club', 'Donne un nom à ton club.')
    if (!v.contexte.trim()) fail('contexte', "Explique pourquoi ce club doit exister à l'ESGIS.")
    if (!v.vision.trim()) fail('vision', 'Décris la vision de ton club.')
    if (!v.objectifs.some((o) => o.trim())) fail('objectifs', 'Ajoute au moins un objectif.')

    const reglOk = v.reglMode === 'file' ? v.reglFile !== null : v.reglText.trim() !== ''
    if (!reglOk) fail('regl', 'Joins ton règlement intérieur (PDF ou DOCX) ou saisis-le en texte.')

    const calOk = v.calMode === 'file' ? v.calFile !== null : v.calRows.some((r) => r.date && r.activity.trim())
    if (!calOk) fail('cal', 'Ajoute ton calendrier : un fichier ou au moins une ligne date + activité.')

    if (!v.engage) fail('engage', 'Coche cette case pour soumettre : la soutenance fait partie du processus.')
  })

/** Valide le formulaire ; `keys` limite le résultat aux champs d'une étape. */
export function validateDossier(form: DossierForm, keys?: ErrorKey[]): FieldErrors {
  const errors: FieldErrors = {}
  const result = dossierSchema.safeParse(form)
  if (result.success) return errors
  for (const issue of result.error.issues) {
    const key = issue.path[0] as ErrorKey
    if (keys && !keys.includes(key)) continue
    errors[key] ??= issue.message
  }
  return errors
}
