import { requireStaffDashboardAccess } from "@/lib/auth/server";

export default async function DashboardPlaceholder() {
  const authContext = await requireStaffDashboardAccess();

  return (
    <main className="container py-20">
      <section className="rounded-3xl border border-silver/30 bg-surface p-10">
        <h1 className="page-heading text-3xl font-semibold text-navy">Tableau de bord</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Une session staff authentifiée a été reconnue et l’accès est prêt pour les permissions RLS.
        </p>
        <dl className="mt-6 grid gap-4 text-sm text-muted sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-black">Rôle</dt>
            <dd>{authContext.role ?? "non défini"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Utilisateur</dt>
            <dd>{authContext.userId ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-black">Avocat</dt>
            <dd>{authContext.lawyerId ?? "—"}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
