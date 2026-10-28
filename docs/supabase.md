# Brancher Supabase et Cloudflare R2

Tant que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont vides, le site tourne sur des **données de démonstration** (mode démo : connexion de test en développement, écritures en mémoire). Dès que les deux variables sont renseignées, tout passe par Supabase et R2, sans autre changement de code.

## Ce qui est déjà prêt dans le code

| Domaine | Fichier | Rôle |
| --- | --- | --- |
| Configuration | `src/lib/env.ts`, `src/lib/supabase.ts` | Lit les variables ; `useMocks` vaut `true` sans Supabase |
| Images | `src/lib/storage.ts` | `imageUrl(clé)` pour afficher, `uploadImage` / `uploadDocument` pour envoyer vers R2 |
| Lectures publiques | `queries.ts` de `clubs`, `planning`, `committee`, `challenge` | Supabase si configuré, sinon `data.ts` |
| Connexion | `src/features/auth/` | Email + mot de passe Supabase Auth, rôle lu dans la table `profiles` |
| Espace admin | `src/features/admin/` (`queries.ts` lit, `api.ts` écrit) | Chargement et sauvegardes réelles |
| Dépôt de dossier | `src/features/dossiers/actions.ts` | Fichiers vers R2 puis fonction SQL `submit_dossier` |
| Base de données | `supabase/schema.sql`, `supabase/seed.sql` | Tables, droits d'accès (RLS), données de départ |
| Envoi vers R2 | `supabase/functions/r2-presign/` | Fonction qui signe les envois ; les clés R2 ne sont jamais dans le navigateur |

## 1. Créer le projet Supabase

1. Créer un projet sur [supabase.com](https://supabase.com) (région proche de Cotonou, par exemple Europe).
2. **Project Settings → API** : copier l'URL du projet et la clé `anon` (publique).
3. Les mettre dans `.env.local` (copie de `.env.example`) :

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ…
```

Ne jamais mettre la clé `service_role` dans le front ni dans Git.

## 2. Créer les tables

Dans **SQL Editor**, exécuter dans l'ordre :

1. le contenu de `supabase/schema.sql` ;
2. le contenu de `supabase/seed.sql` (les 11 clubs, le Comité, le classement, le planning, la fiche de la Robotique).

Vérifier ensuite dans **Authentication → Policies** que chaque table affiche « RLS enabled ».

## 3. Créer les comptes

Il n'y a pas d'inscription publique : le Comité crée les comptes.

1. **Authentication → Providers → Email** : laisser activé, **désactiver « Allow new users to sign up »** pour empêcher les inscriptions libres.
2. **Authentication → Users → Add user** : créer un utilisateur (email + mot de passe) par responsable de club et par membre du Comité.
3. Lier chaque utilisateur à son rôle, dans le SQL Editor (remplacer les valeurs) :

```sql
-- Responsable du Club Robotique
insert into public.profiles (id, full_name, role, club_slug)
values ('<uuid de l''utilisateur>', 'Wilfried Ahouandjinou', 'club', 'robotique');

-- Membre du Comité
insert into public.profiles (id, full_name, role, club_slug)
values ('<uuid de l''utilisateur>', 'Grâce Dossou', 'comite', null);
```

4. **Authentication → URL Configuration** : renseigner l'adresse du site (Site URL), pour les emails de réinitialisation du mot de passe.

## 4. Cloudflare R2 (images et documents)

1. Créer un bucket R2 pour les images publiques (ex. `esgis-clubs`) et le rendre public : soit un domaine personnalisé (recommandé, ex. `images.esgis-clubs.bj`), soit l'URL `r2.dev`.
2. Optionnel mais recommandé : un second bucket **privé** (ex. `esgis-dossiers`) pour les documents des dossiers de création (règlements, calendriers…), qui ne doivent pas être publics.
3. **R2 → Manage API tokens** : créer un token avec accès en écriture (Object Read & Write) limité à ces buckets. Noter l'Account ID, l'Access Key ID et la Secret Access Key.
4. Configurer le **CORS** de chaque bucket pour autoriser les envois depuis le site :

```json
[
  {
    "AllowedOrigins": ["https://ton-site.bj", "http://localhost:5173"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

5. Dans `.env.local` :

```
VITE_R2_PUBLIC_URL=https://images.esgis-clubs.bj
```

## 5. Déployer la fonction d'envoi

Avec la [CLI Supabase](https://supabase.com/docs/guides/cli) installée et connectée (`supabase login`, `supabase link --project-ref <ref>`) :

```bash
supabase secrets set R2_ACCOUNT_ID=… R2_ACCESS_KEY_ID=… R2_SECRET_ACCESS_KEY=… R2_BUCKET=esgis-clubs
supabase secrets set R2_PRIVATE_BUCKET=esgis-dossiers   # optionnel
supabase secrets set ALLOWED_ORIGIN=https://ton-site.bj
supabase functions deploy r2-presign
```

Règles appliquées par la fonction : images (JPEG, PNG, WebP) de 10 Mo maximum pour les clubs, réservées au responsable du club concerné ou au Comité ; documents (PDF, Word, Excel) de 20 Mo maximum pour les dossiers, ouverts à tous (formulaire public).

## 6. Vérifier

```bash
npm run dev
```

- La page d'accueil affiche les clubs de la base (et plus la mention « Mode démo » sur `/connexion`).
- Connexion avec un compte créé à l'étape 3 : redirection vers `/admin/club` ou `/admin/comite`.
- Modifier la fiche d'un club puis « Publier » : le changement apparaît sur la page publique du club.
- Ajouter une photo dans la galerie : elle part sur R2 et s'affiche via `VITE_R2_PUBLIC_URL`.
- Déposer un dossier depuis « Créer un club » : il apparaît dans l'espace Comité.

## À savoir

- **Le code d'accès à Supabase n'a pas encore été testé contre un vrai projet** : il a été écrit et compilé, mais seul le mode démo a été exécuté. Prévoir une passe de test à l'étape 6, en commençant par `schema.sql`.
- Les **documents des dossiers** sont envoyés vers R2 mais leur téléchargement depuis l'espace Comité (liens « Documents ») n'est pas encore branché : il faudra une seconde fonction qui signe des liens de lecture temporaires pour le bucket privé.
- Les **statistiques** (nombre de membres, points du challenge) sont de simples colonnes à modifier par le Comité ; aucun calcul automatique.
- La **sauvegarde du bureau** réécrit la liste des membres (suppression puis insertion), sans transaction. Acceptable pour un usage à faible concurrence ; à remplacer par une fonction SQL si besoin.
- Le dépôt de dossier public n'a pas de limitation de débit : activer un CAPTCHA (Turnstile de Cloudflare) si des abus apparaissent.
