import { Link } from 'react-router'
import CoverImage from '../../../components/CoverImage.tsx'
import Icon from '../../../components/Icon.tsx'
import type { FeaturedActivity } from '../types.ts'

const SITE_URL = 'https://esgis-club.pages.dev'

type Props = { clubName: string; featured: FeaturedActivity | null; clubSlug?: string }

export default function FeaturedActivitySection({ clubName, featured, clubSlug }: Props) {
  return (
    <section id="activite" aria-labelledby="activite-titre" className="flex scroll-mt-[88px] flex-col gap-6">
      <h2 id="activite-titre" className="m-0 text-[28px]/9 font-semibold">Activité phare du mois</h2>

      {featured ? (
        <>
          {/* Event Schema.org pour les rich results Google "Événement" */}
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Event',
            name: featured.title,
            description: featured.description,
            startDate: featured.date,
            location: {
              '@type': 'Place',
              name: featured.place,
              address: { '@type': 'PostalAddress', addressLocality: 'Cotonou', addressCountry: 'BJ' },
            },
            organizer: {
              '@type': 'Organization',
              name: `Club ${clubName} – ESGIS`,
              url: clubSlug ? `${SITE_URL}/clubs/${clubSlug}` : SITE_URL,
            },
            eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
            eventStatus: 'https://schema.org/EventScheduled',
            isAccessibleForFree: true,
          })}</script>

          <article aria-labelledby="featured-title" className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,420px),1fr))] overflow-hidden rounded-xl bg-navy text-white shadow-[0_16px_40px_rgb(11_31_58/0.18)]">
            <div className="flex flex-col gap-5 p-[clamp(24px,4vw,44px)]">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-accent px-3 py-1 text-[13px]/[18px] font-medium">
                <Icon name="workspace_premium" size={16} />
                {featured.badge}
              </span>
              <h3 id="featured-title" className="m-0 text-[28px]/9 font-semibold">{featured.title}</h3>
              <div className="flex flex-col gap-2 text-[15px]/[22px]">
                <span className="flex items-center gap-2.5">
                  <Icon name="calendar_month" size={20} className="text-mist" />
                  <time dateTime={featured.date}>{featured.date} · {featured.time}</time>
                </span>
                <span className="flex items-center gap-2.5">
                  <Icon name="location_on" size={20} className="text-mist" />
                  <address className="not-italic">{featured.place}</address>
                </span>
              </div>
              <p className="m-0 text-pretty text-base/6 text-[#dce2eb]">{featured.description}</p>
              <ol className="m-0 flex list-none flex-col p-0">
                {featured.program.map((p) => (
                  <li key={p.time} className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-t border-white/10 py-3 text-[15px]/[22px]">
                    <time className="font-semibold tabular-nums">{p.time}</time>
                    <span className="text-[#dce2eb]">{p.label}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="ph-navy relative flex min-h-[clamp(220px,28vw,420px)] items-end p-4 font-mono text-xs text-steel">
              <CoverImage src={featured.visualKey} alt={`Visuel de l'activité : ${featured.title}`} />
              {featured.photo}
            </div>
          </article>
        </>
      ) : (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-5 rounded-xl border-[1.5px] border-dashed border-[#8a95a8] bg-soft p-[clamp(20px,4vw,40px)]">
          <span className="flex size-14 items-center justify-center rounded-full bg-navy text-white">
            <Icon name="workspace_premium" size={28} />
          </span>
          <div className="flex flex-col items-start gap-2">
            <span className="rounded-full bg-accent px-2.5 py-1 text-[13px]/[18px] font-medium text-white">Bientôt à l'honneur</span>
            <h3 className="m-0 mt-1 text-xl/7 font-semibold">Le mois du Club {clubName} arrive</h3>
            <p className="m-0 max-w-[620px] text-pretty text-base/6 text-muted">
              Chaque club organise à son tour l'activité ouverte à tous du mois. La date du Club{' '}
              {clubName} sera annoncée par le Comité.
            </p>
            <Link
              to="/clubs/robotique#activite"
              className="flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-navy no-underline hover:text-accent"
            >
              Voir le club du mois actuel
              <Icon name="arrow_forward" size={18} />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
