import Icon from '../../../components/Icon.tsx'
import { useMediaQuery } from '../../../lib/useMediaQuery.ts'
import { imageUrl } from '../../../lib/storage.ts'
import { useAdmin } from '../adminContext.ts'
import { getClubMonth } from '../queries.ts'
import { useAdminActions } from '../useAdminActions.ts'
import { Card, Field, FileButton, smallInputClass, TextAreaInput, TextInput } from './ui.tsx'

const timeInput =
  'h-12 w-full rounded-xl border-[1.5px] border-[#8a95a8] bg-white px-3.5 font-[inherit] text-base text-navy outline-none focus:border-navy'

const hh = (t: string) => t.replace(':', 'h')

export default function ClubActivite() {
  const { state } = useAdmin()
  const actions = useAdminActions()
  const isMobile = useMediaQuery('(max-width: 899px)')
  const p = state.draft.phare
  const month = getClubMonth(state.planning, state.planningDays, state.club.slug, state.saved.phare.titre)
  const set = (edit: (phare: typeof p) => void) => actions.edit((d) => edit(d.phare))
  const visual = imageUrl(p.visuelKey)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-navy px-5 py-4 text-white">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[13px]/[18px] font-medium">
          <Icon name="workspace_premium" size={16} />
          {month.label}
        </span>
        <span className="text-[15px]/[22px] font-semibold">{month.date}</span>
        <span className="text-[13px]/[18px] font-medium text-mist">Date fixée par le Comité · {month.countdown}</span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,400px),1fr))] items-start gap-6">
        <Card>
          <TextInput id="a-ptitre" label="Titre de l'activité" value={p.titre} onChange={(v) => set((x) => { x.titre = v })} />
          <div className="grid grid-cols-2 gap-4">
            <Field id="a-pdeb" label="Début">
              <input id="a-pdeb" type="time" value={p.debut} onChange={(e) => set((x) => { x.debut = e.target.value })} className={timeInput} />
            </Field>
            <Field id="a-pfin" label="Fin">
              <input id="a-pfin" type="time" value={p.fin} onChange={(e) => set((x) => { x.fin = e.target.value })} className={timeInput} />
            </Field>
          </div>
          <TextInput id="a-plieu" label="Lieu" value={p.lieu} onChange={(v) => set((x) => { x.lieu = v })} />
          <TextAreaInput id="a-pdesc" label="Description" rows={4} max={300} value={p.desc} onChange={(v) => set((x) => { x.desc = v })} />

          <div className="flex flex-col gap-2">
            <span className="text-sm/5 font-semibold">Programme</span>
            {p.programme.map((r, i) => (
              <div key={i} className="grid grid-cols-[112px_minmax(0,1fr)_44px] items-center gap-2">
                <input
                  type="time"
                  aria-label={`Heure, étape ${i + 1}`}
                  value={r.h}
                  onChange={(e) => set((x) => { x.programme[i]!.h = e.target.value })}
                  className={`${smallInputClass} h-11 px-2 text-sm`}
                />
                <input
                  aria-label={`Étape ${i + 1}`}
                  placeholder="Étape du programme"
                  value={r.l}
                  onChange={(e) => set((x) => { x.programme[i]!.l = e.target.value })}
                  className={`${smallInputClass} h-11 px-2.5 text-[15px]`}
                />
                <button
                  type="button"
                  aria-label="Supprimer l'étape"
                  onClick={() => set((x) => { x.programme.splice(i, 1) })}
                  className="flex size-11 cursor-pointer items-center justify-center rounded-[10px] border-0 bg-transparent text-muted hover:bg-soft hover:text-navy"
                >
                  <Icon name="delete" size={20} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => set((x) => { x.programme.push({ h: '', l: '' }) })}
              className="flex h-11 cursor-pointer items-center gap-1.5 self-start rounded-xl border-0 bg-transparent pl-2 pr-3 font-[inherit] text-[15px] font-semibold text-navy hover:bg-soft"
            >
              <Icon name="add" size={22} />
              Ajouter une étape
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm/5 font-semibold">Visuel</span>
            <FileButton
              accept="image/*"
              onFiles={([file]) => file && void actions.uploadVisual(file)}
              className="flex min-h-16 items-center gap-3 rounded-xl border-[1.5px] border-dashed border-[#8a95a8] bg-[#fafbfd] px-4 py-3 hover:border-navy"
            >
              <Icon name="image" size={24} />
              <span className="flex flex-col">
                <span className="text-[15px]/[22px] font-semibold">{p.visuelKey ? 'Remplacer le visuel' : 'Ajouter un visuel'}</span>
                <span className="text-[13px]/[18px] font-medium text-muted">Paysage 4:3 conseillé · JPG ou PNG</span>
              </span>
            </FileButton>
          </div>
        </Card>

        <div className="sticky flex flex-col gap-3" style={{ top: isMobile ? 80 : 24 }}>
          <span className="flex items-center gap-2 text-[13px]/[18px] font-medium text-muted">
            <Icon name="visibility" size={18} />
            Aperçu sur la page du club
          </span>
          <article className="overflow-hidden rounded-xl bg-navy text-white shadow-[0_16px_40px_rgb(11_31_58/0.18)]">
            <div className="ph-navy relative aspect-video">
              {visual ? (
                <span aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${visual})` }} />
              ) : (
                <span className="absolute bottom-2.5 left-3 font-mono text-[11px] text-steel">visuel de l'activité</span>
              )}
            </div>
            <div className="flex flex-col gap-3 p-5">
              <span className="self-start rounded-full bg-accent px-2.5 py-1 text-[13px]/[18px] font-medium">
                Club du mois · {month.label}
              </span>
              <h3 className="m-0 text-xl/7 font-semibold">{p.titre}</h3>
              <span className="flex items-center gap-2 text-sm/5">
                <Icon name="calendar_month" size={18} className="text-mist" />
                {month.date} · {hh(p.debut)} – {hh(p.fin)}
              </span>
              <span className="flex items-center gap-2 text-sm/5">
                <Icon name="location_on" size={18} className="text-mist" />
                {p.lieu}
              </span>
              <p className="m-0 line-clamp-3 text-sm/[22px] text-[#dce2eb]">{p.desc}</p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
