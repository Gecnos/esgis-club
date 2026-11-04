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

/** Génère robots.txt, sitemap.xml et llms.txt au build. L'adresse du site vient de VITE_SITE_URL (voir docs/deploiement.md). */
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
      const lastmod = new Date().toISOString().split('T')[0]

      // Sitemap avec lastmod, changefreq et priority
      const sitemapUrls = [
        `  <url><loc>${siteUrl}/</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
        ...slugs.map(
          (s) =>
            `  <url><loc>${siteUrl}/clubs/${s}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
        ),
      ]
      const sitemap =
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        sitemapUrls.join('\n') +
        `\n</urlset>\n`

      // llms.txt pour les agents IA (GEO/AEO)
      const llmsTxt = [
        `# ESGIS Clubs`,
        ``,
        `> Les clubs étudiants de l'ESGIS (Ecole Supérieure de Génie Informatique et des Sciences) à Cotonou, Bénin.`,
        ``,
        `## Pages principales`,
        ``,
        `- [Accueil](${siteUrl}/) : Liste de tous les clubs ESGIS par catégorie (Sport, Tech, Arts & Culture, Business & Langues).`,
        ...slugs.map((s) => `- [Club ${s}](${siteUrl}/clubs/${s}) : Page détaillée du club ${s}.`),
        ``,
        `## Informations`,
        ``,
        `- Localisation : Cotonou, Bénin`,
        `- Nombre de clubs : ${slugs.length}`,
        `- Catégories : Sport, Tech, Arts & Culture, Business & Langues`,
        `- Adhésion : via WhatsApp, gratuit`,
        `- Création de club : dossier en ligne`,
      ].join('\n')

      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.join('\n') + '\n' })
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap })
      this.emitFile({ type: 'asset', fileName: 'llms.txt', source: llmsTxt + '\n' })
    },
    transformIndexHtml(html) {
      // Balises dépendant de l'adresse du site (URL canonique, aperçu de partage).
      if (!siteUrl) return html
      return html.replace(
        '</head>',
        [
          `    <link rel="canonical" href="${siteUrl}/" />`,
          `    <meta property="og:url" content="${siteUrl}/" />`,
          `    <meta property="og:image" content="${siteUrl}/og-image.png" />`,
          `    <meta name="twitter:image" content="${siteUrl}/og-image.png" />`,
          `  </head>`,
        ].join('\n'),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), seoFiles()],
})
