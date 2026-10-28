import { useMocks } from '../../lib/env.ts'
import type { ClubDraft, Dossier, LogEntry, Photo, Planning, PlanningDays } from './types.ts'

// Données de démonstration (mode sans Supabase).

/**
 * Date « du jour ». En démo, elle est figée au 22 octobre 2026 pour que les échéances des dossiers
 * de démonstration restent cohérentes ; avec Supabase, c'est la vraie date.
 */
export const TODAY = useMocks ? new Date(2026, 9, 22) : new Date()

export const CLUB_OPTIONS: [slug: string, name: string][] = [
  ['otaku', 'Otaku'], ['danse', 'Danse'], ['musique', 'Musique'], ['football', 'Football'],
  ['basketball', 'Basketball'], ['robotique', 'Robotique'], ['entrepreneuriat', 'Entrepreneuriat'],
  ['anglais', 'Anglais'], ['dev', 'Dev'], ['cybersecurite', 'Cybersécurité'], ['art-deco', 'Art & Déco'],
]

export const initialClub: ClubDraft = {
  horaire: 'Vendredi 12h – Salle TP 3',
  description:
    "Le Club Robotique réunit les étudiants curieux d'électronique, de programmation embarquée et de mécanique. Chaque vendredi, on conçoit, on soude, on code et on teste des robots en équipe, du premier circuit Arduino jusqu'aux robots autonomes de compétition.",
  but: "Donner à chaque membre les bases pour concevoir un système robotique de A à Z, et représenter l'ESGIS dans les compétitions de robotique au Bénin.",
  objectifs: [
    'Maîtriser Arduino, capteurs et moteurs en 3 mois',
    'Travailler en équipe projet, comme en entreprise',
    'Participer à 2 compétitions nationales par an',
    'Chaque membre confirmé parraine un débutant',
    'Construire un robot utile à la communauté ESGIS',
  ],
  wa: '+229 01 96 11 22 33',
  socials: { instagram: '@robotique.esgis', facebook: 'Club Robotique ESGIS', tiktok: '', linkedin: '' },
  logoKey: null,
  bureau: [
    { id: 1, role: 'Président', name: 'Wilfried Ahouandjinou', filiere: 'Génie électrique · L3', photoKey: 'demo:portrait', fixed: true },
    { id: 2, role: 'Secrétaire', name: 'Nadège Gbaguidi', filiere: 'Génie logiciel · L2', photoKey: 'demo:portrait', fixed: true },
    { id: 3, role: 'Trésorier', name: 'Rachidi Alao', filiere: 'Réseaux & Télécoms · L2', photoKey: 'demo:portrait', fixed: true },
    { id: 4, role: 'Communication', name: 'Estelle Kiki', filiere: 'Marketing digital · L1', photoKey: null, fixed: true },
  ],
  activities: [
    { id: 1, type: 'Atelier', title: 'Initiation Arduino', text: 'Premier circuit, premières LED, premiers capteurs : aucun prérequis.', photoKey: null },
    { id: 2, type: 'Compétition', title: 'Course de robots suiveurs de ligne', text: 'Les équipes du club affrontent celles des autres écoles.', photoKey: null },
  ],
  phare: {
    titre: 'Robots en piste : la grande démo',
    debut: '12:00',
    fin: '17:00',
    lieu: 'Hall principal, campus ESGIS Cotonou',
    desc: "Démonstration des robots suiveurs de ligne conçus par les membres, puis atelier d'initiation Arduino ouvert à tous. Aucun prérequis : viens construire ton premier circuit.",
    programme: [
      { h: '12:00', l: 'Accueil et démonstrations dans le hall' },
      { h: '13:30', l: 'Atelier Arduino, groupes de 10' },
      { h: '16:00', l: 'Course finale et remise des prix' },
    ],
    visuelKey: null,
  },
}

export const initialPhotos: Photo[] = [
  'Atelier soudure, septembre 2026', 'Course du robot suiveur', 'Équipe finaliste 2025',
  'Prototype du bras robotique', 'Séance du vendredi', 'Visite du fablab', 'Remise des prix',
  'Circuit Arduino', 'Démo dans le hall', 'Le club au complet',
].map((label, i) => ({ id: i + 1, label, key: null, ratio: 4 / 3 }))

