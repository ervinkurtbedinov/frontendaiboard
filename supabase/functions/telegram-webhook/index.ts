import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

type TelegramChat = {
  id: number;
};

type TelegramMessage = {
  chat: TelegramChat;
  text?: string;
};

type TelegramUser = {
  id: number;
  username?: string;
};

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  from: TelegramUser;
  message?: TelegramMessage;
};

type TelegramUpdate = {
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const webhookSecret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!botToken || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing required Telegram webhook environment variables.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function sendTelegram(method: string, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(`https://api.telegram.org/bot${botToken}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram API ${method} failed: ${body}`);
  }
}

function parseStartToken(messageText: string | undefined): string | null {
  if (!messageText || !messageText.startsWith("/start")) {
    return null;
  }

  const [, token] = messageText.trim().split(/\s+/, 2);
  return token ?? null;
}

async function handleStart(message: TelegramMessage): Promise<void> {
  const linkToken = parseStartToken(message.text);
  if (!linkToken) {
    await sendTelegram("sendMessage", {
      chat_id: message.chat.id,
      text: "Чтобы включить уведомления, откройте ссылку подключения из Settings и нажмите Start снова.",
    });
    return;
  }

  await sendTelegram("sendMessage", {
    chat_id: message.chat.id,
    text: "Нажмите кнопку ниже, чтобы включить уведомления о новых задачах.",
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Получать уведомления",
            callback_data: `enable_notify:${linkToken}`,
          },
        ],
      ],
    },
  });
}

async function handleEnableNotifications(callbackQuery: TelegramCallbackQuery): Promise<void> {
  const callbackData = callbackQuery.data ?? "";
  const token = callbackData.startsWith("enable_notify:") ? callbackData.slice("enable_notify:".length) : "";
  const chatId = callbackQuery.message?.chat.id;

  if (!token || !chatId) {
    await sendTelegram("answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
      text: "Не удалось распознать токен подключения.",
      show_alert: true,
    });
    return;
  }

  const username = callbackQuery.from.username ? `@${callbackQuery.from.username}` : null;

  const { data, error } = await supabase
    .from("profiles")
    .update({
      telegram_username: username,
      telegram_chat_id: chatId,
      telegram_notifications_enabled: true,
      telegram_linked_at: new Date().toISOString(),
      telegram_link_token: null,
    })
    .eq("telegram_link_token", token)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    await sendTelegram("answerCallbackQuery", {
      callback_query_id: callbackQuery.id,
      text: "Ссылка устарела. Сгенерируйте новую в Settings.",
      show_alert: true,
    });
    return;
  }

  await sendTelegram("answerCallbackQuery", {
    callback_query_id: callbackQuery.id,
    text: "Уведомления включены.",
  });

  await sendTelegram("sendMessage", {
    chat_id: chatId,
    text: "Готово! Теперь вы будете получать уведомления о новых задачах.",
  });
}

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (webhookSecret) {
    const incomingSecret = request.headers.get("x-telegram-bot-api-secret-token");
    if (incomingSecret !== webhookSecret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  try {
    if (update.message?.text?.startsWith("/start")) {
      await handleStart(update.message);
    } else if (update.callback_query?.data?.startsWith("enable_notify:")) {
      await handleEnableNotifications(update.callback_query);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("telegram-webhook error", error);
    return new Response(JSON.stringify({ ok: false }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
