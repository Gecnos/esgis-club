import type { Role } from './types.ts'

export type AdminNavItem = { to: string; icon: string; label: string; short: string; end?: boolean }

export const adminNav: Record<Role, AdminNavItem[]> = {
  club: [
    { to: '/admin/club', icon: 'dashboard', label: 'Tableau de bord', short: 'Accueil', end: true },
    { to: '/admin/club/fiche', icon: 'edit', label: 'Fiche du club', short: 'Fiche' },
    { to: '/admin/club/galerie', icon: 'photo_library', label: 'Galerie photo', short: 'Galerie' },
    { to: '/admin/club/bureau', icon: 'badge', label: 'Bureau du club', short: 'Bureau' },
    { to: '/admin/club/exemples', icon: 'celebration', label: "Exemples d'activités", short: 'Exemples' },
    { to: '/admin/club/activite', icon: 'workspace_premium', label: 'Activité phare', short: 'Phare' },
  ],
  comite: [
    { to: '/admin/comite', icon: 'dashboard', label: 'Tableau de bord', short: 'Accueil', end: true },
    { to: '/admin/comite/dossiers', icon: 'folder_open', label: 'Dossiers de création', short: 'Dossiers' },
    { to: '/admin/comite/planning', icon: 'calendar_month', label: 'Club du mois', short: 'Planning' },
    { to: '/admin/comite/clubs', icon: 'diversity_3', label: 'Clubs', short: 'Clubs' },
    { to: '/admin/comite/site', icon: 'web', label: 'Photos et équipe', short: 'Site' },
    { to: '/admin/comite/comptes', icon: 'manage_accounts', label: 'Comptes', short: 'Comptes' },
  ],
}

export const adminHome: Record<Role, string> = { club: '/admin/club', comite: '/admin/comite' }

/** Titre et sous-titre de chaque vue, indexés par le dernier segment de l'URL. */
export const adminHeads: Record<Role, Record<string, [title: string, subtitle: string]>> = {
  club: {
    tableau: ['Tableau de bord', "Voici l'état de la page de ton club."],
    fiche: ['Fiche du club', "Ces informations s'affichent sur la page publique du club."],
    galerie: ['Galerie photo', "Les photos sont publiées dès l'ajout. Tu peux annuler une suppression pendant quelques secondes."],
    bureau: ['Bureau du club', 'Les membres du bureau apparaissent sur la page du club avec leur photo et leur poste.'],
    exemples: ["Exemples d'activités", "Ce que les membres font concrètement : ils s'affichent sur la page de ton club."],
    activite: ['Activité phare', "L'encart mis en avant sur la page du club et sur l'accueil pendant ton mois."],
  },
  comite: {
    tableau: ['Tableau de bord', "Vue d'ensemble des dossiers en cours et du club du mois."],
    dossiers: ['Dossiers de création', 'Suivi des projets de club, du dépôt à la décision.'],
    planning: ['Planning du club du mois', "Choisis le club et le jour de l'activité ouverte à tous de chaque mois."],
    clubs: ['Clubs', "Ajoute les clubs, modifie leur présentation et la photo de leur carte."],
    site: ['Photos et équipe', "Les photos de la page d'accueil et la présentation du Comité."],
    comptes: ['Comptes', 'Crée les accès des responsables de club et des membres du Comité.'],
  },
}
