import { useEffect, useId, useState } from 'react'
import { Link } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { imageUrl } from '../../../lib/storage.ts'
import { createClub, updateClub, uploadClubPhoto } from '../../clubs/actions.ts'
import { getClubs } from '../../clubs/queries.ts'
import { slugify, validateClubForm } from '../../clubs/schemas.ts'
import type { ClubFormErrors } from '../../clubs/schemas.ts'
import { categories } from '../../clubs/types.ts'
import type { Category, Club } from '../../clubs/types.ts'
import { useAdmin } from '../adminContext.ts'
import { Card, cardClass, ErrorNote, Field, FileButton, ghostButton, inputClass, outlineButton, primaryButton, TextInput } from './ui.tsx'

type Form = { name: string; category: Category | ''; description: string; members: string }
const emptyForm: Form = { name: '', category: '', description: '', members: '0' }

const toValues = (f: Form) => ({
  name: f.name,
  category: f.category as Category,
  description: f.description,
  members: Number.parseInt(f.members, 10) || 0,
})

/** Formulaire commun à l'ajout et à la modification d'un club. */
function ClubForm({
  initial,
  initialPhoto,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Form
  initialPhoto: string | null
  submitLabel: string
  onSubmit: (form: Form, photo: { key: string | null; file: File | null }) => Promise<void>
  onCancel?: () => void
}) {
  const uid = useId()
  const [form, setForm] = useState<Form>(initial)
  const [photo, setPhoto] = useState<{ key: string | null; file: File | null }>({ key: initialPhoto, file: null })
  const [preview, setPreview] = useState<string | null>(null)
  const choose = (file: File) => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setPhoto({ key: photo.key, file })
  }
  const [errors, setErrors] = useState<ClubFormErrors>({})
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }))

  const shown = preview ?? imageUrl(photo.key)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const found = validateClubForm(toValues(form))
    setErrors(found)
    setError('')
    if (Object.keys(found).length > 0 || !form.category) {
      if (!form.category) setErrors((er) => ({ ...er, category: 'Choisis une catégorie.' }))
      return
    }
    setBusy(true)
    try {
      await onSubmit(form, photo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={(e) => void submit(e)} noValidate className="flex flex-col gap-4">
      <FileButton
        accept="image/*"
        onFiles={([file]) => file && choose(file)}
        className="ph-light block aspect-[16/9] w-full overflow-hidden rounded-xl"
      >
        {shown && <span role="img" aria-label="Photo de la carte" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${shown})` }} />}
        {!shown && <span className="absolute left-2.5 top-2.5 font-mono text-[11px] text-muted">photo de la carte du club</span>}
        <span className="absolute inset-x-2 bottom-2 flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-white/95 text-sm font-semibold text-navy">
          <Icon name="cloud_upload" size={18} />
          {shown ? 'Changer la photo' : 'Ajouter une photo'}
        </span>
      </FileButton>

      <div className="flex flex-col gap-1.5">
        <TextInput id={`${uid}-name`} label="Nom du club" value={form.name} onChange={(v) => set('name', v)} placeholder="Ex. Échecs" />
        {errors.name && <ErrorNote>{errors.name}</ErrorNote>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Field id={`${uid}-category`} label="Catégorie">
          <select
            id={`${uid}-category`}
            value={form.category}
            onChange={(e) => set('category', e.target.value as Category)}
            className={`${inputClass} h-12 px-3`}
          >
            <option value="">Choisir une catégorie…</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        {errors.category && <ErrorNote>{errors.category}</ErrorNote>}
      </div>
      <div className="flex flex-col gap-1.5">
        <Field id={`${uid}-desc`} label="Présentation courte (affichée sur la carte)">
          <textarea
            id={`${uid}-desc`}
            rows={3}
            maxLength={140}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputClass} resize-y px-3.5 py-3 leading-6`}
          />
        </Field>
        {errors.description && <ErrorNote>{errors.description}</ErrorNote>}
      </div>
      <div className="flex flex-col gap-1.5">
        <TextInput id={`${uid}-members`} label="Nombre de membres" type="number" value={form.members} onChange={(v) => set('members', v)} />
        {errors.members && <ErrorNote>{errors.members}</ErrorNote>}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={`${primaryButton} h-12 px-5 disabled:opacity-60`}>
          {busy ? 'Enregistrement…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={`${ghostButton} h-12 px-4`}>
            Annuler
          </button>
        )}
      </div>
    </form>
  )
}

