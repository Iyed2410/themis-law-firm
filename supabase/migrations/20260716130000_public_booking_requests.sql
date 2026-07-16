create extension if not exists "pgcrypto";

alter table public.appointments
  add column if not exists expertise_key text,
  add column if not exists requested_start_at timestamptz,
  add column if not exists requested_local_date date,
  add column if not exists requested_local_time time,
  add column if not exists client_message text,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists request_idempotency_key text,
  add column if not exists is_weekend_request boolean not null default false,
  add column if not exists booking_request_source text not null default 'staff';

alter table public.appointments
  add constraint appointments_client_language_check
  check (client_language in ('fr', 'ar')) not valid;

alter table public.appointments
  add constraint appointments_booking_request_source_check
  check (booking_request_source in ('public_booking', 'staff')) not valid;

alter table public.appointments
  add constraint appointments_client_message_length_check
  check (client_message is null or char_length(client_message) <= 500) not valid;

alter table public.appointments
  add constraint appointments_payment_method_check
  check (
    payment_method is null
    or payment_method in ('flouci', 'e_dinar', 'bank_transfer', 'cash', 'undecided')
  ) not valid;

create unique index if not exists appointments_request_idempotency_key_idx
  on public.appointments(request_idempotency_key)
  where request_idempotency_key is not null;

create index if not exists idx_appointments_requested_start_at
  on public.appointments(requested_start_at);

create index if not exists idx_appointments_weekend_request
  on public.appointments(is_weekend_request)
  where is_weekend_request = true;

alter table public.notification_deliveries
  add column if not exists recipient_role text,
  add column if not exists recipient_email text,
  add column if not exists scheduled_for timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists language text,
  add column if not exists provider_id text,
  add column if not exists error_code text,
  add column if not exists idempotency_key text;

alter table public.notification_deliveries enable row level security;

drop policy if exists notification_deliveries_no_public_access on public.notification_deliveries;
create policy notification_deliveries_no_public_access on public.notification_deliveries
  for all
  using (false)
  with check (false);

alter table public.notification_deliveries
  add constraint notification_deliveries_delivery_status_check
  check (delivery_status in ('queued', 'sent', 'failed')) not valid;

alter table public.notification_deliveries
  add constraint notification_deliveries_recipient_role_check
  check (recipient_role is null or recipient_role in ('client', 'admin', 'lawyer')) not valid;

alter table public.notification_deliveries
  add constraint notification_deliveries_language_check
  check (language is null or language in ('fr', 'ar')) not valid;

create unique index if not exists notification_deliveries_idempotency_key_idx
  on public.notification_deliveries(idempotency_key)
  where idempotency_key is not null;

