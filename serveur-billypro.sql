-- ============================================================
-- BillyPro (version vendable) — schema COMPLET d'un NOUVEAU projet
-- Supabase. A executer UNE fois dans SQL Editor du nouveau projet.
-- NE PAS executer dans le projet « billypro-suisse » d'origine.
-- Ecrit d'apres ce que l'application envoie ; jamais encore execute
-- sur un vrai serveur : a tester avec un compte d'essai.
-- ============================================================

create table if not exists entreprises (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  reglages jsonb not null default '{}'::jsonb,
  creee_le timestamptz not null default now(),
  essai_fin timestamptz not null default now() + interval '30 days',
  abonnement_fin timestamptz           -- null = pas (encore) d'abonnement paye
);

create table if not exists membres (
  user_id uuid primary key references auth.users(id) on delete cascade,
  entreprise_id uuid not null references entreprises(id) on delete cascade,
  nom text,
  role text not null default 'patron' check (role in ('patron','bureau','terrain'))
);

-- L'entreprise de la personne connectee. SECURITY DEFINER : lit membres
-- sans boucler sur ses propres regles de securite.
create or replace function mon_entreprise() returns uuid
language sql stable security definer set search_path = public as $$
  select entreprise_id from membres where user_id = auth.uid()
$$;

-- Vrai tant que l'essai court ou que l'abonnement est paye.
create or replace function entreprise_active() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select greatest(e.essai_fin, coalesce(e.abonnement_fin, e.essai_fin)) > now()
                   from entreprises e where e.id = mon_entreprise()), false)
$$;

create table if not exists rdvs (
  id uuid primary key,
  entreprise_id uuid not null default mon_entreprise() references entreprises(id) on delete cascade,
  debut_le timestamptz not null,
  duree_min integer,
  statut text not null default 'planifie',
  adresse text, npa text, localite text,
  donnees jsonb not null default '{}'::jsonb,
  supprime_le timestamptz,
  cree_le timestamptz not null default now()
);
create index if not exists rdvs_entreprise_debut on rdvs (entreprise_id, debut_le desc);

create table if not exists factures (
  id uuid primary key,
  entreprise_id uuid not null default mon_entreprise() references entreprises(id) on delete cascade,
  rdv_id uuid,
  numero text not null,
  annee integer not null,
  serie text not null default 'F',
  total_rappen bigint not null default 0,
  reference_qr text,
  emise_le timestamptz not null default now(),
  payee_le timestamptz,
  donnees jsonb not null default '{}'::jsonb,
  unique (entreprise_id, numero)
);
create index if not exists factures_entreprise_emise on factures (entreprise_id, emise_le desc);

create table if not exists compteurs (
  entreprise_id uuid not null references entreprises(id) on delete cascade,
  serie text not null, annee integer not null, dernier integer not null default 0,
  primary key (entreprise_id, serie, annee)
);

-- ---------- Securite : chacun ne voit QUE son entreprise ----------
alter table entreprises enable row level security;
alter table membres     enable row level security;
alter table rdvs        enable row level security;
alter table factures    enable row level security;
alter table compteurs   enable row level security;   -- aucune regle : fonctions seulement

drop policy if exists entreprises_lire on entreprises;
create policy entreprises_lire on entreprises for select using (id = mon_entreprise());

drop policy if exists membres_lire on membres;
create policy membres_lire on membres for select using (entreprise_id = mon_entreprise());

-- Lecture toujours permise (meme abonnement expire) ; ecriture seulement
-- si l'entreprise est active.
drop policy if exists rdvs_lire on rdvs;
create policy rdvs_lire on rdvs for select using (entreprise_id = mon_entreprise());
drop policy if exists rdvs_creer on rdvs;
create policy rdvs_creer on rdvs for insert with check (entreprise_id = mon_entreprise() and entreprise_active());
drop policy if exists rdvs_modifier on rdvs;
create policy rdvs_modifier on rdvs for update using (entreprise_id = mon_entreprise() and entreprise_active())
  with check (entreprise_id = mon_entreprise());

drop policy if exists factures_lire on factures;
create policy factures_lire on factures for select using (entreprise_id = mon_entreprise());
drop policy if exists factures_creer on factures;
create policy factures_creer on factures for insert with check (entreprise_id = mon_entreprise() and entreprise_active());
drop policy if exists factures_modifier on factures;
create policy factures_modifier on factures for update using (entreprise_id = mon_entreprise() and entreprise_active())
  with check (entreprise_id = mon_entreprise());
