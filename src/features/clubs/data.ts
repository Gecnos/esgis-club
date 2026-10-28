import type { Activity, BureauMember, Category, Club, FeaturedActivity, GalleryPhoto, Objective } from './types.ts'

// Données de démonstration, à remplacer par Supabase.
export const clubs: Club[] = [
  { slug: 'otaku', name: 'Otaku', category: 'Arts & Culture', description: 'Manga, anime et culture japonaise : projections, quiz et cosplay.', members: 36, founded: 2025, photoLabel: 'projection anime' },
  { slug: 'danse', name: 'Danse', category: 'Arts & Culture', description: 'Afro, hip-hop et contemporain : on répète et on monte sur scène.', members: 42, founded: 2019, photoLabel: 'répétition de danse' },
  { slug: 'musique', name: 'Musique', category: 'Arts & Culture', description: "Chant, instruments et jam sessions, du gospel à l'afrobeat.", members: 31, founded: 2020, photoLabel: 'jam session' },
  { slug: 'football', name: 'Football', category: 'Sport', description: 'Entraînements chaque vendredi et tournoi inter-promotions.', members: 54, founded: 2018, photoLabel: 'match de football' },
  { slug: 'basketball', name: 'Basketball', category: 'Sport', description: 'Matchs 3x3 et 5x5, tous niveaux bienvenus.', members: 38, founded: 2019, photoLabel: 'match 3x3' },
  { slug: 'robotique', name: 'Robotique', category: 'Tech', description: 'Arduino, capteurs et robots autonomes construits en équipe.', members: 48, founded: 2021, photoLabel: 'atelier Arduino' },
  { slug: 'entrepreneuriat', name: 'Entrepreneuriat', category: 'Business & Langues', description: 'Du pitch au prototype : lance ton projet avec des mentors.', members: 40, founded: 2020, photoLabel: 'pitch devant un jury' },
  { slug: 'anglais', name: 'Anglais', category: 'Business & Langues', description: 'Conversation, débats et préparation au TOEIC.', members: 45, founded: 2019, photoLabel: 'débat en anglais' },
  { slug: 'dev', name: 'Dev', category: 'Tech', description: 'Web, mobile et hackathons pour coder de vrais projets.', members: 62, founded: 2020, photoLabel: 'hackathon' },
  { slug: 'cybersecurite', name: 'Cybersécurité', category: 'Tech', description: 'Challenges CTF, sécurité réseau et bonnes pratiques.', members: 33, founded: 2023, photoLabel: 'challenge CTF' },
  { slug: 'art-deco', name: 'Art & Déco', category: 'Arts & Culture', description: 'Peinture, upcycling et décoration des événements ESGIS.', members: 24, founded: 2024, photoLabel: 'atelier peinture' },
]

// Contenu générique par catégorie, utilisé quand un club n'a pas encore sa fiche détaillée.
export const genericObjectives: Record<Category, Objective[]> = {
  Sport: [
    { icon: 'groups', text: 'Réunir chaque vendredi les étudiants de toutes les filières' },
    { icon: 'emoji_events', text: "Représenter l'ESGIS dans les tournois universitaires" },
    { icon: 'trending_up', text: 'Progresser ensemble, quel que soit le niveau de départ' },
    { icon: 'handshake', text: "Promouvoir le fair-play et l'esprit d'équipe" },
  ],
  Tech: [
    { icon: 'school', text: 'Apprendre par la pratique, sur des projets réels' },
    { icon: 'groups', text: 'Travailler en équipe comme en entreprise' },
    { icon: 'emoji_events', text: 'Participer à des compétitions et hackathons' },
    { icon: 'lightbulb', text: 'Partager ses connaissances avec les débutants' },
  ],
  'Arts & Culture': [
    { icon: 'lightbulb', text: 'Développer sa créativité et sa confiance sur scène' },
    { icon: 'groups', text: "Créer un espace d'expression ouvert à tous" },
    { icon: 'event', text: "Animer les événements culturels de l'ESGIS" },
    { icon: 'diversity_3', text: 'Faire découvrir de nouvelles cultures' },
  ],
  'Business & Langues': [
    { icon: 'school', text: 'Développer des compétences utiles au monde du travail' },
    { icon: 'handshake', text: 'Rencontrer des professionnels et des alumni' },
    { icon: 'trending_up', text: "Gagner en aisance à l'oral" },
    { icon: 'rocket_launch', text: 'Accompagner les projets concrets des membres' },
  ],
}

