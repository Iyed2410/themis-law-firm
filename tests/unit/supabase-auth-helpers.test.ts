import { describe, expect, it } from "vitest";

import {
  getStaffAuthContext,
  StaffAuthConfigurationError,
} from "@/lib/auth/staff";
import {
  getStaffSession,
  requireStaffDashboardAccess,
} from "@/lib/auth/server";

describe("staff auth helpers", () => {
  it("returns a resolved auth context from explicit input", async () => {
    const context = await getStaffAuthContext({
      userId: "user-1",
      role: "admin_lawyer",
      lawyerId: "lawyer-1",
      isActive: true,
    });

    expect(context?.role).toBe("admin_lawyer");
    expect(context?.userId).toBe("user-1");
    expect(context?.lawyerId).toBe("lawyer-1");
  });

  it("returns null for inactive or missing roles", async () => {
    const missingRole = await getStaffAuthContext({
      userId: "user-1",
      role: "unknown",
      lawyerId: "lawyer-1",
      isActive: true,
    });

    const inactiveProfile = await getStaffAuthContext({
      userId: "user-1",
      role: "lawyer",
      lawyerId: "lawyer-1",
      isActive: false,
    });

    expect(missingRole).toBeNull();
    expect(inactiveProfile).toBeNull();
  });

  it("returns null when no bearer token or profile is available", async () => {
    const result = await getStaffSession({
      headersResolver: async () => new Headers(),
    });

    expect(result).toBeNull();
  });

  it("rejects unauthenticated dashboard access by redirecting to the login route", async () => {
    await expect(
      requireStaffDashboardAccess({
        headersResolver: async () => new Headers(),
      }),
    ).rejects.toThrow();
  });

  it("accepts an active lawyer profile from a resolver", async () => {
    const context = await getStaffSession({
      accessToken: "token",
      profileResolver: async () => ({
        userId: "user-1",
        role: "lawyer",
        lawyerId: "lawyer-1",
        isActive: true,
      }),
    });

    expect(context?.role).toBe("lawyer");
    expect(context?.userId).toBe("user-1");
  });

  it("accepts an active admin profile from a resolver", async () => {
    const context = await getStaffSession({
      accessToken: "token",
      profileResolver: async () => ({
        userId: "user-2",
        role: "admin_lawyer",
        lawyerId: "lawyer-2",
        isActive: true,
      }),
    });

    expect(context?.role).toBe("admin_lawyer");
  });

  it("denies a missing profile", async () => {
    const context = await getStaffSession({
      accessToken: "token",
      profileResolver: async () => null,
    });

    expect(context).toBeNull();
  });

  it("fails closed when Supabase configuration is missing", async () => {
    const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const previousAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    try {
      await expect(
        getStaffSession({
          accessToken: "token",
        }),
      ).rejects.toBeInstanceOf(StaffAuthConfigurationError);
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

  it("does not treat unexpected profile-resolution errors as a valid session", async () => {
    await expect(
      getStaffSession({
        accessToken: "token",
        profileResolver: async () => {
          throw new Error("database down");
        },
      }),
    ).rejects.toThrow("database down");
  });
});