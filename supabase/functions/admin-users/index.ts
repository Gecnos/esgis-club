// Edge Function Supabase : gestion des comptes par le Comité (liste, création, mot de passe, suppression).
// Elle seule utilise la clé service_role (fournie automatiquement par Supabase, jamais dans le navigateur)
// et refuse tout appelant qui n'est pas un membre du Comité. Voir docs/supabase.md.
//
// Entrée : { action: 'list' }
//        | { action: 'create', email, password, name, role, clubSlug }
//        | { action: 'password', id, password }
//        | { action: 'delete', id }

import { createClient } from 'npm:@supabase/supabase-js@2'

// ALLOWED_ORIGIN : une ou plusieurs origines séparées par des virgules (ex. https://clubs.esgis.bj,http://localhost:5173).
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGIN') ?? '').split(',').map((o) => o.trim()).filter(Boolean)
const corsFor = (req: Request) => {
  const origin = req.headers.get('Origin') ?? ''
  return {
    'Access-Control-Allow-Origin': allowedOrigins.length === 0 ? '*' : allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  }
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

Deno.serve(async (req) => {
  // Les en-têtes CORS dépendent de la requête : définis ici pour rester propres à chaque appel concurrent.
  const corsHeaders = corsFor(req)
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  const url = Deno.env.get('SUPABASE_URL')!

  // 1. L'appelant doit être connecté et membre du Comité.
  const caller = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  })
  const { data: userData } = await caller.auth.getUser()
  if (!userData.user) return json({ error: 'Connexion requise' }, 401)
  const { data: me } = await caller.from('profiles').select('role').eq('id', userData.user.id).maybeSingle()
  if (me?.role !== 'comite') return json({ error: 'Réservé au Comité' }, 403)

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const body = await req.json().catch(() => ({}))

  if (body.action === 'list') {
    const { data: list, error } = await admin.auth.admin.listUsers({ perPage: 200 })
    if (error) return json({ error: error.message }, 500)
    const { data: profiles } = await admin.from('profiles').select('id, full_name, role, club_slug')
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]))
    const accounts = list.users
      .filter((u) => byId.has(u.id))
      .map((u) => {
        const p = byId.get(u.id)!
        return { id: u.id, email: u.email ?? '', name: p.full_name ?? '', role: p.role, clubSlug: p.club_slug, createdAt: u.created_at }
      })
    return json({ accounts })
  }

  if (body.action === 'create') {
    const { email, password, name, role, clubSlug } = body
    if (typeof email !== 'string' || !EMAIL.test(email.trim())) return json({ error: 'Email invalide' }, 400)
    if (typeof password !== 'string' || password.length < 8) return json({ error: 'Mot de passe trop court (8 caractères minimum)' }, 400)
    if (typeof name !== 'string' || name.trim().length < 2) return json({ error: 'Nom requis' }, 400)
    if (role !== 'club' && role !== 'comite') return json({ error: 'Rôle invalide' }, 400)
    if (role === 'club' && typeof clubSlug !== 'string') return json({ error: 'Club requis' }, 400)

    const { data, error } = await admin.auth.admin.createUser({ email: email.trim().toLowerCase(), password, email_confirm: true })
    if (error || !data.user) {
      const exists = /already|registered|exists/i.test(error?.message ?? '')
      return json({ error: exists ? 'Un compte existe déjà avec cet email' : (error?.message ?? 'Création impossible') }, exists ? 409 : 500)
    }
    const { error: profileError } = await admin
      .from('profiles')
      .insert({ id: data.user.id, full_name: name.trim(), role, club_slug: role === 'club' ? clubSlug : null })
    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id) // pas de compte sans rôle
      return json({ error: 'Club introuvable ou profil invalide' }, 400)
    }
    return json({
      account: { id: data.user.id, email: data.user.email ?? '', name: name.trim(), role, clubSlug: role === 'club' ? clubSlug : null, createdAt: data.user.created_at },
    })
  }

  if (body.action === 'password') {
    if (typeof body.id !== 'string' || typeof body.password !== 'string' || body.password.length < 8) return json({ error: 'Requête invalide' }, 400)
    const { error } = await admin.auth.admin.updateUserById(body.id, { password: body.password })
    return error ? json({ error: error.message }, 500) : json({ ok: true })
  }

  if (body.action === 'delete') {
    if (typeof body.id !== 'string') return json({ error: 'Requête invalide' }, 400)
    if (body.id === userData.user.id) return json({ error: 'Tu ne peux pas supprimer ton propre compte' }, 400)
    const { error } = await admin.auth.admin.deleteUser(body.id) // le profil part avec (on delete cascade)
    return error ? json({ error: error.message }, 500) : json({ ok: true })
  }

  return json({ error: 'Action inconnue' }, 400)
})
