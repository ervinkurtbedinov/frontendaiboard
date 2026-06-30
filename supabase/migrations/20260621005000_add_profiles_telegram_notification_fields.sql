alter table public.profiles
  add column if not exists telegram_username text,
  add column if not exists telegram_chat_id bigint,
  add column if not exists telegram_notifications_enabled boolean not null default false,
  add column if not exists telegram_linked_at timestamptz,
  add column if not exists telegram_link_token text;

alter table public.profiles
  drop constraint if exists profiles_telegram_username_format_check;

alter table public.profiles
  add constraint profiles_telegram_username_format_check
  check (
    telegram_username is null
    or telegram_username ~ '^@?[A-Za-z0-9_]{5,32}$'
  );
