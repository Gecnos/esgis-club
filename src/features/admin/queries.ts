import { addDays, diffDays, fmt, lastFridayOf } from '../../lib/dates.ts'
import { supabase } from '../../lib/supabase.ts'
import { capitalize } from '../../lib/text.ts'
import type { AuthUser } from '../auth/types.ts'
import type { Category } from '../clubs/types.ts'
import {
  CLUB_OPTIONS, TODAY, initialClub, initialDossiers, initialLog, initialPhotos, initialPlanning, initialPlanningDays,
} from './data.ts'
import type {
  ActivityExample, AdminState, BureauSlot, ClubDraft, ClubView, Dossier, DossierStatus, LogEntry, ManagedClub, Photo, Planning,
  PlanningDays,
} from './types.ts'

// ---------------------------------------------------------------------------------------------
// Chargement de l'état initial : Supabase si configuré, sinon données de démonstration.
// ---------------------------------------------------------------------------------------------

const emptyDraft: ClubDraft = {
  horaire: '',
  description: '',
  but: '',
  objectifs: [],
  wa: '',
  socials: { instagram: '', facebook: '', tiktok: '', linkedin: '' },
  logoKey: null,
  bureau: [],
  activities: [],
  phare: { titre: '', debut: '12:00', fin: '17:00', lieu: '', desc: '', programme: [], visuelKey: null },
}

function mockState(): AdminState {
  return {
    club: { slug: 'robotique', name: 'Robotique', category: 'Tech' },
    saved: structuredClone(initialClub),
    draft: structuredClone(initialClub),
    photos: initialPhotos.slice(),
    cover: 1,
    dossiers: initialDossiers,
    planning: { ...initialPlanning },
    planningDays: { ...initialPlanningDays },
    clubOptions: CLUB_OPTIONS,
    log: initialLog,
    toast: null,
  }
}

type ClubRow = {
  slug: string
  name: string
  category: Category
  schedule: string | null
  long_description: string | null
  goal: string | null
  objectives: string[] | null
  whatsapp: string | null
  socials: Partial<ClubDraft['socials']> | null
  logo_key: string | null
  cover_photo_id: number | null
}
type BureauRow = { id: number; role: string; name: string; filiere: string; photo_key: string | null; fixed: boolean }
type PhotoRow = { id: number; label: string; key: string; ratio: number }
type ActivityRow = { id: number; type: string; title: string; text: string; photo_key: string | null }
type FeaturedRow = {
  title: string
  start_time: string
  end_time: string
  place: string
  description: string
  visual_key: string | null
  program: { time: string; label: string }[] | null
}
type LogRow = { icon: string; text: string; who: string; created_at: string }
type DossierRow = {
  id: number
  number: number
  club_name: string
  porteur: string
  filiere: string
  email: string
  whatsapp: string
  deposited_at: string
  status: DossierStatus
  defense_at: string | null
  decided_at: string | null
  motif: string | null
  contexte: string
  vision: string
  objectifs: string[] | null
  dossier_documents: { kind: string; name: string; file_key: string | null }[] | null
}
type PlanningRow = { month: string; club_slug: string | null; vacation: boolean; activity_date: string | null }

const pad = (n: number) => String(n).padStart(2, '0')

/** `229XXXXXXXXXX` (base) → `+229 XXXXXXXXXX` (champ de saisie). */
const toPhoneField = (digits: string | null) => {
  const d = (digits ?? '').replace(/\D/g, '')
  return d ? `+229 ${d.startsWith('229') ? d.slice(3) : d}` : ''
}

const toLocalDateTime = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toDossier(r: DossierRow): Dossier {
  return {
    id: r.id,
    num: String(r.number).padStart(3, '0'),
    club: r.club_name,
    porteur: r.porteur,
    filiere: r.filiere,
    email: r.email,
    wa: toPhoneField(r.whatsapp),
    depot: new Date(r.deposited_at),
    statut: r.status,
    soutenance: r.defense_at ? toLocalDateTime(r.defense_at) : undefined,
    decisionDate: r.decided_at ? new Date(r.decided_at) : undefined,
    motif: r.motif ?? undefined,
    contexte: r.contexte,
    vision: r.vision,
    objectifs: r.objectifs ?? [],
    docs: (r.dossier_documents ?? []).map((d) => ({ kind: d.kind, name: d.name, key: d.file_key })),
  }
}

