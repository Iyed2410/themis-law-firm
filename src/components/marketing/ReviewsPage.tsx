import { siteContent, type Locale } from "@/lib/content";

type ReviewsPageProps = {
  locale: Locale;
};

export function ReviewsPage({ locale }: ReviewsPageProps) {
  const content = siteContent.avis;

  return (
    <section className="container py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {locale === "fr" ? "Avis approuvés" : "آراء معتمدة"}
        </p>
        <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
          {locale === "fr" ? content.headingFr : content.headingAr}
        </h1>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {content.reviews.map((review) => (
          <figure key={review.alias} className="border border-black/10 bg-surface p-6">
            <div aria-label={`${review.rating}/5`} className="text-sm font-semibold text-gold">
              {review.rating}/5
            </div>
            <blockquote className="mt-4 text-sm leading-7 text-black/70">
              {locale === "fr" ? review.textFr : review.textAr}
            </blockquote>
            <figcaption className="mt-5 text-sm font-semibold text-navy">
              {review.alias}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
