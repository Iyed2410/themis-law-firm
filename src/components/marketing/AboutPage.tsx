import { siteContent, type Locale } from "@/lib/content";

type AboutPageProps = {
  locale: Locale;
};

export function AboutPage({ locale }: AboutPageProps) {
  const content = siteContent.cabinet;
  const heading = locale === "fr" ? content.headingFr : content.headingAr;
  const paragraphs =
    locale === "fr"
      ? [content.para1Fr, content.para2Fr]
      : [content.para1Ar, content.para2Ar];
  const values = locale === "fr" ? content.valuesFr : content.valuesAr;

  return (
    <section className="container py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="border-s border-gold ps-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            Themis Law Firm
          </p>
          <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
            {heading}
          </h1>
        </div>

        <div className="space-y-6 text-base leading-8 text-black/75">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <section className="mt-14 border-y border-black/10 py-10" aria-labelledby="values-title">
        <h2 id="values-title" className="page-heading text-2xl font-semibold text-navy">
          {locale === "fr" ? "Principes de travail" : "مبادئ العمل"}
        </h2>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {values.map((value) => (
            <li
              key={value}
              className="border border-black/10 bg-surface px-5 py-4 text-sm font-medium text-navy"
            >
              {value}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
