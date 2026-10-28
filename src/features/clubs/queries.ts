import type { Club } from './types.ts'

// Données de démonstration, à remplacer par Supabase.
const clubs: Club[] = [
  { slug: 'otaku', name: 'Otaku', category: 'Arts & Culture', description: 'Manga, anime et culture japonaise : projections, quiz et cosplay.', members: 36, photoLabel: 'projection anime' },
  { slug: 'danse', name: 'Danse', category: 'Arts & Culture', description: 'Afro, hip-hop et contemporain : on répète et on monte sur scène.', members: 42, photoLabel: 'répétition de danse' },
  { slug: 'musique', name: 'Musique', category: 'Arts & Culture', description: "Chant, instruments et jam sessions, du gospel à l'afrobeat.", members: 31, photoLabel: 'jam session' },
  { slug: 'football', name: 'Football', category: 'Sport', description: 'Entraînements chaque vendredi et tournoi inter-promotions.', members: 54, photoLabel: 'match de football' },
  { slug: 'basketball', name: 'Basketball', category: 'Sport', description: 'Matchs 3x3 et 5x5, tous niveaux bienvenus.', members: 38, photoLabel: 'match 3x3' },
  { slug: 'robotique', name: 'Robotique', category: 'Tech', description: 'Arduino, capteurs et robots autonomes construits en équipe.', members: 48, photoLabel: 'atelier Arduino' },
  { slug: 'entrepreneuriat', name: 'Entrepreneuriat', category: 'Business & Langues', description: 'Du pitch au prototype : lance ton projet avec des mentors.', members: 40, photoLabel: 'pitch devant un jury' },
  { slug: 'anglais', name: 'Anglais', category: 'Business & Langues', description: 'Conversation, débats et préparation au TOEIC.', members: 45, photoLabel: 'débat en anglais' },
  { slug: 'dev', name: 'Dev', category: 'Tech', description: 'Web, mobile et hackathons pour coder de vrais projets.', members: 62, photoLabel: 'hackathon' },
  { slug: 'cybersecurite', name: 'Cybersécurité', category: 'Tech', description: 'Challenges CTF, sécurité réseau et bonnes pratiques.', members: 33, photoLabel: 'challenge CTF' },
  { slug: 'art-deco', name: 'Art & Déco', category: 'Arts & Culture', description: 'Peinture, upcycling et décoration des événements ESGIS.', members: 24, photoLabel: 'atelier peinture' },
]

export function getClubs(): Club[] {
  return clubs
}
