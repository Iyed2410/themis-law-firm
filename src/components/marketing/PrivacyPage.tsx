import { siteContent, type Locale } from "@/lib/content";

type PrivacyPageProps = {
  locale: Locale;
};

export function PrivacyPage({ locale }: PrivacyPageProps) {
  const content = siteContent.privacy;

  return (
    <PolicyArticle
      heading={locale === "fr" ? content.headingFr : content.headingAr}
      body={locale === "fr" ? content.bodyFr : content.bodyAr}
    />
  );
}

function PolicyArticle({ heading, body }: { heading: string; body: string }) {
  return (
    <article className="container max-w-4xl py-16 sm:py-20">
      <h1 className="page-heading text-4xl font-semibold text-navy sm:text-5xl">{heading}</h1>
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
