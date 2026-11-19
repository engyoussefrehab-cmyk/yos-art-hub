// Telegram webhook: handles the ✅ publish / ❌ delete buttons under each new review.
// Deploy: supabase functions deploy telegram-review --no-verify-jwt
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function secret(key: string): Promise<string | null> {
  const { data } = await db.from("app_secrets").select("value").eq("key", key).maybeSingle();
  return data?.value ?? null;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("ok");
  const [token, chat, hook] = await Promise.all([
    secret("telegram_bot_token"),
    secret("telegram_chat_id"),
    secret("telegram_webhook_secret"),
  ]);
  // Only Telegram (with our secret) may call this.
  if (!token || !hook || req.headers.get("x-telegram-bot-api-secret-token") !== hook) {
    return new Response("forbidden", { status: 403 });
  }
  const api = (method: string, body: unknown) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

  const update = await req.json().catch(() => ({}));
  const cb = update.callback_query;
  if (!cb) return new Response("ok");
  // Only the owner's chat may press the buttons.
  if (String(cb.message?.chat?.id) !== chat) {
    await api("answerCallbackQuery", { callback_query_id: cb.id });
    return new Response("ok");
  }

  const [action, id] = String(cb.data ?? "").split(":");
  const msg = cb.message;
  const base = String(msg.text ?? "").split("\n\n— ")[0];
  let status = "";
  let keyboard: unknown[][] = [];

  if (action === "p" || action === "u") {
    const { error } = await db.from("reviews").update({ is_visible: action === "p" }).eq("id", id);
    if (error) {
      await api("answerCallbackQuery", { callback_query_id: cb.id, text: "حصل خطأ، حاول تاني", show_alert: true });
      return new Response("ok");
    }
    status = action === "p" ? "✅ منشور على الموقع" : "⏸ مخفي (غير منشور)";
    keyboard =
      action === "p"
        ? [[{ text: "إخفاء", callback_data: `u:${id}` }, { text: "❌ حذف", callback_data: `d:${id}` }]]
        : [[{ text: "✅ انشر", callback_data: `p:${id}` }, { text: "❌ حذف", callback_data: `d:${id}` }]];
  } else if (action === "d") {
    await db.from("reviews").delete().eq("id", id);
    status = "🗑 تم الحذف";
  } else {
    await api("answerCallbackQuery", { callback_query_id: cb.id });
    return new Response("ok");
  }

  await api("editMessageText", {
    chat_id: msg.chat.id,
    message_id: msg.message_id,
    text: `${base}\n\n— ${status}`,
    reply_markup: { inline_keyboard: keyboard },
  });
  await api("answerCallbackQuery", { callback_query_id: cb.id, text: status });
  return new Response("ok");
});
