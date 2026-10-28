# Brancher Supabase et Cloudflare R2

Tant que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont vides, le site tourne sur des **données de démonstration** (mode démo : connexion de test en développement, écritures en mémoire). Dès que les deux variables sont renseignées, tout passe par Supabase et R2, sans autre changement de code.

Mise en ligne et maintenance : voir [`deploiement.md`](deploiement.md).

## Ce qui est déjà prêt dans le code

| Domaine | Fichier | Rôle |
| --- | --- | --- |
| Configuration | `src/lib/env.ts`, `src/lib/supabase.ts` | Lit les variables ; `useMocks` vaut `true` sans Supabase |
| Images | `src/lib/storage.ts` | `imageUrl(clé)` pour afficher, `uploadImage` / `uploadDocument` pour envoyer vers R2 |
| Lectures publiques | `queries.ts` de `clubs`, `planning`, `committee` | Supabase si configuré, sinon `data.ts` |
| Connexion | `src/features/auth/` | Email + mot de passe Supabase Auth, rôle lu dans la table `profiles` |
| Comptes | `src/features/accounts/` + fonction `admin-users` | Le Comité crée, réinitialise et supprime les comptes depuis le site |
| Espace admin | `src/features/admin/` (`queries.ts` lit, `api.ts` écrit) | Chargement et sauvegardes réelles |
| Dépôt de dossier | `src/features/dossiers/actions.ts` | Fichiers vers R2 puis fonction SQL `submit_dossier` |
| Base de données | `supabase/schema.sql`, `supabase/seed.sql` | Tables, droits d'accès (RLS), données de départ |
| Envoi vers R2 | `supabase/functions/r2-presign/` | Signe les envois ; les clés R2 ne sont jamais dans le navigateur |
| Gestion des comptes | `supabase/functions/admin-users/` | Seule à utiliser la clé `service_role`, réservée au Comité |

## 1. Créer le projet Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (région proche de Cotonou, par exemple Europe).
2. **Project Settings → API** : copier l'URL du projet et la clé `anon` (publique).
3. Les mettre dans `.env.local` (copie de `.env.example`) :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ…
```

Ne jamais mettre la clé `service_role` dans le front ni dans Git. La fonction `admin-users` la reçoit automatiquement de Supabase, il n'y a rien à configurer.

## 2. Créer les tables

Dans **SQL Editor**, exécuter dans l'ordre :

1. le contenu de `supabase/schema.sql` ;
2. le contenu de `supabase/seed.sql` (les 11 clubs, le Comité, le planning, la fiche de la Robotique).

Vérifier ensuite dans **Authentication → Policies** que chaque table affiche « RLS enabled ».

**Projet déjà créé avant une évolution ?** `schema.sql` ne s'applique pas tout seul : chaque évolution de la base a un fichier dans `supabase/migrations/`, à exécuter une fois dans le SQL Editor (elles sont rejouables sans risque). Dernière en date : `20261029_clubs_photos_planning.sql` (jour d'activité du club du mois, photos du site, droits sur la vignette d'un club). Sans elle, l'espace Comité ne se charge plus.

**Projet déjà créé avant une évolution ?** `schema.sql` ne s'applique pas tout seul : chaque évolution de la base a un fichier dans `supabase/migrations/`, à exécuter une fois dans le SQL Editor (elles sont rejouables sans risque). Dernière en date : `20261029_clubs_photos_planning.sql` (jour d'activité du club du mois, photos du site, droits sur la vignette d'un club). Sans elle, l'espace Comité ne se charge plus.

> Le projet a d'abord eu un classement « challenge inter-clubs », retiré depuis. Si ta base a été créée avant ce retrait, supprime la table devenue inutile : `drop table if exists public.challenge_scores;`

## 3. Les comptes

Il n'y a pas d'inscription publique. **Le premier compte du Comité se crée à la main** ; ensuite le Comité crée tous les autres depuis le site (menu **Comptes** de l'espace Comité : responsable de club ou membre du Comité, mot de passe provisoire généré, réinitialisation, suppression).

1. **Authentication → Sign In / Providers → Email** : laisser activé et **désactiver « Allow new users to sign up »**. La fonction `admin-users` crée les comptes côté serveur, elle n'est pas concernée par ce réglage.
2. **Authentication → Users → Add user** : créer le premier membre du Comité (email + mot de passe, cocher « Auto Confirm User »). Copier son UUID.
3. Dans le SQL Editor, lui donner son rôle :

```sql
insert into public.profiles (id, full_name, role, club_slug)
values ('<uuid de l''utilisateur>', 'Grâce Dossou', 'comite', null);
```

4. **Authentication → URL Configuration** : renseigner l'adresse du site (Site URL), pour les emails de réinitialisation du mot de passe.
5. Se connecter sur `/connexion` : le menu **Comptes** permet de créer les responsables de club (il suffit de choisir le club). Le mot de passe provisoire n'est affiché qu'une fois : le transmettre en privé.

## 4. Cloudflare R2 (images et documents)

1. **Bucket des images** : `images-esgis` (déjà créé). Le rendre lisible publiquement :
   - pour tester : bucket → **Settings → Public Development URL → Enable** (saisir `allow`). L'URL a la forme `https://pub-xxxxxxxx.r2.dev` ; elle est limitée en débit, donc seulement pour les essais ;
   - pour la production : **Settings → Custom Domains → Add**, avec un sous-domaine d'un domaine géré par Cloudflare (ex. `images.esgis-clubs.bj`).
