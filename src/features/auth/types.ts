export type Role = 'club' | 'comite'

export type AuthUser = {
  id: string
  email: string
  name: string
  role: Role
  /** Slug du club géré (rôle `club`), `null` pour le Comité. */
  clubSlug: string | null
}
