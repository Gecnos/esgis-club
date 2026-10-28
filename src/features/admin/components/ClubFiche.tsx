import { Link } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { imageUrl } from '../../../lib/storage.ts'
import { useAdmin } from '../adminContext.ts'
import type { Socials } from '../types.ts'
import { useAdminActions } from '../useAdminActions.ts'
import { Card, ErrorNote, Field, FileButton, TextAreaInput, TextInput, inputClass } from './ui.tsx'

const socialFields: [keyof Socials, string, string][] = [
  ['instagram', 'Instagram', '@nomduclub'],
  ['facebook', 'Facebook', 'Nom de la page'],
  ['tiktok', 'TikTok', '@nomduclub'],
  ['linkedin', 'LinkedIn', 'Nom de la page'],
]

const lockedField = 'flex h-12 items-center justify-between gap-2 rounded-xl bg-soft px-3.5 text-base text-muted'

export default function ClubFiche() {
  const { state } = useAdmin()
  const actions = useAdminActions()
  const d = state.draft
  const set = (edit: (draft: typeof d) => void) => actions.edit(edit)
  const logo = imageUrl(d.logoKey)
  const clubInitials = state.club.name.replace(/&/g, '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  const digits = d.wa.replace(/\D/g, '')
  const local = digits.startsWith('229') ? digits.slice(3) : digits
  const waValid = local.length === 10
  const waNumber = `229${local}`
  const nObj = d.objectifs.filter((o) => o.trim()).length
  const cover = state.photos.find((p) => p.id === state.cover)

  return (
    <div className="flex max-w-[880px] flex-col gap-6">
      <Card title="Identité">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-5">
          <Field label="Nom du club">
            <div className={lockedField}>
              Club {state.club.name}
              <Icon name="lock" size={18} />
            </div>
          </Field>
          <Field label="Catégorie">
            <div className={lockedField}>
              {state.club.category}
              <Icon name="lock" size={18} />
            </div>
          </Field>
          <TextInput id="a-horaire" label="Horaire et lieu des séances" value={d.horaire} onChange={(v) => set((x) => { x.horaire = v })} />
        </div>
        <p className="m-0 -mt-2 text-[13px]/[18px] font-medium text-muted">
          Le nom et la catégorie sont gérés par le Comité des Clubs.
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-5">
          <div className="flex items-center gap-4">
            {logo ? (
              <span
                role="img"
                aria-label="Logo du club"
                className="size-[88px] flex-none rounded-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${logo})` }}
              />
            ) : (
              <span className="flex size-[88px] flex-none items-center justify-center rounded-xl bg-navy text-[26px] font-bold text-white">
                {clubInitials}
              </span>
            )}
            <div className="flex flex-col gap-1.5">
              <span className="text-sm/5 font-semibold">Logo</span>
              <span className="text-[13px]/[18px] font-medium text-muted">Carré, PNG ou JPG, 512 px conseillé</span>
              <FileButton
                accept="image/*"
                onFiles={([file]) => file && void actions.uploadLogo(file)}
                className="flex h-10 items-center gap-1.5 self-start rounded-[10px] border-[1.5px] border-[#c9d1dd] px-3 text-sm font-semibold hover:border-navy"
              >
                <Icon name="cloud_upload" size={18} />
                Remplacer
              </FileButton>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="ph-light flex h-[88px] w-[132px] flex-none items-end overflow-hidden rounded-xl p-2 font-mono text-[10px] text-muted">
              {cover?.label ?? 'aucune'}
            </span>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm/5 font-semibold">Photo de couverture</span>
              <span className="text-[13px]/[18px] font-medium text-muted">Choisie dans la galerie</span>
              <Link
                to="/admin/club/galerie"
                className="flex h-10 items-center gap-1.5 self-start rounded-[10px] border-[1.5px] border-[#c9d1dd] bg-white px-3 text-sm font-semibold text-navy no-underline hover:border-navy"
              >
                <Icon name="swap_horiz" size={18} />
                Changer
              </Link>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Présentation">
        <TextAreaInput id="a-desc" label="Description du club" rows={5} max={600} value={d.description} onChange={(v) => set((x) => { x.description = v })} />
        <TextAreaInput id="a-but" label="But du club" rows={3} max={240} value={d.but} onChange={(v) => set((x) => { x.but = v })} />
      </Card>

      <Card className="!gap-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="m-0 text-xl/7 font-semibold">Objectifs</h2>
          <span className="text-[13px]/[18px] font-medium text-muted">3 à 5 objectifs</span>
        </div>
        {d.objectifs.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="flex size-7 flex-none items-center justify-center rounded-full bg-soft text-[13px] font-semibold">{i + 1}</span>
            <input
              aria-label={`Objectif ${i + 1}`}
              value={o}
              onChange={(e) => set((x) => { x.objectifs[i] = e.target.value })}
              className={`${inputClass} h-12 min-w-0 flex-1 px-3.5`}
            />
            <button
              type="button"
              aria-label="Supprimer cet objectif"
              onClick={() => set((x) => { x.objectifs.splice(i, 1) })}
              className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-xl border-0 bg-transparent text-muted hover:bg-soft hover:text-navy"
            >
              <Icon name="delete" size={22} />
            </button>
          </div>
        ))}
        {d.objectifs.length < 5 && (
          <button
            type="button"
            onClick={() => set((x) => { x.objectifs.push('') })}
            className="flex h-11 cursor-pointer items-center gap-1.5 self-start rounded-xl border-0 bg-transparent pl-2 pr-3 font-[inherit] text-[15px] font-semibold text-navy hover:bg-soft"
          >
            <Icon name="add" size={22} />
            Ajouter un objectif
          </button>
        )}
        {nObj < 3 && <ErrorNote>Ajoute au moins 3 objectifs pour une fiche complète.</ErrorNote>}
      </Card>

      <Card title="Contact et réseaux">
        <div className="flex max-w-[420px] flex-col gap-2">
          <label htmlFor="a-wa" className="text-sm/5 font-semibold">WhatsApp du président</label>
          <input
            id="a-wa"
            type="tel"
            inputMode="tel"
            value={d.wa}
            onChange={(e) => set((x) => { x.wa = e.target.value })}
            className={`${inputClass} h-12 px-3.5 ${waValid ? '' : 'border-accent'}`}
          />
          {waValid && (
            <p className="m-0 text-[13px]/[18px] font-medium text-muted">
              Le bouton « Rejoindre le club » ouvre :{' '}
              <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Bonjour, je souhaite rejoindre le club ' + state.club.name + '.')}`}
                target="_blank"
                rel="noopener"
                className="font-semibold text-navy"
              >
                wa.me/{waNumber}
              </a>
            </p>
          )}
          {!waValid && digits.length > 0 && <ErrorNote>Numéro incomplet : 10 chiffres après +229.</ErrorNote>}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-5">
          {socialFields.map(([key, label, placeholder]) => (
            <TextInput
              key={key}
              id={`a-${key}`}
              label={label}
              placeholder={placeholder}
              value={d.socials[key]}
              onChange={(v) => set((x) => { x.socials[key] = v })}
            />
          ))}
        </div>
      </Card>
    </div>
  )
}
