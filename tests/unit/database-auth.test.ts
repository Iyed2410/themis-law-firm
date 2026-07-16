import { describe, expect, it } from "vitest";
import { canAccessAppointment, canManageUsers, canViewAllAppointments, normalizeStaffRole } from "@/lib/auth/access";

describe("staff role access", () => {
  it("treats the admin lawyer as having full visibility and management rights", () => {
    expect(normalizeStaffRole("admin_lawyer")).toBe("admin_lawyer");
    expect(canViewAllAppointments("admin_lawyer")).toBe(true);
    expect(canManageUsers("admin_lawyer")).toBe(true);
  });

  it("restricts lawyers to their own assigned appointments", () => {
    expect(normalizeStaffRole("lawyer")).toBe("lawyer");
    expect(canViewAllAppointments("lawyer")).toBe(false);
    expect(canAccessAppointment("lawyer", "lawyer-a", "lawyer-a")).toBe(true);
    expect(canAccessAppointment("lawyer", "lawyer-b", "lawyer-a")).toBe(false);
  });

  it("denies access when the role is missing or unrecognized", () => {
    expect(normalizeStaffRole("unknown")).toBeNull();
    expect(canViewAllAppointments("unknown")).toBe(false);
    expect(canManageUsers(null)).toBe(false);
    expect(canAccessAppointment(null, "lawyer-a", "lawyer-a")).toBe(false);
  });
});
