create table if not exists public.prompt_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create index if not exists prompt_favorites_prompt_id_idx
  on public.prompt_favorites (prompt_id);

alter table public.prompt_favorites enable row level security;

revoke all on table public.prompt_favorites from public, anon, authenticated;
grant select, insert, delete on public.prompt_favorites to authenticated;

drop policy if exists "Users read own prompt favorites" on public.prompt_favorites;
create policy "Users read own prompt favorites"
on public.prompt_favorites for select to authenticated
using (
  (select auth.uid()) = user_id
  and (
    (select public.is_admin())
    or (select public.has_prompt_access())
  )
);

drop policy if exists "Users add own prompt favorites" on public.prompt_favorites;
create policy "Users add own prompt favorites"
on public.prompt_favorites for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    (select public.is_admin())
    or (select public.has_prompt_access())
  )
  and exists (
    select 1
    from public.prompts
    where id = prompt_id
      and (is_published or (select public.is_admin()))
  )
);

drop policy if exists "Users remove own prompt favorites" on public.prompt_favorites;
create policy "Users remove own prompt favorites"
on public.prompt_favorites for delete to authenticated
using (
  (select auth.uid()) = user_id
  and (
    (select public.is_admin())
    or (select public.has_prompt_access())
  )
);

revoke update on table public.profiles from public, anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "Users update own name" on public.profiles;
create policy "Users update own name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create index if not exists prompts_subniche_category_created_idx
  on public.prompts (subniche_id, category, created_at desc);
