-- Full JSON backup and restore, done in the database so a restore is
-- all-or-nothing (one transaction) and automations do not fire twice.

-- Tables in dependency order (parents first).
create or replace function public.backup_tables()
returns text[] language sql immutable as $$
  select array[
    'settings', 'services', 'templates', 'clients', 'leads', 'quotations',
    'quotation_items', 'projects', 'project_items', 'payments', 'follow_ups'
  ];
$$;

create or replace function public.export_backup()
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  t text;
  rows jsonb;
  result jsonb := '{}'::jsonb;
begin
  if not public.is_owner() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  foreach t in array public.backup_tables() loop
    execute format('select coalesce(jsonb_agg(to_jsonb(x)), ''[]''::jsonb) from public.%I x', t) into rows;
    result := result || jsonb_build_object(t, rows);
  end loop;
  return jsonb_build_object(
    'app', 'yr-studio-os',
    'version', 1,
    'exported_at', now(),
    'tables', result
  );
end $$;

-- Replaces ALL studio data with the backup.
create or replace function public.restore_backup(backup jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t text;
  counts jsonb := '{}'::jsonb;
  n int;
begin
  if not public.is_owner() then
    raise exception 'Not allowed' using errcode = '42501';
  end if;
  if backup ->> 'app' is distinct from 'yr-studio-os' or jsonb_typeof(backup -> 'tables') <> 'object' then
    raise exception 'This file is not a YR Studio OS backup.' using errcode = '22023';
  end if;

  -- Automations check this flag and stay quiet during a restore.
  perform set_config('app.restoring', 'on', true);

  -- Clear children first, then load parents first.
  foreach t in array (select array_agg(x order by ord desc) from unnest(public.backup_tables()) with ordinality u(x, ord)) loop
    execute format('delete from public.%I where true', t);
  end loop;

  foreach t in array public.backup_tables() loop
    if jsonb_typeof(backup -> 'tables' -> t) = 'array' then
      execute format('insert into public.%I select * from jsonb_populate_recordset(null::public.%I, $1)', t, t)
        using backup -> 'tables' -> t;
      get diagnostics n = row_count;
      counts := counts || jsonb_build_object(t, n);
    end if;
  end loop;

  if not exists (select 1 from public.settings) then
    insert into public.settings (id) values (1);
  end if;

  -- Keep reference numbers counting up from the restored ones.
  perform setval('public.lead_ref_seq', greatest(1, coalesce((select max(substring(ref from 3)::int) from leads where ref ~ '^L-\d+$'), 0)), (select count(*) > 0 from leads));
  perform setval('public.quotation_ref_seq', greatest(1, coalesce((select max(substring(ref from 3)::int) from quotations where ref ~ '^Q-\d+$'), 0)), (select count(*) > 0 from quotations));
  perform setval('public.project_ref_seq', greatest(1, coalesce((select max(substring(ref from 3)::int) from projects where ref ~ '^P-\d+$'), 0)), (select count(*) > 0 from projects));

  return counts;
end $$;

revoke all on function public.export_backup() from public;
revoke all on function public.restore_backup(jsonb) from public;
grant execute on function public.export_backup() to authenticated;
grant execute on function public.restore_backup(jsonb) to authenticated;

-- Automations: skip while restoring.
create or replace function public.on_lead_follow_up()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('app.restoring', true) = 'on' then
    return new;
  end if;
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
