# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projet

Site des clubs étudiants ESGIS (React 19 + TypeScript 7 + Vite 8, Tailwind 4, React Router). Backend Supabase, images probablement sur Cloudflare R2. L'interface est en français. La maquette de référence est le projet Claude Design « Planche Maquettes Clubs ESGIS » ; voir README.md pour le contexte et la structure.

## Commandes

```bash
npm run dev      # serveur Vite
npm run build    # tsc -b && vite build
npm run lint     # oxlint
```

Aucun test configuré pour l'instant. Node >= 22.22 requis. Sous Windows, après une mise à jour de Node, ouvrir un nouveau terminal pour recharger le PATH.

## Architecture

Le code est organisé par features (`src/features/<feature>/`), les pages (`src/pages/`) ne font que composer.

- Les pages restent fines : elles composent des éléments de `features/` et n'ont pas de logique métier.
- L'accès aux données (Supabase, R2) se fait uniquement dans `queries.ts` et `actions.ts` d'une feature, jamais dans un composant.
- Les entrées utilisateur sont validées avec zod dans `schemas.ts`.
- Le `types.ts` d'une feature est le contrat entre les composants et les requêtes : à convenir avant de coder chaque côté.
- Les dossiers contenant un `.gitkeep` sont vides en attendant leur premier fichier : supprimer le `.gitkeep` au premier ajout.

## Données : mode démo ou Supabase

- `src/lib/env.ts` expose `useMocks` (vrai quand `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` sont vides) et `src/lib/supabase.ts` le client (`null` en démo). Chaque `queries.ts` / `api.ts` a deux branches : Supabase si le client existe, sinon les données de `data.ts`.
- Les pages publiques chargent leurs données par des loaders React Router (`src/pages/loaders.ts`) ; l'espace admin charge son état dans `AdminProvider` (`features/admin/queries.ts`) et écrit via `useAdminActions` → `api.ts`.
- Images : on stocke des clés R2 (`…Key`), jamais des URLs ; l'affichage passe par `imageUrl()` et `<CoverImage>` (`lib/storage.ts`). Les envois passent par la fonction `supabase/functions/r2-presign`.
- Le schéma de base et les droits (RLS) sont dans `supabase/schema.sql` ; toute nouvelle table ou colonne doit y être ajoutée, avec sa politique RLS. Procédure de branchement : `docs/supabase.md` ; mise en ligne et maintenance : `docs/deploiement.md`. Les comptes sont créés par le Comité via la fonction `admin-users` (seule à utiliser la clé service_role).
- Authentification : `features/auth` (email + mot de passe, rôle dans la table `profiles`). Le mode démo de connexion n'existe qu'en développement.

## Conventions Git

- Aucun commit direct sur `main` ni sur `dev`.
- Une branche par ticket, créée depuis `dev`, nommée `type/numéro-sujet` (ex. `feat/9-recherche-filtres`).
- Branche intermédiaire `dev` : toutes les features y sont mergées ; seul `dev` est mergé vers `main`.
- Dès qu'une branche est terminée, ouvrir une Pull Request contre `dev` ; le propriétaire du repo la valide (ne jamais merger soi-même).
- Merge en rebase pour garder un historique linéaire, une fois la CI verte.
- Commits au format Conventional Commits (`feat(search): ...`, `fix(upload): ...`), vérifié par commitlint.
- Hooks prévus (husky) : lint et formatage des fichiers modifiés, gitleaks si installé en local, contrôle du message de commit. Ne pas les contourner avec `--no-verify`.
- Ne commiter ou pousser que sur demande de l'utilisateur.
