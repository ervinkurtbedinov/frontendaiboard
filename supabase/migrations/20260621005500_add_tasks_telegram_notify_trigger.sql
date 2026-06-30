create extension if not exists pg_net with schema extensions;

create or replace function public.notify_task_created_via_edge_function()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  project_url text := 'https://ukyrxztinxbrtwjodzfk.supabase.co';
  webhook_secret text := coalesce(
    nullif(current_setting('app.telegram_db_webhook_secret', true), ''),
    'telegram-change-me'
  );
begin
  if new.assignee_id is null then
    return new;
  end if;

  perform net.http_post(
    url := project_url || '/functions/v1/notify-task-created',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-webhook-secret', webhook_secret
    ),
    body := jsonb_build_object(
      'type', TG_OP,
      'table', TG_TABLE_NAME,
      'schema', TG_TABLE_SCHEMA,
      'record', to_jsonb(new)
    )
  );

  return new;
end;
$$;

drop trigger if exists trg_notify_task_created_via_edge_function on public.tasks;

create trigger trg_notify_task_created_via_edge_function
after insert on public.tasks
for each row
execute function public.notify_task_created_via_edge_function();
