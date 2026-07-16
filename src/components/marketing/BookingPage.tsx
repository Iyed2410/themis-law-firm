import { siteContent, type Locale } from "@/lib/content";

type BookingPageProps = {
  locale: Locale;
};

const paymentOptions = {
  fr: ["Flouci", "e-Dinar", "Virement bancaire", "Paiement au cabinet"],
  ar: ["Flouci", "e-Dinar", "تحويل بنكي", "الدفع في المكتب"],
};

export function BookingPage({ locale }: BookingPageProps) {
  const content = siteContent.booking;
  const expertiseLabel = locale === "fr" ? "Domaine juridique" : "المجال القانوني";

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
        <form className="border border-black/10 bg-surface p-6" aria-describedby="booking-dev-note">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={locale === "fr" ? "Nom complet" : "الاسم الكامل"} id="full-name" required>
              <input id="full-name" name="fullName" required className="field-input" />
            </Field>
            <Field label={locale === "fr" ? "Email" : "البريد الإلكتروني"} id="email" required>
              <input id="email" name="email" type="email" required className="field-input" />
            </Field>
            <Field label={locale === "fr" ? "Téléphone" : "الهاتف"} id="phone" required>
              <input id="phone" name="phone" type="tel" required className="field-input" />
            </Field>
            <Field label={expertiseLabel} id="expertise" required>
              <select id="expertise" name="expertise" required className="field-input">
                <option value="">{locale === "fr" ? "Sélectionner" : "اختر"}</option>
                {siteContent.expertises.map((expertise) => (
                  <option key={expertise.anchor} value={expertise.anchor}>
                    {locale === "fr" ? expertise.titleFr : expertise.titleAr}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={locale === "fr" ? "Avocat préféré" : "المحامي المفضل"} id="lawyer">
              <select id="lawyer" name="lawyer" className="field-input">
                <option value="none">{locale === "fr" ? "Sans préférence" : "بدون تفضيل"}</option>
                {siteContent.equipe.lawyers.map((lawyer, index) => (
                  <option key={`${lawyer.nameFr}-${index}`} value={`lawyer-${index + 1}`}>
                    {locale === "fr" ? lawyer.nameFr : lawyer.nameAr}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={locale === "fr" ? "Date souhaitée" : "التاريخ المطلوب"} id="date" required>
              <input id="date" name="date" type="date" required className="field-input" />
            </Field>
            <Field label={locale === "fr" ? "Heure souhaitée" : "الوقت المطلوب"} id="time" required>
              <input id="time" name="time" type="time" required className="field-input" />
            </Field>
            <Field label={locale === "fr" ? "Préférence de paiement" : "طريقة الدفع المفضلة"} id="payment">
              <select id="payment" name="payment" className="field-input">
                {paymentOptions[locale].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </Field>
            <Field label={locale === "fr" ? "Motif bref" : "سبب مختصر"} id="reason" className="md:col-span-2">
              <textarea
                id="reason"
                name="reason"
                maxLength={500}
                rows={5}
                className="field-input resize-y"
                aria-describedby="reason-help"
              />
              <p id="reason-help" className="mt-2 text-xs text-black/60">
                {locale === "fr" ? "Maximum 500 caractères." : "500 حرف كحد أقصى."}
              </p>
            </Field>
          </div>

          <label className="mt-6 flex gap-3 text-sm leading-6 text-black/70">
            <input type="checkbox" required className="mt-1 h-4 w-4 accent-[var(--gold)]" />
            <span>{locale === "fr" ? content.consentFr : content.consentAr}</span>
          </label>

          <p id="booking-dev-note" className="mt-6 border border-gold/60 bg-gold/10 p-4 text-sm text-black/75">
            {locale === "fr" ? content.submitPendingFr : content.submitPendingAr}
          </p>
          <button
            type="submit"
            disabled
            className="mt-5 border border-black/20 bg-black/10 px-5 py-3 text-sm font-semibold text-black/50"
          >
            {locale === "fr" ? "Envoyer la demande" : "إرسال الطلب"}
          </button>
        </form>

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

function Field({
  label,
  id,
  required,
  className,
  children,
}: {
  label: string;
  id: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-semibold text-navy">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div className="mt-2">{children}</div>
    </div>
  );
}
