import { siteContent, type Locale } from "@/lib/content";
import { BookingRequestForm } from "@/components/booking/BookingRequestForm";

type BookingPageProps = {
  locale: Locale;
};

export function BookingPage({ locale }: BookingPageProps) {
  const content = siteContent.booking;
  const expertiseOptions = siteContent.expertises.map((expertise) => ({
    value: expertise.anchor,
    label: locale === "fr" ? expertise.titleFr : expertise.titleAr,
  }));
  const lawyerOptions = [
    {
      value: "no_preference",
      label: locale === "fr" ? "Sans préférence" : "بدون تفضيل",
    },
  ];

  return (
    <section className="container py-16 sm:py-20">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold">
          {locale === "fr" ? "Rendez-vous" : "المواعيد"}
        </p>
        <h1 className="page-heading mt-4 text-4xl font-semibold text-navy sm:text-5xl">
          {locale === "fr" ? content.headingFr : content.headingAr}
        </h1>
        <p className="mt-6 text-base leading-8 text-black/70">
          {locale === "fr" ? content.subheadingFr : content.subheadingAr}
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.65fr]">
        <BookingRequestForm
          locale={locale}
          expertiseOptions={expertiseOptions}
          lawyerOptions={lawyerOptions}
        />

        <aside className="space-y-5">
          <div className="border border-black/10 bg-navy p-6 text-ivory">
            <h2 className="text-lg font-semibold">
              {locale === "fr" ? "Informations importantes" : "معلومات مهمة"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-ivory/80">
              {locale === "fr" ? content.warningFr : content.warningAr}
            </p>
          </div>
          <div className="border border-black/10 bg-surface p-6">
            <h2 className="text-lg font-semibold text-navy">
              {locale === "fr" ? "Week-end" : "عطلة نهاية الأسبوع"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/70">
              {locale === "fr" ? content.weekendNoticeFr : content.weekendNoticeAr}
            </p>
          </div>
          <div className="border border-black/10 bg-surface p-6">
            <h2 className="text-lg font-semibold text-navy">
              {locale === "fr" ? "Avertissement professionnel" : "تنبيه مهني"}
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/70">
              {locale === "fr" ? content.disclaimerFr : content.disclaimerAr}
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
