# ESGIS Clubs

Site web des clubs étudiants de l'ESGIS : trouver un club, découvrir le club du mois, déposer un dossier de création de club, et espace d'administration pour les responsables de club et le Comité.


## Stack

| Domaine | Choix |
| --- | --- |
| Front | React 19, TypeScript 7, Vite 8 |
| Routage | React Router |
| Style | Tailwind CSS 4 |
| Backend | Supabase (base de données, authentification email + mot de passe) |
| Images | Cloudflare R2 (probable) |
| Validation | zod |
| Lint | oxlint |

Node.js 22.22 ou plus est requis (24 LTS recommandé, à garder à jour pour les correctifs de sécurité).

## Démarrage

```bash
npm install
npm run dev       # serveur de développement
npm run build     # vérification des types + build de production
npm run lint      # oxlint
```

Les variables d'environnement (clés Supabase, accès R2) vont dans un fichier `.env.local` non versionné ; un fichier `.env.example` documente les noms attendus.

### Mode démo et Supabase

Tant que `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` sont vides, le site utilise des données de démonstration et, en développement, deux comptes de test affichés sur `/connexion`. Pour brancher Supabase et R2 : voir [`docs/supabase.md`](docs/supabase.md) (schéma SQL dans `supabase/`). Mise en ligne, sauvegardes et maintenance : [`docs/deploiement.md`](docs/deploiement.md).

## Architecture

```
src/
  pages/        pages routées, fines : elles composent des éléments de features/
  features/     un dossier par domaine métier (clubs, dossiers, planning, auth, …)
    <feature>/
      components/   composants de la feature
      queries.ts    lecture des données (Supabase, R2)
      actions.ts    écritures (Supabase, R2)
      schemas.ts    validation zod des entrées utilisateur
      types.ts      contrat entre composants et requêtes
  components/   composants partagés (Header, Footer, Button, …)
```

## Workflow Git

Branches :

- `main` : production, jamais de commit direct.
- `dev` : branche d'intégration, on y merge toutes les fonctionnalités.


Processus :

1. Créer la branche depuis `dev`.
2. Commits au format Conventional Commits : `feat(search): ajoute les filtres`, `fix(upload): corrige la taille max`.
3. Dès que la branche est terminée, ouvrir une Pull Request **vers `dev`**.
4. Le mainteneur valide la PR, puis elle est mergée en rebase (historique linéaire) une fois la CI verte.
5. Quand `dev` est stable, une PR `dev` → `main` publie.

Types de commit : `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.

## Hooks Git (à installer)

Prévu avec husky : lint et formatage des fichiers modifiés à chaque commit (lint-staged), contrôle du message de commit (commitlint), détection de secrets avec gitleaks si l'outil est installé en local.