drop policy if exists factures_supprimer on factures;
create policy factures_supprimer on factures for delete using (entreprise_id = mon_entreprise() and entreprise_active());

-- ---------- Inscription : la base cree l'entreprise ----------
-- Le nom d'entreprise arrive avec le compte (options.data.entreprise).
-- Vide = collegue qui sera rattache plus tard : aucune entreprise creee.
create or replace function a_l_inscription() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_nom text := nullif(trim(new.raw_user_meta_data->>'entreprise'), '');
        v_id uuid;
begin
  if v_nom is not null then
    insert into entreprises (nom) values (left(v_nom, 120)) returning id into v_id;
    insert into membres (user_id, entreprise_id, nom, role)
      values (new.id, v_id, new.email, 'patron');
  end if;
  return new;
end $$;
drop trigger if exists inscription_billy on auth.users;
create trigger inscription_billy after insert on auth.users
  for each row execute function a_l_inscription();

-- ---------- Fonctions appelees par l'application ----------
create or replace function mes_reglages() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  if mon_entreprise() is null then
    raise exception 'Ce compte n''est rattaché à aucune entreprise. Demandez à votre responsable de vous rattacher (Réglages).';
  end if;
  return (select reglages from entreprises where id = mon_entreprise());
end $$;

create or replace function enregistrer_reglages(p_reglages jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
begin
  if not entreprise_active() then raise exception 'Abonnement expiré : enregistrement impossible.'; end if;
  update entreprises set reglages = p_reglages where id = mon_entreprise();
  return p_reglages;
end $$;

-- Numero unique, attribue par la base : F0001-2026, D0001-2026...
create or replace function prochain_numero_facture(p_serie text default 'F') returns text
language plpgsql security definer set search_path = public as $$
declare v_e uuid := mon_entreprise();
        v_a integer := extract(year from now())::int;
        v_n integer;
begin
  if v_e is null then raise exception 'Aucune entreprise.'; end if;
  if not entreprise_active() then raise exception 'Abonnement expiré : facturation impossible.'; end if;
  insert into compteurs (entreprise_id, serie, annee, dernier) values (v_e, p_serie, v_a, 1)
    on conflict (entreprise_id, serie, annee) do update set dernier = compteurs.dernier + 1
    returning dernier into v_n;
  return p_serie || lpad(v_n::text, 4, '0') || '-' || v_a;
end $$;

-- Le patron rattache un compte DEJA cree (sans entreprise) a la sienne.
create or replace function rattacher_collegue(p_email text, p_role text default 'terrain') returns text
language plpgsql security definer set search_path = public as $$
declare v_e uuid := mon_entreprise(); v_u uuid;
begin
  if (select role from membres where user_id = auth.uid()) is distinct from 'patron' then
    raise exception 'Seul le responsable peut rattacher un collègue.';
  end if;
  if p_role not in ('bureau','terrain') then raise exception 'Rôle inconnu.'; end if;
  select id into v_u from auth.users where lower(email) = lower(trim(p_email));
  if v_u is null then
    raise exception 'Aucun compte avec cette adresse : votre collègue doit d''abord créer son compte (sans nom d''entreprise).';
  end if;
  if exists (select 1 from membres where user_id = v_u) then
    raise exception 'Ce compte appartient déjà à une entreprise.';
  end if;
  insert into membres (user_id, entreprise_id, nom, role) values (v_u, v_e, lower(trim(p_email)), p_role);
  return p_email || ' rattaché à votre entreprise (rôle : ' || p_role || ').';
end $$;

create or replace function mon_abonnement() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'etat', case when e.abonnement_fin > now() then 'actif'
                 when e.essai_fin > now() then 'essai' else 'expire' end,
    'jours_restants', greatest(0, ceil(extract(epoch from (e.essai_fin - now())) / 86400)::int))
  from entreprises e where e.id = mon_entreprise()
$$;

revoke all on function a_l_inscription() from public, anon, authenticated;
grant execute on function mes_reglages(), enregistrer_reglages(jsonb),
  prochain_numero_facture(text), rattacher_collegue(text, text), mon_abonnement()
  to authenticated;

-- ---------- Pour toi (vendeur), a lancer a la main apres un paiement ----------
-- update entreprises set abonnement_fin = now() + interval '1 month' where nom = 'Nom du client';
