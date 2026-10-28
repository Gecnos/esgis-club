import { diffDays, fmt } from '../../../lib/dates.ts'
import { capitalize } from '../../../lib/text.ts'
import { useMediaQuery } from '../../../lib/useMediaQuery.ts'
import { useAdmin } from '../adminContext.ts'
import { TODAY } from '../data.ts'
import { activityDay, assignedClubs, clubName, MONTHS, SEASON_LABEL, toIsoDay } from '../queries.ts'
import { useAdminActions } from '../useAdminActions.ts'
import { cardClass } from './ui.tsx'

export default function ComitePlanning() {
  const { state } = useAdmin()
  const actions = useAdminActions()
  const CLUB_OPTIONS = state.clubOptions
  const isMobile = useMediaQuery('(max-width: 899px)')
  const assigned = assignedClubs(state.planning)
  const unassigned = CLUB_OPTIONS.filter(([slug]) => !assigned.some(([, c]) => c === slug)).map(([, name]) => name)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,300px),1fr))] items-start gap-6">
      <section className={`${cardClass} overflow-hidden ${isMobile ? '' : 'col-span-2'}`}>
        <div className="flex items-center justify-between gap-3 border-b border-[#eef1f5] px-6 py-5">
          <h2 className="m-0 text-xl/7 font-semibold">Année {SEASON_LABEL}</h2>
          <span className="text-[13px]/[18px] font-medium text-muted">Enregistré automatiquement</span>
        </div>

        {MONTHS.map((m) => {
          const value = state.planning[m.key] ?? ''
          const vacation = value === '__vac'
          const day = activityDay(state.planningDays, m)
          const past = diffDays(TODAY, day) < 0
          const current = m.y === TODAY.getFullYear() && m.m === TODAY.getMonth()
          // Le mois en cours reste modifiable (le Comité peut déplacer ou changer l'activité).
          const locked = past || vacation
          const status = vacation ? 'Vacances' : past ? 'Passé' : current ? 'En cours' : value ? 'Programmé' : 'À programmer'
          const monthLabel = capitalize(fmt(m.fri, { month: 'long', year: 'numeric' }))
          const statusClass = current
            ? 'bg-accent text-white'
            : status === 'À programmer'
              ? 'bg-white text-accent'
              : 'bg-soft text-muted'

          return (
            <div
              key={m.key}
              className={`grid items-center gap-x-4 gap-y-2 border-b border-[#eef1f5] px-6 py-3 ${
                current ? 'bg-[#fafbfd]' : 'bg-white'
              } ${isMobile ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[200px_minmax(0,1fr)_120px]'}`}
            >
              <span className="flex flex-col">
                <span className="text-base/6 font-semibold">{monthLabel}</span>
                <span className="text-[13px]/[18px] font-medium text-muted">
                  {capitalize(fmt(day, { weekday: 'long', day: 'numeric', month: 'long' }))}
                </span>
              </span>

              <div className={isMobile ? 'order-3 col-span-full' : ''}>
                {locked ? (
                  <span
                    className={`flex min-h-12 items-center gap-2 text-[15px]/[22px] font-medium ${vacation ? 'text-muted' : 'text-navy'}`}
                  >
                    {vacation ? "Vacances de fin d'année, pas d'activité" : value ? `Club ${clubName(CLUB_OPTIONS, value)}` : '—'}
                  </span>
                ) : (
                  <select
                    value={value}
                    aria-label={`Club du mois · ${fmt(m.fri, { month: 'long', year: 'numeric' })}`}
                    onChange={(e) => void actions.setMonth(m.key, e.target.value)}
                    className={`h-12 w-full cursor-pointer rounded-xl border-[1.5px] bg-white px-3 font-[inherit] text-[15px] text-navy outline-none focus:border-navy ${
                      value ? 'border-[#8a95a8]' : 'border-accent'
                    }`}
                  >
                    <option value="">— Choisir un club —</option>
                    {CLUB_OPTIONS.map(([slug, name]) => {
                      const other = assigned.find(([key, c]) => c === slug && key !== m.key)
                      const otherMonth = other ? MONTHS.find((x) => x.key === other[0]) : undefined
                      return (
                        <option key={slug} value={slug} disabled={!!other}>
                          Club {name}
                          {otherMonth ? ` · déjà en ${fmt(otherMonth.fri, { month: 'long' })}` : ''}
                        </option>
                      )
                    })}
                  </select>
                )}
                {!locked && value && (
                <label className="mt-2 flex items-center gap-2 text-[13px]/[18px] font-medium text-muted">
                  Jour de l'activité
                  <input
                    type="date"
                    value={toIsoDay(day)}
                    min={toIsoDay(new Date(m.y, m.m, 1))}
                    max={toIsoDay(new Date(m.y, m.m + 1, 0))}
                    onChange={(e) => e.target.value && void actions.setDay(m.key, e.target.value)}
                    className="h-10 rounded-[10px] border-[1.5px] border-[#8a95a8] bg-white px-2.5 font-[inherit] text-[15px] text-navy outline-none focus:border-navy"
                  />
                </label>
                )}
              </div>

              <span className={`justify-self-start rounded-full px-2.5 py-1 text-[13px]/[18px] font-medium ${statusClass}`}>
                {status}
              </span>
            </div>
          )
        })}
      </section>

      <aside
        className={`${cardClass} flex flex-col gap-3 p-6`}
        style={{ position: 'sticky', top: isMobile ? 80 : 24 }}
      >
        <h2 className="m-0 text-xl/7 font-semibold">Pas encore programmés</h2>
        <span className="text-[13px]/[18px] font-medium text-muted">
          {unassigned.length} clubs sur {CLUB_OPTIONS.length} attendent leur mois.
        </span>
        <div className="flex flex-wrap gap-2">
          {unassigned.map((name) => (
            <span key={name} className="rounded-full bg-soft px-3 py-1.5 text-sm/5 font-medium">
              {name}
            </span>
          ))}
        </div>
        <p className="m-0 mt-2 text-[13px]/[18px] font-medium text-muted">
          Le club programmé peut préparer son activité phare depuis son espace. La page d'accueil bascule automatiquement le 1er du mois.
        </p>
      </aside>
    </div>
  )
}
