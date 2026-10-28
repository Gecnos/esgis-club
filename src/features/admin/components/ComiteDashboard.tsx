import { Link, useNavigate } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { diffDays, fmt } from '../../../lib/dates.ts'
import { capitalize } from '../../../lib/text.ts'
import { TODAY } from '../data.ts'
import { useAdmin } from '../adminContext.ts'
import { clubName, enrichDossier, filterDossiers, MONTHS } from '../queries.ts'
import type { DossierFilter } from '../queries.ts'
import { Card, cardClass } from './ui.tsx'

const tiles: [DossierFilter, string, string][] = [
  ['recu', 'Reçus', 'folder_open'],
  ['etude', 'En étude', 'hourglass_top'],
  ['soutenance', 'Soutenances à venir', 'event'],
  ['decides', 'Décidés cette année', 'task_alt'],
]

export default function ComiteDashboard() {
  const { state } = useAdmin()
  const navigate = useNavigate()
  const all = state.dossiers.map(enrichDossier)

  const priority = all
    .filter((d) => (d.dueDays !== null && d.dueDays <= 2) || d.statut === 'recu' || d.statut === 'soutenance')
    .map((d) => {
      const defense = d.soutenance ? new Date(d.soutenance) : null
      return {
        d,
        reason:
          d.statut === 'recu'
            ? 'Nouveau dossier · étude à démarrer'
            : d.statut === 'soutenance' && defense
              ? `Soutenance le ${fmt(defense, { weekday: 'long', day: 'numeric', month: 'long' })}`
              : 'Étude à terminer',
        badge: d.statut === 'soutenance' && defense ? `J-${diffDays(TODAY, defense)}` : d.dueLabel,
      }
    })

  const upcoming = MONTHS.filter((m) => diffDays(TODAY, m.fri) >= 0).slice(0, 2)
  const futureEmpty = MONTHS.filter((m) => diffDays(TODAY, m.fri) >= 0 && !state.planning[m.key]).length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,190px),1fr))] gap-4">
        {tiles.map(([key, label, icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => navigate(`/admin/comite/dossiers?statut=${key}`)}
            className={`${cardClass} flex cursor-pointer flex-col items-start gap-2 border-0 p-5 text-left font-[inherit] text-navy hover:shadow-[0_2px_4px_rgb(11_31_58/0.06),0_12px_28px_rgb(11_31_58/0.10)]`}
          >
            <Icon name={icon} />
            <span className="text-[32px]/10 font-bold tabular-nums">{filterDossiers(all, key).length}</span>
            <span className="text-[15px]/[22px] font-medium text-muted">{label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,380px),1fr))] items-start gap-6">
        <Card title="À traiter en priorité" className="!gap-1 !p-6">
          {priority.map(({ d, reason, badge }) => (
            <button
              key={d.id}
              type="button"
              onClick={() => navigate(`/admin/comite/dossiers?dossier=${d.id}`)}
              className="flex min-h-16 cursor-pointer items-center gap-3 border-0 border-t border-[#eef1f5] bg-transparent px-1 py-2 text-left font-[inherit] text-navy hover:bg-[#fafbfd]"
            >
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-base/6 font-semibold">{d.club}</span>
                <span className="text-[13px]/[18px] font-medium text-muted">{reason}</span>
              </span>
              <span
                className={`flex-none rounded-full px-2.5 py-1 text-[13px]/[18px] font-medium ${
                  d.urgent ? 'bg-accent text-white' : 'bg-[#e8ecf3] text-navy'
                }`}
              >
                {badge}
              </span>
              <Icon name="chevron_right" size={22} className="text-muted" />
            </button>
          ))}
          {priority.length === 0 && <p className="m-0 text-[15px] text-muted">Rien d'urgent pour le moment.</p>}
        </Card>

        <Card title="Club du mois" className="!gap-4 !p-6">
          {upcoming.map((m, i) => {
            const slug = state.planning[m.key]
            return (
              <div key={m.key} className="flex items-center gap-4 rounded-xl bg-soft p-3">
                <span className="flex w-14 flex-none flex-col items-center rounded-[10px] bg-white py-1.5">
                  <span className="text-[13px]/[18px] font-medium text-muted">{capitalize(fmt(m.fri, { month: 'short' }).replace('.', ''))}</span>
                  <span className="text-xl/7 font-bold">{m.fri.getDate()}</span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[13px]/[18px] font-medium text-muted">{i === 0 ? 'Ce mois-ci' : 'Le mois prochain'}</span>
                  <span className="text-base/6 font-semibold">
                    {slug && slug !== '__vac' ? `Club ${clubName(slug)}` : 'Aucun club programmé'}
                  </span>
                </span>
              </div>
            )
          })}
          <Link
            to="/admin/comite/planning"
            className="flex min-h-11 items-center self-start px-1 text-[15px] font-semibold text-navy underline underline-offset-[3px]"
          >
            {futureEmpty ? `${futureEmpty} mois à programmer →` : 'Voir le planning →'}
          </Link>
        </Card>
      </div>
    </div>
  )
}
