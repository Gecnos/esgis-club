import { useEffect, useState } from 'react'
import Icon from '../../../components/Icon.tsx'
import { imageUrl } from '../../../lib/storage.ts'
import { saveCommittee, uploadCommitteePhoto } from '../../committee/actions.ts'
import { getCommittee } from '../../committee/queries.ts'
import type { Member } from '../../committee/types.ts'
import { saveHeroPhotos, uploadSitePhoto } from '../../site/actions.ts'
import { getHeroPhotos } from '../../site/queries.ts'
import type { HeroPhotos } from '../../site/types.ts'
import { Card, cardClass, ErrorNote, FileButton, primaryButton } from './ui.tsx'

const heroLabels = ['Grande photo (match, scène…)', 'Haut droite', 'Milieu droite', 'Bas gauche', 'Bas large']

const textInput =
  'h-11 w-full rounded-[10px] border-[1.5px] border-[#8a95a8] px-3 font-[inherit] text-[15px] text-navy outline-none focus:border-navy'

function HeroPhotosCard() {
  const [photos, setPhotos] = useState<HeroPhotos | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getHeroPhotos().then(setPhotos, (e: Error) => setError(e.message))
  }, [])

  async function change(index: number, file: File | null) {
    if (!photos) return
    setError('')
    setSaved(false)
    try {
      const key = file ? await uploadSitePhoto(file) : null
      const next = photos.map((p, i) => (i === index ? key : p))
      await saveHeroPhotos(next)
      setPhotos(next)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.')
    }
  }

  return (
    <Card title="Photos de la page d'accueil">
      <p className="m-0 text-[15px]/[22px] text-muted">
        Cinq photos de la vie des clubs, affichées en mosaïque sous le titre. Elles sont publiées dès l'ajout.
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,150px),1fr))] gap-3">
        {heroLabels.map((label, i) => {
          const key = photos?.[i] ?? null
          const url = imageUrl(key)
          return (
            <div key={label} className="flex flex-col gap-2">
              <FileButton
                accept="image/*"
                onFiles={([file]) => file && void change(i, file)}
                className="ph-light block aspect-[4/3] overflow-hidden rounded-xl"
              >
                {url && <span role="img" aria-label={label} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />}
                <span className="absolute inset-x-1.5 bottom-1.5 flex h-9 items-center justify-center gap-1 rounded-[9px] bg-white/95 text-[13px] font-semibold text-navy">
                  <Icon name="cloud_upload" size={16} />
                  {key ? 'Changer' : 'Ajouter'}
                </span>
              </FileButton>
              <span className="text-[13px]/[18px] font-medium text-muted">{label}</span>
              {key && (
                <button
                  type="button"
                  onClick={() => void change(i, null)}
                  className="flex h-9 cursor-pointer items-center gap-1 self-start rounded-[9px] border-0 bg-transparent px-2 font-[inherit] text-[13px] font-semibold text-muted hover:bg-soft hover:text-navy"
                >
                  <Icon name="delete" size={16} />
                  Retirer
                </button>
              )}
            </div>
          )
        })}
      </div>
      {saved && <span role="status" className="text-[13px]/[18px] font-medium text-muted">Enregistré. La page d'accueil est à jour.</span>}
    </Card>
  )
}

function CommitteeCard() {
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getCommittee().then(setMembers, (e: Error) => setError(e.message))
  }, [])

  const edit = (index: number, patch: Partial<Member>) => {
    setSaved(false)
    setMembers((list) => (list ?? []).map((m, i) => (i === index ? { ...m, ...patch } : m)))
  }

  async function upload(index: number, file: File) {
    setError('')
    try {
      edit(index, { photoKey: await uploadCommitteePhoto(file) })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Envoi de la photo impossible.")
    }
  }

  async function save() {
    if (!members) return
    setBusy(true)
    setError('')
    try {
      await saveCommittee(members)
      setSaved(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Enregistrement impossible.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Card title="Équipe du Comité">
      <p className="m-0 text-[15px]/[22px] text-muted">
        Les membres affichés dans « Qui gère les clubs ? » sur la page d'accueil. Les lignes sans nom ne sont pas enregistrées.
      </p>
      {error && <ErrorNote>{error}</ErrorNote>}
      {!members && !error && <p className="m-0 text-muted">Chargement…</p>}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,200px),1fr))] gap-4">
        {members?.map((m, i) => {
          const url = imageUrl(m.photoKey)
          return (
            <div key={i} className={`${cardClass} flex flex-col gap-2.5 p-3`}>
              <FileButton
                accept="image/*"
                onFiles={([file]) => file && void upload(i, file)}
                className="ph-light block aspect-square overflow-hidden rounded-xl"
              >
                {url && <span role="img" aria-label={m.name} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />}
                {!url && <span className="absolute left-2.5 top-2.5 font-mono text-[11px] text-muted">portrait</span>}
                <span className="absolute inset-x-1.5 bottom-1.5 flex h-9 items-center justify-center gap-1 rounded-[9px] bg-white/95 text-[13px] font-semibold text-navy">
                  <Icon name="cloud_upload" size={16} />
                  {url ? 'Changer la photo' : 'Ajouter une photo'}
                </span>
              </FileButton>
              <input aria-label="Poste" placeholder="Poste" value={m.role} onChange={(e) => edit(i, { role: e.target.value })} className={`${textInput} font-semibold`} />
              <input aria-label="Nom" placeholder="Nom et prénom" value={m.name} onChange={(e) => edit(i, { name: e.target.value })} className={textInput} />
              <input aria-label="Filière" placeholder="Filière et niveau" value={m.filiere} onChange={(e) => edit(i, { filiere: e.target.value })} className={textInput} />
              <button
                type="button"
                onClick={() => {
                  setSaved(false)
                  setMembers((list) => (list ?? []).filter((_, j) => j !== i))
                }}
                className="flex h-9 cursor-pointer items-center gap-1 self-start rounded-[9px] border-0 bg-transparent px-2 font-[inherit] text-[13px] font-semibold text-muted hover:bg-soft hover:text-navy"
              >
                <Icon name="delete" size={16} />
                Retirer
              </button>
            </div>
          )
        })}
        {members && (
          <button
            type="button"
            onClick={() => {
              setSaved(false)
              setMembers((list) => [...(list ?? []), { role: '', name: '', filiere: '', photoKey: null }])
            }}
            className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#8a95a8] bg-transparent font-[inherit] text-[15px] font-semibold text-navy hover:border-navy hover:bg-white"
          >
            <Icon name="add" size={28} />
            Ajouter un membre
          </button>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void save()} disabled={busy || !members} className={`${primaryButton} h-12 px-5 disabled:opacity-60`}>
          {busy ? 'Enregistrement…' : "Enregistrer l'équipe"}
        </button>
        {saved && <span role="status" className="text-[13px]/[18px] font-medium text-muted">Enregistré.</span>}
      </div>
    </Card>
  )
}

export default function ComiteSite() {
  return (
    <div className="flex flex-col gap-6">
      <HeroPhotosCard />
      <CommitteeCard />
    </div>
  )
}
