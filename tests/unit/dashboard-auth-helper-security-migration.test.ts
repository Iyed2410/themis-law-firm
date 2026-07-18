import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  "supabase/migrations/20260718023415_move_staff_rls_helpers_private.sql",
  "utf8",
);
const supabaseConfig = readFileSync("supabase/config.toml", "utf8");

describe("dashboard auth helper security migration", () => {
  it("moves staff RLS helper functions into the private schema", () => {
    expect(migration).toContain("create schema if not exists private");
    expect(migration).toContain("create or replace function private.current_staff_is_active()");
    expect(migration).toContain("create or replace function private.current_staff_is_admin_lawyer()");
    expect(migration).toContain("stable");
    expect(migration).toContain("security definer");
    expect(migration).toContain("set search_path = ''");
  });

  it("keeps helper authorization based only on active public profiles and auth.uid", () => {
    expect(migration).toContain("from public.profiles profile");
    expect(migration).toContain("profile.id = (select auth.uid())");
    expect(migration).toContain("profile.is_active = true");
    expect(migration).toContain("profile.role = 'admin_lawyer'");
    expect(migration).not.toContain("user_metadata");
    expect(migration).not.toContain("auth.jwt()");
  });

  it("replaces all RLS policy references with private helpers", () => {
    const policySection = migration.split("revoke all on function public.current_staff_is_active()")[0];

    expect(migration).toContain("using (private.current_staff_is_admin_lawyer())");
    expect(migration).toContain("private.current_staff_is_active()");
    expect(policySection).not.toContain("public.current_staff_is_admin_lawyer()");
    expect(policySection).not.toContain("public.current_staff_is_active()");
  });

  it("revokes and drops the old public helper functions", () => {
    expect(migration).toContain("revoke all on function public.current_staff_is_active() from public, anon, authenticated");
    expect(migration).toContain("revoke all on function public.current_staff_is_admin_lawyer() from public, anon, authenticated");
    expect(migration).toContain("drop function if exists public.current_staff_is_active()");
    expect(migration).toContain("drop function if exists public.current_staff_is_admin_lawyer()");
  });

  it("does not grant private helper execution to public or anon", () => {
    expect(migration).toContain("revoke all on schema private from public, anon, authenticated");
    expect(migration).toContain("grant usage on schema private to authenticated");
    expect(migration).toContain("grant execute on function private.current_staff_is_active() to authenticated");
    expect(migration).toContain("grant execute on function private.current_staff_is_admin_lawyer() to authenticated");
    expect(migration).not.toMatch(/grant execute on function private\.current_staff_is_active\(\) to (public|anon)/i);
    expect(migration).not.toMatch(/grant execute on function private\.current_staff_is_admin_lawyer\(\) to (public|anon)/i);
  });

  it("keeps the private schema out of Supabase exposed API schemas", () => {
    const exposedSchemasLine = supabaseConfig
      .split(/\r?\n/)
      .find((line) => line.trim().startsWith("schemas ="));

    expect(exposedSchemasLine).toBeDefined();
    expect(exposedSchemasLine).not.toContain("private");
  });
});