export const genericActivities: Record<Category, [type: string, title: string, text: string][]> = {
  Sport: [
    ['Entraînement', 'Séance du vendredi', 'Échauffement, exercices techniques et match.'],
    ['Compétition', 'Tournoi inter-promotions', "Les promotions s'affrontent sur une journée."],
    ['Sortie', 'Match amical inter-écoles', 'Rencontre avec une autre université de Cotonou.'],
  ],
  Tech: [
    ['Atelier', 'Atelier pratique', '2 h pour découvrir un outil et l\'utiliser.'],
    ['Compétition', 'Hackathon interne', '24 h pour construire un prototype en équipe.'],
    ['Sortie', "Visite d'entreprise", "Découverte d'une équipe tech à Cotonou."],
  ],
  'Arts & Culture': [
    ['Atelier', 'Séance créative', 'Apprentissage et pratique encadrés par les membres.'],
    ['Spectacle', 'Scène ouverte', 'Les membres présentent leur travail au public.'],
    ['Sortie', 'Sortie culturelle', 'Exposition, festival ou concert en groupe.'],
  ],
  'Business & Langues': [
    ['Atelier', 'Atelier pratique', 'Exercices concrets en petits groupes.'],
    ['Compétition', 'Concours oratoire', 'Débats et pitchs devant un jury.'],
    ['Rencontre', 'Talk alumni', 'Un ancien partage son parcours.'],
  ],
}

export const bureauRoles = ['Président', 'Secrétaire', 'Trésorier', 'Communication']

export const memberPool = [
  'Arnaud Hounsou', 'Carine Sossa', 'Fabrice Azon', 'Mireille Agbo',
  'Yannick Dossa', 'Rosine Ahyi', 'Serge Tchibozo', 'Laure Quenum',
]

export type ClubOverride = {
  cover: string
  schedule: string
  whatsapp: string
  longDescription: string
  goal: string
  objectives: Objective[]
  activities: Activity[]
  featured?: FeaturedActivity
  bureau: BureauMember[]
  photos: GalleryPhoto[]
}

const ratio = (r: string) => {
  const [a, b] = r.split('/').map(Number)
  return a / b
}

