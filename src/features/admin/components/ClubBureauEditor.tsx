import Icon from '../../../components/Icon.tsx'
import { editDraft } from '../actions.ts'
import { useAdmin } from '../adminContext.ts'
import { cardClass, FileButton } from './ui.tsx'

const textInput =
  'h-11 w-full rounded-[10px] border-[1.5px] border-[#8a95a8] px-3 font-[inherit] text-[15px] text-navy outline-none focus:border-navy'

export default function ClubBureauEditor() {
  const { state, apply } = useAdmin()
  const bureau = state.draft.bureau
  const set = (edit: (d: typeof state.draft) => void) => apply((s) => editDraft(s, edit))

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,250px),1fr))] gap-4">
        {bureau.map((m, i) => {
          const missing = !m.url && !m.photo
          return (
            <div key={m.id} className={`${cardClass} flex flex-col gap-3 p-4`}>
              <FileButton
                accept="image/*"
                onFiles={([file]) => file && set((d) => { d.bureau[i]!.url = URL.createObjectURL(file) })}
                className={`relative block aspect-square overflow-hidden rounded-xl border-[1.5px] border-dashed ${
                  missing ? 'border-accent bg-[#fdf0f1]' : 'border-transparent ph-light'
                }`}
              >
                {m.url && (
                  <span
                    role="img"
                    aria-label={m.name}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${m.url})` }}
                  />
                )}
                {!m.url && m.photo && (
                  <span className="absolute left-2.5 top-2.5 font-mono text-[11px] text-muted">portrait</span>
                )}
                {missing && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-sm font-semibold text-accent">
                    <Icon name="person" size={32} />
                    Photo manquante
                  </span>
                )}
                <span className="absolute inset-x-2 bottom-2 flex h-10 items-center justify-center gap-1.5 rounded-[10px] bg-white/95 text-sm font-semibold text-navy">
                  <Icon name="cloud_upload" size={18} />
                  {m.url || m.photo ? 'Changer la photo' : 'Ajouter une photo'}
                </span>
              </FileButton>

              {m.fixed ? (
                <span className="text-[13px]/[18px] font-semibold text-accent">{m.role}</span>
              ) : (
                <input
                  aria-label="Poste"
                  placeholder="Intitulé du poste"
                  value={m.role}
                  onChange={(e) => set((d) => { d.bureau[i]!.role = e.target.value })}
                  className={`${textInput} font-semibold`}
                />
              )}
              <input
                aria-label={`Nom · ${m.role || 'poste'}`}
                placeholder="Nom et prénom"
                value={m.name}
                onChange={(e) => set((d) => { d.bureau[i]!.name = e.target.value })}
                className={textInput}
              />
              <input
                aria-label={`Filière · ${m.role || 'poste'}`}
                placeholder="Filière et niveau"
                value={m.filiere}
                onChange={(e) => set((d) => { d.bureau[i]!.filiere = e.target.value })}
                className={textInput}
              />
              {!m.fixed && (
                <button
                  type="button"
                  onClick={() => set((d) => { d.bureau.splice(i, 1) })}
                  className="flex h-10 cursor-pointer items-center gap-1.5 self-start rounded-[10px] border-0 bg-transparent px-2.5 font-[inherit] text-sm font-semibold text-muted hover:bg-soft hover:text-navy"
                >
                  <Icon name="delete" size={18} />
                  Retirer ce poste
                </button>
              )}
            </div>
          )
        })}

        <button
          type="button"
          onClick={() =>
            set((d) => {
              d.bureau.push({ id: Date.now(), role: '', name: '', filiere: '', photo: false, url: null, fixed: false })
            })
          }
          className="flex min-h-60 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-[#8a95a8] bg-transparent font-[inherit] text-[15px] font-semibold text-navy hover:border-navy hover:bg-white"
        >
          <Icon name="add" size={28} />
          Ajouter un poste
        </button>
      </div>
      <p className="m-0 text-[13px]/[18px] font-medium text-muted">
        Président, Secrétaire, Trésorier et Communication sont obligatoires sur chaque page club.
      </p>
    </>
  )
}
