#!/usr/bin/env tsx
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "../src/lib/supabase/server";

const allowedRoles = new Set(["admin_lawyer", "lawyer"]);
const args = Object.fromEntries(
  process.argv.slice(2).reduce<Array<[string, string]>>((pairs, rawArg, index, values) => {
    if (rawArg.startsWith("--") && index + 1 < values.length && !values[index + 1].startsWith("--")) {
      pairs.push([rawArg.slice(2), values[index + 1]]);
    }

    return pairs;
  }, [])
);

const email = typeof args.email === "string" ? args.email : process.env.STAFF_EMAIL;
const role = typeof args.role === "string" ? args.role : process.env.STAFF_ROLE;
const password = typeof args.password === "string" ? args.password : process.env.STAFF_PASSWORD;

if (!email || !role || !allowedRoles.has(role)) {
  console.error("Usage: create-staff-users --email <email> --role <admin_lawyer|lawyer> [--password <password>]");
  process.exit(1);
}

const client = createSupabaseServerClient();

if (!client) {
  console.error("Supabase service-role credentials are not configured.");
  process.exit(1);
}

const temporaryPassword = password ?? randomUUID();

try {
  const {
    data: { user },
    error: createUserError,
  } = await client.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { role },
  });

  if (createUserError || !user?.id) {
    throw createUserError ?? new Error("Supabase did not return a created user identity.");
  }

  const { error: profileError } = await client.from("profiles").upsert(
    {
      id: user.id,
      full_name: email,
      email,
      role,
      lawyer_id: null,
      is_active: true,
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw profileError;
  }

  console.log(`Created staff user ${email} with role ${role}.`);
} catch (error) {
  console.error("Staff user provisioning failed.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
