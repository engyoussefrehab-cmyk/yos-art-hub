-- YR Studio OS — full schema.
-- Single-owner app: every private table is readable/writable only by users
-- listed in public.owners. Anonymous visitors can only call submit_inquiry().

-- ─────────────────────────────────────────────────────────── owner check
create table public.owners (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.owners enable row level security;
create policy "owners read self" on public.owners
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.owners where user_id = auth.uid());
$$;
revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ─────────────────────────────────────────────────────────── enums
create type public.currency as enum ('USD', 'EGP', 'SAR', 'AED');
create type public.lead_source as enum ('instagram', 'tiktok', 'whatsapp', 'website', 'referral', 'other');
create type public.lead_status as enum (
  'new_inquiry', 'brief_requested', 'brief_received', 'qualified',
  'quotation_sent', 'negotiation', 'won', 'lost'
);
create type public.priority as enum ('low', 'normal', 'high');
create type public.quotation_status as enum ('draft', 'sent', 'accepted', 'rejected', 'expired');
create type public.project_status as enum (
  'not_started', 'in_progress', 'waiting_for_client', 'in_review',
  'revision', 'completed', 'cancelled'
);
create type public.discount_type as enum ('amount', 'percent');

-- ─────────────────────────────────────────────────────────── settings
create table public.settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'YR Studio',
  owner_name text not null default 'Youssef Rehab',
  email text,
  phone text,
  website text default 'yrstudio.art',
  address text,
  logo_url text,
  default_currency public.currency not null default 'USD',
  quotation_terms text,
  payment_terms text default '50% upfront, 50% before final delivery.',
  quotation_valid_days int not null default 14 check (quotation_valid_days between 1 and 365),
  language text not null default 'en' check (language in ('en', 'ar')),
  brand jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

-- ─────────────────────────────────────────────────────────── core tables
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  brand text,
  email text,
  phone text,
  country text,
  language text check (language in ('en', 'ar')),
  source public.lead_source,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.clients (lower(email));
create index on public.clients (phone);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  description text,
  default_price numeric(12, 2) check (default_price >= 0),
  currency public.currency not null default 'USD',
  delivery_days int check (delivery_days >= 0),
  deliverables text,
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now()
);

create sequence public.lead_ref_seq;
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default 'L-' || lpad(nextval('public.lead_ref_seq')::text, 4, '0'),
  client_id uuid not null references public.clients (id) on delete cascade,
  date date not null default current_date,
  source public.lead_source not null default 'other',
  service_id uuid references public.services (id) on delete set null,
  requested_service text,
  brief text,
  budget numeric(12, 2) check (budget >= 0),
  currency public.currency,
  desired_start date,
  priority public.priority not null default 'normal',
  status public.lead_status not null default 'new_inquiry',
  next_follow_up date,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.leads (client_id);
create index on public.leads (status);

create sequence public.quotation_ref_seq;
create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default 'Q-' || lpad(nextval('public.quotation_ref_seq')::text, 4, '0'),
  client_id uuid not null references public.clients (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete set null,
  title text,
  status public.quotation_status not null default 'draft',
  currency public.currency not null default 'USD',
  discount_type public.discount_type not null default 'amount',
  discount_value numeric(12, 2) not null default 0 check (discount_value >= 0),
  tax_rate numeric(5, 2) not null default 0 check (tax_rate between 0 and 100),
  delivery_time text,
  payment_terms text,
  issue_date date not null default current_date,
  expiry_date date,
  notes text,
  sent_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.quotations (client_id);
create index on public.quotations (status);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  description text not null check (length(description) between 1 and 500),
  details text,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  unit_price numeric(12, 2) not null default 0 check (unit_price >= 0),
  sort int not null default 0
);
create index on public.quotation_items (quotation_id);

create sequence public.project_ref_seq;
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique default 'P-' || lpad(nextval('public.project_ref_seq')::text, 4, '0'),
  name text not null check (length(name) between 1 and 200),
  client_id uuid not null references public.clients (id) on delete cascade,
  quotation_id uuid unique references public.quotations (id) on delete set null,
  service text,
  budget numeric(12, 2) check (budget >= 0),
  currency public.currency not null default 'USD',
  start_date date,
  due_date date,
  status public.project_status not null default 'not_started',
  notes text,
  created_at timestamptz not null default now()
);
create index on public.projects (client_id);

