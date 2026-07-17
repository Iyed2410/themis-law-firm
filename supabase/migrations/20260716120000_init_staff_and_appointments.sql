create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  role text not null check (role in ('admin_lawyer', 'lawyer')),
  lawyer_id uuid null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lawyer_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  specialization text not null default 'general',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  public_reference text not null unique,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  client_language text not null default 'fr',
  expertise text not null,
  preferred_lawyer_id uuid null,
  assigned_lawyer_id uuid null,
  consultation_type text not null default 'office',
  appointment_date timestamptz not null,
  duration_minutes integer not null default 60,
  consultation_amount_tnd numeric(10,2) null,
  payment_method text null,
  payment_status text not null default 'awaiting_payment',
  status text not null default 'pending' check (status in ('pending','confirmed','rescheduled','completed','cancelled_by_client','cancelled_by_lawyer','rejected','no_show')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_audit_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  actor_id uuid null,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid null references public.appointments(id) on delete cascade,
  channel text not null default 'email',
  notification_type text not null,
  recipient text not null,
  delivery_status text not null default 'queued',
  created_at timestamptz not null default now(),
  unique (notification_type, recipient, appointment_id)
);

create table if not exists public.lawyer_availability (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null,
  day_of_week integer not null check (day_of_week between 0 and 6),
  start_time text not null,
  end_time text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blocked_times (
  id uuid primary key default gen_random_uuid(),
  lawyer_id uuid not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text not null default 'blocked',
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_appointments_status on public.appointments(status);
create index if not exists idx_appointments_date on public.appointments(appointment_date);

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_audit_logs enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;

create policy profiles_select_own_or_admin on public.profiles
  for select using (
    auth.uid() = id
    or exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin_lawyer'
    )
  );

drop policy if exists appointments_select_admin_or_assigned on public.appointments;

create policy appointments_select_admin_or_assigned on public.appointments
  for select using (
    exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin_lawyer'
    )
    or exists (
      select 1 from public.profiles assigned_profile
      where assigned_profile.id = auth.uid()
        and assigned_profile.lawyer_id = appointments.assigned_lawyer_id
    )
  );

drop policy if exists appointments_update_admin_or_assigned on public.appointments;

create policy appointments_update_admin_or_assigned on public.appointments
  for update using (
    exists (
      select 1 from public.profiles admin_profile
      where admin_profile.id = auth.uid()
        and admin_profile.role = 'admin_lawyer'
    )
    or exists (
      select 1 from public.profiles assigned_profile
      where assigned_profile.id = auth.uid()
        and assigned_profile.lawyer_id = appointments.assigned_lawyer_id
    )
  );

drop policy if exists appointments_insert_denied on public.appointments;

create policy appointments_insert_denied on public.appointments
  for insert with check (false);

drop policy if exists appointments_read_denied on public.appointments;

create policy appointments_read_denied on public.appointments
  for select using (false);
