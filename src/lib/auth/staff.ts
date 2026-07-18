import { normalizeStaffRole } from "@/lib/auth/access";
import { createSupabaseSsrServerClient } from "@/lib/supabase/ssr-server";
import { isUnauthenticatedAuthError } from "@/lib/auth/supabase-auth-errors";

export { isUnauthenticatedAuthError } from "@/lib/auth/supabase-auth-errors";

export class StaffAuthConfigurationError extends Error {
  constructor(message = "Supabase auth configuration is missing.") {
    super(message);
    this.name = "StaffAuthConfigurationError";
  }
}

export class StaffAuthServiceError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "StaffAuthServiceError";
  }
}

export type StaffAuthContext = {
  role: "admin_lawyer" | "lawyer";
  userId: string;
  profileId: string;
  staffProfileId: string;
  email: string | null;
  fullName: string | null;
};

export type ResolvedStaffProfile = {
  userId: string;
  profileId: string;
  role: "admin_lawyer" | "lawyer";
  email: string | null;
  fullName: string | null;
  isActive: boolean;
};

type SupabaseUser = {
  id?: string;
  email?: string | null;
};

type StaffAuthSupabaseClient = {
  auth: {
    getUser: () => Promise<{
      data: { user: SupabaseUser | null };
      error: unknown;
    }>;
  };
  from: (table: "profiles") => {
    select: (columns: string) => unknown;
  };
};

export type StaffAuthContextInput = {
  supabase?: StaffAuthSupabaseClient | null;
  userId?: string | null;
  profileId?: string | null;
  role?: string | null;
  email?: string | null;
  fullName?: string | null;
  isActive?: boolean;
};

function isOutsideRequestScopeError(error: unknown): boolean {
  return error instanceof Error && /`?cookies`? was called outside a request scope|next\/headers/i.test(error.message);
}

async function resolveStaffProfile(client: StaffAuthSupabaseClient): Promise<ResolvedStaffProfile | null> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    if (isUnauthenticatedAuthError(userError)) {
      return null;
    }

    throw new StaffAuthServiceError("Unable to resolve the current auth session.", { cause: userError });
  }

  if (!user?.id) {
    return null;
  }

  const profileQuery = client.from("profiles").select("id, full_name, email, role, is_active") as {
      eq: (
        column: "id",
        value: string
      ) => {
        maybeSingle: <T>() => Promise<{
          data: T | null;
          error: unknown;
        }>;
      };
    };

  const { data: profile, error: profileError } = await profileQuery.eq("id", user.id).maybeSingle<{
    id: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    is_active: boolean | null;
  }>();

  if (profileError) {
    throw new StaffAuthServiceError("Unable to load the staff profile for the current user.", { cause: profileError });
  }

  if (!profile) {
    return null;
  }

  if (profile.is_active === false) {
    return null;
  }

  const normalizedRole = normalizeStaffRole(profile.role);

  if (!normalizedRole) {
    return null;
  }

  return {
    userId: profile.id,
    profileId: profile.id,
    role: normalizedRole,
    email: profile.email ?? user.email ?? null,
    fullName: profile.full_name ?? null,
    isActive: profile.is_active ?? true,
  };
}

export async function getStaffAuthContext(input?: StaffAuthContextInput): Promise<StaffAuthContext | null> {
  if (input?.userId !== undefined || input?.profileId !== undefined || input?.role !== undefined) {
    const profileId = input.profileId ?? input.userId;
    const normalizedRole = normalizeStaffRole(input.role);

    if (!profileId || !normalizedRole) {
      return null;
    }

    if (input.isActive === false) {
      return null;
    }

    return {
      role: normalizedRole,
      userId: profileId,
      profileId,
      staffProfileId: profileId,
      email: input.email ?? null,
      fullName: input.fullName ?? null,
    };
  }

  let client = input?.supabase ?? null;

  if (!client) {
    try {
      client = (await createSupabaseSsrServerClient()) as StaffAuthSupabaseClient | null;
    } catch (error) {
      if (isOutsideRequestScopeError(error)) {
        return null;
      }

      throw error;
    }
  }

  if (!client) {
    throw new StaffAuthConfigurationError();
  }

  const resolvedProfile = await resolveStaffProfile(client);

  if (!resolvedProfile || resolvedProfile.isActive === false) {
    return null;
  }

  return {
    role: resolvedProfile.role,
    userId: resolvedProfile.userId,
    profileId: resolvedProfile.profileId,
    staffProfileId: resolvedProfile.profileId,
    email: resolvedProfile.email,
    fullName: resolvedProfile.fullName,
  };
}
