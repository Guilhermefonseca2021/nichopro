create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  access_status text not null default 'pending'
    check (access_status in ('pending', 'approved', 'rejected')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.niches (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  cover_image_url text not null default '',
  accent text not null default '#7c3aed',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subniches (
  id uuid primary key default gen_random_uuid(),
  niche_id uuid not null references public.niches (id) on delete cascade,
  name text not null,
  slug text not null,
  cover_image_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (niche_id, slug)
);

create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  subniche_id uuid not null references public.subniches (id) on delete cascade,
  title text not null,
  description text not null,
  image_url text not null,
  prompt_text text not null,
  category text not null default 'Todos',
  is_published boolean not null default true,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subniches_niche_id_idx on public.subniches (niche_id);
create index if not exists prompts_subniche_published_idx
  on public.prompts (subniche_id, is_published);
create index if not exists profiles_status_idx
  on public.profiles (access_status, payment_status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create or replace function public.ensure_admin_remains()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  removing_admin boolean := false;
begin
  if old.role = 'admin' then
    if tg_op = 'DELETE' then
      removing_admin := true;
    elsif tg_op = 'UPDATE' then
      removing_admin := new.role <> 'admin';
    end if;
  end if;

  if removing_admin then
    perform pg_catalog.pg_advisory_xact_lock(481902, 1);
    if (select count(*) from public.profiles where role = 'admin') <= 1 then
      raise exception 'At least one administrator must remain'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_keep_admin on public.profiles;
create trigger profiles_keep_admin
before update of role or delete on public.profiles
for each row execute function public.ensure_admin_remains();

drop trigger if exists prompts_set_updated_at on public.prompts;
create trigger prompts_set_updated_at
before update on public.prompts
for each row execute function public.set_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.has_prompt_access()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'user'
      and access_status = 'approved'
      and payment_status = 'paid'
  );
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

insert into public.profiles (id, full_name)
select
  id,
  coalesce(nullif(trim(raw_user_meta_data ->> 'full_name'), ''), '')
from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.niches enable row level security;
alter table public.subniches enable row level security;
alter table public.prompts enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or (select public.is_admin()));

drop policy if exists "Admins update profiles" on public.profiles;

drop policy if exists "Admins read all niches" on public.niches;
create policy "Admins read all niches"
on public.niches for select to authenticated
using ((select public.is_admin()));

drop policy if exists "Approved users read niches" on public.niches;
create policy "Approved users read niches"
on public.niches for select to authenticated
using ((select public.has_prompt_access()));

drop policy if exists "Admins manage niches" on public.niches;
create policy "Admins manage niches"
on public.niches for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins read all subniches" on public.subniches;
create policy "Admins read all subniches"
on public.subniches for select to authenticated
using ((select public.is_admin()));

drop policy if exists "Approved users read subniches" on public.subniches;
create policy "Approved users read subniches"
on public.subniches for select to authenticated
using ((select public.has_prompt_access()));

drop policy if exists "Admins manage subniches" on public.subniches;
create policy "Admins manage subniches"
on public.subniches for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Admins manage prompts" on public.prompts;
create policy "Admins manage prompts"
on public.prompts for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "Approved users read published prompts" on public.prompts;
create policy "Approved users read published prompts"
on public.prompts for select to authenticated
using (
  is_published
  and (select public.has_prompt_access())
);

insert into public.niches (name, slug, description, cover_image_url, accent, sort_order)
values
  ('Comida', 'comida', 'Prompts para o seu negócio gastronômico.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=85', '#f97316', 1),
  ('Lojas', 'lojas', 'Ideias para lojas e marcas de varejo.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85', '#a855f7', 2),
  ('Fotografia', 'fotografia', 'Recursos para fotografia e edição profissional.', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=85', '#14b8a6', 3),
  ('Serviços', 'servicos', 'Conteúdo para profissionais e prestadores de serviços.', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=85', '#f59e0b', 4)
on conflict (slug) do nothing;

insert into public.subniches (niche_id, name, slug, cover_image_url, sort_order)
select n.id, s.name, s.slug, s.cover_image_url, s.sort_order
from public.niches n
join (values
  ('comida', 'Hamburgueria', 'hamburgueria', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=85', 1),
  ('comida', 'Pizzaria', 'pizzaria', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=85', 2),
  ('comida', 'Açaiteria', 'acaiteria', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=800&q=85', 3),
  ('comida', 'Doceria', 'doceria', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=85', 4),
  ('lojas', 'Loja de Roupas', 'loja-de-roupas', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=85', 1),
  ('lojas', 'Loja de Calçados', 'loja-de-calcados', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=85', 2),
  ('lojas', 'Acessórios', 'acessorios', 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?auto=format&fit=crop&w=800&q=85', 3),
  ('fotografia', 'Tratamento de Luz', 'tratamento-de-luz', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=85', 1),
  ('fotografia', 'Tratamento de Pele', 'tratamento-de-pele', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=85', 2),
  ('fotografia', 'Tratamento de Cenário', 'tratamento-de-cenario', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=85', 3),
  ('servicos', 'Estética e Beleza', 'estetica-e-beleza', 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?auto=format&fit=crop&w=800&q=85', 1),
  ('servicos', 'Saúde', 'saude', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=85', 2),
  ('servicos', 'Imobiliária', 'imobiliaria', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85', 3),
  ('servicos', 'Automotivo', 'automotivo', 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=800&q=85', 4)
) as s(niche_slug, name, slug, cover_image_url, sort_order)
  on s.niche_slug = n.slug
on conflict (niche_id, slug) do nothing;

grant select on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select, insert, update, delete on public.niches to authenticated;
grant select, insert, update, delete on public.subniches to authenticated;
grant select, insert, update, delete on public.prompts to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.has_prompt_access() to authenticated;