async function loadClubPart(slug: string): Promise<Pick<AdminState, 'club' | 'saved' | 'draft' | 'photos' | 'cover' | 'log'>> {
  if (!supabase) throw new Error('Supabase non configuré')
  const [clubRes, bureauRes, photosRes, featuredRes, logRes, activitiesRes] = await Promise.all([
    supabase.from('clubs').select('*').eq('slug', slug).single<ClubRow>(),
    supabase.from('club_bureau').select('id, role, name, filiere, photo_key, fixed').eq('club_slug', slug).order('position'),
    supabase.from('club_photos').select('id, label, key, ratio').eq('club_slug', slug).order('position'),
    supabase.from('featured_activities').select('*').eq('club_slug', slug).maybeSingle<FeaturedRow>(),
    supabase.from('club_log').select('icon, text, who, created_at').eq('club_slug', slug).order('created_at', { ascending: false }).limit(5),
    supabase.from('club_activities').select('id, type, title, text, photo_key').eq('club_slug', slug).order('position'),
  ])
  for (const res of [clubRes, bureauRes, photosRes, featuredRes, logRes, activitiesRes]) if (res.error) throw res.error

  const c = clubRes.data!
  const f = featuredRes.data
  const draft: ClubDraft = {
    horaire: c.schedule ?? '',
    description: c.long_description ?? '',
    but: c.goal ?? '',
    objectifs: c.objectives ?? [],
    wa: toPhoneField(c.whatsapp),
    socials: { ...emptyDraft.socials, ...c.socials },
    logoKey: c.logo_key,
    bureau: ((bureauRes.data ?? []) as BureauRow[]).map<BureauSlot>((b) => ({
      id: b.id, role: b.role, name: b.name, filiere: b.filiere, photoKey: b.photo_key, fixed: b.fixed,
    })),
    activities: ((activitiesRes.data ?? []) as ActivityRow[]).map<ActivityExample>((a) => ({
      id: a.id, type: a.type, title: a.title, text: a.text, photoKey: a.photo_key,
    })),
    phare: f
      ? {
          titre: f.title,
          debut: f.start_time.slice(0, 5),
          fin: f.end_time.slice(0, 5),
          lieu: f.place,
          desc: f.description,
          programme: (f.program ?? []).map((p) => ({ h: p.time, l: p.label })),
          visuelKey: f.visual_key,
        }
      : emptyDraft.phare,
  }
  const log: LogEntry[] = ((logRes.data ?? []) as LogRow[]).map((l) => ({
    icon: l.icon, text: l.text, who: l.who, when: fmt(new Date(l.created_at), { day: 'numeric', month: 'short' }),
  }))

  return {
    club: { slug: c.slug, name: c.name, category: c.category },
    saved: structuredClone(draft),
    draft,
    photos: ((photosRes.data ?? []) as PhotoRow[]).map<Photo>((p) => ({ id: p.id, label: p.label, key: p.key, ratio: Number(p.ratio) || 1 })),
    cover: c.cover_photo_id ?? 0,
    log,
  }
}

async function loadCommitteePart(): Promise<Pick<AdminState, 'dossiers' | 'planning' | 'planningDays' | 'clubOptions'>> {
  if (!supabase) throw new Error('Supabase non configuré')
  const [dossiersRes, planningRes, clubsRes] = await Promise.all([
    supabase.from('dossiers').select('*, dossier_documents(kind, name, file_key)').order('deposited_at', { ascending: false }),
    supabase.from('planning').select('month, club_slug, vacation, activity_date'),
    supabase.from('clubs').select('slug, name').order('name'),
  ])
  if (dossiersRes.error) throw dossiersRes.error
  if (planningRes.error) throw planningRes.error
  if (clubsRes.error) throw clubsRes.error

  const planning: Planning = {}
  const planningDays: PlanningDays = {}
  for (const p of (planningRes.data ?? []) as PlanningRow[]) {
    const [y, m] = p.month.split('-').map(Number)
    const key = `${y}-${(m ?? 1) - 1}`
    planning[key] = p.vacation ? '__vac' : (p.club_slug ?? '')
    if (p.activity_date) planningDays[key] = p.activity_date
  }
  return {
    dossiers: ((dossiersRes.data ?? []) as DossierRow[]).map(toDossier),
    planning,
    planningDays,
    clubOptions: ((clubsRes.data ?? []) as { slug: string; name: string }[]).map((c) => [c.slug, c.name]),
  }
}