2. Optionnel mais recommandé : un second bucket **privé** (ex. `esgis-dossiers`) pour les documents des dossiers de création, qui ne doivent pas être publics. Ne pas activer d'URL publique dessus.
3. **Le token d'API (clés d'envoi)**. L'adresse « S3 API » affichée dans les réglages du bucket n'est **pas** un token : c'est le point d'accès privé, il ne sert à rien dans `.env`. Pour créer le token :
   1. Dashboard Cloudflare → **Storage & databases → R2 Object Storage → Overview**.
   2. Dans le bloc **API** (colonne de droite), cliquer **Manage** (ou « Manage API tokens »).
   3. **Create Account API token** (ou « Create API token »).
   4. Permissions : **Object Read & Write**. Restreindre à **Apply to specific buckets only** : `images-esgis` (et `esgis-dossiers` s'il existe). Durée : sans expiration, ou à renouveler (voir `deploiement.md`).
   5. **Create**. La page affiche **une seule fois** l'`Access Key ID` et la `Secret Access Key` : les copier tout de suite dans un gestionnaire de mots de passe. (Le champ « Token value » affiché au-dessus ne sert pas ici.)
   6. L'**Account ID** est dans l'URL du dashboard (`dash.cloudflare.com/<account id>/…`) et dans l'adresse S3 API du bucket.
4. **CORS** de chaque bucket (**Settings → CORS Policy → Edit**) : remplacer `https://ton-site.bj` par le vrai domaine du site.

```json
[
  {
    "AllowedOrigins": ["https://clubs.esgis.bj", "http://localhost:5173"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Dans `.env.local`, `VITE_R2_PUBLIC_URL` est le **domaine public** du bucket d'images (celui de l'étape 1), sans slash final, par exemple :

```
VITE_R2_PUBLIC_URL=https://pub-xxxxxxxx.r2.dev
```

Ne pas y mettre l'adresse `…r2.cloudflarestorage.com` : elle exige une signature, les images ne s'afficheraient pas.

## 5. Déployer les fonctions

Avec la [CLI Supabase](https://supabase.com/docs/guides/cli) (`npx supabase` suffit, sans installation) :

```bash
npx supabase login
npx supabase link --project-ref qypyxolgfewqdrehfuaz
```

Définir les secrets (remplacer les valeurs entre chevrons ; ne pas les commiter, ne pas les coller dans un chat) :

```bash
npx supabase secrets set \
  R2_ACCOUNT_ID=a129d7ba60f4c2482068e5f13ee640f5 \
  R2_ACCESS_KEY_ID=<Access Key ID du token R2> \
  R2_SECRET_ACCESS_KEY=<Secret Access Key du token R2> \
  R2_BUCKET=images-esgis \
  ALLOWED_ORIGIN=https://clubs.esgis.bj,http://localhost:5173

# Optionnel : bucket privé pour les documents des dossiers
npx supabase secrets set R2_PRIVATE_BUCKET=esgis-dossiers
```

`ALLOWED_ORIGIN` accepte plusieurs origines séparées par une virgule : le domaine de production et `http://localhost:5173` pour développer. Tant que le domaine n'existe pas, mettre seulement `http://localhost:5173`.

Déployer :

```bash
npx supabase functions deploy r2-presign
npx supabase functions deploy admin-users
```

Vérifier avec `npx supabase secrets list` (n'affiche que les noms) et dans **Edge Functions** du dashboard (les deux fonctions doivent être « Active »).

Règles appliquées :
- `r2-presign` : images (JPEG, PNG, WebP) de 10 Mo maximum pour les clubs, réservées au responsable du club concerné ou au Comité (les photos du site, `site/…` et `comite/…`, au Comité seul) ; documents (PDF, Word, Excel) de 20 Mo maximum pour les dossiers, ouverts à tous (formulaire public).
- `admin-users` : refuse quiconque n'est pas membre du Comité ; un membre ne peut pas supprimer son propre compte.

## 6. Vérifier

```bash
npm run dev
```

- La page d'accueil affiche les clubs de la base (et plus la mention « Mode démo » sur `/connexion`).
- Connexion avec le compte Comité : redirection vers `/admin/comite`.
- **Comptes** : créer un responsable de club, puis se connecter avec lui dans une fenêtre privée : redirection vers `/admin/club`.
- Modifier la fiche d'un club puis « Publier » : le changement apparaît sur la page publique du club.
- Ajouter une photo dans la galerie : elle part sur R2 et s'affiche via `VITE_R2_PUBLIC_URL`.
- Déposer un dossier depuis « Créer un club » : il apparaît dans l'espace Comité.

## À savoir

- **Le code d'accès à Supabase n'a pas encore été testé de bout en bout** sur le vrai projet : seul le mode démo a été exécuté. Prévoir une passe de test à l'étape 6.
- Les **documents des dossiers** sont envoyés vers R2 mais leur téléchargement depuis l'espace Comité (liens « Documents ») n'est pas encore branché : il faudra une seconde fonction qui signe des liens de lecture temporaires pour le bucket privé.
- Le **nombre de membres** d'un club est une simple colonne à modifier par le Comité ; aucun calcul automatique.
- La **sauvegarde du bureau** réécrit la liste des membres (suppression puis insertion), sans transaction. Acceptable pour un usage à faible concurrence ; à remplacer par une fonction SQL si besoin.
- Le dépôt de dossier public n'a pas de limitation de débit : activer un CAPTCHA (Turnstile de Cloudflare) si des abus apparaissent.
