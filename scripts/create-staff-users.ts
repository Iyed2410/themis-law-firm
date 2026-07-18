#!/usr/bin/env tsx
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "../src/lib/supabase/server";

const allowedRoles = new Set(["admin_lawyer", "lawyer"]);

type StaffRole = "admin_lawyer" | "lawyer";
type SupabaseAdminClient = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2);
  const args = Object.fromEntries(
    rawArgs.reduce<Array<[string, string]>>((pairs, rawArg, index, values) => {
      if (rawArg.startsWith("--") && index + 1 < values.length && !values[index + 1].startsWith("--")) {
        pairs.push([rawArg.slice(2), values[index + 1]]);
      }

      return pairs;
    }, [])
  );

  if (rawArgs.includes("--help")) {
    console.log("Usage: create-staff-users --email <email> --role <admin_lawyer|lawyer> [--password <password>]");
    return;
  }

  const email = typeof args.email === "string" ? args.email : process.env.STAFF_EMAIL;
  const role = typeof args.role === "string" ? args.role : process.env.STAFF_ROLE;
  const password = typeof args.password === "string" ? args.password : process.env.STAFF_PASSWORD;

  if (!email || !role || !allowedRoles.has(role)) {
    throw new Error("Usage: create-staff-users --email <email> --role <admin_lawyer|lawyer> [--password <password>]");
  }

  const staffEmail = email;
  const staffRole = role as StaffRole;
  const fullName = typeof args.name === "string" ? args.name : staffEmail;
  const displayName = typeof args.displayName === "string" ? args.displayName : fullName;
  const supabaseAdminClient = createSupabaseServerClient();

  if (!supabaseAdminClient) {
    throw new Error("Supabase service-role credentials are not configured.");
  }

  const temporaryPassword = password ?? randomUUID();
  const user = await createOrResolveAuthUser({
    client: supabaseAdminClient,
    staffEmail,
    temporaryPassword,
  });

  const { error: profileError } = await supabaseAdminClient.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      email: staffEmail,
      role: staffRole,
      lawyer_id: null,
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new Error(`Profile upsert failed: ${profileError.message}`);
  }

  const { error: lawyerProfileError } = await supabaseAdminClient.from("lawyer_profiles").upsert(
    {
      profile_id: user.id,
      display_name: displayName,
      specialization: staffRole === "admin_lawyer" ? "administration" : "general",
      is_active: true,
    },
    { onConflict: "profile_id" }
  );

  if (lawyerProfileError) {
    throw new Error(`Lawyer profile upsert failed: ${lawyerProfileError.message}`);
  }

  console.log(`Provisioned active staff user ${staffEmail} with role ${staffRole}.`);
}

async function createOrResolveAuthUser(input: {
  client: SupabaseAdminClient;
  staffEmail: string;
  temporaryPassword: string;
}) {
  const createResult = await input.client.auth.admin.createUser({
    email: input.staffEmail,
    password: input.temporaryPassword,
    email_confirm: true,
  });

  if (createResult.data.user?.id) {
    return createResult.data.user;
  }

  const message = createResult.error?.message.toLowerCase() ?? "";

  if (!message.includes("already") && !message.includes("registered")) {
    throw createResult.error ?? new Error("Supabase did not return a created user identity.");
  }

  const existingUser = await findExistingAuthUserByEmail(input.client, input.staffEmail);

  if (!existingUser?.id) {
    throw new Error("Auth user already exists but could not be resolved by email.");
  }

  return existingUser;
}

async function findExistingAuthUserByEmail(client: SupabaseAdminClient, targetEmail: string) {
  const perPage = 100;

  for (let page = 1; page <= 100; page += 1) {
    const listResult = await client.auth.admin.listUsers({
      page,
      perPage,
    });

    if (listResult.error) {
      throw new Error(`Unable to resolve existing auth user: ${listResult.error.message}`);
    }

    const existingUser = listResult.data.users.find((user) => user.email?.toLowerCase() === targetEmail.toLowerCase());

    if (existingUser) {
      return existingUser;
    }

    if (listResult.data.users.length < perPage) {
      return null;
    }
  }

  throw new Error("Auth user lookup exceeded the safe pagination limit.");
}

main().catch((error: unknown) => {
  console.error("Staff user provisioning failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
