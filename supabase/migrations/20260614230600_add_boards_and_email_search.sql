create extension if not exists pgcrypto;

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 3),
  description text not null default 'New board',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (board_id, user_id)
);

create index if not exists boards_owner_id_idx on public.boards(owner_id);
create index if not exists board_members_user_id_idx on public.board_members(user_id);
create index if not exists profiles_email_lower_idx on public.profiles(lower(email)) where email is not null;

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at
before update on public.boards
for each row
execute function public.set_updated_at_timestamp();

alter table public.boards enable row level security;
alter table public.board_members enable row level security;

drop policy if exists boards_select_for_members on public.boards;
create policy boards_select_for_members
on public.boards
for select
to authenticated
using (owner_id = auth.uid());

drop policy if exists boards_insert_for_owner on public.boards;
create policy boards_insert_for_owner
on public.boards
for insert
to authenticated
with check (owner_id = auth.uid());

drop policy if exists boards_update_for_members on public.boards;
create policy boards_update_for_members
on public.boards
for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

drop policy if exists boards_delete_for_owner on public.boards;
create policy boards_delete_for_owner
on public.boards
for delete
to authenticated
using (owner_id = auth.uid());

drop policy if exists board_members_select_for_members on public.board_members;
create policy board_members_select_for_members
on public.board_members
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.boards board_row
    where board_row.id = board_members.board_id
      and board_row.owner_id = auth.uid()
  )
);

drop policy if exists board_members_insert_for_owner on public.board_members;
create policy board_members_insert_for_owner
on public.board_members
for insert
to authenticated
with check (
  exists (
    select 1
    from public.boards board_row
    where board_row.id = board_members.board_id
      and board_row.owner_id = auth.uid()
  )
);

drop policy if exists board_members_delete_for_owner on public.board_members;
create policy board_members_delete_for_owner
on public.board_members
for delete
to authenticated
using (
  exists (
    select 1
    from public.boards board_row
    where board_row.id = board_members.board_id
      and board_row.owner_id = auth.uid()
  )
);

create or replace function public.find_user_by_email(search_email text)
returns table (
  id uuid,
  email text,
  full_name text,
  team_role text
)
language sql
security definer
set search_path = public
as $$
  select profile.id, profile.email, profile.full_name, profile.team_role
  from public.profiles profile
  where profile.email is not null
    and lower(profile.email) = lower(search_email)
  limit 1;
$$;

revoke all on function public.find_user_by_email(text) from public;
grant execute on function public.find_user_by_email(text) to authenticated;