-- Tasks and deliverables share one table; kind tells them apart.
create table public.project_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  kind text not null default 'task' check (kind in ('task', 'deliverable')),
  title text not null check (length(title) between 1 and 300),
  done boolean not null default false,
  due_date date,
  link text,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.project_items (project_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  currency public.currency not null,
  paid_on date not null default current_date,
  method text,
  note text,
  created_at timestamptz not null default now()
);
create index on public.payments (project_id);
create index on public.payments (paid_on);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  title text not null check (length(title) between 1 and 300),
  due_date date not null default current_date,
  note text,
  client_id uuid references public.clients (id) on delete cascade,
  lead_id uuid references public.leads (id) on delete cascade,
  quotation_id uuid references public.quotations (id) on delete cascade,
  done_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.follow_ups (due_date) where done_at is null;

create table public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200),
  body text not null default '',
  sort int not null default 0,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────── quotation totals
-- One place that defines how a quotation total is calculated. Exposed to the
-- app as a computed field: select('*, quotation_totals').
create or replace function public.quotation_totals(q public.quotations)
returns json language sql stable set search_path = public as $$
  with s as (
    select coalesce(sum(round(i.quantity * i.unit_price, 2)), 0) as subtotal
    from quotation_items i where i.quotation_id = q.id
  ), d as (
    select subtotal, least(
      subtotal,
      case when q.discount_type = 'percent'
        then round(subtotal * least(q.discount_value, 100) / 100, 2)
        else q.discount_value end
    ) as discount
    from s
  )
  select json_build_object(
    'subtotal', subtotal,
    'discount', discount,
    'tax', round((subtotal - discount) * q.tax_rate / 100, 2),
    'total', round((subtotal - discount) * (1 + q.tax_rate / 100), 2)
  ) from d;
$$;

-- ─────────────────────────────────────────────────────────── row level security
do $$
declare t text;
begin
  foreach t in array array[
    'settings', 'clients', 'services', 'leads', 'quotations', 'quotation_items',
    'projects', 'project_items', 'payments', 'follow_ups', 'templates'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "owner full access" on public.%I for all to authenticated using (public.is_owner()) with check (public.is_owner())',
      t
    );
  end loop;
end $$;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;

-- ─────────────────────────────────────────────────────────── automations
-- Quotation status changes: keep the lead in step, add follow-ups, and turn
-- an accepted quotation into a project (once).
create or replace function public.on_quotation_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_total numeric;
  v_client text;
begin
  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'sent' then
    new.sent_at := coalesce(new.sent_at, now());
    if new.lead_id is not null then
      update leads set status = 'quotation_sent'
        where id = new.lead_id and status not in ('won', 'lost', 'negotiation');
    end if;
    insert into follow_ups (title, due_date, client_id, lead_id, quotation_id)
      values ('Follow up on quotation ' || new.ref, current_date + 3, new.client_id, new.lead_id, new.id);
  elsif new.status in ('accepted', 'rejected') then
    new.decided_at := now();
    update follow_ups set done_at = now() where quotation_id = new.id and done_at is null;
    if new.lead_id is not null then
      update leads set status = case when new.status = 'accepted' then 'won' else 'lost' end::lead_status
        where id = new.lead_id;
    end if;
  end if;

  if new.status = 'accepted' and not exists (select 1 from projects where quotation_id = new.id) then
    v_total := (public.quotation_totals(new) ->> 'total')::numeric;
    select coalesce(nullif(brand, ''), name) into v_client from clients where id = new.client_id;
    insert into projects (name, client_id, quotation_id, service, budget, currency, start_date, status)
      values (
        coalesce(nullif(new.title, ''), v_client || ' — ' || new.ref),
        new.client_id, new.id,
        (select string_agg(description, ', ' order by sort) from quotation_items where quotation_id = new.id),
        v_total, new.currency, current_date, 'not_started'
      );
  end if;
  return new;