export const clubOverrides: Record<string, ClubOverride> = {
  robotique: {
    cover: "membres autour d'un robot",
    schedule: 'Vendredi 12h – Salle TP 3',
    whatsapp: '2290196112233',
    longDescription:
      "Le Club Robotique réunit les étudiants curieux d'électronique, de programmation embarquée et de mécanique. Chaque vendredi, on conçoit, on soude, on code et on teste des robots en équipe, du premier circuit Arduino jusqu'aux robots autonomes de compétition.",
    goal: "Donner à chaque membre les bases pour concevoir un système robotique de A à Z, et représenter l'ESGIS dans les compétitions de robotique au Bénin.",
    objectives: [
      { icon: 'precision_manufacturing', text: 'Maîtriser Arduino, capteurs et moteurs en 3 mois' },
      { icon: 'groups', text: 'Travailler en équipe projet, comme en entreprise' },
      { icon: 'emoji_events', text: 'Participer à 2 compétitions nationales par an' },
      { icon: 'school', text: 'Chaque membre confirmé parraine un débutant' },
      { icon: 'lightbulb', text: 'Construire un robot utile à la communauté ESGIS' },
    ],
    activities: [
      { type: 'Atelier', title: 'Initiation Arduino', text: 'Premier circuit, LED et capteur de distance en 2 h.', photo: 'photo · atelier soudure' },
      { type: 'Compétition', title: 'Défi robot suiveur de ligne', text: 'Course chronométrée entre les équipes du club.', photo: 'photo · piste de course' },
      { type: 'Sortie', title: "Visite d'un fablab", text: "Découverte de l'impression 3D et de la découpe laser.", photo: 'photo · visite fablab' },
      { type: 'Projet', title: 'Bras robotique', text: "Projet de l'année, imprimé en 3D et piloté par smartphone.", photo: 'photo · bras robotique' },
    ],
    featured: {
      badge: 'Club du mois · Octobre 2026',
      title: 'Robots en piste : la grande démo',
      date: 'Vendredi 30 octobre 2026',
      time: '12h00 – 17h00',
      place: 'Hall principal, campus ESGIS Cotonou',
      description:
        "Démonstration des robots suiveurs de ligne conçus par les membres, puis atelier d'initiation Arduino ouvert à tous. Aucun prérequis : viens construire ton premier circuit.",
      photo: 'photo · démonstration de robots',
      program: [
        { time: '12h00', label: 'Accueil et démonstrations dans le hall' },
        { time: '13h30', label: 'Atelier Arduino, groupes de 10' },
        { time: '16h00', label: 'Course finale et remise des prix' },
      ],
    },
    bureau: [
      { role: 'Président', name: 'Wilfried Ahouandjinou' },
      { role: 'Secrétaire', name: 'Nadège Gbaguidi' },
      { role: 'Trésorier', name: 'Rachidi Alao' },
      { role: 'Communication', name: 'Estelle Kiki' },
    ],
    photos: [
      ['Atelier soudure, septembre 2026', '4/5'], ['Course du robot suiveur', '4/3'], ['Équipe finaliste 2025', '1/1'],
      ['Prototype du bras robotique', '3/4'], ['Séance du vendredi', '16/10'], ['Visite du fablab', '4/5'],
      ['Remise des prix', '4/3'], ['Circuit Arduino', '1/1'], ['Démo dans le hall', '3/4'], ['Le club au complet', '16/9'],
    ].map(([label, r]) => ({ label, ratio: ratio(r) })),
  },
  otaku: {
    cover: 'soirée projection',
    schedule: 'Vendredi 13h – Salle 204',
    whatsapp: '2290195445566',
    longDescription:
      "Le Club Otaku rassemble les fans de manga, d'anime et de culture japonaise. Projections commentées, quiz, ateliers de dessin manga et initiation au japonais rythment les vendredis.",
    goal: "Créer un espace d'échange autour de la culture japonaise et développer la créativité des membres par le dessin, le cosplay et l'écriture.",
    objectives: [
      { icon: 'diversity_3', text: "Réunir les passionnés de culture japonaise de l'ESGIS" },
      { icon: 'edit_note', text: 'Lancer un atelier de dessin manga chaque mois' },
      { icon: 'school', text: 'Proposer une initiation au japonais pour débutants' },
      { icon: 'event', text: "Organiser le premier festival cosplay de l'école" },
    ],
    activities: [
      { type: 'Projection', title: 'Ciné-anime du vendredi', text: 'Un épisode, puis débat autour du thème.', photo: 'photo · salle de projection' },
      { type: 'Atelier', title: 'Dessin manga', text: 'Les bases du personnage, encadré par un membre.', photo: 'photo · planches de dessin' },
      { type: 'Jeu', title: 'Quiz otaku', text: 'Équipes, buzzer et lots à gagner.', photo: 'photo · quiz en équipe' },
      { type: 'Événement', title: 'Journée cosplay', text: 'Défilé et concours de costumes.', photo: 'photo · cosplay' },
    ],
    bureau: [
      { role: 'Président', name: 'Junior Akakpo' },
      { role: 'Secrétaire', name: 'Prisca Adjovi' },
      { role: 'Trésorière', name: 'Ornella Tossou' },
      { role: 'Communication', name: 'Samuel Dègbo' },
    ],
    photos: [],
  },
}
