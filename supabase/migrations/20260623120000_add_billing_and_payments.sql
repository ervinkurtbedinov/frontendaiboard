alter table public.profiles
  add column if not exists stripe_customer_id text,
  add column if not exists billing_plan text not null default 'free',
  add column if not exists stripe_subscription_id text,
  add column if not exists subscription_status text,
  add column if not exists subscription_current_period_end timestamptz;

alter table public.profiles
  drop constraint if exists profiles_billing_plan_check;

alter table public.profiles
  add constraint profiles_billing_plan_check
  check (billing_plan in ('free', 'pro', 'team'));

create unique index if not exists profiles_stripe_customer_id_idx
  on public.profiles (stripe_customer_id)
  where stripe_customer_id is not null;

create unique index if not exists profiles_stripe_subscription_id_idx
  on public.profiles (stripe_subscription_id)
  where stripe_subscription_id is not null;

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_event_id text unique,
  stripe_checkout_session_id text,
  stripe_invoice_id text,
  stripe_payment_intent_id text,
  amount_cents integer not null default 0,
  currency text not null default 'usd',
  status text not null,
  plan text,
  created_at timestamptz not null default now()
);

create index if not exists payments_user_id_created_at_idx
  on public.payments (user_id, created_at desc);

alter table public.payments enable row level security;

drop policy if exists payments_select_own on public.payments;
create policy payments_select_own
on public.payments
for select
to authenticated
using (user_id = auth.uid());
