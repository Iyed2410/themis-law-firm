import { normalizeStaffRole } from "@/lib/auth/access";
import { createSupabaseAuthClient } from "@/lib/supabase/server";

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
  role: string | null;
  userId: string | null;
  lawyerId: string | null;
};

export type ResolvedStaffProfile = {
  userId: string;
  role: string | null;
  lawyerId: string | null;
  isActive: boolean;
};

export type StaffAuthContextInput = {
  accessToken?: string | null;
  profileResolver?: (accessToken: string) => Promise<ResolvedStaffProfile | null>;
  userId?: string | null;
  role?: string | null;
  lawyerId?: string | null;
  isActive?: boolean;
};

function isInvalidSessionError(error: { message?: string } | null | undefined): boolean {
  if (!error?.message) {
    return false;
  }

  const message = error.message.toLowerCase();

  return message.includes("invalid jwt") || message.includes("not authenticated") || message.includes("expired") || message.includes("unauthorized");
}

async function resolveStaffProfile(accessToken: string): Promise<ResolvedStaffProfile | null> {
  const client = createSupabaseAuthClient();

  if (!client) {
    throw new StaffAuthConfigurationError();
  }

  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser(accessToken);

  if (userError) {
    if (isInvalidSessionError(userError)) {
      return null;
    }

    throw new StaffAuthServiceError("Unable to resolve the current auth session.", { cause: userError });
  }

  if (!user?.id) {
    return null;
  }

  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role, lawyer_id, is_active")
    .eq("id", user.id)
    .maybeSingle<{ role: string | null; lawyer_id: string | null; is_active: boolean | null }>();

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
    userId: user.id,
    role: normalizedRole,
    lawyerId: profile.lawyer_id ?? null,
    isActive: profile.is_active ?? true,
  };
}

export async function getStaffAuthContext(input?: StaffAuthContextInput): Promise<StaffAuthContext | null> {
  if (input?.userId !== undefined || input?.role !== undefined || input?.lawyerId !== undefined) {
    if (!input.userId || !normalizeStaffRole(input.role)) {
      return null;
    }

    if (input.isActive === false) {
      return null;
    }

    return {
      role: normalizeStaffRole(input.role),
      userId: input.userId,
      lawyerId: input.lawyerId ?? null,
    };
  }

  const accessToken = input?.accessToken?.trim() ?? null;

  if (!accessToken) {
    return null;
  }

  const resolvedProfile = input?.profileResolver
    ? await input.profileResolver(accessToken)
    : await resolveStaffProfile(accessToken);

  if (!resolvedProfile || resolvedProfile.isActive === false) {
    return null;
  }

  return {
    role: resolvedProfile.role,
    userId: resolvedProfile.userId,
    lawyerId: resolvedProfile.lawyerId,
  };
}
