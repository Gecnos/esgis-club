import { useAuth } from '../auth/authContext.ts'
import { uploadImage } from '../../lib/storage.ts'
import { TODAY } from './data.ts'
import {
  addPhotos, discardDraft, dossierMessages, editDraft, failToast, markPublished, patchDossier, publishLabels,
  removePhoto, restore, setCover, setPhotoLabel, setPlanning,
} from './actions.ts'
import { useAdmin } from './adminContext.ts'
import * as api from './api.ts'
import type { ClubDraft, ClubView } from './types.ts'

/**
 * Actions de l'espace admin : met à jour l'état local puis écrit via `api.ts`.
 * En cas d'échec d'écriture, l'état n'est pas modifié et un message d'erreur s'affiche.
 */
export function useAdminActions() {
  const { state, apply } = useAdmin()
  const { user } = useAuth()
  const slug = state.club.slug
  const author = user?.name ?? ''

  async function run(task: () => Promise<void>) {
    try {
      await task()
    } catch (error) {
      const detail = error instanceof Error ? error.message : ''
      apply((s) => failToast(s, `Enregistrement impossible${detail ? ` : ${detail}` : ''}`))
    }
  }

  const editFile = (file: File, folder: string, assign: (draft: ClubDraft, key: string) => void) =>
    run(async () => {
      const { key } = await uploadImage(file, `clubs/${slug}/${folder}`)
      apply((s) => editDraft(s, (d) => assign(d, key)))
    })

  return {
    // --- Fiche, bureau, activité phare ---
    edit: (change: (draft: ClubDraft) => void) => apply((s) => editDraft(s, change)),
    discard: () => apply(discardDraft),
    publish: (view: ClubView) =>
      run(async () => {
        const [icon, text] = publishLabels[view] ?? ['edit', 'Page du club mise à jour']
        await api.saveClub(slug, state.draft, author, text, icon)
        apply((s) => markPublished(s, view, author))
      }),
    uploadLogo: (file: File) => editFile(file, 'logo', (d, key) => { d.logoKey = key }),
    uploadVisual: (file: File) => editFile(file, 'activite', (d, key) => { d.phare.visuelKey = key }),
    uploadBureauPhoto: (index: number, file: File) =>
      editFile(file, 'bureau', (d, key) => { if (d.bureau[index]) d.bureau[index].photoKey = key }),

    // --- Galerie (publiée immédiatement) ---
    addPhotos: (files: File[]) =>
      run(async () => {
        const images = files.filter((f) => f.type.startsWith('image/'))
        if (images.length === 0) return
        const items = []
        for (const file of images) {
          const { key, ratio } = await uploadImage(file, `clubs/${slug}/galerie`)
          items.push({ label: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), key, ratio })
        }
        const created = await api.addPhotos(slug, items, state.photos.length)
        apply((s) => addPhotos(s, created))
      }),
    renamePhoto: (id: number, label: string) => apply((s) => setPhotoLabel(s, id, label)),
    savePhotoLabel: (id: number, label: string) => run(() => api.updatePhotoLabel(id, label)),
    setCover: (id: number) =>
      run(async () => {
        await api.setCoverPhoto(slug, id)
        apply((s) => setCover(s, id))
      }),
    removePhoto: (id: number) =>
      run(async () => {
        await api.deletePhoto(id)
        apply((s) => removePhoto(s, id))
      }),
    undo: () => {
      const snapshot = state.toast?.undo
      if (!snapshot) return apply((s) => ({ ...s, toast: null }))
      return run(async () => {
        await api.restorePhotos(slug, snapshot.photos, snapshot.cover)
        apply((s) => restore(s, snapshot))
      })
    },

    // --- Comité : dossiers et planning ---
    startStudy: (id: number) =>
      run(async () => {
        await api.updateDossier(id, { statut: 'etude' })
        apply((s) => patchDossier(s, id, { statut: 'etude' }, dossierMessages.study))
      }),
    scheduleDefense: (id: number, date: string, time: string) =>
      run(async () => {
        const patch = { statut: 'soutenance' as const, soutenance: `${date}T${time || '14:00'}` }
        await api.updateDossier(id, patch)
        apply((s) => patchDossier(s, id, patch, dossierMessages.defense))
      }),
    rejectDossier: (id: number, motif: string) =>
      run(async () => {
        const patch = { statut: 'rejete' as const, motif, decisionDate: TODAY }
        await api.updateDossier(id, patch)
        apply((s) => patchDossier(s, id, patch, dossierMessages.reject))
      }),
    approveDossier: (id: number) =>
      run(async () => {
        const patch = { statut: 'approuve' as const, decisionDate: TODAY }
        await api.updateDossier(id, patch)
        apply((s) => patchDossier(s, id, patch, dossierMessages.approve))
      }),
    setMonth: (key: string, clubSlug: string) =>
      run(async () => {
        await api.setPlanningMonth(key, clubSlug)
        apply((s) => setPlanning(s, key, clubSlug))
      }),
  }
}