export default function ComiteClubs() {
  const { state, apply } = useAdmin()
  const [clubs, setClubs] = useState<Club[] | null>(null)
  const [loadError, setLoadError] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [created, setCreated] = useState<Club | null>(null)
  const [formKey, setFormKey] = useState(0)

  useEffect(() => {
    getClubs().then(setClubs, (e: Error) => setLoadError(e.message))
  }, [])

  const syncOptions = (list: Club[]) =>
    apply((s) => ({ ...s, clubOptions: list.map((c) => [c.slug, c.name] as [string, string]) }))

  async function add(form: Form, photo: { key: string | null; file: File | null }) {
    const values = toValues(form)
    const slug = slugify(values.name)
    if (clubs?.some((c) => c.slug === slug)) throw new Error('Un club porte déjà ce nom.')
    const key = photo.file ? await uploadClubPhoto(slug, photo.file) : photo.key
    const club = await createClub(values, key, slug)
    const next = [...(clubs ?? []), club].sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    setClubs(next)
    syncOptions(next)
    setCreated(club)
    setFormKey((k) => k + 1) // vide le formulaire
  }

  async function save(club: Club, form: Form, photo: { key: string | null; file: File | null }) {
    const key = photo.file ? await uploadClubPhoto(club.slug, photo.file) : photo.key
    const updated = await updateClub(club.slug, toValues(form), key)
    const next = (clubs ?? []).map((c) => (c.slug === club.slug ? updated : c)).sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    setClubs(next)
    syncOptions(next)
    setEditing(null)
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-6">
      <div className="flex flex-col gap-6">
        <Card title="Ajouter un club">
          <ClubForm key={formKey} initial={emptyForm} initialPhoto={null} submitLabel="Ajouter le club" onSubmit={add} />
        </Card>
        {created && (
          <section role="status" className={`${cardClass} flex flex-col gap-3 border-l-4 border-accent p-5`}>
            <h2 className="m-0 text-lg/6 font-semibold">Club {created.name} ajouté</h2>
            <p className="m-0 text-[15px]/[22px] text-muted">
              Sa page est en ligne. Crée maintenant le compte de son responsable pour qu'il complète la fiche, le bureau et la galerie.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to={`/admin/comite/comptes?club=${created.slug}`} className={`${primaryButton} h-11 px-4 no-underline`}>
                <Icon name="person_add" size={20} />
                Créer son responsable
              </Link>
              <Link to={`/clubs/${created.slug}`} className={`${outlineButton} h-11 px-4 no-underline`}>
                <Icon name="visibility" size={20} />
                Voir la page
              </Link>
            </div>
          </section>
        )}
      </div>

      <Card title={`Clubs${clubs ? ` (${clubs.length})` : ''}`}>
        {loadError && <ErrorNote>{loadError}</ErrorNote>}
        {!clubs && !loadError && <p className="m-0 text-muted">Chargement…</p>}
        <ul className="m-0 flex list-none flex-col p-0">
          {clubs?.map((c) => {
            const thumb = imageUrl(c.photoKey)
            return (
              <li key={c.slug} className="flex flex-col gap-3 border-t border-[#eef1f5] py-3 first:border-t-0">
                <div className="flex items-center gap-3">
                  <span className="ph-light relative size-14 flex-none overflow-hidden rounded-[10px]">
                    {thumb && <span role="img" aria-label={c.name} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${thumb})` }} />}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-[15px]/[22px] font-semibold">{c.name}</span>
                    <span className="truncate text-[13px]/[18px] text-muted">
                      {c.category} · {c.members} membres{thumb ? '' : ' · sans photo'}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditing(editing === c.slug ? null : c.slug)}
                    aria-label={`Modifier le club ${c.name}`}
                    className={`${ghostButton} size-11 justify-center`}
                  >
                    <Icon name={editing === c.slug ? 'close' : 'edit'} size={22} />
                  </button>
                </div>
                {editing === c.slug && (
                  <ClubForm
                    initial={{ name: c.name, category: c.category, description: c.description, members: String(c.members) }}
                    initialPhoto={c.photoKey ?? null}
                    submitLabel="Enregistrer"
                    onSubmit={(form, photo) => save(c, form, photo)}
                    onCancel={() => setEditing(null)}
                  />
                )}
              </li>
            )
          })}
        </ul>
        <p className="m-0 text-[13px]/[18px] text-muted">
          {state.clubOptions.length} clubs au total. L'adresse d'un club (<code>/clubs/nom</code>) ne change jamais après sa création, même si tu renommes le club.
        </p>
      </Card>
    </div>
  )
}
