import { Link } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { useAdmin } from '../adminContext.ts'
import { getClubMonth, getCompletion } from '../queries.ts'
import { Card } from './ui.tsx'

export default function ClubDashboard() {
  const { state } = useAdmin()
  const { pct, checks } = getCompletion(state.draft, state.photos, state.cover)
  const month = getClubMonth(state.planning, state.club.slug, state.saved.phare.titre)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-6">
      <Card className="!gap-4 !p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="m-0 text-xl/7 font-semibold">Fiche du club</h2>
          <span className="text-[28px]/9 font-bold tabular-nums">{pct}%</span>
        </div>
        <div
          role="progressbar"
          aria-label="Complétude de la fiche"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 overflow-hidden rounded-full bg-line"
        >
          <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
        </div>
        <ul className="m-0 flex list-none flex-col p-0">
          {checks.map((c) => (
            <li key={c.label} className="flex min-h-12 items-center gap-3 border-t border-[#eef1f5]">
              <Icon name={c.ok ? 'check_circle' : 'error'} size={22} className={c.ok ? 'text-navy' : 'text-accent'} />
              <span className={`flex-1 text-[15px]/[22px] ${c.ok ? 'text-navy' : 'text-muted'}`}>{c.label}</span>
              {!c.ok && (
                <Link
                  to={`/admin/club/${c.to}`}
                  className="flex h-10 items-center rounded-[10px] px-2.5 text-sm font-semibold text-navy underline underline-offset-[3px] hover:bg-soft"
                >
                  Compléter
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-3.5 rounded-xl bg-navy p-6 text-white shadow-[0_12px_32px_rgb(11_31_58/0.16)]">
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-accent px-3 py-1 text-[13px]/[18px] font-medium">
            <Icon name="workspace_premium" size={16} />
            Ton mois à l'honneur
          </span>
          <h2 className="m-0 text-[28px]/9 font-semibold">{month.label}</h2>
          <span className="flex items-center gap-2.5 text-[15px]/[22px]">
            <Icon name="calendar_month" size={20} className="text-mist" />
            {month.countdown ? `${month.date} · ${month.countdown}` : month.date}
          </span>
          <span className="flex items-center gap-2.5 text-[15px]/[22px]">
            <Icon name="event" size={20} className="text-mist" />
            {month.title}
          </span>
          <Link
            to="/admin/club/activite"
            className="mt-1 flex h-12 items-center gap-2 self-start rounded-xl border-[1.5px] border-white px-[18px] text-[15px] font-semibold text-white no-underline hover:bg-white/10"
          >
            <Icon name="edit" size={20} />
            Modifier l'activité phare
          </Link>
        </section>

        <Card title="Dernières modifications" className="!gap-2 !p-6">
          {state.log.map((l) => (
            <div key={`${l.text}-${l.when}`} className="grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3 py-2">
              <span className="flex size-9 items-center justify-center rounded-full bg-soft">
                <Icon name={l.icon} size={18} />
              </span>
              <span className="flex flex-col">
                <span className="text-[15px]/[22px] font-medium">{l.text}</span>
                <span className="text-[13px]/[18px] font-medium text-muted">
                  {l.who} · {l.when}
                </span>
              </span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
