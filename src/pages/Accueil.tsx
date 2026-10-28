import { useLoaderData } from 'react-router'
import ClubsSection from '../features/clubs/components/ClubsSection.tsx'
import CommitteeSection from '../features/committee/components/CommitteeSection.tsx'
import CreateClubSection from '../features/dossiers/components/CreateClubSection.tsx'
import Hero from '../features/home/components/Hero.tsx'
import InfoBar from '../features/home/components/InfoBar.tsx'
import Mission from '../features/home/components/Mission.tsx'
import ClubOfMonthSection from '../features/planning/components/ClubOfMonthSection.tsx'
import type { accueilLoader } from './loaders.ts'

export default function Accueil() {
  const { clubs, clubOfMonth, committee, heroPhotos } = useLoaderData<Awaited<ReturnType<typeof accueilLoader>>>()

  return (
    <>
      <Hero photos={heroPhotos} />
      <InfoBar />
      <Mission />
      {clubOfMonth && <ClubOfMonthSection club={clubOfMonth} />}
      <ClubsSection clubs={clubs} clubOfMonthSlug={clubOfMonth?.clubSlug} />
      <CommitteeSection members={committee} />
      <CreateClubSection />
    </>
  )
}
