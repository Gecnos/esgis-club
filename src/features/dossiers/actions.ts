import { supabase } from '../../lib/supabase.ts'
import { uploadDocument } from '../../lib/storage.ts'
import { validateDossier } from './schemas.ts'
import type { DossierForm, UploadedFile } from './types.ts'

type DocumentRow = { kind: string; name: string; file_key: string | null }

async function toDocument(kind: string, upload: UploadedFile | null, folder: string): Promise<DocumentRow[]> {
  if (!upload) return []
  const key = upload.file ? await uploadDocument(upload.file, folder) : null
  return [{ kind, name: upload.name, file_key: key }]
}

/**
 * Enregistre un dossier de création de club.
 * Sans Supabase : simulation. Avec Supabase : fichiers vers R2 (dossier `dossiers/<id>/`), puis la fonction SQL `submit_dossier`.
 */
export async function submitDossier(form: DossierForm): Promise<{ reference: string }> {
  if (Object.keys(validateDossier(form)).length > 0) throw new Error('Dossier invalide')

  if (!supabase) {
    await new Promise((resolve) => setTimeout(resolve, 400))
    const n = String(Math.floor(Math.random() * 900) + 100)
    return { reference: `CC-${new Date().getFullYear()}-${n}` }
  }

  const folder = `dossiers/${crypto.randomUUID()}`
  const documents: DocumentRow[] = [
    ...(form.reglMode === 'file'
      ? await toDocument('Règlement intérieur', form.reglFile, folder)
      : [{ kind: 'Règlement intérieur', name: 'Saisi en texte', file_key: null }]),
    ...(form.calMode === 'file'
      ? await toDocument("Calendrier d'activités", form.calFile, folder)
      : [{ kind: "Calendrier d'activités", name: `Tableau saisi · ${form.calRows.filter((r) => r.date && r.activity.trim()).length} séances`, file_key: null }]),
    ...(await toDocument('Document projet', form.docFile, folder)),
  ]

  const { data, error } = await supabase.rpc('submit_dossier', {
    payload: {
      club_name: form.club.trim(),
      porteur: form.nom.trim(),
      filiere: form.filiere.trim(),
      email: form.email.trim(),
      whatsapp: form.wa.replace(/\D/g, ''),
      contexte: form.contexte.trim(),
      vision: form.vision.trim(),
      objectifs: form.objectifs.map((o) => o.trim()).filter(Boolean),
      reglement_text: form.reglMode === 'text' ? form.reglText.trim() : null,
      calendar: form.calMode === 'table' ? form.calRows.filter((r) => r.date && r.activity.trim()) : null,
      documents,
    },
  })
  if (error) throw new Error(error.message)
  return { reference: String(data) }
}
