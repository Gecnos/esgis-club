import { readFileSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'

/** Slugs des clubs : lus dans Supabase si configuré (clé anon publique), sinon dans les données de démonstration. */
async function clubSlugs(supabaseUrl: string, anonKey: string): Promise<string[]> {
  if (supabaseUrl && anonKey) {
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/clubs?select=slug&order=name`, {
        headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
      })
      if (res.ok) return ((await res.json()) as { slug: string }[]).map((c) => c.slug)
    } catch {
      // on retombe sur les données de démonstration
    }
  }
  return [...readFileSync('src/features/clubs/data.ts', 'utf8').matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1])
}

/** Génère robots.txt et sitemap.xml au build. L'adresse du site vient de VITE_SITE_URL (voir docs/deploiement.md). */
function seoFiles(): Plugin {
  let siteUrl = ''
  let supabaseUrl = ''
  let anonKey = ''
  return {
    name: 'seo-files',
    apply: 'build',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, 'VITE_')
      siteUrl = (env.VITE_SITE_URL ?? '').replace(/\/$/, '')
      supabaseUrl = env.VITE_SUPABASE_URL ?? ''
      anonKey = env.VITE_SUPABASE_ANON_KEY ?? ''
    },
    async generateBundle() {
      const robots = ['User-agent: *', 'Disallow: /admin', 'Disallow: /connexion', 'Allow: /']
      if (!siteUrl) {
        this.warn('VITE_SITE_URL vide : sitemap.xml non généré.')
        this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
        return
      }
      robots.push(`Sitemap: ${siteUrl}/sitemap.xml`)
      const slugs = await clubSlugs(supabaseUrl, anonKey)
      const urls = [`${siteUrl}/`, ...slugs.map((s) => `${siteUrl}/clubs/${s}`)]
      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n') +
        `\n</urlset>\n`
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
    },
    transformIndexHtml(html) {
      // Balises dépendant de l'adresse du site (URL canonique, aperçu de partage).
      if (!siteUrl) return html
      return html.replace('</head>', `    <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n    <meta property="og:image" content="${siteUrl}/og-image.png" />\n  </head>`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoFiles()],
})
