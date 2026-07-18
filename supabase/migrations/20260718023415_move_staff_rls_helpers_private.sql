create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.current_staff_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('admin_lawyer', 'lawyer')
  );
$$;

create or replace function private.current_staff_is_admin_lawyer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = (select auth.uid())
      and profile.is_active = true
      and profile.role = 'admin_lawyer'
  );
$$;

revoke all on function private.current_staff_is_active() from public, anon, authenticated;
revoke all on function private.current_staff_is_admin_lawyer() from public, anon, authenticated;
grant usage on schema private to authenticated;
grant execute on function private.current_staff_is_active() to authenticated;
grant execute on function private.current_staff_is_admin_lawyer() to authenticated;

drop policy if exists profiles_select_active_admin_staff on public.profiles;
create policy profiles_select_active_admin_staff on public.profiles
  for select
  to authenticated
  using (private.current_staff_is_admin_lawyer());

drop policy if exists lawyer_profiles_select_active_staff on public.lawyer_profiles;
create policy lawyer_profiles_select_active_staff on public.lawyer_profiles
  for select
  to authenticated
  using (
    private.current_staff_is_admin_lawyer()
    or (
      private.current_staff_is_active()
      and profile_id = (select auth.uid())
      and is_active = true
    )
  );

drop policy if exists appointments_select_staff_identity on public.appointments;
create policy appointments_select_staff_identity on public.appointments
  for select
  to authenticated
  using (
    private.current_staff_is_admin_lawyer()
    or (
      private.current_staff_is_active()
      and assigned_lawyer_id = (select auth.uid())
    )
  );

drop policy if exists appointment_audit_logs_select_staff_identity on public.appointment_audit_logs;
create policy appointment_audit_logs_select_staff_identity on public.appointment_audit_logs
  for select
  to authenticated
  using (
    private.current_staff_is_admin_lawyer()
    or exists (
      select 1
      from public.appointments appointment
      where appointment.id = appointment_audit_logs.appointment_id
        and appointment.assigned_lawyer_id = (select auth.uid())
        and private.current_staff_is_active()
    )
  );

drop policy if exists lawyer_availability_select_staff_identity on public.lawyer_availability;
create policy lawyer_availability_select_staff_identity on public.lawyer_availability
  for select
  to authenticated
  using (
    private.current_staff_is_admin_lawyer()
    or (
      private.current_staff_is_active()
      and lawyer_id = (select auth.uid())
    )
  );

drop policy if exists blocked_times_select_staff_identity on public.blocked_times;
create policy blocked_times_select_staff_identity on public.blocked_times
  for select
  to authenticated
  using (
    private.current_staff_is_admin_lawyer()
    or (
      private.current_staff_is_active()
      and lawyer_id = (select auth.uid())
    )
  );

drop policy if exists business_settings_select_active_staff on public.business_settings;
create policy business_settings_select_active_staff on public.business_settings
  for select
  to authenticated
  using (private.current_staff_is_active());

revoke all on function public.current_staff_is_active() from public, anon, authenticated;
revoke all on function public.current_staff_is_admin_lawyer() from public, anon, authenticated;

drop function if exists public.current_staff_is_active();
drop function if exists public.current_staff_is_admin_lawyer();
