export type Role = 'club' | 'comite'

export type BureauSlot = {
  id: number
  role: string
  name: string
  filiere: string
  /** Une photo existe déjà côté serveur (démo) sans URL locale. */
  photo: boolean
  url: string | null
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
  visuelUrl: string | null
}

export type Socials = { instagram: string; facebook: string; tiktok: string; linkedin: string }

export type ClubDraft = {
  horaire: string
  description: string
  but: string
  objectifs: string[]
  wa: string
  socials: Socials
  logoUrl: string | null
  bureau: BureauSlot[]
  phare: FeaturedDraft
}

export type Photo = { id: number; label: string; url: string | null }

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
  docs: { kind: string; name: string }[]
}

export type LogEntry = { icon: string; text: string; who: string; when: string }

export type ToastState = { msg: string; undo?: { photos: Photo[]; cover: number } }

/** Clé `année-mois` (mois de 0 à 11) → slug du club, ou `__vac` pour les vacances. */
export type Planning = Record<string, string>

export type AdminState = {
  saved: ClubDraft
  draft: ClubDraft
  photos: Photo[]
  cover: number
  dossiers: Dossier[]
  planning: Planning
  log: LogEntry[]
  toast: ToastState | null
}

export type ClubView = 'tableau' | 'fiche' | 'galerie' | 'bureau' | 'activite'
export type ComiteView = 'tableau' | 'dossiers' | 'planning'
