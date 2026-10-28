import { useState } from 'react'
import { useSearchParams } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { addDays, fmt } from '../../../lib/dates.ts'
import { useMediaQuery } from '../../../lib/useMediaQuery.ts'
import { useAdminActions } from '../useAdminActions.ts'
import { useAdmin } from '../adminContext.ts'
import { TODAY } from '../data.ts'
import { enrichDossier, filterDossiers, statusClasses } from '../queries.ts'
import type { DossierFilter, EnrichedDossier } from '../queries.ts'
import { cardClass, ErrorNote, inputClass, outlineButton, primaryButton } from './ui.tsx'

const filters: [DossierFilter, string][] = [
  ['tous', 'Tous'],
  ['recu', 'Reçus'],
  ['etude', 'En étude'],
  ['soutenance', 'Soutenance'],
  ['decides', 'Décidés'],
]

const stepNames = ['Dépôt', 'Étude', 'Soutenance', 'Décision']

function stepsOf(d: EnrichedDossier) {
  const index = { recu: 0, etude: 1, soutenance: 2, approuve: 3, rejete: 3 }[d.statut]
  const final = index === 3
  const defense = d.soutenance ? new Date(d.soutenance) : null
  const meta = [
    fmt(d.depot, { day: 'numeric', month: 'short' }),
    '7 jours max.',
    defense ? fmt(defense, { day: 'numeric', month: 'short' }) : 'Devant le panel',
    d.decisionDate ? fmt(d.decisionDate, { day: 'numeric', month: 'short' }) : 'Sous 24 h',
  ]
  return stepNames.map((label, i) => {
    const done = i < index || (i === index && final) || i === 0
    const current = i === index && !final && i !== 0
    return {
      label,
      meta: meta[i]!,
      bar: done ? 'bg-navy' : current ? 'bg-[#8a95a8]' : 'bg-line',
      color: done || current ? 'text-navy' : 'text-[#7a8499]',
    }
  })
}

