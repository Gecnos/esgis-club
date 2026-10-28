import { TODAY } from './data.ts'
import { clubName, MONTHS } from './queries.ts'
import { capitalize } from '../../lib/text.ts'
import { fmt } from '../../lib/dates.ts'
import type { AdminState, ClubDraft, ClubView, Dossier, Photo, ToastState } from './types.ts'

// Écritures simulées en mémoire : à remplacer par Supabase (et R2 pour les images).

const withToast = (s: AdminState, msg: string, undo?: ToastState['undo']): AdminState => ({ ...s, toast: { msg, undo } })

export function dismissToast(s: AdminState): AdminState {
  return { ...s, toast: null }
}

export function undoToast(s: AdminState): AdminState {
  const undo = s.toast?.undo
  return undo ? { ...s, ...undo, toast: null } : { ...s, toast: null }
}

export function editDraft(s: AdminState, edit: (draft: ClubDraft) => void): AdminState {
  const draft = structuredClone(s.draft)
  edit(draft)
  return { ...s, draft }
}

export function discardDraft(s: AdminState): AdminState {
  return { ...s, draft: structuredClone(s.saved) }
}

const publishLabels: Partial<Record<ClubView, [icon: string, text: string]>> = {
  fiche: ['edit', 'Fiche du club mise à jour'],
  bureau: ['badge', 'Bureau mis à jour'],
  activite: ['workspace_premium', 'Activité phare mise à jour'],
}

export function publishDraft(s: AdminState, view: ClubView): AdminState {
  const label = publishLabels[view]
  const log = label
    ? [{ icon: label[0], text: label[1], who: 'Wilfried Ahouandjinou', when: "à l'instant" }, ...s.log].slice(0, 5)
    : s.log
  return withToast({ ...s, saved: structuredClone(s.draft), log }, 'Publié · la page du club est à jour')
}

export function addPhotos(s: AdminState, items: { label: string; url: string }[]): AdminState {
  let id = Math.max(0, ...s.photos.map((p) => p.id))
  const added: Photo[] = items.map((i) => ({ id: ++id, label: i.label, url: i.url }))
  const msg = items.length > 1 ? `${items.length} photos ajoutées et publiées` : 'Photo ajoutée et publiée'
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

function patchDossier(s: AdminState, id: number, patch: Partial<Dossier>, msg: string): AdminState {
  return withToast({ ...s, dossiers: s.dossiers.map((d) => (d.id === id ? { ...d, ...patch } : d)) }, msg)
}

export function startStudy(s: AdminState, id: number): AdminState {
  return patchDossier(s, id, { statut: 'etude' }, 'Dossier passé en étude')
}

export function scheduleDefense(s: AdminState, id: number, date: string, time: string): AdminState {
  return patchDossier(
    s,
    id,
    { statut: 'soutenance', soutenance: `${date}T${time || '14:00'}` },
    'Soutenance programmée · le porteur est notifié',
  )
}

export function rejectDossier(s: AdminState, id: number, motif: string): AdminState {
  return patchDossier(
    s,
    id,
    { statut: 'rejete', motif, decisionDate: TODAY },
    'Dossier rejeté · pense à prévenir le porteur',
  )
}

export function approveDossier(s: AdminState, id: number): AdminState {
  return patchDossier(s, id, { statut: 'approuve', decisionDate: TODAY }, 'Club approuvé · préviens le porteur sous 24 h')
}

export function setPlanning(s: AdminState, key: string, slug: string): AdminState {
  const planning = { ...s.planning, [key]: slug }
  const month = MONTHS.find((m) => m.key === key)
  const monthName = month ? capitalize(fmt(month.fri, { month: 'long' })) : ''
  const msg = slug ? `${monthName} : Club ${clubName(slug)} programmé` : 'Mois libéré'
  return withToast({ ...s, planning }, msg)
}
