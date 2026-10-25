-- CODE DEVS DIGITAL — Supabase schema
-- Run in Supabase > SQL Editor. Then create an admin user in Authentication > Users.
-- Every table: id text PK, data jsonb, created_at timestamptz.

do $$
declare t text;
begin
  foreach t in array array['projects','services','team','settings','popups','news','notifications','quotes','reviews','tickets','messages','leads','secrets','partners']
  loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null default ''{}'', created_at timestamptz not null default now())', t);
    execute format('alter table public.%I enable row level security', t);
    -- authenticated (admin) users: full access
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- Public read-only content
do $$
declare t text;
begin
  foreach t in array array['projects','services','team','settings','popups','news','notifications','partners']
  loop
    execute format('drop policy if exists public_read on public.%I', t);
    execute format('create policy public_read on public.%I for select to anon using (true)', t);
  end loop;
end $$;

-- Public inserts (forms)
drop policy if exists anon_insert on public.quotes;
create policy anon_insert on public.quotes for insert to anon with check (length(data->>'email') > 3 and length(data->>'description') >= 20);
drop policy if exists anon_insert on public.leads;
create policy anon_insert on public.leads for insert to anon with check (true);
drop policy if exists anon_insert on public.tickets;
create policy anon_insert on public.tickets for insert to anon with check (data->>'status' = 'open' and length(data->>'key') >= 10);

-- Reviews: anyone can submit (unapproved); only approved ones are public
drop policy if exists anon_insert on public.reviews;
create policy anon_insert on public.reviews for insert to anon with check ((data->>'approved')::boolean is not true);
drop policy if exists public_read on public.reviews;
create policy public_read on public.reviews for select to anon using ((data->>'approved')::boolean = true);

-- Messages: visitors may only post as "user" on an existing, non-closed ticket
drop policy if exists anon_insert on public.messages;
create policy anon_insert on public.messages for insert to anon with check (
  data->>'from' = 'user' and exists (select 1 from public.tickets t where t.data->>'key' = messages.data->>'ticketKey' and t.data->>'status' <> 'closed')
);

-- Ticket access by secret chat key only (no listing)
create or replace function public.get_ticket(p_key text) returns public.tickets
language sql security definer set search_path = public as $$
  select * from public.tickets where data->>'key' = p_key limit 1;
$$;
create or replace function public.get_ticket_messages(p_key text) returns setof public.messages
language sql security definer set search_path = public as $$
  select * from public.messages where data->>'ticketKey' = p_key order by created_at;
$$;
grant execute on function public.get_ticket(text), public.get_ticket_messages(text) to anon, authenticated;

-- Storage bucket for logos, screenshots, avatars
insert into storage.buckets (id, name, public) values ('media', 'media', true) on conflict (id) do nothing;
drop policy if exists media_read on storage.objects;
create policy media_read on storage.objects for select using (bucket_id = 'media');
drop policy if exists media_write on storage.objects;
create policy media_write on storage.objects for all to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

-- Web Push subscriptions (written/read only by serverless functions with the service role key)
create table if not exists public.push_subs (id text primary key, data jsonb not null default '{}', created_at timestamptz not null default now());
alter table public.push_subs enable row level security;
drop policy if exists admin_all on public.push_subs;
create policy admin_all on public.push_subs for all to authenticated using (true) with check (true);

-- Partnership requests & meeting bookings
do $$
declare t text;
begin
  foreach t in array array['partnerships','meetings']
  loop
    execute format('create table if not exists public.%I (id text primary key, data jsonb not null default ''{}'', created_at timestamptz not null default now())', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists admin_all on public.%I', t);
    execute format('create policy admin_all on public.%I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
drop policy if exists anon_insert on public.partnerships;
create policy anon_insert on public.partnerships for insert to anon with check (data->>'status' = 'new' and length(data->>'email') > 3);
drop policy if exists anon_insert on public.meetings;
create policy anon_insert on public.meetings for insert to anon with check (
  data->>'status' = 'pending' and length(data->>'email') > 3
  and not exists (select 1 from public.meetings m where m.data->>'date' = meetings.data->>'date' and m.data->>'time' = meetings.data->>'time' and m.data->>'status' <> 'cancelled')
);
-- Public: only the taken times of a date (no personal data)
create or replace function public.get_booked_slots(p_date text) returns table(time text)
language sql security definer set search_path = public as $$
  select data->>'time' from public.meetings where data->>'date' = p_date and data->>'status' <> 'cancelled';
$$;
grant execute on function public.get_booked_slots(text) to anon, authenticated;
