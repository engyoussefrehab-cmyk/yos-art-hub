-- Telegram notification for every new website inquiry.
-- Run this file in Supabase -> SQL Editor, then store the bot token and chat id
-- with the two `insert` statements at the bottom (kept OUT of the repo on purpose).

create extension if not exists pg_net with schema extensions;

-- Private key/value store. RLS on and no policies: only the database owner and
-- security-definer functions can read it. The anon/publishable key gets nothing.
create table if not exists public.app_secrets (
  key text primary key,
  value text not null
);
alter table public.app_secrets enable row level security;
revoke all on public.app_secrets from anon, authenticated;

create or replace function public.notify_new_inquiry()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare
  v_token text;
  v_chat text;
  v_name text;
  v_phone text;
  v_email text;
  v_text text;
begin
  -- Only website/inquiry-form leads (no signed-in user). Leads you add yourself stay quiet.
  if auth.uid() is not null then return new; end if;

  select value into v_token from app_secrets where key = 'telegram_bot_token';
  select value into v_chat from app_secrets where key = 'telegram_chat_id';
  if v_token is null or v_chat is null then return new; end if;

  select name, phone, email into v_name, v_phone, v_email from clients where id = new.client_id;

  v_text := E'📩 طلب جديد ' || new.ref
    || E'\nالاسم: ' || coalesce(v_name, '')
    || E'\nواتساب: ' || coalesce(v_phone, '-')
    || E'\nالإيميل: ' || coalesce(v_email, '-')
    || E'\nالخدمة: ' || coalesce(new.requested_service, '-')
    || E'\nالمصدر: ' || new.source::text
    || E'\n\n' || left(coalesce(new.brief, ''), 1500);

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || v_token || '/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('chat_id', v_chat, 'text', v_text)
  );
  return new;
exception when others then
  -- Never let a notification problem block a client's inquiry.
  return new;
end $$;

revoke all on function public.notify_new_inquiry() from public, anon, authenticated;

drop trigger if exists leads_notify_telegram on public.leads;
create trigger leads_notify_telegram
  after insert on public.leads
  for each row execute function public.notify_new_inquiry();

-- ---- Run these two ONCE with your real values (do not commit them) ----
-- insert into public.app_secrets (key, value) values ('telegram_bot_token', 'PASTE_BOT_TOKEN')
--   on conflict (key) do update set value = excluded.value;
-- insert into public.app_secrets (key, value) values ('telegram_chat_id', 'PASTE_CHAT_ID')
--   on conflict (key) do update set value = excluded.value;