function Detail({ d, isMobile, onBack }: { d: EnrichedDossier; isMobile: boolean; onBack: () => void }) {
  const actions = useAdminActions()
  // Remise à zéro de l'état local quand on change de dossier ou de statut.
  const [mode, setMode] = useState<'idle' | 'schedule' | 'reject'>('idle')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('14:00')
  const [dateError, setDateError] = useState(false)
  const [motif, setMotif] = useState('')
  const [motifError, setMotifError] = useState(false)

  const reset = () => {
    setMode('idle')
    setDateError(false)
    setMotifError(false)
  }

  const defense = d.soutenance ? new Date(d.soutenance) : null
  const prenom = d.porteur.split(' ')[0]
  const waMessage =
    d.statut === 'approuve'
      ? `Bonjour ${prenom}, félicitations : le panel a approuvé le projet « ${d.club} ». Le Comité des Clubs te contactera pour la suite.`
      : `Bonjour ${prenom}, le Comité des Clubs a étudié le projet « ${d.club} ». Il n'a pas été retenu pour le moment. Motif : ${d.motif ?? ''}`
  const waHref = `https://wa.me/229${d.wa.replace(/\D/g, '').replace(/^229/, '')}?text=${encodeURIComponent(waMessage)}`
  const final = d.statut === 'approuve' || d.statut === 'rejete'

  const rejectForm = (
    <div className="flex flex-col gap-2.5">
      <label htmlFor="a-motif" className="text-sm/5 font-semibold">
        Motif du rejet <span className="text-accent">*</span>
      </label>
      <textarea
        id="a-motif"
        rows={3}
        placeholder="Ce motif sera transmis au porteur du projet."
        value={motif}
        onChange={(e) => {
          setMotif(e.target.value)
          setMotifError(false)
        }}
        className={`${inputClass} resize-y px-3.5 py-3 leading-6 ${motifError ? 'border-accent' : ''}`}
      />
      {motifError && <ErrorNote>Indique le motif avant de rejeter le dossier.</ErrorNote>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (!motif.trim()) return setMotifError(true)
            void actions.rejectDossier(d.id, motif.trim())
            reset()
          }}
          className="h-12 cursor-pointer rounded-xl border-0 bg-navy px-5 font-[inherit] text-[15px] font-semibold text-white"
        >
          Confirmer le rejet
        </button>
        <button type="button" onClick={reset} className="h-12 cursor-pointer rounded-xl border-0 bg-transparent px-3.5 font-[inherit] text-[15px] font-semibold text-navy hover:bg-[#e8ecf3]">
          Annuler
        </button>
      </div>
    </div>
  )

  return (
    <section className={`${cardClass} flex flex-col gap-6 p-[clamp(20px,3vw,32px)]`}>
      {isMobile && (
        <button
          type="button"
          onClick={onBack}
          className="-my-2 -ml-1 flex h-11 cursor-pointer items-center gap-1 self-start rounded-[10px] border-0 bg-transparent pl-1 pr-2 font-[inherit] text-[15px] font-semibold text-navy"
        >
          <Icon name="chevron_left" size={22} />
          Tous les dossiers
        </button>
      )}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-[13px]/[18px] font-medium text-muted">Dossier CC-2026-{d.num}</span>
          <h2 className="m-0 text-[28px]/9 font-semibold">{d.club}</h2>
          <span className="text-[15px]/[22px] text-muted">
            Porté par {d.porteur} · {d.filiere}
          </span>
        </div>
        <span className={`rounded-full px-3 py-1 text-[13px]/[18px] font-medium ${statusClasses(d.statut)}`}>{d.statusLabel}</span>
      </div>

      <ol className="m-0 grid list-none grid-cols-4 gap-2 p-0">
        {stepsOf(d).map((st) => (
          <li key={st.label} className="flex flex-col gap-2">
            <span className={`h-1.5 rounded-full ${st.bar}`} />
            <span className={`text-[13px]/[18px] font-semibold ${st.color}`}>{st.label}</span>
            <span className="text-[13px]/[18px] font-medium text-muted">{st.meta}</span>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-4 rounded-xl bg-soft p-5">
        {d.statut === 'recu' && (
          <div className="flex flex-col gap-3">
            <span className="text-base/6 font-semibold">Nouveau dossier reçu</span>
            <span className="text-[15px]/[22px] text-muted">
              Le Comité a jusqu'au {fmt(addDays(d.depot, 7), { weekday: 'long', day: 'numeric', month: 'long' })} pour étudier le dossier ({d.dueLabel}).
            </span>
            <button type="button" onClick={() => void actions.startStudy(d.id)} className={`${primaryButton} h-12 self-start px-5`}>
              Démarrer l'étude
            </button>
          </div>
        )}

        {d.statut === 'etude' && (
          <div className="flex flex-col gap-3">
            <span className="text-base/6 font-semibold">
              Étude en cours · réponse avant le {fmt(addDays(d.depot, 7), { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            {mode === 'idle' && (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => setMode('schedule')} className={`${primaryButton} h-12 px-5`}>
                  <Icon name="event" size={20} />
                  Programmer la soutenance
                </button>
                <button type="button" onClick={() => setMode('reject')} className={`${outlineButton} h-12 px-[18px]`}>
                  Rejeter le dossier
                </button>
              </div>
            )}
            {mode === 'schedule' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,160px),1fr))] gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="a-sdate" className="text-sm/5 font-semibold">Date de soutenance</label>
                    <input
                      id="a-sdate"
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value)
                        setDateError(false)
                      }}
                      className={`${inputClass} h-12 px-3 ${dateError ? 'border-accent' : ''}`}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="a-sheure" className="text-sm/5 font-semibold">Heure</label>
                    <input id="a-sheure" type="time" value={time} onChange={(e) => setTime(e.target.value)} className={`${inputClass} h-12 px-3`} />
                  </div>
                </div>
                {dateError && <ErrorNote>Choisis une date pour la soutenance.</ErrorNote>}
                <span className="text-[13px]/[18px] font-medium text-muted">
                  Panel : Responsable des Clubs, Vice-Président des Clubs, Directeur des Études, Conseil des Responsables de Clubs.
                </span>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!date) return setDateError(true)
                      void actions.scheduleDefense(d.id, date, time)
                      reset()
                    }}
                    className={`${primaryButton} h-12 px-5`}
                  >
                    Confirmer la date
                  </button>
                  <button type="button" onClick={reset} className="h-12 cursor-pointer rounded-xl border-0 bg-transparent px-3.5 font-[inherit] text-[15px] font-semibold text-navy hover:bg-[#e8ecf3]">
                    Annuler
                  </button>
                </div>
              </div>
            )}
            {mode === 'reject' && rejectForm}
          </div>
        )}

        {d.statut === 'soutenance' && defense && (
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-base/6 font-semibold">
              <Icon name="event" size={20} />
              Soutenance le {fmt(defense, { weekday: 'long', day: 'numeric', month: 'long' })} à{' '}
              {defense.toTimeString().slice(0, 5).replace(':', 'h')}
            </span>
            <span className="text-[15px]/[22px] text-muted">
              La décision doit être communiquée au porteur dans les 24 h suivant la présentation.
            </span>
            {mode === 'reject' ? (
              rejectForm
            ) : (
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void actions.approveDossier(d.id)} className={`${primaryButton} h-12 px-5`}>
                  <Icon name="task_alt" size={20} />
                  Approuver le club
                </button>
                <button type="button" onClick={() => setMode('reject')} className={`${outlineButton} h-12 px-[18px]`}>
                  Rejeter
                </button>
              </div>
            )}
          </div>
        )}

        {final && (
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-base/6 font-semibold">
              <Icon name={d.statut === 'approuve' ? 'task_alt' : 'cancel'} size={22} />
              {d.statut === 'approuve' ? 'Club approuvé le ' : 'Dossier rejeté le '}
              {fmt(d.decisionDate ?? TODAY, { day: 'numeric', month: 'long' })}
            </span>
            {d.statut === 'rejete' && d.motif && <p className="m-0 text-[15px]/[22px] text-muted">Motif : {d.motif}</p>}
            <a href={waHref} target="_blank" rel="noopener" className={`${outlineButton} h-12 self-start px-[18px] no-underline`}>
              Prévenir {prenom} sur WhatsApp
            </a>
          </div>
        )}
      </div>

      <dl className="m-0 grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-6 gap-y-4">
        {[
          ['Email', d.email],
          ['WhatsApp', d.wa],
          ['Déposé le', fmt(d.depot, { day: 'numeric', month: 'long', year: 'numeric' })],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-[13px]/[18px] font-medium text-muted">{label}</dt>
            <dd className="m-0 text-[15px]/[22px] font-medium [overflow-wrap:anywhere]">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="m-0 text-base/6 font-semibold">Contexte</h3>
          <p className="m-0 text-pretty text-[15px]/6 text-muted">{d.contexte}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="m-0 text-base/6 font-semibold">Vision</h3>
          <p className="m-0 text-pretty text-[15px]/6 text-muted">{d.vision}</p>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="m-0 text-base/6 font-semibold">Objectifs</h3>
          <ul className="m-0 flex flex-col gap-1 pl-5 text-[15px]/[22px] text-muted">
            {d.objectifs.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="m-0 text-base/6 font-semibold">Documents</h3>
        {d.docs.map((doc) => (
          <a
            key={doc.name}
            href="#"
            className="flex min-h-14 items-center gap-3 rounded-xl border border-line px-3 py-2 text-navy no-underline hover:border-navy"
          >
            <span className="flex size-9 flex-none items-center justify-center rounded-[10px] bg-soft">
              <Icon name="description" size={20} />
            </span>
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-[13px]/[18px] font-medium text-muted">{doc.kind}</span>
              <span className="truncate text-[15px]/[22px] font-semibold">{doc.name}</span>
            </span>
            <Icon name="open_in_new" size={20} className="text-muted" />
          </a>
        ))}
      </div>
    </section>
  )
}

export default function ComiteDossiers() {
  const { state } = useAdmin()
  const [params, setParams] = useSearchParams()
  const isMobile = useMediaQuery('(max-width: 899px)')

  const all = state.dossiers.map(enrichDossier)
  const filter = (params.get('statut') as DossierFilter | null) ?? 'tous'
  const selectedParam = params.get('dossier')
  const list = filterDossiers(all, filter)
  const current = all.find((d) => d.id === Number(selectedParam)) ?? all.find((d) => d.id === 2) ?? all[0]
  const showList = !isMobile || !selectedParam
  const showDetail = !isMobile || !!selectedParam

  const select = (id: number) => setParams({ ...(filter !== 'tous' && { statut: filter }), dossier: String(id) })

  return (
    <div className="flex flex-col gap-5">
      {showList && (
        <div role="group" aria-label="Filtrer par statut" className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none]">
          {filters.map(([key, label]) => {
            const active = key === filter
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => setParams(key === 'tous' ? {} : { statut: key })}
                className={`flex h-11 flex-none cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border-[1.5px] px-4 font-[inherit] text-[15px] font-semibold ${
                  active ? 'border-navy bg-navy text-white' : 'border-outline bg-white text-navy'
                }`}
              >
                {label}
                <span className="text-[13px] font-medium opacity-75">{filterDossiers(all, key).length}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className={`grid items-start gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-[minmax(0,380px)_minmax(0,1fr)]'}`}>
        {showList && (
          <div className={`${cardClass} flex flex-col overflow-hidden`}>
            {list.map((d) => {
              const selected = d.id === current?.id && !isMobile
              return (
                <button
                  key={d.id}
                  type="button"
                  aria-current={d.id === current?.id ? 'true' : undefined}
                  onClick={() => select(d.id)}
                  className={`relative flex cursor-pointer flex-col gap-2 border-0 border-b border-[#eef1f5] px-5 py-4 text-left font-[inherit] text-navy hover:bg-[#fafbfd] ${
                    selected ? 'bg-soft' : 'bg-white'
                  }`}
                >
                  {selected && <span className="absolute inset-y-3 left-0 w-[3px] rounded-r-[3px] bg-navy" />}
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-base/6 font-semibold">{d.club}</span>
                    <span className={`flex-none rounded-full px-2.5 py-[3px] text-[13px]/[18px] font-medium ${statusClasses(d.statut)}`}>
                      {d.statusLabel}
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-3 text-[13px]/[18px] font-medium text-muted">
                    <span>
                      {d.porteur} · déposé le {fmt(d.depot, { day: 'numeric', month: 'short' })}
                    </span>
                    {d.dueDays !== null && (
                      <span className={`flex flex-none items-center gap-1 font-semibold ${d.urgent ? 'text-accent' : 'text-muted'}`}>
                        <Icon name="hourglass_top" size={16} />
                        {d.dueLabel}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
            {list.length === 0 && <p className="m-0 px-5 py-8 text-center text-[15px] text-muted">Aucun dossier dans ce statut.</p>}
          </div>
        )}

        {showDetail && current && (
          <Detail
            key={`${current.id}-${current.statut}`}
            d={current}
            isMobile={isMobile}
            onBack={() => setParams(filter !== 'tous' ? { statut: filter } : {})}
          />
        )}
      </div>
    </div>
  )
}
