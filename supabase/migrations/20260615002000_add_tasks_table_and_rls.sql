create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null check (char_length(trim(title)) >= 3),
  description text not null default '',
  status text not null check (status in ('backlog', 'todo', 'in_progress', 'review', 'done')),
  priority text not null check (priority in ('low', 'medium', 'high')),
  assignee_id uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_board_id_idx on public.tasks(board_id);
create index if not exists tasks_board_status_created_at_idx on public.tasks(board_id, status, created_at desc);

drop trigger if exists set_tasks_updated_at on public.tasks;
create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at_timestamp();

alter table public.tasks enable row level security;

create or replace function public.is_board_member(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boards board_row
    where board_row.id = p_board_id
      and (
        board_row.owner_id = auth.uid()
        or exists (
          select 1
          from public.board_members member_row
          where member_row.board_id = board_row.id
            and member_row.user_id = auth.uid()
        )
      )
  );
$$;

revoke all on function public.is_board_member(uuid) from public;
grant execute on function public.is_board_member(uuid) to authenticated;

drop policy if exists tasks_select_for_board_members on public.tasks;
create policy tasks_select_for_board_members
on public.tasks
for select
to authenticated
using (public.is_board_member(board_id));

drop policy if exists tasks_insert_for_board_members on public.tasks;
create policy tasks_insert_for_board_members
on public.tasks
for insert
to authenticated
with check (public.is_board_member(board_id));

drop policy if exists tasks_update_for_board_members on public.tasks;
create policy tasks_update_for_board_members
on public.tasks
for update
to authenticated
using (public.is_board_member(board_id))
with check (public.is_board_member(board_id));

drop policy if exists tasks_delete_for_board_members on public.tasks;
create policy tasks_delete_for_board_members
on public.tasks
for delete
to authenticated
using (public.is_board_member(board_id));