end $$;

create trigger quotation_status_change
  before update of status on public.quotations
  for each row execute function public.on_quotation_status();

-- When a lead gets a next follow-up date, keep one open reminder for it.
create or replace function public.on_lead_follow_up()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.next_follow_up is null
     or (tg_op = 'UPDATE' and new.next_follow_up is not distinct from old.next_follow_up) then
    return new;
  end if;
  update follow_ups set due_date = new.next_follow_up
    where lead_id = new.id and quotation_id is null and done_at is null;
  if not found then
    insert into follow_ups (title, due_date, client_id, lead_id)
      values ('Follow up lead ' || new.ref, new.next_follow_up, new.client_id, new.id);
  end if;
  return new;
end $$;

create trigger lead_follow_up
  after insert or update of next_follow_up on public.leads
  for each row execute function public.on_lead_follow_up();

-- ─────────────────────────────────────────────────────────── public inquiry form
-- The only thing anonymous visitors can do. Validates input, ignores bots that
-- fill the hidden field, limits volume, then saves a client + lead and a
-- follow-up to reply today.
create table public.inquiry_log (
  id bigint generated always as identity primary key,
  ip text,
  contact text,
  created_at timestamptz not null default now()
);
create index on public.inquiry_log (created_at);
alter table public.inquiry_log enable row level security;
create policy "owner full access" on public.inquiry_log for all to authenticated
  using (public.is_owner()) with check (public.is_owner());

