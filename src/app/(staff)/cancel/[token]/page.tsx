import { notFound } from "next/navigation";

type CancelPageProps = {
  params: Promise<{ token: string }>;
};

export default async function CancelPage({ params }: CancelPageProps) {
  const { token } = await params;

  if (!token) {
    notFound();
  }

  return (
    <main className="container py-20">
      <section className="rounded-3xl border border-silver/30 bg-surface p-10">
        <h1 className="page-heading text-3xl font-semibold text-navy">Annulation de rendez-vous</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          La page d’annulation sécurisée sera implémentée dans une phase ultérieure.
        </p>
      </section>
    </main>
  );
}
