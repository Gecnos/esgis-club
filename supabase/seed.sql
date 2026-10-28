-- Données de départ, reprises des données de démonstration du site.
-- À exécuter après schema.sql. Sans danger si relancé (on conflict do nothing).

insert into public.clubs (slug, name, category, description, members, founded) values
  ('otaku', 'Otaku', 'Arts & Culture', 'Manga, anime et culture japonaise : projections, quiz et cosplay.', 36, 2025),
  ('danse', 'Danse', 'Arts & Culture', 'Afro, hip-hop et contemporain : on répète et on monte sur scène.', 42, 2019),
  ('musique', 'Musique', 'Arts & Culture', 'Chant, instruments et jam sessions, du gospel à l''afrobeat.', 31, 2020),
  ('football', 'Football', 'Sport', 'Entraînements chaque vendredi et tournoi inter-promotions.', 54, 2018),
  ('basketball', 'Basketball', 'Sport', 'Matchs 3x3 et 5x5, tous niveaux bienvenus.', 38, 2019),
  ('robotique', 'Robotique', 'Tech', 'Arduino, capteurs et robots autonomes construits en équipe.', 48, 2021),
  ('entrepreneuriat', 'Entrepreneuriat', 'Business & Langues', 'Du pitch au prototype : lance ton projet avec des mentors.', 40, 2020),
  ('anglais', 'Anglais', 'Business & Langues', 'Conversation, débats et préparation au TOEIC.', 45, 2019),
  ('dev', 'Dev', 'Tech', 'Web, mobile et hackathons pour coder de vrais projets.', 62, 2020),
  ('cybersecurite', 'Cybersécurité', 'Tech', 'Challenges CTF, sécurité réseau et bonnes pratiques.', 33, 2023),
  ('art-deco', 'Art & Déco', 'Arts & Culture', 'Peinture, upcycling et décoration des événements ESGIS.', 24, 2024)
on conflict (slug) do nothing;

-- Fiche détaillée du Club Robotique (les autres clubs la complètent depuis leur espace admin).
update public.clubs set
  schedule = 'Vendredi 12h – Salle TP 3',
  whatsapp = '2290196112233',
  long_description = 'Le Club Robotique réunit les étudiants curieux d''électronique, de programmation embarquée et de mécanique. Chaque vendredi, on conçoit, on soude, on code et on teste des robots en équipe, du premier circuit Arduino jusqu''aux robots autonomes de compétition.',
  goal = 'Donner à chaque membre les bases pour concevoir un système robotique de A à Z, et représenter l''ESGIS dans les compétitions de robotique au Bénin.',
  objectives = array[
    'Maîtriser Arduino, capteurs et moteurs en 3 mois',
    'Travailler en équipe projet, comme en entreprise',
    'Participer à 2 compétitions nationales par an',
    'Chaque membre confirmé parraine un débutant',
    'Construire un robot utile à la communauté ESGIS'
  ],
  socials = '{"instagram": "@robotique.esgis", "facebook": "Club Robotique ESGIS"}'
where slug = 'robotique';

insert into public.club_bureau (club_slug, role, name, filiere, fixed, position)
select 'robotique', v.role, v.name, v.filiere, true, v.position
from (values
  ('Président', 'Wilfried Ahouandjinou', 'Génie électrique · L3', 0),
  ('Secrétaire', 'Nadège Gbaguidi', 'Génie logiciel · L2', 1),
  ('Trésorier', 'Rachidi Alao', 'Réseaux & Télécoms · L2', 2),
  ('Communication', 'Estelle Kiki', 'Marketing digital · L1', 3)
) as v(role, name, filiere, position)
where not exists (select 1 from public.club_bureau where club_slug = 'robotique');

insert into public.featured_activities (club_slug, title, start_time, end_time, place, description, program) values
  ('robotique', 'Robots en piste : la grande démo', '12:00', '17:00', 'Hall principal, campus ESGIS Cotonou',
   'Démonstration des robots suiveurs de ligne conçus par les membres, puis atelier d''initiation Arduino ouvert à tous. Aucun prérequis : viens construire ton premier circuit.',
   '[{"time": "12:00", "label": "Accueil et démonstrations dans le hall"}, {"time": "13:30", "label": "Atelier Arduino, groupes de 10"}, {"time": "16:00", "label": "Course finale et remise des prix"}]')
on conflict (club_slug) do nothing;

insert into public.committee_members (role, name, filiere, position)
select v.role, v.name, v.filiere, v.position
from (values
  ('Président', 'Kévin Agossou', 'Génie logiciel · M1', 0),
  ('Vice-Présidente', 'Mariam Bello', 'Gestion · L3', 1),
  ('Secrétaire Générale', 'Grâce Dossou', 'Droit des affaires · L3', 2),
  ('Trésorier', 'Ulrich Hounkpatin', 'Finance · M1', 3),
  ('Communication', 'Fadilatou Saka', 'Marketing digital · L2', 4),
  ('Événements', 'Jordan Zinsou', 'Réseaux & Télécoms · L3', 5)
) as v(role, name, filiere, position)
where not exists (select 1 from public.committee_members);

insert into public.challenge_scores (club_slug, points) values
  ('robotique', 1240), ('danse', 1105), ('entrepreneuriat', 980), ('football', 920), ('dev', 870)
on conflict (club_slug) do nothing;

-- Planning de l'année 2026–2027 (adapter les dates chaque année).
insert into public.planning (month, club_slug, vacation) values
  ('2026-09-01', 'football', false),
  ('2026-10-01', 'robotique', false),
  ('2026-11-01', 'danse', false),
  ('2026-12-01', null, true),
  ('2027-01-01', 'entrepreneuriat', false),
  ('2027-02-01', 'dev', false)
on conflict (month) do nothing;
