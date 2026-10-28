-- Migration : ajout de clubs par le Comité, photos du site, jour d'activité du club du mois.
-- À exécuter une fois dans le SQL Editor d'un projet créé AVANT cette date (un projet neuf utilise schema.sql).
-- Sans danger si rejouée.

-- 1. Jour de l'activité choisi par le Comité (défaut : dernier vendredi du mois).
alter table public.planning add column if not exists activity_date date;
alter table public.planning drop constraint if exists planning_activity_date_in_month;
alter table public.planning add constraint planning_activity_date_in_month
  check (activity_date is null or date_trunc('month', activity_date) = month);

-- 2. Réglages du site (photos de l'accueil).
create table if not exists public.site_settings (
  key    text primary key,
  value  jsonb not null default '[]'
);
alter table public.site_settings enable row level security;
drop policy if exists "lecture publique" on public.site_settings;
drop policy if exists "comité" on public.site_settings;
create policy "lecture publique" on public.site_settings for select using (true);
create policy "comité" on public.site_settings for all
  using (public.app_role() = 'comite') with check (public.app_role() = 'comite');

-- 3. La vignette de la carte d'un club suit sa photo de couverture : le responsable peut donc la modifier.
create or replace function public.clubs_guard() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if coalesce(public.app_role(), '') <> 'comite'
     and (new.slug, new.name, new.category, new.members, new.founded)
         is distinct from (old.slug, old.name, old.category, old.members, old.founded) then
    raise exception 'Seul le Comité peut modifier le nom, la catégorie ou les chiffres d''un club';
  end if;
  return new;
end $$;
