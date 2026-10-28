// Edge Function Supabase : délivre une URL signée pour envoyer un fichier vers Cloudflare R2.
// Le navigateur n'a jamais accès aux clés R2. Voir docs/supabase.md pour le déploiement.
//
// Entrée  : { folder, filename, contentType, size }
// Sortie  : { uploadUrl, key }  (le navigateur fait un PUT sur uploadUrl, puis stocke `key` en base)

import { createClient } from 'npm:@supabase/supabase-js@2'
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3@3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigner@3'

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
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]
const MAX_IMAGE = 10 * 1024 * 1024
const MAX_DOC = 20 * 1024 * 1024

Deno.serve(async (req) => {
  // Les en-têtes CORS dépendent de la requête : définis ici pour rester propres à chaque appel concurrent.
  const corsHeaders = corsFor(req)
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée' }, 405)

  const { folder, filename, contentType, size } = await req.json().catch(() => ({}))
  if (typeof folder !== 'string' || typeof filename !== 'string' || typeof contentType !== 'string' || typeof size !== 'number') {
    return json({ error: 'Requête invalide' }, 400)
  }

  // Dossiers autorisés : clubs/<slug>/<sous-dossier> (images) et dossiers/<uuid> (documents du formulaire public).
  const isDossier = /^dossiers\/[0-9a-f-]{36}$/.test(folder)
  const clubMatch = folder.match(/^clubs\/([a-z0-9-]+)\/[a-z0-9-]+$/)
  // Photos du site (accueil, équipe du Comité) : site/<sous-dossier> et comite/<sous-dossier>, réservées au Comité.
  const siteMatch = folder.match(/^(site|comite)\/[a-z0-9-]+$/)
  if (!isDossier && !clubMatch && !siteMatch) return json({ error: 'Dossier non autorisé' }, 400)

  const allowed = isDossier ? [...DOC_TYPES, ...IMAGE_TYPES] : IMAGE_TYPES
  const maxSize = isDossier ? MAX_DOC : MAX_IMAGE
  if (!allowed.includes(contentType)) return json({ error: 'Type de fichier non autorisé' }, 400)
  if (size <= 0 || size > maxSize) return json({ error: 'Fichier trop volumineux' }, 400)

  // Les images des clubs exigent un compte : responsable de ce club, ou Comité. Celles du site : Comité seul.
  if (clubMatch || siteMatch) {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return json({ error: 'Connexion requise' }, 401)
    const { data: profile } = await supabase.from('profiles').select('role, club_slug').eq('id', userData.user.id).maybeSingle()
    const allowedClub = profile?.role === 'comite' || (!!clubMatch && profile?.role === 'club' && profile.club_slug === clubMatch[1])
    if (!allowedClub) return json({ error: 'Accès refusé' }, 403)
  }

  const safeName = filename.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-80) || 'fichier'
  const key = `${folder}/${Date.now()}-${safeName}`

  const s3 = new S3Client({
    region: 'auto',
    endpoint: `https://${Deno.env.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: Deno.env.get('R2_ACCESS_KEY_ID')!,
      secretAccessKey: Deno.env.get('R2_SECRET_ACCESS_KEY')!,
    },
  })
  // Les documents de dossiers vont dans un bucket privé s'il est configuré (R2_PRIVATE_BUCKET).
  const bucket = (isDossier ? Deno.env.get('R2_PRIVATE_BUCKET') : undefined) ?? Deno.env.get('R2_BUCKET')!
  const uploadUrl = await getSignedUrl(s3, new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType }), {
    expiresIn: 300,
  })

  return json({ uploadUrl, key })
})