create or replace function public.submit_inquiry(payload jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_name text := btrim(coalesce(payload ->> 'name', ''));
  v_email text := lower(btrim(coalesce(payload ->> 'email', '')));
  v_phone text := regexp_replace(coalesce(payload ->> 'phone', ''), '[^0-9+]', '', 'g');
  v_brief text := btrim(coalesce(payload ->> 'brief', ''));
  v_source lead_source;
  v_currency currency;
  v_budget numeric;
  v_start date;
  v_ip text;
  v_contact text;
  v_client uuid;
  v_lead uuid;
  v_ref text;
begin
  -- Honeypot: real people never see or fill this field.
  if coalesce(payload ->> 'website', '') <> '' then
    return 'ok';
  end if;

  if length(v_name) < 2 or length(v_name) > 120 then
    raise exception 'Please enter your name.' using errcode = '22023';
  end if;
  if v_email = '' and v_phone = '' then
    raise exception 'Please add an email or WhatsApp number.' using errcode = '22023';
  end if;
  if v_email <> '' and (length(v_email) > 200 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'Please check your email address.' using errcode = '22023';
  end if;
  if v_phone <> '' and (length(v_phone) < 7 or length(v_phone) > 20) then
    raise exception 'Please check your phone number.' using errcode = '22023';
  end if;
  if length(v_brief) > 4000 or length(coalesce(payload ->> 'brand', '')) > 200
     or length(coalesce(payload ->> 'country', '')) > 100
     or length(coalesce(payload ->> 'service', '')) > 200 then
    raise exception 'Some fields are too long.' using errcode = '22023';
  end if;

  begin v_source := coalesce(nullif(payload ->> 'source', ''), 'website')::lead_source;
  exception when others then v_source := 'website'; end;
  begin v_currency := nullif(payload ->> 'currency', '')::currency;
  exception when others then v_currency := null; end;
  begin v_budget := nullif(payload ->> 'budget', '')::numeric;
  exception when others then v_budget := null; end;
  if v_budget is not null and (v_budget < 0 or v_budget > 100000000) then v_budget := null; end if;
  begin v_start := nullif(payload ->> 'desired_start', '')::date;
  exception when others then v_start := null; end;

  -- Rate limits: 3 per contact and 5 per IP per hour, 100 in total per day.
  begin
    v_ip := split_part(current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1);
  exception when others then v_ip := null; end;
  v_contact := coalesce(nullif(v_email, ''), v_phone);
  if (select count(*) from inquiry_log where contact = v_contact and created_at > now() - interval '1 hour') >= 3
     or (v_ip is not null and (select count(*) from inquiry_log where ip = v_ip and created_at > now() - interval '1 hour') >= 5)
     or (select count(*) from inquiry_log where created_at > now() - interval '1 day') >= 100 then
    raise exception 'Too many requests. Please try again later or message us on WhatsApp.' using errcode = '22023';
  end if;
  insert into inquiry_log (ip, contact) values (v_ip, v_contact);

  -- Reuse the client if we already know this email or phone.
  select id into v_client from clients
    where (v_email <> '' and lower(email) = v_email) or (v_phone <> '' and phone = v_phone)
    order by created_at limit 1;
  if v_client is null then
    insert into clients (name, brand, email, phone, country, language, source)
      values (
        v_name, nullif(btrim(payload ->> 'brand'), ''), nullif(v_email, ''), nullif(v_phone, ''),
        nullif(btrim(payload ->> 'country'), ''),
        case when payload ->> 'language' in ('en', 'ar') then payload ->> 'language' end,
        v_source
      )
      returning id into v_client;
  end if;

  insert into leads (client_id, source, service_id, requested_service, brief, budget, currency, desired_start, status)
    values (
      v_client, v_source,
      (select id from services where name = payload ->> 'service' limit 1),
      nullif(btrim(payload ->> 'service'), ''), nullif(v_brief, ''), v_budget, v_currency, v_start, 'new_inquiry'
    )
    returning id, ref into v_lead, v_ref;

  insert into follow_ups (title, due_date, client_id, lead_id)
    values ('Reply to new inquiry ' || v_ref || ' — ' || v_name, current_date, v_client, v_lead);

  return 'ok';
end $$;

revoke all on function public.submit_inquiry(jsonb) from public;
grant execute on function public.submit_inquiry(jsonb) to anon, authenticated;

-- Service names for the public form (names only, no prices).
create or replace function public.public_services()
returns table (name text) language sql stable security definer set search_path = public as $$
  select name from services where active order by sort, name;
$$;
revoke all on function public.public_services() from public;
grant execute on function public.public_services() to anon, authenticated;

-- ─────────────────────────────────────────────────────────── starter data
insert into public.services (name, sort) values
  ('Branding & Visual Identity', 1),
  ('Social Media Design', 2),
  ('Company Profiles & Presentations', 3),
  ('Logo Design', 4),
  ('Packaging Design', 5),
  ('Other Design Services', 6);

insert into public.templates (name, sort, body) values
  ('Inquiry reply', 1, E'Hi {{client_name}}, thanks for reaching out to YR Studio!\nI''d love to learn more about your project. Could you share a few details about your brand and what you need?'),
  ('Brief request', 2, E'Hi {{client_name}}, to prepare an accurate quotation please send:\n1. Your brand name and what you do\n2. Your target audience\n3. The deliverables you need\n4. Any references you like\n5. Your timeline and budget range'),
  ('Quotation message', 3, E'Hi {{client_name}}, please find your quotation {{quotation_number}} attached.\nTotal: {{quotation_amount}}\nIt is valid until {{expiry_date}}. Happy to answer any questions.'),
  ('Follow-up', 4, E'Hi {{client_name}}, just checking in on the quotation I sent. Do you have any questions, or would you like to adjust anything?'),
  ('Project confirmation', 5, E'Hi {{client_name}}, great news — {{project_name}} is confirmed!\nI''ll start on {{start_date}}. Next step: the first payment as agreed.'),
  ('Payment request', 6, E'Hi {{client_name}}, a friendly reminder for the payment of {{amount_due}} for {{project_name}}. Thank you!'),
  ('Project update', 7, E'Hi {{client_name}}, here''s an update on {{project_name}}:\n'),
  ('Delivery', 8, E'Hi {{client_name}}, {{project_name}} is ready! You''ll find the final files here:\n\nIt was a pleasure working with you.');

-- ─────────────────────────────────────────────────────────── first user = owner
-- Public sign-up is disabled; the owner account is created once from the
-- Supabase dashboard. The first account ever created becomes the owner.
create or replace function public.claim_first_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.owners) then
    insert into public.owners (user_id) values (new.id);
  end if;
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.claim_first_owner();
