export const DEFAULT_STAFF_REDIRECT_PATH = "/dashboard";

export function getSafeStaffRedirectPath(value: string | null | undefined): string {
  const candidate = value?.trim();

  if (!candidate) {
    return DEFAULT_STAFF_REDIRECT_PATH;
  }

  if (!candidate.startsWith("/") || candidate.startsWith("//") || candidate.includes("\\")) {
    return DEFAULT_STAFF_REDIRECT_PATH;
  }

  if (!candidate.startsWith("/dashboard")) {
    return DEFAULT_STAFF_REDIRECT_PATH;
  }

  return candidate;
}

export function getStaffLoginPath(nextPath: string | null | undefined): string {
  const safeNextPath = getSafeStaffRedirectPath(nextPath);

  if (safeNextPath === DEFAULT_STAFF_REDIRECT_PATH) {
    return "/auth/login";
  }

  return `/auth/login?next=${encodeURIComponent(safeNextPath)}`;
}
