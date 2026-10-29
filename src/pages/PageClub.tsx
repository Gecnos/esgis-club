import { Link, useLoaderData } from 'react-router'
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

export default function PageClub() {
  const { club, similar, clubOfMonthSlug } = useLoaderData<Awaited<ReturnType<typeof clubLoader>>>()

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
      <title>{`Club ${club.name} · ESGIS Clubs`}</title>
      <meta name="description" content={`${club.description} Club ${club.category} de l'ESGIS : activités, bureau, photos et adhésion.`} />
      <meta property="og:title" content={`Club ${club.name} · ESGIS Clubs`} />
      <meta property="og:description" content={club.description} />
      <ClubHero club={club} isClubOfMonth={club.slug === clubOfMonthSlug} />
      <div className="wrap flex flex-col gap-[clamp(56px,7vw,88px)] pb-[clamp(64px,8vw,104px)] pt-[clamp(48px,6vw,72px)]">
        <ClubAbout club={club} />
        <ClubObjectives objectives={club.objectives} />
        <ClubActivities activities={club.activities} />
        <FeaturedActivitySection clubName={club.name} featured={club.featured} />
        <ClubBureau bureau={club.bureau} />
        <PhotoLibrary key={club.slug} clubName={club.name} photos={club.photos} />
        <ClubSocials slug={club.slug} name={club.name} />
        <SimilarClubs clubs={similar} />
      </div>
      <JoinBar clubName={club.name} href={whatsappLink(club)} />
    </>
  )
}
