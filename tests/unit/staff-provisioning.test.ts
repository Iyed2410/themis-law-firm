import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("scripts/create-staff-users.ts", "utf8");

describe("staff provisioning script", () => {
  it("does not store roles in user metadata for authorization", () => {
    expect(source).not.toContain("user_metadata");
  });

  it("upserts profiles and lawyer_profiles by the auth user profile id", () => {
    expect(source).toContain('supabaseAdminClient.from("profiles").upsert');
    expect(source).toContain('supabaseAdminClient.from("lawyer_profiles").upsert');
    expect(source).toContain("profile_id: user.id");
    expect(source).toContain('onConflict: "profile_id"');
  });

  it("is retry-safe for existing auth users and avoids printing secrets", () => {
    expect(source).toContain("createOrResolveAuthUser");
    expect(source).toContain("listUsers");
    expect(source).not.toContain("console.log(temporaryPassword");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("wraps executable async work in main without top-level await", () => {
    const sourceWithoutFunctionBodies = source.replace(/async function[\s\S]*?^}/gm, "");

    expect(source).toContain("async function main(): Promise<void>");
    expect(source).toContain("main().catch((error: unknown)");
    expect(sourceWithoutFunctionBodies).not.toMatch(/^await\s/m);
  });
});
