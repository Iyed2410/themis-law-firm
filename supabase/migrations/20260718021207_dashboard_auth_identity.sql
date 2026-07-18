do $$
begin
  if exists (
    select 1
    from public.lawyer_profiles lawyer_profile
    left join public.profiles profile on profile.id = lawyer_profile.profile_id
    where profile.id is null
  ) then
    raise exception 'dashboard_auth_identity: orphaned lawyer_profiles.profile_id values exist';
  end if;

  if exists (
    select 1
    from public.lawyer_profiles
    group by profile_id
    having count(*) > 1
  ) then
    raise exception 'dashboard_auth_identity: duplicate lawyer_profiles.profile_id values exist';
  end if;

  if exists (
    select 1
    from public.profiles profile
    where profile.lawyer_id is not null
      and not exists (select 1 from public.profiles mapped_profile where mapped_profile.id = profile.lawyer_id)
      and not exists (select 1 from public.lawyer_profiles mapped_lawyer where mapped_lawyer.id = profile.lawyer_id)
  ) then
    raise exception 'dashboard_auth_identity: profiles.lawyer_id contains values that cannot be mapped safely';
  end if;

  if exists (
    select 1
    from public.appointments appointment
    where appointment.preferred_lawyer_id is not null
      and exists (select 1 from public.profiles mapped_profile where mapped_profile.id = appointment.preferred_lawyer_id)
      and exists (
        select 1
        from public.lawyer_profiles mapped_lawyer
        where mapped_lawyer.id = appointment.preferred_lawyer_id
          and mapped_lawyer.profile_id <> appointment.preferred_lawyer_id
      )
  ) then
    raise exception 'dashboard_auth_identity: appointments.preferred_lawyer_id contains ambiguous values';
  end if;

  if exists (
    select 1
    from public.appointments appointment
    where appointment.assigned_lawyer_id is not null
      and exists (select 1 from public.profiles mapped_profile where mapped_profile.id = appointment.assigned_lawyer_id)
      and exists (
        select 1
        from public.lawyer_profiles mapped_lawyer
        where mapped_lawyer.id = appointment.assigned_lawyer_id
          and mapped_lawyer.profile_id <> appointment.assigned_lawyer_id
      )
  ) then
    raise exception 'dashboard_auth_identity: appointments.assigned_lawyer_id contains ambiguous values';
  end if;

  if exists (
    select 1
    from public.lawyer_availability availability
    where exists (select 1 from public.profiles mapped_profile where mapped_profile.id = availability.lawyer_id)
      and exists (
        select 1
        from public.lawyer_profiles mapped_lawyer
        where mapped_lawyer.id = availability.lawyer_id
          and mapped_lawyer.profile_id <> availability.lawyer_id
      )
  ) then
    raise exception 'dashboard_auth_identity: lawyer_availability.lawyer_id contains ambiguous values';
  end if;

  if exists (
    select 1
    from public.blocked_times blocked_time
    where exists (select 1 from public.profiles mapped_profile where mapped_profile.id = blocked_time.lawyer_id)
      and exists (
        select 1
        from public.lawyer_profiles mapped_lawyer
        where mapped_lawyer.id = blocked_time.lawyer_id
          and mapped_lawyer.profile_id <> blocked_time.lawyer_id
      )
  ) then
    raise exception 'dashboard_auth_identity: blocked_times.lawyer_id contains ambiguous values';
  end if;

  if exists (
    select 1
    from public.appointment_audit_logs audit_log
    where audit_log.actor_id is not null
      and exists (select 1 from public.profiles mapped_profile where mapped_profile.id = audit_log.actor_id)
      and exists (
        select 1
        from public.lawyer_profiles mapped_lawyer
        where mapped_lawyer.id = audit_log.actor_id
          and mapped_lawyer.profile_id <> audit_log.actor_id
      )
  ) then
    raise exception 'dashboard_auth_identity: appointment_audit_logs.actor_id contains ambiguous values';
  end if;
end;
$$;

update public.profiles profile
set lawyer_id = lawyer_profile.profile_id
from public.lawyer_profiles lawyer_profile
where profile.lawyer_id = lawyer_profile.id;

