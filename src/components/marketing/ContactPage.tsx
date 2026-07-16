import { siteContent, type Locale } from "@/lib/content";

type ContactPageProps = {
  locale: Locale;
};

export function ContactPage({ locale }: ContactPageProps) {
  const content = siteContent.contact;
  const mapUrl = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL?.trim();

  return (
    <section className="container py-16 sm:py-20">
      <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
            {locale === "fr" ? "Contact" : "الاتصال"}
          </p>
          <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
            {locale === "fr" ? "Nous contacter" : "اتصلوا بنا"}
          </h1>
          <dl className="mt-8 space-y-5 text-sm leading-7 text-black/75">
            <div>
              <dt className="font-semibold text-navy">{locale === "fr" ? "Adresse" : "العنوان"}</dt>
              <dd>{locale === "fr" ? content.addressFr : content.addressAr}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">{locale === "fr" ? "Téléphone" : "الهاتف"}</dt>
              <dd>{content.phone}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">{locale === "fr" ? "Email" : "البريد الإلكتروني"}</dt>
              <dd>{content.email}</dd>
            </div>
            <div>
              <dt className="font-semibold text-navy">{locale === "fr" ? "Horaires" : "ساعات العمل"}</dt>
              <dd>{locale === "fr" ? content.hoursFr : content.hoursAr}</dd>
            </div>
          </dl>
        </div>

        <div className="min-h-80 border border-black/10 bg-surface p-4">
          {mapUrl ? (
            <iframe
              src={mapUrl}
              title={locale === "fr" ? content.mapTitleFr : content.mapTitleAr}
              loading="lazy"
              className="h-80 w-full border-0"
            />
          ) : (
            <div className="flex min-h-72 items-center justify-center border border-dashed border-black/20 p-6 text-center">
              <a
                href={content.mapFallbackUrl}
                className="font-semibold text-navy underline decoration-gold underline-offset-4"
                target="_blank"
                rel="noreferrer"
              >
                {locale === "fr" ? content.mapFallbackLabelFr : content.mapFallbackLabelAr}
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
