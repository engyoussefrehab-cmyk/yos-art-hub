-- Review notification in Telegram now carries ✅ publish / ❌ delete buttons.
-- The buttons are handled by the edge function functions/telegram-review.
create or replace function public.notify_new_review()
returns trigger language plpgsql security definer set search_path = public, extensions as $$
declare v_token text; v_chat text;
begin
  select value into v_token from app_secrets where key = 'telegram_bot_token';
  select value into v_chat from app_secrets where key = 'telegram_chat_id';
  if v_token is null or v_chat is null then return new; end if;
  perform net.http_post(
    url := 'https://api.telegram.org/bot' || v_token || '/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object(
      'chat_id', v_chat,
      'text', E'⭐ تقييم جديد ' || new.rating || E'/5\nالاسم: ' || new.name
        || E'\nالمشروع: ' || coalesce(new.project, '-') || E'\n\n' || left(new.text, 1500)
        || E'\n\n— ⏳ بانتظار موافقتك',
      'reply_markup', jsonb_build_object('inline_keyboard', jsonb_build_array(jsonb_build_array(
        jsonb_build_object('text', '✅ انشر', 'callback_data', 'p:' || new.id),
        jsonb_build_object('text', '❌ احذف', 'callback_data', 'd:' || new.id)
      )))
    )
  );
  return new;
exception when others then return new;
end $$;
revoke all on function public.notify_new_review() from public, anon, authenticated;

-- Run ONCE with a random string of your own (do not commit it):
-- insert into public.app_secrets (key, value) values ('telegram_webhook_secret', 'PUT_A_LONG_RANDOM_STRING')
--   on conflict (key) do update set value = excluded.value;
