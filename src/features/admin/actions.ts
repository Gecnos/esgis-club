import { fmt } from '../../lib/dates.ts'
import { capitalize } from '../../lib/text.ts'
import { clubName, MONTHS } from './queries.ts'
import type { AdminState, ClubDraft, ClubView, Dossier, Photo, ToastState } from './types.ts'

// Transitions d'état en mémoire (optimistes). La persistance est dans `api.ts`, orchestrée par `useAdminActions`.

const withToast = (s: AdminState, msg: string, undo?: ToastState['undo']): AdminState => ({ ...s, toast: { msg, undo } })

export function failToast(s: AdminState, msg: string): AdminState {
  return { ...s, toast: { msg, error: true } }
}

export function dismissToast(s: AdminState): AdminState {
  return { ...s, toast: null }
}

export function editDraft(s: AdminState, edit: (draft: ClubDraft) => void): AdminState {
  const draft = structuredClone(s.draft)
  edit(draft)
  return { ...s, draft }
}

export function discardDraft(s: AdminState): AdminState {
  return { ...s, draft: structuredClone(s.saved) }
}

export const publishLabels: Partial<Record<ClubView, [icon: string, text: string]>> = {
  fiche: ['edit', 'Fiche du club mise à jour'],
  bureau: ['badge', 'Bureau mis à jour'],
  activite: ['workspace_premium', 'Activité phare mise à jour'],
}

export function markPublished(s: AdminState, view: ClubView, author: string): AdminState {
  const label = publishLabels[view]
  const log = label
    ? [{ icon: label[0], text: label[1], who: author, when: "à l'instant" }, ...s.log].slice(0, 5)
    : s.log
  return withToast({ ...s, saved: structuredClone(s.draft), log }, 'Publié · la page du club est à jour')
}

export function addPhotos(s: AdminState, added: Photo[]): AdminState {
  const msg = added.length > 1 ? `${added.length} photos ajoutées et publiées` : 'Photo ajoutée et publiée'
  return withToast({ ...s, photos: [...s.photos, ...added] }, msg)
}

export function setPhotoLabel(s: AdminState, id: number, label: string): AdminState {
  return { ...s, photos: s.photos.map((p) => (p.id === id ? { ...p, label } : p)) }
}

export function setCover(s: AdminState, id: number): AdminState {
  return withToast({ ...s, cover: id }, 'Photo de couverture mise à jour')
}

export function removePhoto(s: AdminState, id: number): AdminState {
  const remaining = s.photos.filter((p) => p.id !== id)
  const cover = s.cover === id ? (remaining[0]?.id ?? 0) : s.cover
  return withToast({ ...s, photos: remaining, cover }, 'Photo supprimée', { photos: s.photos, cover: s.cover })
}

export function restore(s: AdminState, snapshot: NonNullable<ToastState['undo']>): AdminState {
  return { ...s, ...snapshot, toast: null }
}

export function patchDossier(s: AdminState, id: number, patch: Partial<Dossier>, msg: string): AdminState {
  return withToast({ ...s, dossiers: s.dossiers.map((d) => (d.id === id ? { ...d, ...patch } : d)) }, msg)
}

export const dossierMessages = {
  study: 'Dossier passé en étude',
  defense: 'Soutenance programmée · le porteur est notifié',
  reject: 'Dossier rejeté · pense à prévenir le porteur',
  approve: 'Club approuvé · préviens le porteur sous 24 h',
}

export function setPlanning(s: AdminState, key: string, slug: string): AdminState {
  const planning = { ...s.planning, [key]: slug }
  const month = MONTHS.find((m) => m.key === key)
  const monthName = month ? capitalize(fmt(month.fri, { month: 'long' })) : ''
  const msg = slug ? `${monthName} : Club ${clubName(s.clubOptions, slug)} programmé` : 'Mois libéré'
  return withToast({ ...s, planning }, msg)
}