create table if not exists public.booking_rate_limits (
  subject_hash text primary key,
  window_start timestamptz not null,
  window_end timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.booking_rate_limits enable row level security;

drop policy if exists booking_rate_limits_no_public_access on public.booking_rate_limits;
create policy booking_rate_limits_no_public_access on public.booking_rate_limits
  for all
  using (false)
  with check (false);

create or replace function public.increment_booking_rate_limit(
  p_subject_hash text,
  p_window_start timestamptz,
  p_window_end timestamptz,
  p_limit integer
)
returns table(allowed boolean, request_count integer)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count integer;
begin
  if p_subject_hash is null or length(p_subject_hash) < 32 then
    raise exception 'invalid_rate_limit_subject';
  end if;

  if p_limit < 1 then
    raise exception 'invalid_rate_limit';
  end if;

  insert into public.booking_rate_limits (
    subject_hash,
    window_start,
    window_end,
    request_count,
    updated_at
  )
  values (
    p_subject_hash,
    p_window_start,
    p_window_end,
    1,
    now()
  )
  on conflict (subject_hash) do update
    set request_count = public.booking_rate_limits.request_count + 1,
        updated_at = now()
    where public.booking_rate_limits.request_count < p_limit
  returning public.booking_rate_limits.request_count into v_count;

  if v_count is null then
    select public.booking_rate_limits.request_count
      into v_count
      from public.booking_rate_limits
      where subject_hash = p_subject_hash;

    return query select false, coalesce(v_count, p_limit);
    return;
  end if;

  return query select true, v_count;
end;
$$;

create or replace function public.create_public_booking_request(
  p_public_reference text,
  p_request_idempotency_key text,
  p_client_language text,
  p_client_name text,
  p_client_email text,
  p_client_phone text,
  p_expertise_key text,
  p_consultation_type text,
  p_requested_start_at timestamptz,
  p_requested_local_date date,
  p_requested_local_time time,
  p_payment_preference text,
  p_client_message text,
  p_privacy_consent_at timestamptz,
  p_is_weekend_request boolean,
  p_client_notification_key text,
  p_admin_notification_key text,
  p_admin_email text
)
returns table(result_code text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_appointment_id uuid;
begin
  if exists (
    select 1
    from public.appointments
    where request_idempotency_key = p_request_idempotency_key
  ) then
    return query select 'idempotent'::text;
    return;
  end if;

  insert into public.appointments (
    public_reference,
    client_name,
    client_email,
    client_phone,
    client_language,
    expertise,
    expertise_key,
    preferred_lawyer_id,
    assigned_lawyer_id,
    consultation_type,
    appointment_date,
    requested_start_at,
    requested_local_date,
    requested_local_time,
    duration_minutes,
    consultation_amount_tnd,
    payment_method,
    payment_status,
    status,
    client_message,
    privacy_consent_at,
    request_idempotency_key,
    is_weekend_request,
    booking_request_source
  )
  values (
    p_public_reference,
    p_client_name,
    p_client_email,
    p_client_phone,
    p_client_language,
    p_expertise_key,
    p_expertise_key,
    null,
    null,
    p_consultation_type,
    p_requested_start_at,
    p_requested_start_at,
    p_requested_local_date,
    p_requested_local_time,
    60,
    null,
    p_payment_preference,
    'awaiting_payment',
    'pending',
    p_client_message,
    p_privacy_consent_at,
    p_request_idempotency_key,
    p_is_weekend_request,
    'public_booking'
  )
  returning id into v_appointment_id;

  insert into public.appointment_audit_logs (
    appointment_id,
    actor_id,
    action,
    details
  )
  values (
    v_appointment_id,
    null,
    'public_booking_requested',
    jsonb_build_object(
      'source', 'public_booking',
      'locale', p_client_language,
      'expertise_key', p_expertise_key,
      'is_weekend_request', p_is_weekend_request
    )
  );

  insert into public.notification_deliveries (
    appointment_id,
    channel,
    notification_type,
    recipient,
    recipient_email,
    recipient_role,
    delivery_status,
    scheduled_for,
    language,
    idempotency_key
  )
  values
    (
      v_appointment_id,
      'email',
      'booking_request_received_client',
      p_client_email,
      p_client_email,
      'client',
      'queued',
      now(),
      p_client_language,
      p_client_notification_key
    ),
    (
      v_appointment_id,
      'email',
      'booking_request_new_admin',
      p_admin_email,
      p_admin_email,
      'admin',
      'queued',
      now(),
      'fr',
      p_admin_notification_key
    );

  return query select 'created'::text;
end;
$$;

revoke all on function public.increment_booking_rate_limit(text, timestamptz, timestamptz, integer)
  from public, anon, authenticated;
revoke all on function public.create_public_booking_request(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  date,
  time,
  text,
  text,
  timestamptz,
  boolean,
  text,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.increment_booking_rate_limit(text, timestamptz, timestamptz, integer)
  to service_role;
grant execute on function public.create_public_booking_request(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  timestamptz,
  date,
  time,
  text,
  text,
  timestamptz,
  boolean,
  text,
  text,
  text
) to service_role;
