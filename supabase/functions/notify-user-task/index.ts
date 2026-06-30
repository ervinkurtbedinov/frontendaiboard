import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type NotifyUserTaskPayload = {
  userId?: string;
  task?: {
    id?: string;
    title?: string;
    description?: string;
    boardName?: string;
  };
};

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("DB_WEBHOOK_SECRET") ?? "telegram-change-me";

if (!botToken || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing required notify-user-task environment variables.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function sendTelegram(chatId: number, text: string): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed: ${body}`);
  }
}

function buildMessage(task: NonNullable<NotifyUserTaskPayload["task"]>): string {
  const title = task.title?.trim() || "Новая задача";
  const board = task.boardName?.trim();
  const description = task.description?.trim();

  const lines = [`Новая задача: ${title}`];
  if (board) {
    lines.push(`Доска: ${board}`);
  }
  if (description) {
    lines.push("", description);
  }

  return lines.join("\n");
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const incomingSecret = request.headers.get("x-webhook-secret");
  if (incomingSecret !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: NotifyUserTaskPayload;
  try {
    payload = (await request.json()) as NotifyUserTaskPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const userId = payload.userId?.trim();
  if (!userId || !payload.task) {
    return new Response(JSON.stringify({ ok: false, error: "userId and task are required" }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }

  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("telegram_username, telegram_chat_id, telegram_notifications_enabled")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (!profile) {
      return new Response(JSON.stringify({ ok: true, skipped: "user-not-found" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const telegramUsername = profile.telegram_username ?? null;
    const chatId = profile.telegram_chat_id;
    const notificationsEnabled = Boolean(profile.telegram_notifications_enabled);

    if (!notificationsEnabled) {
      return new Response(JSON.stringify({ ok: true, skipped: "notifications-disabled", telegramUsername }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    if (!chatId) {
      return new Response(JSON.stringify({ ok: true, skipped: "chat-id-not-linked", telegramUsername }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    await sendTelegram(chatId, buildMessage(payload.task));

    return new Response(JSON.stringify({ ok: true, notified: true, telegramUsername }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("notify-user-task error", error);
    return new Response(JSON.stringify({ ok: false }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
