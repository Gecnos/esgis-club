# Mise en ligne et maintenance

Ce guide couvre : héberger le site, le relier à un domaine, le publier à chaque évolution, puis l'exploiter en production. Pour la base et les images, voir [`supabase.md`](supabase.md).

## Vue d'ensemble

| Élément | Où | Rôle |
| --- | --- | --- |
| Site (fichiers statiques) | Cloudflare Workers & Pages | Sert le dossier `dist/` généré par `npm run build` |
| Base de données, comptes, fonctions | Supabase | Données, authentification, fonctions `r2-presign` et `admin-users` |
| Images et documents | Cloudflare R2 | Fichiers envoyés par les clubs et les dossiers |
| Code | GitHub `Gecnos/esgis-club` | `main` = production, `dev` = intégration |

Le site est une application statique : il n'y a **pas de serveur à administrer**. Tout ce qui demande un secret passe par les fonctions Supabase.

## 1. Héberger le site sur Cloudflare

Cloudflare regroupe maintenant Pages et Workers sous **Workers & Pages** : le projet `esgis-club` est un *Worker* qui sert le dossier `dist/` (Workers Builds). C'est gratuit pour cet usage, et R2 est déjà chez Cloudflare.

1. Dashboard Cloudflare → **Workers & Pages → Create → Import a repository**, choisir `Gecnos/esgis-club`.
2. **Settings → Builds** du projet :
   - **Production branch** : `main`
   - **Build command** : `npm run build`
   - **Deploy command** : `npx wrangler deploy`
   - **Root directory** : `/`
3. **Settings → Builds → Variables and secrets → Add** (variables de *build*, pas les « Runtime variables » du haut de la page) :

| Variable | Valeur |
| --- | --- |
| `VITE_SUPABASE_URL` | `https://qypyxolgfewqdrehfuaz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | clé `anon` (publique), la même que dans `.env.local` |
| `VITE_R2_PUBLIC_URL` | domaine public du bucket d'images (`https://pub-….r2.dev` ou domaine personnalisé) |

4. Lancer le déploiement (**Deployments → Retry build**, ou un push sur `main`). Les variables `VITE_*` sont **inscrites dans le code au moment du build** : après les avoir modifiées, il faut redéployer. Sans elles, le site tourne en mode démonstration.
5. Le fichier `wrangler.jsonc` (à la racine) demande à Cloudflare de servir `dist/` et de renvoyer `index.html` pour toute route inconnue (`/clubs/robotique`, `/connexion` en accès direct). **Ne pas ajouter de `public/_redirects` avec `/* /index.html 200`** : Cloudflare le refuse (« Infinite loop detected »). `public/_headers` (en-têtes de sécurité, cache des fichiers versionnés) est, lui, pris en charge.

Chaque Pull Request obtient automatiquement une **URL de prévisualisation** : pratique pour valider avant de merger.

> Autre hébergeur possible (Netlify, Vercel) : mêmes commandes et même dossier ; `_headers` est compris par Netlify, pas par Vercel (il faudrait un `vercel.json`), et il faudrait ajouter un `_redirects` avec `/* /index.html 200`.

## 2. Nom de domaine

1. Workers & Pages → le projet → **Settings → Domains & Routes → Add → Custom domain** (ex. `clubs.esgis.bj`). Si le domaine n'est pas chez Cloudflare, ajouter l'enregistrement CNAME indiqué chez le registrar.
2. Une fois le domaine actif, mettre à jour **partout** l'adresse du site :
   - Supabase → **Authentication → URL Configuration** : *Site URL* et *Redirect URLs*.
   - Secret `ALLOWED_ORIGIN` des fonctions (puis redéployer les deux fonctions) : `npx supabase secrets set ALLOWED_ORIGIN=https://clubs.esgis.bj`.
   - CORS des buckets R2 (`AllowedOrigins`).
3. Pour les images, ajouter un **domaine personnalisé** au bucket (ex. `images.esgis.bj`), mettre `VITE_R2_PUBLIC_URL` à jour et redéployer. Cela remplace l'URL `r2.dev`, limitée en débit.

## 3. Publier une évolution

Le flux de travail est celui du dépôt (voir README) :

1. Branche `type/numéro-sujet` depuis `dev`, commits Conventional Commits, Pull Request vers `dev`.
2. Le propriétaire valide et merge (rebase) dans `dev`. Tester sur l'URL de prévisualisation.
3. Quand `dev` est stable : Pull Request `dev` → `main`. Le merge déclenche le déploiement de production.

