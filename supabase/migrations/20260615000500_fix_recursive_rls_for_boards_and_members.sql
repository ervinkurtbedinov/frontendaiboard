create or replace function public.is_board_owner(p_board_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.boards board_row
    where board_row.id = p_board_id
      and board_row.owner_id = auth.uid()
  );
$$;

revoke all on function public.is_board_owner(uuid) from public;
grant execute on function public.is_board_owner(uuid) to authenticated;

drop policy if exists boards_select_for_members on public.boards;
create policy boards_select_for_members
on public.boards
for select
to authenticated
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.board_members member_row
    where member_row.board_id = boards.id
      and member_row.user_id = auth.uid()
  )
);

drop policy if exists board_members_select_for_members on public.board_members;
create policy board_members_select_for_members
on public.board_members
for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_board_owner(board_id)
);
