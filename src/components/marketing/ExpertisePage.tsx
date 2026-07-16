import Link from "next/link";
import { siteContent, type Locale } from "@/lib/content";
import { getCanonicalPath, getRouteById } from "@/lib/public-routes";

type ExpertisePageProps = {
  locale: Locale;
};

export function ExpertisePage({ locale }: ExpertisePageProps) {
  const bookingPath = getCanonicalPath(locale, getRouteById("rendez-vous"));

  return (
    <section className="container py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {locale === "fr" ? "Domaines d'intervention" : "مجالات التدخل"}
        </p>
        <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
          {locale === "fr" ? "Expertises juridiques" : "التخصصات القانونية"}
        </h1>
        <p className="mt-6 text-base leading-8 text-black/70">
          {locale === "fr"
            ? "Tous les domaines ci-dessous sont présentés sur une seule page afin de faciliter la lecture, l'accessibilité et le référencement."
            : "تُعرض جميع المجالات أدناه في صفحة واحدة لتسهيل القراءة وإتاحة الوصول والفهرسة."}
        </p>
      </div>

      <div className="mt-12 space-y-5">
        {siteContent.expertises.map((expertise, index) => {
          const title = locale === "fr" ? expertise.titleFr : expertise.titleAr;
          const intro = locale === "fr" ? expertise.introFr : expertise.introAr;
          const matters = locale === "fr" ? expertise.mattersFr : expertise.mattersAr;
          const audience = locale === "fr" ? expertise.audienceFr : expertise.audienceAr;
          const how = locale === "fr" ? expertise.howFr : expertise.howAr;

          return (
            <details
              key={expertise.anchor}
              id={expertise.anchor}
              open={index === 0}
              className="group border border-black/10 bg-surface p-6 open:border-gold"
            >
              <summary className="cursor-pointer list-none text-xl font-semibold text-navy marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  <span>{title}</span>
                  <span aria-hidden="true" className="text-gold">
                    +
                  </span>
                </span>
              </summary>

              <div className="mt-6 grid gap-6 text-sm leading-7 text-black/75 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-5">
                  <p>{intro}</p>
                  <section aria-labelledby={`${expertise.anchor}-matters`}>
                    <h2 id={`${expertise.anchor}-matters`} className="font-semibold text-black">
                      {locale === "fr" ? "Situations traitées" : "الحالات المعالجة"}
                    </h2>
                    <ul className="mt-3 list-disc space-y-2 ps-5">
                      {matters.map((matter) => (
                        <li key={matter}>{matter}</li>
                      ))}
                    </ul>
                  </section>
                </div>

                <div className="space-y-5 border-s border-black/10 ps-5">
                  <section aria-labelledby={`${expertise.anchor}-audience`}>
                    <h2 id={`${expertise.anchor}-audience`} className="font-semibold text-black">
                      {locale === "fr" ? "Clients concernés" : "الموكلون المعنيون"}
                    </h2>
                    <p className="mt-2">{audience}</p>
                  </section>
                  <section aria-labelledby={`${expertise.anchor}-approach`}>
                    <h2 id={`${expertise.anchor}-approach`} className="font-semibold text-black">
                      {locale === "fr" ? "Accompagnement" : "طريقة المرافقة"}
                    </h2>
                    <p className="mt-2">{how}</p>
                  </section>
                  <Link
                    href={bookingPath}
                    className="inline-flex border border-gold px-4 py-2 text-sm font-semibold text-navy transition hover:bg-gold hover:text-black"
                  >
                    {locale === "fr" ? "Demander une consultation" : "طلب استشارة"}
                  </Link>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
