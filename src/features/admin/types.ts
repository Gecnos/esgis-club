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
  /** Clubs programmables dans le planning : [slug, nom]. */
  clubOptions: [slug: string, name: string][]
  log: LogEntry[]
  toast: ToastState | null
}

export type ClubView = 'tableau' | 'fiche' | 'galerie' | 'bureau' | 'activite'
export type ComiteView = 'tableau' | 'dossiers' | 'planning'
