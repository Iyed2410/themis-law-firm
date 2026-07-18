import type { ReactNode } from "react";
import { requireStaffDashboardAccess } from "@/lib/auth/server";
import { StaffLogoutButton } from "@/components/auth/StaffLoginForm";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const staff = await requireStaffDashboardAccess();

  return (
    <div className="min-h-screen bg-ivory text-black">
      <header className="border-b border-silver/40 bg-white">
        <div className="container flex flex-wrap items-center justify-between gap-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted">Espace staff</p>
            <p className="mt-1 text-sm font-semibold text-navy">
              {staff.fullName ?? staff.email ?? staff.profileId}
            </p>
          </div>
          <StaffLogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
