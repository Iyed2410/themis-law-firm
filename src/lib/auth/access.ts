export type StaffRole = "admin_lawyer" | "lawyer";

export function normalizeStaffRole(role: string | null | undefined): StaffRole | null {
  if (role === "admin_lawyer") {
    return "admin_lawyer";
  }

  if (role === "lawyer") {
    return "lawyer";
  }

  return null;
}

export function canViewAllAppointments(role: string | null | undefined): boolean {
  return normalizeStaffRole(role) === "admin_lawyer";
}

export function canManageUsers(role: string | null | undefined): boolean {
  return normalizeStaffRole(role) === "admin_lawyer";
}

export function canAccessAppointment(
  role: string | null | undefined,
  assignedStaffProfileId: string | null | undefined,
  currentStaffProfileId: string | null | undefined
): boolean {
  const normalizedRole = normalizeStaffRole(role);

  if (normalizedRole === "admin_lawyer") {
    return true;
  }

  if (normalizedRole !== "lawyer") {
    return false;
  }

  return Boolean(
    assignedStaffProfileId &&
      currentStaffProfileId &&
      assignedStaffProfileId === currentStaffProfileId
  );
}