update public.appointments appointment
set preferred_lawyer_id = lawyer_profile.profile_id
from public.lawyer_profiles lawyer_profile
where appointment.preferred_lawyer_id = lawyer_profile.id;

update public.appointments appointment
set assigned_lawyer_id = lawyer_profile.profile_id
from public.lawyer_profiles lawyer_profile
where appointment.assigned_lawyer_id = lawyer_profile.id;

update public.lawyer_availability availability
set lawyer_id = lawyer_profile.profile_id
from public.lawyer_profiles lawyer_profile
where availability.lawyer_id = lawyer_profile.id;

update public.blocked_times blocked_time
set lawyer_id = lawyer_profile.profile_id
from public.lawyer_profiles lawyer_profile
where blocked_time.lawyer_id = lawyer_profile.id;

update public.appointment_audit_logs audit_log
set actor_id = lawyer_profile.profile_id
from public.lawyer_profiles lawyer_profile
where audit_log.actor_id = lawyer_profile.id;

do $$
begin
  if exists (
    select 1
    from public.appointments appointment
    where appointment.preferred_lawyer_id is not null
      and not exists (select 1 from public.profiles profile where profile.id = appointment.preferred_lawyer_id)
  ) then
    raise exception 'dashboard_auth_identity: appointments.preferred_lawyer_id contains unmapped values';
  end if;

  if exists (
    select 1
    from public.appointments appointment
    where appointment.assigned_lawyer_id is not null
      and not exists (select 1 from public.profiles profile where profile.id = appointment.assigned_lawyer_id)
  ) then
    raise exception 'dashboard_auth_identity: appointments.assigned_lawyer_id contains unmapped values';
  end if;

  if exists (
    select 1
    from public.lawyer_availability availability
    where not exists (select 1 from public.profiles profile where profile.id = availability.lawyer_id)
  ) then
    raise exception 'dashboard_auth_identity: lawyer_availability.lawyer_id contains unmapped values';
  end if;

  if exists (
    select 1
    from public.blocked_times blocked_time
    where not exists (select 1 from public.profiles profile where profile.id = blocked_time.lawyer_id)
  ) then
    raise exception 'dashboard_auth_identity: blocked_times.lawyer_id contains unmapped values';
  end if;

  if exists (
    select 1
    from public.appointment_audit_logs audit_log
    where audit_log.actor_id is not null
      and not exists (select 1 from public.profiles profile where profile.id = audit_log.actor_id)
  ) then
    raise exception 'dashboard_auth_identity: appointment_audit_logs.actor_id contains unmapped values';
  end if;
end;
$$;

comment on column public.profiles.lawyer_id is
  'Deprecated. Dashboard identity and appointment assignment use profiles.id/auth.users.id directly.';

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'lawyer_profiles_profile_id_unique'
      and conrelid = 'public.lawyer_profiles'::regclass
  ) then
    alter table public.lawyer_profiles
      add constraint lawyer_profiles_profile_id_unique unique (profile_id);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_preferred_lawyer_id_fkey'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_preferred_lawyer_id_fkey
      foreign key (preferred_lawyer_id)
      references public.profiles(id)
      on delete set null
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'appointments_assigned_lawyer_id_fkey'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_assigned_lawyer_id_fkey
      foreign key (assigned_lawyer_id)
      references public.profiles(id)
      on delete set null
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'lawyer_availability_lawyer_id_fkey'
      and conrelid = 'public.lawyer_availability'::regclass
  ) then
    alter table public.lawyer_availability
      add constraint lawyer_availability_lawyer_id_fkey
      foreign key (lawyer_id)
      references public.profiles(id)
      on delete cascade
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'blocked_times_lawyer_id_fkey'
      and conrelid = 'public.blocked_times'::regclass
  ) then
    alter table public.blocked_times
      add constraint blocked_times_lawyer_id_fkey
      foreign key (lawyer_id)
      references public.profiles(id)
      on delete cascade
      not valid;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'appointment_audit_logs_actor_id_fkey'
      and conrelid = 'public.appointment_audit_logs'::regclass
  ) then
    alter table public.appointment_audit_logs
      add constraint appointment_audit_logs_actor_id_fkey
      foreign key (actor_id)
      references public.profiles(id)
      on delete set null
      not valid;
  end if;
