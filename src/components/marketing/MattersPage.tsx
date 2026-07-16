import { siteContent, type Locale } from "@/lib/content";

type MattersPageProps = {
  locale: Locale;
};

export function MattersPage({ locale }: MattersPageProps) {
  const content = siteContent.experience;

  return (
    <section className="container py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {locale === "fr" ? "Affaires anonymisées" : "قضايا مجهّلة"}
        </p>
        <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
          {locale === "fr" ? content.headingFr : content.headingAr}
        </h1>
        <p className="mt-6 border-s border-gold ps-5 text-sm leading-7 text-black/70">
          {locale === "fr" ? content.disclaimerFr : content.disclaimerAr}
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {content.matters.map((matter) => (
          <article key={matter.areaFr} className="border border-black/10 bg-surface p-6">
            <h2 className="text-lg font-semibold text-navy">
              {locale === "fr" ? matter.areaFr : matter.areaAr}
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/70">
              {locale === "fr" ? matter.summaryFr : matter.summaryAr}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
