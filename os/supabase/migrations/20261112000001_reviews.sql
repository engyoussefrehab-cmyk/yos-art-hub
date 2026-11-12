-- Client reviews submitted from yrstudio.art/review.
-- Reviews publish automatically; hide a bad one with:
--   update public.reviews set is_visible = false where id = '...';
-- Anonymous visitors can only call submit_review() and public_reviews().

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  project text,
  text text not null,
  rating int not null check (rating between 1 and 5),
  is_visible boolean not null default true,
  ip text,
  created_at timestamptz not null default now()
);
create index if not exists reviews_created_idx on public.reviews (is_visible, created_at desc);
alter table public.reviews enable row level security;
revoke all on public.reviews from anon;
create policy "owner full access" on public.reviews for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

create or replace function public.submit_review(payload jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_name text := btrim(coalesce(payload ->> 'name', ''));
  v_project text := btrim(coalesce(payload ->> 'project', ''));
  v_text text := btrim(coalesce(payload ->> 'text', ''));
  v_rating int;
  v_ip text;
begin
  if coalesce(payload ->> 'website', '') <> '' then return 'ok'; end if; -- honeypot

  begin v_rating := (payload ->> 'rating')::int; exception when others then v_rating := null; end;
  if v_rating is null or v_rating < 1 or v_rating > 5 then
    raise exception 'Please choose a rating.' using errcode = '22023';
  end if;
  if length(v_name) < 2 or length(v_name) > 80 then
    raise exception 'Please enter your name.' using errcode = '22023';
  end if;
  if length(v_text) < 15 or length(v_text) > 800 then
    raise exception 'Please write a few words about your experience.' using errcode = '22023';
  end if;
  if length(v_project) > 120 then
    raise exception 'Project is too long.' using errcode = '22023';
  end if;
  -- No links in public reviews.
  if v_text ~* '(https?://|www\.)' or v_name ~* '(https?://|www\.)' or v_project ~* '(https?://|www\.)' then
    raise exception 'Links are not allowed in reviews.' using errcode = '22023';
  end if;

  begin
    v_ip := split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1);
  exception when others then v_ip := null; end;
  if (v_ip is not null and (select count(*) from reviews where ip = v_ip and created_at > now() - interval '1 day') >= 2)
     or (select count(*) from reviews where created_at > now() - interval '1 day') >= 30 then
    raise exception 'Too many requests. Please try again later.' using errcode = '22023';
  end if;

  insert into reviews (name, project, text, rating, ip)
    values (v_name, nullif(v_project, ''), v_text, v_rating, v_ip);
  return 'ok';
end $$;
revoke all on function public.submit_review(jsonb) from public;
grant execute on function public.submit_review(jsonb) to anon, authenticated;

-- Visible reviews for the public site (no ip, no hidden rows).
create or replace function public.public_reviews()
returns table (id uuid, name text, project text, text text, rating int, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select id, name, project, text, rating, created_at
  from reviews where is_visible order by created_at desc limit 50;
$$;
revoke all on function public.public_reviews() from public;
grant execute on function public.public_reviews() to anon, authenticated;

-- Telegram ping for each new review (uses the same secrets as new inquiries).
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
    body := jsonb_build_object('chat_id', v_chat, 'text',
      E'⭐ تقييم جديد ' || new.rating || E'/5\nالاسم: ' || new.name
      || E'\nالمشروع: ' || coalesce(new.project, '-') || E'\n\n' || left(new.text, 1500))
  );
  return new;
exception when others then return new;
end $$;
revoke all on function public.notify_new_review() from public, anon, authenticated;
drop trigger if exists reviews_notify_telegram on public.reviews;
create trigger reviews_notify_telegram after insert on public.reviews
  for each row execute function public.notify_new_review();
