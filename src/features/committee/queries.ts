import { supabase } from '../../lib/supabase.ts'
import type { Member } from './types.ts'

type MemberRow = { role: string; name: string; filiere: string; photo_key: string | null }

// Données de démonstration (mode sans Supabase).
const members: Member[] = [
  { role: 'Président', name: 'Kévin Agossou', filiere: 'Génie logiciel · M1' },
  { role: 'Vice-Présidente', name: 'Mariam Bello', filiere: 'Gestion · L3' },
  { role: 'Secrétaire Générale', name: 'Grâce Dossou', filiere: 'Droit des affaires · L3' },
  { role: 'Trésorier', name: 'Ulrich Hounkpatin', filiere: 'Finance · M1' },
  { role: 'Communication', name: 'Fadilatou Saka', filiere: 'Marketing digital · L2' },
  { role: 'Événements', name: 'Jordan Zinsou', filiere: 'Réseaux & Télécoms · L3' },
]

export async function getCommittee(): Promise<Member[]> {
  if (!supabase) return members
  const { data, error } = await supabase.from('committee_members').select('role, name, filiere, photo_key').order('position')
  if (error) throw error
  return (data as MemberRow[]).map((m) => ({ role: m.role, name: m.name, filiere: m.filiere, photoKey: m.photo_key }))
}