**Modification de la base** : tout changement de table ou de colonne s'écrit dans `supabase/schema.sql` *et* se rejoue à la main dans le SQL Editor du projet (le fichier ne s'applique pas tout seul). Faire d'abord la modification de base (compatible avec l'ancien code), puis déployer le site.

**Modification d'une fonction** : `npx supabase functions deploy r2-presign` ou `admin-users`.

## 4. Annuler un mauvais déploiement

- **Site** : Workers & Pages → le projet → **Deployments** → choisir une version saine → **Rollback** (instantané).
- **Code** : `git revert <commit>` dans une branche, Pull Request, merge.
- **Base** : il n'y a pas d'annulation automatique. Restaurer une sauvegarde (section 6) ou écrire la requête inverse.

## 5. Exploitation courante

### Comptes (tâche du Comité)

Menu **Comptes** de l'espace Comité : créer un responsable à chaque nouvelle élection, **nouveau mot de passe** si quelqu'un l'oublie (le mot de passe est affiché une fois, à transmettre en privé), **supprimer** le compte d'un responsable sorti. Chaque club doit avoir son responsable : la page signale les clubs sans compte.

### Rentrée universitaire (chaque année)

- Mettre à jour le planning du club du mois (Comité → Planning) : la saison commence en septembre.
- Mettre à jour la mention « Année universitaire » du pied de page (`src/components/Footer.tsx`) et le calendrier de `supabase/seed.sql` pour la documentation.
- Passer en revue les comptes : supprimer ceux des responsables partis, créer les nouveaux.

### Contenu

Les responsables de club modifient leur fiche, leur galerie, leur bureau et leur activité phare eux-mêmes ; le Comité traite les dossiers et le planning. Aucune intervention technique n'est nécessaire.

## 6. Sauvegardes

- **Base** : la formule gratuite de Supabase **ne propose pas de sauvegarde téléchargeable automatique** ; la formule Pro inclut des sauvegardes quotidiennes (7 jours). En attendant, faire un export régulier (mensuel, et avant toute modification de schéma) : `npx supabase db dump --linked -f sauvegarde-AAAA-MM-JJ.sql`. Conserver les fichiers hors du dépôt (ils contiennent des données personnelles) dans un stockage privé.
- **Images** : R2 ne supprime rien tout seul, mais il n'y a pas de corbeille. Activer le *Bucket Lock* ou copier le bucket de temps en temps (`rclone` sur l'API S3 de R2) si les photos sont précieuses.
- **Code** : GitHub fait office de sauvegarde. Protéger `main` et `dev` (Settings → Branches : Pull Request obligatoire, pas de force-push).

## 7. Surveillance

