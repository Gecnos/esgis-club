export type UploadedFile = { name: string; size: string; /** Fichier à envoyer vers R2 à la soumission. */ file?: File }

export type CalendarRow = { date: string; activity: string }

export type DossierForm = {
  nom: string
  filiere: string
  email: string
  wa: string
  club: string
  contexte: string
  vision: string
  objectifs: string[]
  reglMode: 'file' | 'text'
  reglFile: UploadedFile | null
  reglText: string
  calMode: 'file' | 'table'
  calFile: UploadedFile | null
  calRows: CalendarRow[]
  docFile: UploadedFile | null
  engage: boolean
}

export type ErrorKey =
  | 'nom'
  | 'filiere'
  | 'email'
  | 'wa'
  | 'club'
  | 'contexte'
  | 'vision'
  | 'objectifs'
  | 'regl'
  | 'cal'
  | 'engage'

export type FieldErrors = Partial<Record<ErrorKey, string>>

export type Step = 1 | 2 | 3

export const stepFields: Record<Step, ErrorKey[]> = {
  1: ['nom', 'filiere', 'email', 'wa'],
  2: ['club', 'contexte', 'vision', 'objectifs'],
  3: ['regl', 'cal', 'engage'],
}

export const stepTitles: Record<Step, string> = {
  1: "L'initiateur",
  2: 'Le projet de club',
  3: 'Documents et engagement',
}

export const emptyForm: DossierForm = {
  nom: '',
  filiere: '',
  email: '',
  wa: '',
  club: '',
  contexte: '',
  vision: '',
  objectifs: [''],
  reglMode: 'file',
  reglFile: null,
  reglText: '',
  calMode: 'file',
  calFile: null,
  calRows: [{ date: '', activity: '' }],
  docFile: null,
  engage: false,
}
