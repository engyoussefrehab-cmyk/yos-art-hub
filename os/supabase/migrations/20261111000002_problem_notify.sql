-- Telegram alert when a visitor gets stuck or fails to submit the website brief.
-- Needs 20261111000001_telegram_notify.sql (app_secrets + pg_net) to be applied first.

create table if not exists public.problem_log (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now()
);
alter table public.problem_log enable row level security;
revoke all on public.problem_log from anon, authenticated;

create or replace function public.report_inquiry_problem(payload jsonb)
returns text language plpgsql security definer set search_path = public, extensions as $$
declare
  v_token text;
  v_chat text;
  v_text text;
begin
  -- Honeypot, and a global cap so the public endpoint cannot be used to spam Telegram.
  if coalesce(payload ->> 'website', '') <> '' then return 'ok'; end if;
  if (select count(*) from problem_log where created_at > now() - interval '1 hour') >= 30 then return 'ok'; end if;
  insert into problem_log default values;

  select value into v_token from app_secrets where key = 'telegram_bot_token';
  select value into v_chat from app_secrets where key = 'telegram_chat_id';
  if v_token is null or v_chat is null then return 'ok'; end if;

  v_text := E'⚠️ عميل واجه مشكلة في نموذج المشروع'
    || E'\nالمشكلة: ' || left(coalesce(payload ->> 'reason', '-'), 300)
    || E'\nالخطوة: ' || left(coalesce(payload ->> 'step', '-'), 60)
    || E'\nالاسم: ' || coalesce(nullif(left(payload ->> 'name', 100), ''), '-')
    || E'\nالبراند: ' || coalesce(nullif(left(payload ->> 'brand', 100), ''), '-')
    || E'\nالهاتف: ' || coalesce(nullif(left(payload ->> 'phone', 30), ''), '-')
    || E'\nالإيميل: ' || coalesce(nullif(left(payload ->> 'email', 150), ''), '-');

  perform net.http_post(
    url := 'https://api.telegram.org/bot' || v_token || '/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('chat_id', v_chat, 'text', v_text)
  );
  return 'ok';
exception when others then
  return 'ok';
end $$;

revoke all on function public.report_inquiry_problem(jsonb) from public;
grant execute on function public.report_inquiry_problem(jsonb) to anon, authenticated;
