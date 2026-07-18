import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260718021207_dashboard_auth_identity.sql",
  "utf8",
);

describe("dashboard auth identity migration", () => {
  it("contains preflight checks for unsafe legacy identity data", () => {
    expect(migration).toContain("orphaned lawyer_profiles.profile_id");
    expect(migration).toContain("duplicate lawyer_profiles.profile_id");
    expect(migration).toContain("profiles.lawyer_id contains values that cannot be mapped safely");
    expect(migration).toContain("appointments.preferred_lawyer_id contains ambiguous values");
    expect(migration).toContain("appointments.assigned_lawyer_id contains ambiguous values");
    expect(migration).toContain("lawyer_availability.lawyer_id contains ambiguous values");
    expect(migration).toContain("blocked_times.lawyer_id contains ambiguous values");
    expect(migration).toContain("appointment_audit_logs.actor_id contains ambiguous values");
  });

  it("establishes canonical profile UUID foreign keys and uniqueness", () => {
    expect(migration).toContain("lawyer_profiles_profile_id_unique");
    expect(migration).toContain("foreign key (preferred_lawyer_id)");
    expect(migration).toContain("references public.profiles(id)");
    expect(migration).toContain("foreign key (assigned_lawyer_id)");
    expect(migration).toContain("foreign key (lawyer_id)");
    expect(migration).toContain("foreign key (actor_id)");
  });

  it("does not drop profiles.lawyer_id and marks it deprecated", () => {
    expect(migration).not.toMatch(/drop\s+column\s+(if\s+exists\s+)?lawyer_id/i);
    expect(migration).toContain("comment on column public.profiles.lawyer_id");
    expect(migration).toContain("Deprecated");
  });

  it("uses authenticated profile-backed RLS rather than user metadata or profiles.lawyer_id", () => {
    expect(migration).toContain("to authenticated");
    expect(migration).toContain("auth.uid()");
    expect(migration).toContain("current_staff_is_admin_lawyer");
    expect(migration).not.toContain("user_metadata");
    expect(migration).not.toContain("assigned_profile.lawyer_id");
  });

  it("keeps appointment writes denied until the next checkpoint adds narrow staff actions", () => {
    expect(migration).toContain("drop policy if exists appointments_update_admin_or_assigned");
    expect(migration).not.toMatch(/create policy [\s\S]*appointments[\s\S]*for update/i);
    expect(migration).not.toMatch(/create policy [\s\S]*appointments[\s\S]*for insert/i);
  });
});
