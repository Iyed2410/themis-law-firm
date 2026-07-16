import { siteContent, type Locale } from "@/lib/content";

type TeamPageProps = {
  locale: Locale;
};

export function TeamPage({ locale }: TeamPageProps) {
  const content = siteContent.equipe;

  return (
    <section className="container py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {locale === "fr" ? "Avocats" : "المحامون"}
        </p>
        <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
          {locale === "fr" ? content.headingFr : content.headingAr}
        </h1>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {content.lawyers.map((lawyer, index) => (
          <article key={`${lawyer.nameFr}-${index}`} className="border border-black/10 bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {locale === "fr" ? `Profil ${index + 1}` : `الملف ${index + 1}`}
            </p>
            <h2 className="mt-4 text-xl font-semibold text-navy">
              {locale === "fr" ? lawyer.nameFr : lawyer.nameAr}
            </h2>
            <p className="mt-2 text-sm font-medium text-black/70">
              {locale === "fr" ? lawyer.titleFr : lawyer.titleAr}
            </p>
            <p className="mt-5 text-sm leading-7 text-black/70">
              {locale === "fr" ? lawyer.bioFr : lawyer.bioAr}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {lawyer.languages.map((language) => (
                <li key={language} className="border border-black/10 px-3 py-1 text-xs text-navy">
                  {language}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
