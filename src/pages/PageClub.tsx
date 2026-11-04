import { Link, useLoaderData, useLocation } from 'react-router'
import ClubAbout from '../features/clubs/components/ClubAbout.tsx'
import ClubActivities from '../features/clubs/components/ClubActivities.tsx'
import ClubBureau from '../features/clubs/components/ClubBureau.tsx'
import ClubHero from '../features/clubs/components/ClubHero.tsx'
import ClubObjectives from '../features/clubs/components/ClubObjectives.tsx'
import ClubSocials from '../features/clubs/components/ClubSocials.tsx'
import FeaturedActivitySection from '../features/clubs/components/FeaturedActivitySection.tsx'
import JoinBar from '../features/clubs/components/JoinBar.tsx'
import PhotoLibrary from '../features/clubs/components/PhotoLibrary.tsx'
import SimilarClubs from '../features/clubs/components/SimilarClubs.tsx'
import { whatsappLink } from '../features/clubs/whatsapp.ts'
import type { clubLoader } from './loaders.ts'

const SITE_URL = 'https://esgis-club.pages.dev'

const SCHEMA_TYPE: Record<string, string> = {
  Sport: 'SportsClub',
  Tech: 'Organization',
  'Arts & Culture': 'Organization',
  'Business & Langues': 'Organization',
}

export default function PageClub() {
  const { club, similar, clubOfMonthSlug } = useLoaderData<Awaited<ReturnType<typeof clubLoader>>>()
  const { pathname } = useLocation()
  const canonicalUrl = `${SITE_URL}${pathname}`

  if (!club) {
    return (
      <div className="wrap flex flex-col items-start gap-4 py-24">
        <title>Club introuvable · ESGIS Clubs</title>
        <meta name="robots" content="noindex" />
        <h1 className="m-0 text-[clamp(30px,calc(2.2vw+18px),40px)] font-bold">Club introuvable</h1>
        <p className="m-0 text-base/6 text-muted">Ce club n'existe pas ou n'est plus actif.</p>
        <Link to="/#clubs" className="font-semibold text-navy">
          Voir tous les clubs
        </Link>
      </div>
    )
  }

  return (
    <>
      <title>{`Club ${club.name} · ESGIS Clubs – ${club.category}, Cotonou`}</title>
      <meta name="description" content={`${club.description} Club ${club.category} de l'ESGIS Cotonou : activités, bureau, photos et adhésion via WhatsApp.`} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`Club ${club.name} · ESGIS Clubs`} />
      <meta property="og:description" content={`${club.description} Rejoins le club ${club.name} de l'ESGIS Cotonou.`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content="ESGIS Clubs" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`Club ${club.name} · ESGIS Clubs`} />
      <meta name="twitter:description" content={`${club.description} Rejoins le club via WhatsApp.`} />
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@type': SCHEMA_TYPE[club.category] ?? 'Organization',
        name: `Club ${club.name} – ESGIS`,
        description: club.longDescription || club.description,
        url: canonicalUrl,
        foundingDate: String(club.founded),
        numberOfEmployees: { '@type': 'QuantitativeValue', value: club.members },
        ...(club.schedule ? { openingHours: club.schedule } : {}),
        member: club.bureau.map((m) => ({
          '@type': 'Person',
          name: m.name,
          jobTitle: m.role,
          worksFor: { '@type': 'Organization', name: `Club ${club.name} – ESGIS` },
        })),
        memberOf: {
          '@type': 'EducationalOrganization',
          name: 'ESGIS Clubs',
          url: SITE_URL,
        },
        parentOrganization: {
          '@type': 'CollegeOrUniversity',
          name: 'ESGIS – École Supérieure de Génie Informatique et des Sciences',
          address: { '@type': 'PostalAddress', addressLocality: 'Cotonou', addressCountry: 'BJ' },
        },
      })}</script>
      <ClubHero club={club} isClubOfMonth={club.slug === clubOfMonthSlug} />
      <div className="wrap flex flex-col gap-[clamp(56px,7vw,88px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(48px,6vw,72px)]">
        <ClubAbout club={club} />
        <ClubObjectives objectives={club.objectives} />
        <ClubActivities activities={club.activities} />
        <FeaturedActivitySection clubName={club.name} featured={club.featured} clubSlug={club.slug} />
        <ClubBureau bureau={club.bureau} />
        <PhotoLibrary key={club.slug} clubName={club.name} photos={club.photos} />
        <ClubSocials slug={club.slug} name={club.name} />
        <SimilarClubs clubs={similar} />
      </div>
      <JoinBar clubName={club.name} href={whatsappLink(club)} />
    </>
  )
}
