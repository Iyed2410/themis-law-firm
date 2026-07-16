import { redirect } from "next/navigation";
import { headers as nextHeaders } from "next/headers";
import { getStaffAuthContext, type StaffAuthContextInput } from "@/lib/auth/staff";

export type StaffSessionInput = StaffAuthContextInput & {
  headersResolver?: () => Promise<Headers | null>;
};

function isOutsideRequestScopeError(error: unknown): boolean {
  return error instanceof Error && /headers was called outside a request scope|next\/headers/i.test(error.message);
}

export async function getStaffSession(input?: StaffSessionInput) {
  if (input?.accessToken) {
    return getStaffAuthContext(input);
  }

  try {
    const requestHeaders = input?.headersResolver ? await input.headersResolver() : await nextHeaders();
    const authorization = requestHeaders?.get("authorization");
    const accessToken = authorization?.replace(/^Bearer\s+/i, "").trim() ?? null;

    return getStaffAuthContext({ ...input, accessToken });
  } catch (error) {
    if (isOutsideRequestScopeError(error)) {
      return null;
    }

    throw error;
  }
}

export async function requireStaffSession(input?: StaffSessionInput) {
  return getStaffSession(input);
}

export async function requireStaffDashboardAccess(input?: StaffSessionInput) {
  const session = await requireStaffSession(input);

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}
