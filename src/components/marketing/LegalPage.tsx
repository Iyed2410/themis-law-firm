import { siteContent, type Locale } from "@/lib/content";

type LegalPageProps = {
  locale: Locale;
};

export function LegalPage({ locale }: LegalPageProps) {
  const content = siteContent.legal;
  const body = locale === "fr" ? content.bodyFr : content.bodyAr;

  return (
    <article className="container max-w-4xl py-16 sm:py-20">
      <h1 className="page-heading text-4xl font-semibold text-navy sm:text-5xl">
        {locale === "fr" ? content.headingFr : content.headingAr}
      </h1>
      <div className="mt-10 space-y-5 text-sm leading-8 text-black/75">
        {body.split("\n\n").map((paragraph) => {
          const clean = paragraph.replace(/\*\*/g, "");
          const isHeading = paragraph.startsWith("**") && paragraph.endsWith("**");

          return isHeading ? (
            <h2 key={paragraph} className="pt-4 text-lg font-semibold text-navy">
              {clean}
            </h2>
          ) : (
            <p key={paragraph}>{clean}</p>
          );
        })}
      </div>
    </article>
  );
}