- **Disponibilité** : un moniteur gratuit (UptimeRobot, Better Stack) sur `https://clubs.esgis.bj` et sur `https://qypyxolgfewqdrehfuaz.supabase.co/rest/v1/` (répond 401/200 selon la clé : tout code autre qu'une erreur réseau signifie que Supabase répond).
- **Erreurs des fonctions** : Supabase → **Edge Functions →** la fonction → **Logs**. Une erreur 403 sur `admin-users` signifie un appelant qui n'est pas du Comité ; une 500 sur `r2-presign` indique en général un secret R2 absent ou expiré.
- **Auth** : Supabase → **Authentication → Logs** pour les échecs de connexion en série.
- **Quotas** : Supabase → **Settings → Usage** ; Cloudflare → R2 → **Metrics**.

## 8. Points d'attention en production

- **Projet Supabase gratuit mis en pause** : sans activité pendant 7 jours, il est suspendu et le site cesse de charger les données. Soit passer en formule Pro (recommandé dès que le site est public), soit faire une requête régulière (le moniteur de disponibilité ci-dessus suffit à l'éviter s'il interroge l'API). Un projet en pause se relance depuis le dashboard.
- **Quotas gratuits** : Supabase (500 Mo de base, 5 Go de trafic, 50 000 utilisateurs actifs), R2 (10 Go, sans frais de sortie), Pages (builds illimités en lecture). Largement suffisant pour des clubs d'étudiants.
- **Rotation des clés** (au moins une fois par an, et tout de suite en cas de fuite) :
  - *Token R2* : créer un nouveau token, relancer `npx supabase secrets set R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=…`, redéployer `r2-presign`, puis supprimer l'ancien token.
  - *Clé `anon`* : publique par conception, elle protège par les règles RLS ; à régénérer seulement en cas d'abus (Project Settings → API), puis mettre à jour `VITE_SUPABASE_ANON_KEY` et redéployer le site.
  - *Clé `service_role`* : ne sort jamais de Supabase. Si elle fuite quelque part, la régénérer immédiatement.
- **Mots de passe** : Authentication → **Sign In / Providers → Email** : exiger 8 caractères minimum et activer la protection contre les mots de passe compromis si disponible.
- **Inscriptions** : « Allow new users to sign up » doit rester **désactivé** (sinon n'importe qui crée un compte sans rôle).
- **Formulaire public de dossier** : surveiller le volume (table `dossiers`). En cas de spam, ajouter Turnstile (CAPTCHA Cloudflare gratuit) devant le formulaire.
- **Emails de réinitialisation** : l'envoi intégré de Supabase est limité à quelques emails par heure. Pour un usage réel, configurer un SMTP (Authentication → **Emails → SMTP Settings**, ex. Resend, Brevo). En attendant, le Comité peut aussi attribuer un nouveau mot de passe depuis le menu Comptes.

## 9. Mises à jour techniques

Une fois par mois ou par trimestre :

```bash
npm outdated          # versions disponibles
npm audit             # failles connues
npm update            # mises à jour compatibles
npm run lint && npm run build
```

Passer par une branche et une Pull Request, vérifier l'URL de prévisualisation, puis merger. Mettre à jour **Node** (24 LTS) en local (Cloudflare détecte la version via `NODE_VERSION`, à définir dans les variables de build si besoin) ; les versions majeures (React, Vite, React Router, TypeScript) se traitent à part, avec lecture des notes de version.

## 10. En cas de problème

| Symptôme | Cause probable | Action |
| --- | --- | --- |
| Pages blanches ou « Chargement impossible » | Supabase en pause ou indisponible | Vérifier le dashboard Supabase, relancer le projet |
| 404 en rafraîchissant `/clubs/...` | `not_found_handling` absent | Vérifier `wrangler.jsonc` (valeur `single-page-application`) |
| Build en échec « Infinite loop detected » | Fichier `public/_redirects` | Le supprimer : `wrangler.jsonc` gère déjà les routes |
| Site en mode démo après déploiement | Variables `VITE_*` absentes du build | Les ajouter dans Settings → Builds → Variables and secrets, puis relancer le build |
| Images cassées | `VITE_R2_PUBLIC_URL` incorrect ou bucket non public | Ouvrir l'URL d'une image à la main ; la variable doit être le domaine public, pas l'adresse `…r2.cloudflarestorage.com` |
| Envoi de photo refusé | CORS du bucket, secrets R2 ou `ALLOWED_ORIGIN` | Vérifier le domaine dans les trois, redéployer `r2-presign` |
| « Le service de comptes est indisponible » | `admin-users` non déployée | `npx supabase functions deploy admin-users`, regarder les logs |
| Connexion OK mais « pas encore d'accès à l'espace admin » | Compte sans ligne dans `profiles` | Recréer le compte depuis le menu Comptes, ou ajouter la ligne en SQL |
| Mot de passe oublié sans email reçu | Quota d'emails Supabase ou SMTP absent | Nouveau mot de passe depuis le menu Comptes |

## Référencement (SEO)

- Renseigner la variable de build **`VITE_SITE_URL`** (ex. `https://clubs.esgis.bj`, sans slash final) : elle sert à l'URL canonique, à l'aperçu de partage et au `sitemap.xml` généré au build (accueil + un lien par club, lus dans Supabase). Sans elle, seul `robots.txt` est produit.
- `robots.txt` interdit l'indexation de `/admin` et `/connexion` (les pages portent aussi `noindex`).
- Chaque page club a son propre titre et sa description (« Club Robotique · ESGIS Clubs »).
- Après la mise en ligne : ajouter le site dans [Google Search Console](https://search.google.com/search-console), valider le domaine, puis **Sitemaps → `sitemap.xml`**. Même chose dans Bing Webmaster Tools.
- Optionnel : déposer `public/og-image.png` (1200×630) pour l'image affichée au partage sur WhatsApp et les réseaux.
- Le site est une application React rendue dans le navigateur : Google l'indexe, mais plus lentement qu'un site pré-rendu. Si l'indexation s'avère insuffisante, prévoir un pré-rendu des pages clubs.
