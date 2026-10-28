import type { Member } from './types.ts'

// Données de démonstration, à remplacer par Supabase.
const members: Member[] = [
  { role: 'Président', name: 'Kévin Agossou', filiere: 'Génie logiciel · M1' },
  { role: 'Vice-Présidente', name: 'Mariam Bello', filiere: 'Gestion · L3' },
  { role: 'Secrétaire Générale', name: 'Grâce Dossou', filiere: 'Droit des affaires · L3' },
  { role: 'Trésorier', name: 'Ulrich Hounkpatin', filiere: 'Finance · M1' },
  { role: 'Communication', name: 'Fadilatou Saka', filiere: 'Marketing digital · L2' },
  { role: 'Événements', name: 'Jordan Zinsou', filiere: 'Réseaux & Télécoms · L3' },
]

export function getCommittee(): Member[] {
  return members
}