end;
$$;

alter table public.appointments validate constraint appointments_preferred_lawyer_id_fkey;
alter table public.appointments validate constraint appointments_assigned_lawyer_id_fkey;
alter table public.lawyer_availability validate constraint lawyer_availability_lawyer_id_fkey;
alter table public.blocked_times validate constraint blocked_times_lawyer_id_fkey;
alter table public.appointment_audit_logs validate constraint appointment_audit_logs_actor_id_fkey;

create or replace function public.current_staff_is_active()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('admin_lawyer', 'lawyer')
  );
$$;

create or replace function public.current_staff_is_admin_lawyer()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role = 'admin_lawyer'
  );
$$;

revoke all on function public.current_staff_is_active() from public, anon, authenticated;
revoke all on function public.current_staff_is_admin_lawyer() from public, anon, authenticated;
grant execute on function public.current_staff_is_active() to authenticated;
grant execute on function public.current_staff_is_admin_lawyer() to authenticated;

alter table public.profiles enable row level security;
alter table public.lawyer_profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_audit_logs enable row level security;
alter table public.lawyer_availability enable row level security;
alter table public.blocked_times enable row level security;
alter table public.business_settings enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
drop policy if exists profiles_select_active_self on public.profiles;
drop policy if exists profiles_select_active_admin_staff on public.profiles;

create policy profiles_select_active_self on public.profiles
  for select
  to authenticated
  using (
    id = (select auth.uid())
    and is_active = true
    and role in ('admin_lawyer', 'lawyer')
  );

create policy profiles_select_active_admin_staff on public.profiles
  for select
  to authenticated
  using (public.current_staff_is_admin_lawyer());

drop policy if exists lawyer_profiles_select_active_staff on public.lawyer_profiles;

create policy lawyer_profiles_select_active_staff on public.lawyer_profiles
  for select
  to authenticated
  using (
    public.current_staff_is_admin_lawyer()
    or (
      public.current_staff_is_active()
      and profile_id = (select auth.uid())
      and is_active = true
    )
  );

drop policy if exists appointments_select_admin_or_assigned on public.appointments;
drop policy if exists appointments_update_admin_or_assigned on public.appointments;
drop policy if exists appointments_insert_denied on public.appointments;
drop policy if exists appointments_read_denied on public.appointments;
drop policy if exists appointments_select_staff_identity on public.appointments;

create policy appointments_select_staff_identity on public.appointments
  for select
  to authenticated
  using (
    public.current_staff_is_admin_lawyer()
    or (
      public.current_staff_is_active()
      and assigned_lawyer_id = (select auth.uid())
    )
  );

drop policy if exists appointment_audit_logs_select_staff_identity on public.appointment_audit_logs;

create policy appointment_audit_logs_select_staff_identity on public.appointment_audit_logs
  for select
  to authenticated
  using (
    public.current_staff_is_admin_lawyer()
    or exists (
      select 1
      from public.appointments appointment
      where appointment.id = appointment_audit_logs.appointment_id
        and appointment.assigned_lawyer_id = (select auth.uid())
        and public.current_staff_is_active()
    )
  );

drop policy if exists lawyer_availability_select_staff_identity on public.lawyer_availability;

create policy lawyer_availability_select_staff_identity on public.lawyer_availability
  for select
  to authenticated
  using (
    public.current_staff_is_admin_lawyer()
    or (
      public.current_staff_is_active()
      and lawyer_id = (select auth.uid())
    )
  );

drop policy if exists blocked_times_select_staff_identity on public.blocked_times;

create policy blocked_times_select_staff_identity on public.blocked_times
  for select
  to authenticated
  using (
    public.current_staff_is_admin_lawyer()
    or (
      public.current_staff_is_active()
      and lawyer_id = (select auth.uid())
    )
  );

drop policy if exists business_settings_select_active_staff on public.business_settings;

create policy business_settings_select_active_staff on public.business_settings
  for select
  to authenticated
  using (public.current_staff_is_active());