export const initialDossiers: Dossier[] = [
  {
    id: 1, num: '014', club: 'Club Échecs ESGIS', porteur: 'Aïcha Houngbédji', filiere: 'Réseaux & Télécoms · L2',
    email: 'aicha.houngbedji@gmail.com', wa: '+229 01 96 45 21 08', depot: new Date(2026, 9, 20), statut: 'recu',
    contexte: "Une trentaine d'étudiants jouent déjà aux échecs entre les cours, sans cadre ni matériel. Aucun club de réflexion et de stratégie n'existe aujourd'hui à l'ESGIS.",
    vision: "Faire de l'ESGIS une référence des échecs universitaires au Bénin.",
    objectifs: ["Organiser une séance d'initiation chaque vendredi", "Former 40 joueurs réguliers d'ici juin 2027", 'Participer au championnat universitaire de Cotonou'],
    docs: [
      { kind: 'Règlement intérieur', name: 'Reglement_interieur_Club_Echecs.pdf' },
      { kind: "Calendrier d'activités", name: 'Tableau saisi · 3 séances' },
      { kind: 'Document projet', name: 'Projet_Club_Echecs_ESGIS.docx' },
    ],
  },
  {
    id: 2, num: '012', club: 'Club Photo & Vidéo', porteur: 'Brice Akplogan', filiere: 'Marketing digital · L3',
    email: 'brice.akplogan@gmail.com', wa: '+229 01 97 31 08 44', depot: new Date(2026, 9, 15), statut: 'etude',
    contexte: "Les événements de l'école sont peu couverts en images. Plusieurs étudiants possèdent du matériel et veulent apprendre ensemble.",
    vision: "Devenir l'équipe média officielle des événements étudiants de l'ESGIS.",
    objectifs: ['Couvrir chaque activité du club du mois', 'Former les membres au montage vidéo', "Organiser une exposition photo en fin d'année"],
    docs: [
      { kind: 'Règlement intérieur', name: 'Reglement_Club_Photo.pdf' },
      { kind: "Calendrier d'activités", name: 'Calendrier_2026-2027.xlsx' },
    ],
  },
  {
    id: 3, num: '011', club: 'Club Théâtre', porteur: 'Merveille Sossou', filiere: 'Droit des affaires · L1',
    email: 'merveille.sossou@gmail.com', wa: '+229 01 95 72 66 10', depot: new Date(2026, 9, 6), statut: 'soutenance',
    soutenance: '2026-10-30T14:00',
    contexte: "Aucun espace d'expression scénique n'existe à l'ESGIS. Le théâtre aide aussi à la prise de parole en public.",
    vision: "Monter une pièce par semestre jouée devant toute l'école.",
    objectifs: ["Ateliers d'improvisation hebdomadaires", 'Une représentation par semestre', 'Collaborer avec le Club Musique'],
    docs: [
      { kind: 'Règlement intérieur', name: 'Reglement_Club_Theatre.docx' },
      { kind: "Calendrier d'activités", name: 'Calendrier_Theatre.pdf' },
      { kind: 'Document projet', name: 'Dossier_Club_Theatre.pdf' },
    ],
  },
  {
    id: 4, num: '013', club: 'Club Environnement', porteur: 'Sandra Agossa', filiere: 'Gestion · L2',
    email: 'sandra.agossa@gmail.com', wa: '+229 01 94 18 52 07', depot: new Date(2026, 9, 19), statut: 'etude',
    contexte: 'Le campus ne dispose pas de tri des déchets. Des étudiants souhaitent agir concrètement.',
    vision: "Un campus ESGIS plus propre et plus vert d'ici 2028.",
    objectifs: ['Installer des points de tri sur le campus', 'Organiser une journée de salubrité par trimestre', 'Sensibiliser les nouveaux étudiants'],
    docs: [
      { kind: 'Règlement intérieur', name: 'Reglement_Club_Environnement.pdf' },
      { kind: "Calendrier d'activités", name: 'Tableau saisi · 5 séances' },
    ],
  },
  {
    id: 5, num: '009', club: 'Club Data & IA', porteur: 'Ismaël Bio', filiere: 'Génie logiciel · M1',
    email: 'ismael.bio@gmail.com', wa: '+229 01 96 90 14 33', depot: new Date(2026, 8, 22), statut: 'approuve',
    decisionDate: new Date(2026, 9, 2),
    contexte: 'Forte demande des étudiants pour des projets concrets en science des données.',
    vision: 'Former une communauté data reconnue par les entreprises de Cotonou.',
    objectifs: ['Un atelier Python par mois', 'Participer à un challenge Kaggle par semestre', 'Inviter 3 alumni data par an'],
    docs: [
      { kind: 'Règlement intérieur', name: 'Reglement_Data_IA.pdf' },
      { kind: "Calendrier d'activités", name: 'Calendrier_Data_IA.pdf' },
    ],
  },
  {
    id: 6, num: '008', club: 'Club Gaming', porteur: 'Dorian Fagla', filiere: 'Réseaux & Télécoms · L1',
    email: 'dorian.fagla@gmail.com', wa: '+229 01 97 55 20 81', depot: new Date(2026, 8, 8), statut: 'rejete',
    decisionDate: new Date(2026, 8, 25),
    motif: 'Calendrier incomplet et objectifs trop proches du Club Dev. Le porteur est invité à redéposer un dossier.',
    contexte: 'Organiser des tournois e-sport entre étudiants.',
    vision: "Représenter l'ESGIS dans les tournois e-sport universitaires.",
    objectifs: ['Tournoi mensuel', 'Équipe e-sport compétitive'],
    docs: [{ kind: 'Règlement intérieur', name: 'Reglement_Gaming.pdf' }],
  },
]

export const initialPlanning: Planning = {
  '2026-8': 'football',
  '2026-9': 'robotique',
  '2026-10': 'danse',
  '2027-0': 'entrepreneuriat',
  '2027-1': 'dev',
  '2026-11': '__vac',
}

export const initialPlanningDays: PlanningDays = { '2026-9': '2026-10-30', '2026-10': '2026-11-20' }

export const initialLog: LogEntry[] = [
  { icon: 'photo_library', text: '3 photos ajoutées à la galerie', who: 'Estelle Kiki', when: 'hier, 18h40' },
  { icon: 'workspace_premium', text: 'Activité phare publiée', who: 'Wilfried Ahouandjinou', when: '18 oct.' },
  { icon: 'badge', text: 'Bureau mis à jour', who: 'Nadège Gbaguidi', when: '9 oct.' },
]
