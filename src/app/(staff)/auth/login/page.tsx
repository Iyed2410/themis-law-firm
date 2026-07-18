import { redirect } from "next/navigation";
import { StaffLoginForm } from "@/components/auth/StaffLoginForm";
import { getSafeStaffRedirectPath } from "@/lib/auth/redirect";
import { getStaffSession } from "@/lib/auth/server";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ next }, session] = await Promise.all([searchParams, getStaffSession()]);
  const nextPath = getSafeStaffRedirectPath(next);

  if (session) {
    redirect(nextPath);
  }

  return (
    <main className="container py-20">
      <section className="mx-auto max-w-xl rounded-3xl border border-silver/30 bg-surface p-10">
        <h1 className="page-heading text-3xl font-semibold text-navy">Connexion</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Accès réservé aux membres actifs du cabinet.
        </p>
        <StaffLoginForm nextPath={nextPath} />
      </section>
    </main>
  );
}
