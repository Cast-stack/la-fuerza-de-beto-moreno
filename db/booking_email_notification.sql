-- ============================================================================
-- Email the band when a new booking is submitted — NO Edge Function needed.
-- ============================================================================
-- This runs entirely in Postgres: a trigger on `bookings` calls the Resend
-- email API using pg_net (async HTTP), with the API key kept in Supabase Vault.
-- Replaces the Edge Function + Database Webhook approach.
--
-- Prerequisites:
--   1. The `bookings` table exists (run db/bookings.sql first).
--   2. A Resend account (https://resend.com) created with the SAME Gmail you
--      want notified (lafuerzadebetomoreno@gmail.com), and an API key (re_...).
--
-- Then paste this whole file into the Supabase SQL Editor, put your real
-- Resend key in step 2, and Run.
-- ============================================================================

-- 1. Async HTTP from Postgres (usually already enabled on Supabase).
create extension if not exists pg_net;

-- 2. Store the Resend API key in Vault. <<< REPLACE re_XXXX WITH YOUR KEY >>>
--    Idempotent: won't error or duplicate if you run this file again.
select vault.create_secret('re_XXXXXXXXXXXXXXXXXXXXXXXX', 'resend_api_key')
where not exists (select 1 from vault.secrets where name = 'resend_api_key');
-- To change the key later:  select vault.update_secret(
--   (select id from vault.secrets where name='resend_api_key'), 're_NEWKEY');

-- 3. Trigger function: send the new booking to your Gmail via Resend.
create or replace function public.notify_new_booking()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
begin
  select decrypted_secret into api_key
  from vault.decrypted_secrets
  where name = 'resend_api_key';

  perform net.http_post(
    url     := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type',  'application/json'
    ),
    body := jsonb_build_object(
      'from',     'La Fuerza Web <onboarding@resend.dev>',
      'to',       'lafuerzadebetomoreno@gmail.com',
      'reply_to', coalesce(new.email, 'lafuerzadebetomoreno@gmail.com'),
      'subject',  'Nueva contratación — ' || coalesce(new.name, 'Sin nombre'),
      'text',
        'Nombre: '         || coalesce(new.name, '')       || E'\n' ||
        'Correo: '         || coalesce(new.email, '')      || E'\n' ||
        'Teléfono: '       || coalesce(new.phone, '')      || E'\n' ||
        'Tipo de evento: ' || coalesce(new.event_type, '') || E'\n\n' ||
        'Mensaje:' || E'\n' || coalesce(new.message, '')
    )
  );

  return new;
end;
$$;

-- 4. Fire it after every new booking.
drop trigger if exists on_new_booking on public.bookings;
create trigger on_new_booking
  after insert on public.bookings
  for each row execute function public.notify_new_booking();
