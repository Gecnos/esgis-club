import { supabase } from '../../lib/supabase.ts'
import { uploadImage } from '../../lib/storage.ts'
import { mockMembers } from './queries.ts'
import type { Member } from './types.ts'

export async function uploadCommitteePhoto(file: File): Promise<string> {
  return (await uploadImage(file, 'comite/equipe')).key
}

/** Remplace la liste des membres du Comité (suppression puis insertion, dans l'ordre affiché). */
export async function saveCommittee(members: Member[]): Promise<void> {
  const clean = members.filter((m) => m.name.trim())
  if (!supabase) {
    mockMembers.splice(0, mockMembers.length, ...clean)
    return
  }
  const removed = await supabase.from('committee_members').delete().gte('id', 0)
  if (removed.error) throw new Error(removed.error.message)
  if (clean.length === 0) return
  const inserted = await supabase.from('committee_members').insert(
    clean.map((m, position) => ({ role: m.role.trim(), name: m.name.trim(), filiere: m.filiere.trim(), photo_key: m.photoKey ?? null, position })),
  )
  if (inserted.error) throw new Error(inserted.error.message)
}
