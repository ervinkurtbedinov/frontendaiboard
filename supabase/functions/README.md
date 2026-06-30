# Telegram Notification Setup

This project now includes two Supabase Edge Functions:

- `telegram-webhook`
- `notify-task-created`
- `notify-user-task`

Required secrets in Supabase:

- `TELEGRAM_BOT_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TELEGRAM_WEBHOOK_SECRET` (optional but recommended)
- `DB_WEBHOOK_SECRET` (must match the DB trigger secret; default fallback is `telegram-change-me`)

Recommended DB setting for webhook secret:

```sql
alter database postgres set app.telegram_db_webhook_secret = 'replace-with-strong-secret';
```

Telegram webhook URL:

`https://ukyrxztinxbrtwjodzfk.supabase.co/functions/v1/telegram-webhook`

Set Telegram webhook with secret token:

`https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=https://ukyrxztinxbrtwjodzfk.supabase.co/functions/v1/telegram-webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>`

## Direct user notify endpoint

POST `https://ukyrxztinxbrtwjodzfk.supabase.co/functions/v1/notify-user-task`

Headers:

- `Content-Type: application/json`
- `x-webhook-secret: <DB_WEBHOOK_SECRET>`

Body example:

```json
{
  "userId": "00000000-0000-0000-0000-000000000000",
  "task": {
    "title": "Подготовить лендинг",
    "description": "Собрать первый черновик до завтра",
    "boardName": "Marketing"
  }
}
```
