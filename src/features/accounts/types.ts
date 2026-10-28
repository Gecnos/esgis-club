import type { Role } from '../auth/types.ts'

export type Account = {
  id: string
  email: string
  name: string
  role: Role
  /** Slug du club géré (rôle `club`), `null` pour le Comité. */
  clubSlug: string | null
  createdAt: string
}
