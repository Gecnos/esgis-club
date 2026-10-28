import { useState } from 'react'
import { Link } from 'react-router'
import Icon from '../../../components/Icon.tsx'
import { useAdmin } from '../adminContext.ts'
import { getClubMonth, getCompletion } from '../queries.ts'
import { Card, outlineButton, primaryButton } from './ui.tsx'

/** Suggestions affichées quand la fiche est complète : de quoi continuer à faire vivre la page. */
const ideas: [icon: string, text: string][] = [
  ['photo_library', 'Ajoute une photo après chaque séance : une galerie vivante donne envie de rejoindre le club.'],
  ['celebration', "Remplace un exemple d'activité par ta dernière réalisation de la saison."],
  ['workspace_premium', "Prépare ton activité phare au moins deux semaines avant ton mois à l'honneur."],
  ['chat', 'Partage le lien de ta page dans ton groupe WhatsApp et sur tes réseaux.'],
]

export default function ClubDashboard() {
  const { state } = useAdmin()
  const { pct, checks } = getCompletion(state.draft, state.photos, state.cover)
  const month = getClubMonth(state.planning, state.planningDays, state.club.slug, state.saved.phare.titre)
  const [copied, setCopied] = useState(false)
  const complete = pct === 100
  const pageUrl = `${window.location.origin}/clubs/${state.club.slug}`

  const stats: [label: string, value: number, to: string][] = [
    ['Photos', state.photos.length, '/admin/club/galerie'],
    ['Membres du bureau', state.saved.bureau.filter((m) => m.name.trim()).length, '/admin/club/bureau'],
    ["Exemples d'activités", state.saved.activities.length, '/admin/club/exemples'],
    ['Réseaux renseignés', Object.values(state.saved.socials).filter((x) => x.trim()).length, '/admin/club/fiche'],
  ]

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] items-start gap-6">
      {complete ? (
        <Card className="!gap-5 !p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-11 flex-none items-center justify-center rounded-full bg-navy text-white">
              <Icon name="check" size={26} />
            </span>
            <span className="flex flex-col">
              <h2 className="m-0 text-xl/7 font-semibold">Ta page est complète</h2>
              <span className="text-[15px]/[22px] text-muted">Elle est en ligne et prête à accueillir de nouveaux membres.</span>
            </span>
          </div>

          <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0">
            {stats.map(([label, value, to]) => (
              <li key={label}>
                <Link to={to} className="flex flex-col gap-0.5 rounded-xl bg-soft px-4 py-3 text-navy no-underline hover:bg-line">
                  <span className="text-[28px]/9 font-bold tabular-nums">{value}</span>
                  <span className="text-[13px]/[18px] font-medium text-muted">{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            <Link to={`/clubs/${state.club.slug}`} className={`${primaryButton} h-12 px-5 no-underline`}>
              <Icon name="visibility" size={20} />
              Voir ma page
            </Link>
            <button type="button" onClick={() => void copyLink()} className={`${outlineButton} h-12 px-5`}>
              <Icon name={copied ? 'check' : 'content_copy'} size={20} />
              {copied ? 'Lien copié' : 'Copier le lien'}
            </button>
          </div>

          <div className="flex flex-col gap-1 border-t border-[#eef1f5] pt-4">
            <h3 className="m-0 text-base/6 font-semibold">Pour continuer à la faire vivre</h3>
            <ul className="m-0 flex list-none flex-col p-0">
              {ideas.map(([icon, text]) => (
                <li key={icon} className="flex items-start gap-3 py-2">
                  <Icon name={icon} size={20} className="mt-0.5 text-muted" />
                  <span className="text-[15px]/[22px] text-muted">{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      ) : (
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
      )}

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
            {month.title || "Pas encore d'activité phare : prépare-la dès maintenant"}
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
          {state.log.length === 0 && (
            <p className="m-0 text-[15px]/[22px] text-muted">
              Rien pour l'instant. Tes publications (fiche, bureau, photos, activités) apparaîtront ici.
            </p>
          )}
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