/** État initial de l'espace admin pour l'utilisateur connecté. */
export async function loadAdminState(user: AuthUser): Promise<AdminState> {
  if (!supabase) return mockState()

  const blank: AdminState = {
    club: { slug: '', name: '', category: 'Tech' } satisfies ManagedClub,
    saved: emptyDraft,
    draft: structuredClone(emptyDraft),
    photos: [],
    cover: 0,
    dossiers: [],
    planning: {},
    planningDays: {},
    clubOptions: [],
    log: [],
    toast: null,
  }
  if (user.role === 'club' && user.clubSlug) return { ...blank, ...(await loadClubPart(user.clubSlug)) }
  if (user.role === 'comite') return { ...blank, ...(await loadCommitteePart()) }
  return blank
}

// ---------------------------------------------------------------------------------------------
// Sélecteurs (calculs d'affichage, indépendants de la source des données).
// ---------------------------------------------------------------------------------------------

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

export function clubName(options: [string, string][], slug: string): string {
  return options.find(([s]) => s === slug)?.[1] ?? slug
}

/** Les 10 mois d'activité de l'année universitaire en cours (septembre à juin). */
const seasonStart = TODAY.getMonth() >= 8 ? TODAY.getFullYear() : TODAY.getFullYear() - 1
export const SEASON_LABEL = `${seasonStart}–${seasonStart + 1}`
export const MONTHS = Array.from({ length: 10 }, (_, i) => {
  const y = seasonStart + (8 + i >= 12 ? 1 : 0)
  const m = (8 + i) % 12
  return { key: `${y}-${m}`, y, m, fri: lastFridayOf(y, m) }
})

export type CompletionCheck = { label: string; ok: boolean; to: ClubView }

/** `YYYY-MM-DD` → date locale (sans décalage de fuseau). */
export const parseDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 1970, (m ?? 1) - 1, d ?? 1)
}

export const toIsoDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Jour de l'activité d'un mois : celui choisi par le Comité, sinon le dernier vendredi. */
export function activityDay(days: PlanningDays, month: { key: string; fri: Date }): Date {
  const chosen = days[month.key]
  return chosen ? parseDay(chosen) : month.fri
}

export function getCompletion(draft: ClubDraft, photos: Photo[], cover: number) {
  const bureauOk = draft.bureau.filter((m) => m.fixed).every((m) => m.name.trim() && m.photoKey)
  const nObj = draft.objectifs.filter((o) => o.trim()).length
  const nSoc = Object.values(draft.socials).filter((x) => x.trim()).length
  const checks: CompletionCheck[] = [
    { label: 'Description (80 caractères min.)', ok: draft.description.trim().length >= 80, to: 'fiche' },
    { label: 'But du club', ok: !!draft.but.trim(), to: 'fiche' },
    { label: 'Au moins 3 objectifs', ok: nObj >= 3, to: 'fiche' },
    { label: 'Au moins 2 réseaux sociaux', ok: nSoc >= 2, to: 'fiche' },
    { label: 'Bureau complet avec photos', ok: !!bureauOk, to: 'bureau' },
    { label: "Au moins 2 exemples d'activités", ok: draft.activities.filter((a) => a.title.trim()).length >= 2, to: 'exemples' },
    { label: 'Au moins 6 photos dans la galerie', ok: photos.length >= 6, to: 'galerie' },
    { label: 'Photo de couverture choisie', ok: photos.some((p) => p.id === cover), to: 'galerie' },
  ]
  const pct = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
  return { pct, checks }
}

/** Mois à l'honneur du club connecté. */
export function getClubMonth(planning: Planning, days: PlanningDays, clubSlug: string, title: string) {
  const key = Object.keys(planning).find((k) => planning[k] === clubSlug)
  const month = MONTHS.find((m) => m.key === key)
  if (!month) return { label: 'Pas encore programmé', date: 'Le Comité annoncera ta date', countdown: '', title }
  const day = activityDay(days, month)
  const left = diffDays(TODAY, day)
  return {
    label: capitalize(fmt(day, { month: 'long', year: 'numeric' })),
    date: capitalize(fmt(day, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })),
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
