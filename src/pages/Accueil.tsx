import ChallengeSection from '../features/challenge/components/ChallengeSection.tsx'
import { getLeaderboard } from '../features/challenge/queries.ts'
import ClubsSection from '../features/clubs/components/ClubsSection.tsx'
import { getClubs } from '../features/clubs/queries.ts'
import CommitteeSection from '../features/committee/components/CommitteeSection.tsx'
import { getCommittee } from '../features/committee/queries.ts'
import CreateClubSection from '../features/dossiers/components/CreateClubSection.tsx'
import Hero from '../features/home/components/Hero.tsx'
import InfoBar from '../features/home/components/InfoBar.tsx'
import Mission from '../features/home/components/Mission.tsx'
import ClubOfMonthSection from '../features/planning/components/ClubOfMonthSection.tsx'
import { getClubOfMonth } from '../features/planning/queries.ts'

export default function Accueil() {
  const clubOfMonth = getClubOfMonth()

  return (
    <>
      <Hero />
      <InfoBar />
      <Mission />
      <ClubOfMonthSection club={clubOfMonth} />
      <ClubsSection clubs={getClubs()} clubOfMonthSlug={clubOfMonth.clubSlug} />
      <CommitteeSection members={getCommittee()} />
      <ChallengeSection board={getLeaderboard()} />
      <CreateClubSection />
    </>
  )
}
