import Icon from '../../../components/Icon.tsx'
import { imageUrl } from '../../../lib/storage.ts'
import { useAdmin } from '../adminContext.ts'
import { ACTIVITY_TYPES } from '../types.ts'
import { useAdminActions } from '../useAdminActions.ts'
import { Card, cardClass, FileButton } from './ui.tsx'

const MAX = 6

const textInput =
  'h-11 w-full rounded-[10px] border-[1.5px] border-[#8a95a8] px-3 font-[inherit] text-[15px] text-navy outline-none focus:border-navy'

export default function ClubExemples() {
  const { state } = useAdmin()
  const actions = useAdminActions()
  const items = state.draft.activities

  return (
    <>
      <Card className="!gap-2 !p-5">
        <p className="m-0 text-[15px]/[22px] text-muted">
          Montre ce que les membres font concrètement : un atelier, une sortie, un tournoi. Ces exemples s'affichent dans « Exemples d'activités » sur la page de ton club.
          Ajoute 2 à {MAX} exemples, avec une photo si possible.
        </p>
      </Card>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-4">
        {items.map((a, i) => {
          const photo = imageUrl(a.photoKey)
          return (
            <div key={a.id} className={`${cardClass} flex flex-col gap-3 p-4`}>
              <FileButton
                accept="image/*"
                onFiles={([file]) => file && void actions.uploadActivityPhoto(i, file)}
                className="ph-light relative block aspect-[4/3] overflow-hidden rounded-xl"
              >
                {photo && <span role="img" aria-label={a.title} className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${photo})` }} />}
                {!photo && <span className="absolute left-2.5 top-2.5 font-mono text-[11px] text-muted">photo de l'activité</span>}
                <span className="absolute inset-x-2 bottom-2 flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-white/95 text-sm font-semibold text-navy">
                  <Icon name="cloud_upload" size={18} />
                  {photo ? 'Changer la photo' : 'Ajouter une photo'}
                </span>
              </FileButton>

              <select
                aria-label="Type d'activité"
                value={a.type}
                onChange={(e) => actions.edit((d) => { d.activities[i]!.type = e.target.value })}
                className={`${textInput} cursor-pointer`}
              >
                {[...new Set([...ACTIVITY_TYPES, a.type])].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <input
                aria-label="Titre de l'activité"
                placeholder="Titre (ex. Initiation Arduino)"
                maxLength={60}
                value={a.title}
                onChange={(e) => actions.edit((d) => { d.activities[i]!.title = e.target.value })}
                className={`${textInput} font-semibold`}
              />
              <textarea
                aria-label="Description de l'activité"
                placeholder="En une ou deux phrases : ce qu'on y fait, pour qui."
                rows={3}
                maxLength={160}
                value={a.text}
                onChange={(e) => actions.edit((d) => { d.activities[i]!.text = e.target.value })}
                className="w-full resize-y rounded-[10px] border-[1.5px] border-[#8a95a8] px-3 py-2.5 font-[inherit] text-[15px]/[22px] text-navy outline-none focus:border-navy"
              />
              <button
                type="button"
                onClick={() => actions.edit((d) => { d.activities.splice(i, 1) })}
                className="flex h-10 cursor-pointer items-center gap-1.5 self-start rounded-[10px] border-0 bg-transparent px-2.5 font-[inherit] text-sm font-semibold text-muted hover:bg-soft hover:text-navy"
              >
                <Icon name="delete" size={18} />
                Retirer cet exemple
              </button>
            </div>
          )
        })}

        {items.length < MAX && (
          <button
            type="button"
            onClick={() =>
              actions.edit((d) => {
                d.activities.push({ id: -Date.now(), type: ACTIVITY_TYPES[0], title: '', text: '', photoKey: null })
              })
            }
            className="flex min-h-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#8a95a8] bg-transparent font-[inherit] text-[15px] font-semibold text-navy hover:border-navy hover:bg-white"
          >
            <Icon name="add" size={28} />
            Ajouter un exemple
          </button>
        )}
      </div>
      <p className="m-0 text-[13px]/[18px] font-medium text-muted">
        Tant que tu n'as pas publié d'exemples, la page affiche des exemples génériques pour ta catégorie.
      </p>
    </>
  )
}
