import { describe, expect, it } from "vitest";
import { AuthSessionMissingError } from "@supabase/supabase-js";
import { renderToStaticMarkup } from "react-dom/server";

import LoginPage from "@/app/(staff)/auth/login/page";
import { getStaffAuthContext, isUnauthenticatedAuthError, StaffAuthServiceError } from "@/lib/auth/staff";
import { getStaffSession, requireStaffDashboardAccess } from "@/lib/auth/server";
import { getSafeStaffRedirectPath, getStaffLoginPath } from "@/lib/auth/redirect";

type FakeProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  is_active: boolean | null;
};

function fakeSupabaseClient(options: {
  user?: { id: string; email?: string | null } | null;
  userError?: unknown;
  profile?: FakeProfile | null;
  profileError?: { message: string } | null;
}) {
  return {
    auth: {
      async getUser() {
        return {
          data: { user: options.user ?? null },
          error: options.userError ?? null,
        };
      },
    },
    from(table: "profiles") {
      expect(table).toBe("profiles");

      return {
        select(columns: string) {
          expect(columns).toContain("role");
          expect(columns).toContain("is_active");
          expect(columns).not.toContain("lawyer_id");

          return {
            eq(column: "id", value: string) {
              expect(column).toBe("id");
              expect(value).toBe(options.user?.id);

              return {
                async maybeSingle<T>() {
                  return {
                    data: (options.profile ?? null) as T | null,
                    error: options.profileError ?? null,
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}

describe("staff auth helpers", () => {
  it("returns a resolved auth context from explicit profile input", async () => {
    const context = await getStaffAuthContext({
      profileId: "profile-1",
      role: "admin_lawyer",
      isActive: true,
    });

    expect(context?.role).toBe("admin_lawyer");
    expect(context?.userId).toBe("profile-1");
    expect(context?.profileId).toBe("profile-1");
    expect(context?.staffProfileId).toBe("profile-1");
  });

  it("returns null for inactive or missing roles", async () => {
    const missingRole = await getStaffAuthContext({
      userId: "user-1",
      role: "unknown",
      isActive: true,
    });

    const inactiveProfile = await getStaffAuthContext({
      userId: "user-1",
      role: "lawyer",
      isActive: false,
    });

    expect(missingRole).toBeNull();
    expect(inactiveProfile).toBeNull();
  });

  it("returns null when no cookie session is available", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    try {
      const result = await getStaffSession();

      expect(result).toBeNull();
    } finally {
      if (previousUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      }

      if (previousAnonKey === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousAnonKey;
      }
    }
  });

  it("rejects unauthenticated dashboard access by redirecting to the login route", async () => {
    await expect(
      requireStaffDashboardAccess({
        currentPath: "/dashboard/calendar?view=week",
      }),
    ).rejects.toThrow();
  });

  it("accepts an active lawyer profile from the cookie-authenticated Supabase client", async () => {
    const context = await getStaffSession({
      supabase: fakeSupabaseClient({
        user: { id: "profile-lawyer", email: "lawyer@example.com" },
        profile: {
          id: "profile-lawyer",
          full_name: "Lawyer A",
          email: "lawyer@example.com",
          role: "lawyer",
          is_active: true,
        },
      }),
    });

    expect(context).toEqual({
      userId: "profile-lawyer",
      profileId: "profile-lawyer",
      staffProfileId: "profile-lawyer",
      role: "lawyer",
      email: "lawyer@example.com",
      fullName: "Lawyer A",
    });
  });

  it("accepts an active admin profile from the profiles table", async () => {
    const context = await getStaffSession({
      supabase: fakeSupabaseClient({
        user: { id: "profile-admin", email: "admin@example.com" },
        profile: {
          id: "profile-admin",
          full_name: "Admin Lawyer",
          email: "admin@example.com",
          role: "admin_lawyer",
          is_active: true,
        },
      }),
    });

    expect(context?.role).toBe("admin_lawyer");
    expect(context?.profileId).toBe("profile-admin");
  });

  it("loads role from profiles rather than user metadata", async () => {
    const context = await getStaffSession({
      supabase: fakeSupabaseClient({
        user: {
          id: "profile-lawyer",
          email: "lawyer@example.com",
          user_metadata: { role: "admin_lawyer" },
        } as never,
        profile: {
          id: "profile-lawyer",
          full_name: "Lawyer A",
          email: "lawyer@example.com",
          role: "lawyer",
          is_active: true,
        },
      }),
    });

    expect(context?.role).toBe("lawyer");
  });

  it("denies inactive, missing, expired, or invalid sessions", async () => {
    const inactive = await getStaffSession({
      supabase: fakeSupabaseClient({
        user: { id: "profile-lawyer" },
        profile: {
          id: "profile-lawyer",
          full_name: "Lawyer A",
          email: "lawyer@example.com",
          role: "lawyer",
          is_active: false,
        },
      }),
    });

    const missingProfile = await getStaffSession({
      supabase: fakeSupabaseClient({
        user: { id: "profile-lawyer" },
        profile: null,
      }),
    });

    const expired = await getStaffSession({
      supabase: fakeSupabaseClient({
        user: null,
        userError: { message: "JWT expired" },
      }),
    });

    expect(inactive).toBeNull();
    expect(missingProfile).toBeNull();
    expect(expired).toBeNull();
  });

  it("treats AuthSessionMissingError and no-session auth codes as unauthenticated", async () => {
    const cases = [
      new AuthSessionMissingError(),
      { name: "AuthSessionMissingError", message: "Auth session missing!" },
      { code: "session_not_found", message: "Session not found" },
      { code: "session_expired", message: "Session expired" },
      { code: "refresh_token_not_found", message: "Refresh token not found" },
      { code: "refresh_token_already_used", message: "Refresh token already used" },
    ];

    for (const userError of cases) {
      expect(isUnauthenticatedAuthError(userError)).toBe(true);
      await expect(
        getStaffSession({
          supabase: fakeSupabaseClient({
            user: null,
            userError,
          }),
        }),
      ).resolves.toBeNull();
    }
  });

  it("still throws StaffAuthServiceError for genuine unexpected auth failures", async () => {
    await expect(
      getStaffSession({
        supabase: fakeSupabaseClient({
          user: null,
          userError: { name: "AuthRetryableFetchError", message: "fetch failed" },
        }),
      }),
    ).rejects.toBeInstanceOf(StaffAuthServiceError);
  });

  it("renders the login form for logged-out visitors", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

    try {
      const page = await LoginPage({
        searchParams: Promise.resolve({}),
      });
      const html = renderToStaticMarkup(page);

      expect(html).toContain("Connexion");
      expect(html).toContain("Adresse email");
      expect(html).toContain("Mot de passe");
    } finally {
      if (previousUrl === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
      }

      if (previousAnonKey === undefined) {
        delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      } else {
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousAnonKey;
      }
    }
  });

  it("prevents open redirects for staff destinations", () => {
    expect(getSafeStaffRedirectPath("/dashboard/requests")).toBe("/dashboard/requests");
    expect(getSafeStaffRedirectPath("https://evil.example/dashboard")).toBe("/dashboard");
    expect(getSafeStaffRedirectPath("//evil.example")).toBe("/dashboard");
    expect(getSafeStaffRedirectPath("/fr/rendez-vous")).toBe("/dashboard");
    expect(getStaffLoginPath("/dashboard/calendar?view=day")).toBe(
      "/auth/login?next=%2Fdashboard%2Fcalendar%3Fview%3Dday",
    );
  });

  it("does not treat unexpected profile-resolution errors as a valid session", async () => {
    await expect(
      getStaffSession({
        supabase: {
          auth: {
            async getUser() {
              return {
                data: { user: { id: "profile-1" } },
                error: null,
              };
            },
          },
          from() {
            throw new Error("database down");
          },
        } as never,
      }),
    ).rejects.toThrow("database down");
  });
});
