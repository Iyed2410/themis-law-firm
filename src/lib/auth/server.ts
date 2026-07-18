import { redirect } from "next/navigation";
import { headers as nextHeaders } from "next/headers";
import { getStaffAuthContext, type StaffAuthContextInput } from "@/lib/auth/staff";
import { getSafeStaffRedirectPath, getStaffLoginPath } from "@/lib/auth/redirect";

export type StaffSessionInput = StaffAuthContextInput & {
  headersResolver?: () => Promise<Headers | null>;
  currentPath?: string | null;
};

function isOutsideRequestScopeError(error: unknown): boolean {
  return error instanceof Error && /headers was called outside a request scope|next\/headers/i.test(error.message);
}

export async function getStaffSession(input?: StaffSessionInput) {
  return getStaffAuthContext(input);
}

export async function requireStaffSession(input?: StaffSessionInput) {
  return getStaffSession(input);
}

export async function requireStaffDashboardAccess(input?: StaffSessionInput) {
  const session = await requireStaffSession(input);

  if (!session) {
    redirect(getStaffLoginPath(await resolveCurrentPath(input)));
  }

  return session;
}

async function resolveCurrentPath(input?: StaffSessionInput): Promise<string> {
  if (input?.currentPath) {
    return getSafeStaffRedirectPath(input.currentPath);
  }

  try {
    const requestHeaders = input?.headersResolver ? await input.headersResolver() : await nextHeaders();
    return getSafeStaffRedirectPath(requestHeaders?.get("x-current-path"));
  } catch (error) {
    if (isOutsideRequestScopeError(error)) {
      return "/dashboard";
    }

    throw error;
  }
}
