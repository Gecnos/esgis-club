import { addDays, diffDays, fmt, lastFridayOf } from '../../lib/dates.ts'
import { capitalize } from '../../lib/text.ts'
import { CLUB_OPTIONS, TODAY, initialClub, initialDossiers, initialLog, initialPhotos, initialPlanning } from './data.ts'
import type { AdminState, ClubDraft, ClubView, Dossier, DossierStatus, Photo, Planning } from './types.ts'

export function getInitialState(): AdminState {
  return {
    saved: structuredClone(initialClub),
    draft: structuredClone(initialClub),
    photos: initialPhotos.slice(),
    cover: 1,
    dossiers: initialDossiers,
    planning: { ...initialPlanning },
    log: initialLog,
    toast: null,
  }
}

export const STATUS_LABELS: Record<DossierStatus, string> = {
  recu: 'Reçu',
  etude: 'En étude',
  soutenance: 'Soutenance',
  approuve: 'Approuvé',
  rejete: 'Rejeté',
}

/** Classes Tailwind de la pastille de statut. */
export function statusClasses(status: DossierStatus): string {
  switch (status) {
    case 'soutenance':
      return 'bg-navy text-white'
    case 'approuve':
      return 'bg-white text-navy shadow-[inset_0_0_0_1.5px_#0b1f3a]'
    case 'rejete':
      return 'bg-soft text-muted'
    default:
      return 'bg-[#e8ecf3] text-navy'
  }
}

export function clubName(slug: string): string {
  return CLUB_OPTIONS.find(([s]) => s === slug)?.[1] ?? slug
}

export const MONTHS = Array.from({ length: 10 }, (_, i) => {
  const y = 2026 + (8 + i >= 12 ? 1 : 0)
  const m = (8 + i) % 12
  return { key: `${y}-${m}`, y, m, fri: lastFridayOf(y, m) }
})

export type CompletionCheck = { label: string; ok: boolean; to: ClubView }

export function getCompletion(draft: ClubDraft, photos: Photo[], cover: number) {
  const bureauOk = draft.bureau.filter((m) => m.fixed).every((m) => m.name.trim() && (m.photo || m.url))
  const nObj = draft.objectifs.filter((o) => o.trim()).length
  const nSoc = Object.values(draft.socials).filter((x) => x.trim()).length
  const checks: CompletionCheck[] = [
    { label: 'Description (80 caractères min.)', ok: draft.description.trim().length >= 80, to: 'fiche' },
    { label: 'But du club', ok: !!draft.but.trim(), to: 'fiche' },
    { label: 'Au moins 3 objectifs', ok: nObj >= 3, to: 'fiche' },
    { label: 'Au moins 2 réseaux sociaux', ok: nSoc >= 2, to: 'fiche' },
    { label: 'Bureau complet avec photos', ok: !!bureauOk, to: 'bureau' },
    { label: 'Au moins 6 photos dans la galerie', ok: photos.length >= 6, to: 'galerie' },
    { label: 'Photo de couverture choisie', ok: photos.some((p) => p.id === cover), to: 'galerie' },
  ]
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
  return { pct, checks }
}

/** Mois à l'honneur du club connecté (Robotique dans la démo). */
export function getClubMonth(planning: Planning, title: string) {
  const key = Object.keys(planning).find((k) => planning[k] === 'robotique')
  const month = MONTHS.find((m) => m.key === key) ?? MONTHS[1]!
  const left = diffDays(TODAY, month.fri)
  return {
    label: capitalize(fmt(month.fri, { month: 'long', year: 'numeric' })),
    date: capitalize(fmt(month.fri, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
    countdown: left > 0 ? `dans ${left} jours` : left === 0 ? "aujourd'hui" : 'terminé',
    title,
  }
}

export type EnrichedDossier = Dossier & {
  statusLabel: string
  /** Jours avant l'échéance de 7 jours ; `null` pour un dossier décidé ou en soutenance. */
  dueDays: number | null
  dueLabel: string
  urgent: boolean
}

export function enrichDossier(d: Dossier): EnrichedDossier {
  const dueDays = d.statut === 'recu' || d.statut === 'etude' ? diffDays(TODAY, addDays(d.depot, 7)) : null
  const dueLabel =
    dueDays === null ? '' : dueDays < 0 ? `En retard de ${-dueDays} j` : dueDays === 0 ? "Échéance aujourd'hui" : `J-${dueDays}`
  return { ...d, statusLabel: STATUS_LABELS[d.statut], dueDays, dueLabel, urgent: dueDays !== null && dueDays <= 1 }
}

export type DossierFilter = 'tous' | 'recu' | 'etude' | 'soutenance' | 'decides'

export function filterDossiers(all: EnrichedDossier[], filter: DossierFilter): EnrichedDossier[] {
  if (filter === 'tous') return all
  if (filter === 'decides') return all.filter((d) => d.statut === 'approuve' || d.statut === 'rejete')
  return all.filter((d) => d.statut === filter)
}

/** Clubs déjà programmés (hors vacances), au format [clé du mois, slug]. */
export function assignedClubs(planning: Planning): [string, string][] {
  return Object.entries(planning).filter(([, v]) => v && v !== '__vac')
}
