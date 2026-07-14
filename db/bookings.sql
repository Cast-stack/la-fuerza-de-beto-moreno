-- ============================================================================
-- bookings: contact/booking form submissions from the website.
-- ============================================================================
-- Security model: the public (anon) can INSERT a submission, but CANNOT read,
-- update, or delete rows. You read submissions in the Supabase dashboard
-- (Table Editor → bookings), which uses the service role and bypasses RLS.
-- Run this whole block once in the SQL Editor.
-- ============================================================================

create table if not exists public.bookings (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text not null,
  email      text,
  phone      text,
  event_type text,
  message    text not null,
  -- basic abuse guards: cap field lengths so the endpoint can't be flooded
  -- with huge payloads.
  constraint bookings_name_len    check (char_length(name) <= 120),
  constraint bookings_email_len   check (email is null or char_length(email) <= 200),
  constraint bookings_phone_len   check (phone is null or char_length(phone) <= 60),
  constraint bookings_event_len   check (event_type is null or char_length(event_type) <= 80),
  constraint bookings_message_len check (char_length(message) between 1 and 4000)
);

alter table public.bookings enable row level security;

-- Make sure the public role can insert (Supabase usually grants this by
-- default for tables in the public schema; explicit for safety).
grant insert on table public.bookings to anon;

-- Anyone may SUBMIT a booking. No select/update/delete policies exist for
-- anon, so those operations stay denied — submissions are write-only from
-- the site and only readable via the dashboard/service role.
drop policy if exists "anon can submit bookings" on public.bookings;
create policy "anon can submit bookings"
  on public.bookings
  for insert
  to anon
  with check (true);

-- Newest first when you browse them in the dashboard.
create index if not exists bookings_created_at_idx on public.bookings (created_at desc);
