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

create or replace function public.get_board_members(p_board_id uuid)
returns table (
  id uuid,
  email text,
  full_name text,
  team_role text,
  avatar_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
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
  ) then
    raise exception 'Not allowed to view board members';
  end if;

  return query
  select distinct
    profile.id,
    profile.email,
    profile.full_name,
    profile.team_role,
    to_jsonb(profile)->>'avatar_url' as avatar_url
  from public.profiles profile
  where profile.id in (
    select board_row.owner_id
    from public.boards board_row
    where board_row.id = p_board_id
    union
    select member_row.user_id
    from public.board_members member_row
    where member_row.board_id = p_board_id
  );
end;
$$;

revoke all on function public.get_board_members(uuid) from public;
grant execute on function public.get_board_members(uuid) to authenticated;
