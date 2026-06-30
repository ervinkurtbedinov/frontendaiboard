import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type TaskInsertPayload = {
  type?: string;
  record?: {
    id: string;
    title: string;
    board_id: string;
    assignee_id: string | null;
  };
};

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const webhookSecret = Deno.env.get("DB_WEBHOOK_SECRET") ?? "telegram-change-me";

if (!botToken || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing required notify-task-created environment variables.");
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

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const incomingSecret = request.headers.get("x-webhook-secret");
  if (incomingSecret !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload: TaskInsertPayload;
  try {
    payload = (await request.json()) as TaskInsertPayload;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload.type !== "INSERT" || !payload.record) {
    return new Response(JSON.stringify({ ok: true, skipped: "non-insert-event" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  const assigneeId = payload.record.assignee_id;
  if (!assigneeId) {
    return new Response(JSON.stringify({ ok: true, skipped: "no-assignee" }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  try {
    const [{ data: assignee, error: assigneeError }, { data: board }] = await Promise.all([
      supabase
        .from("profiles")
        .select("telegram_chat_id, telegram_notifications_enabled")
        .eq("id", assigneeId)
        .maybeSingle(),
      supabase.from("boards").select("name").eq("id", payload.record.board_id).maybeSingle(),
    ]);

    if (assigneeError) {
      throw assigneeError;
    }

    const chatId = assignee?.telegram_chat_id;
    const notificationsEnabled = Boolean(assignee?.telegram_notifications_enabled);

    if (!chatId || !notificationsEnabled) {
      return new Response(JSON.stringify({ ok: true, skipped: "telegram-not-linked-or-disabled" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    const boardName = board?.name ?? "Board";
    await sendTelegram(chatId, `Новая задача: ${payload.record.title}\nДоска: ${boardName}`);

    return new Response(JSON.stringify({ ok: true, notified: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("notify-task-created error", error);
    return new Response(JSON.stringify({ ok: false }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
