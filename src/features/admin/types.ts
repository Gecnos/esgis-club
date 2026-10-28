import type { Category } from '../clubs/types.ts'

export type { Role } from '../auth/types.ts'

// Les champs `…Key` sont des clés d'objet R2 (ou une URL `blob:` en mode démo) : voir `lib/storage.ts`.

export type BureauSlot = {
  id: number
  role: string
  name: string
  filiere: string
  photoKey: string | null
  /** Poste obligatoire : ne peut pas être retiré. */
  fixed: boolean
}

export type ProgramStep = { h: string; l: string }

export type FeaturedDraft = {
  titre: string
  debut: string
  fin: string
  lieu: string
  desc: string
  programme: ProgramStep[]
  visuelKey: string | null
}

/** Exemple d'activité du club, affiché dans « Exemples d'activités » de sa page. */
export type ActivityExample = { id: number; type: string; title: string; text: string; photoKey: string | null }

export const ACTIVITY_TYPES = ['Atelier', 'Événement', 'Compétition', 'Entraînement', 'Sortie', 'Autre'] as const

export type Socials = { instagram: string; facebook: string; tiktok: string; linkedin: string }

export type ClubDraft = {
  horaire: string
  description: string
  but: string
  objectifs: string[]
  wa: string
  socials: Socials
  logoKey: string | null
  bureau: BureauSlot[]
  activities: ActivityExample[]
  phare: FeaturedDraft
}

export type Photo = { id: number; label: string; key: string | null; ratio: number }

export type DossierStatus = 'recu' | 'etude' | 'soutenance' | 'approuve' | 'rejete'

export type Dossier = {
  id: number
  num: string
  club: string
  porteur: string
  filiere: string
  email: string
  wa: string
  depot: Date
  statut: DossierStatus
  /** Date et heure de soutenance au format `YYYY-MM-DDTHH:mm`. */
  soutenance?: string
  decisionDate?: Date
  motif?: string
  contexte: string
  vision: string
  objectifs: string[]
  docs: { kind: string; name: string; key?: string | null }[]
}

export type LogEntry = { icon: string; text: string; who: string; when: string }

export type ToastState = {
  msg: string
  error?: boolean
  undo?: { photos: Photo[]; cover: number }
}

/** Clé `année-mois` (mois de 0 à 11) → slug du club, ou `__vac` pour les vacances. */
export type Planning = Record<string, string>

/** Clé `année-mois` → jour de l'activité (`YYYY-MM-DD`). Absent : dernier vendredi du mois. */
export type PlanningDays = Record<string, string>

export type ManagedClub = { slug: string; name: string; category: Category }

export type AdminState = {
  /** Club géré par l'utilisateur connecté (espace « responsable de club »). */
  club: ManagedClub
  saved: ClubDraft
  draft: ClubDraft
  photos: Photo[]
  cover: number
  dossiers: Dossier[]
  planning: Planning
  planningDays: PlanningDays
  /** Clubs programmables dans le planning : [slug, nom]. */
  clubOptions: [slug: string, name: string][]
  log: LogEntry[]
  toast: ToastState | null
}

export type ClubView = 'tableau' | 'fiche' | 'galerie' | 'bureau' | 'exemples' | 'activite'
export type ComiteView = 'tableau' | 'dossiers' | 'planning' | 'clubs' | 'site' | 'comptes'
