"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Locale } from "@/lib/content";

type Option = {
  value: string;
  label: string;
};

type BookingRequestFormProps = {
  locale: Locale;
  expertiseOptions: Option[];
  lawyerOptions: Option[];
};

type FieldErrors = Record<string, string>;

type ApiFieldError = {
  field: string;
  code: string;
};

type ApiResponse = {
  code: string;
  errors?: ApiFieldError[];
};

const labels = {
  fr: {
    fullName: "Nom complet",
    email: "Email",
    telephone: "Téléphone",
    expertise: "Domaine juridique",
    lawyer: "Avocat préféré",
    consultationType: "Type de consultation",
    office: "Au cabinet",
    online: "En ligne",
    requestedDate: "Date souhaitée",
    requestedTime: "Heure souhaitée",
    payment: "Préférence de paiement",
    reason: "Motif bref",
    consent: "J'accepte la politique de confidentialité et le traitement de mes données pour répondre à ma demande.",
    submit: "Envoyer la demande",
    sending: "Envoi en cours",
    successTitle: "Demande reçue",
    successText:
      "Votre demande a été reçue et sera examinée par le cabinet. La date et l'heure demandées ne sont pas réservées tant que le rendez-vous n'est pas confirmé.",
    summaryTitle: "Veuillez corriger les champs suivants.",
    weekendNotice:
      "Les demandes de week-end sont exceptionnelles et nécessitent une approbation manuelle.",
    pendingNotice:
      "La soumission crée une demande en attente, pas un rendez-vous confirmé.",
    reasonHelp: "Maximum 500 caractères. N'envoyez pas d'informations urgentes ou hautement sensibles.",
    genericError: "La demande n'a pas pu être envoyée. Veuillez réessayer.",
    rateLimited: "Trop de demandes ont été envoyées. Veuillez réessayer plus tard.",
  },
  ar: {
    fullName: "الاسم الكامل",
    email: "البريد الإلكتروني",
    telephone: "الهاتف",
    expertise: "المجال القانوني",
    lawyer: "المحامي المفضل",
    consultationType: "نوع الاستشارة",
    office: "في المكتب",
    online: "عن بعد",
    requestedDate: "التاريخ المطلوب",
    requestedTime: "الوقت المطلوب",
    payment: "طريقة الدفع المفضلة",
    reason: "سبب مختصر",
    consent: "أوافق على سياسة الخصوصية ومعالجة بياناتي للرد على طلبي.",
    submit: "إرسال الطلب",
    sending: "جارٍ الإرسال",
    successTitle: "تم استلام الطلب",
    successText:
      "تم استلام طلبكم وسيتم مراجعته من قبل المكتب. التاريخ والوقت المطلوبان غير محجوزين إلى أن يتم تأكيد الموعد.",
    summaryTitle: "يرجى تصحيح الحقول التالية.",
    weekendNotice: "طلبات عطلة نهاية الأسبوع استثنائية وتتطلب موافقة يدوية.",
    pendingNotice: "الإرسال ينشئ طلباً في الانتظار، وليس موعداً مؤكداً.",
    reasonHelp: "500 حرف كحد أقصى. لا ترسلوا معلومات عاجلة أو شديدة الحساسية.",
    genericError: "تعذر إرسال الطلب. يرجى المحاولة مرة أخرى.",
    rateLimited: "تم إرسال طلبات كثيرة. يرجى المحاولة لاحقاً.",
  },
} as const;

const fieldErrorLabels: Record<string, Record<Locale, string>> = {
  required: { fr: "Ce champ est obligatoire.", ar: "هذا الحقل مطلوب." },
  too_short: { fr: "La valeur est trop courte.", ar: "القيمة قصيرة جداً." },
  too_long: { fr: "La valeur est trop longue.", ar: "القيمة طويلة جداً." },
  invalid_email: { fr: "Adresse email invalide.", ar: "البريد الإلكتروني غير صالح." },
  invalid_telephone: { fr: "Numéro de téléphone invalide.", ar: "رقم الهاتف غير صالح." },
  unknown_expertise: { fr: "Domaine juridique inconnu.", ar: "مجال قانوني غير معروف." },
  unknown_payment_preference: { fr: "Préférence de paiement inconnue.", ar: "طريقة دفع غير معروفة." },
  unknown_lawyer: { fr: "Avocat préféré invalide.", ar: "اختيار المحامي غير صالح." },
  missing_consent: { fr: "Le consentement est obligatoire.", ar: "الموافقة مطلوبة." },
  invalid_or_past_datetime: {
    fr: "La date ou l'heure est invalide ou passée.",
    ar: "التاريخ أو الوقت غير صالح أو في الماضي.",
  },
  invalid_idempotency_key: { fr: "Veuillez réessayer l'envoi.", ar: "يرجى إعادة محاولة الإرسال." },
};

const paymentOptions: Record<Locale, Option[]> = {
  fr: [
    { value: "undecided", label: "À décider" },
    { value: "flouci", label: "Flouci" },
    { value: "e_dinar", label: "e-Dinar" },
    { value: "bank_transfer", label: "Virement bancaire" },
    { value: "cash", label: "Paiement au cabinet" },
  ],
  ar: [
    { value: "undecided", label: "لاحقاً" },
    { value: "flouci", label: "Flouci" },
    { value: "e_dinar", label: "e-Dinar" },
    { value: "bank_transfer", label: "تحويل بنكي" },
    { value: "cash", label: "الدفع في المكتب" },
  ],
};

export function BookingRequestForm({
  locale,
  expertiseOptions,
  lawyerOptions,
}: BookingRequestFormProps) {
  const text = labels[locale];
  const [idempotencyKey, setIdempotencyKey] = useState(createIdempotencyKey);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [reasonLength, setReasonLength] = useState(0);
  const errorEntries = useMemo(() => Object.entries(fieldErrors), [fieldErrors]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload = {
      locale,
      fullName: getString(formData, "fullName"),
      email: getString(formData, "email"),
      telephone: getString(formData, "telephone"),
      expertiseKey: getString(formData, "expertiseKey"),
      preferredLawyerCode: getString(formData, "preferredLawyerCode"),
      consultationType: getString(formData, "consultationType"),
      requestedDate: getString(formData, "requestedDate"),
      requestedTime: getString(formData, "requestedTime"),
      paymentPreference: getString(formData, "paymentPreference"),
      reason: getString(formData, "reason"),
      privacyConsent: formData.get("privacyConsent") === "on",
      honeypot: getString(formData, "companyWebsite"),
      requestIdempotencyKey: idempotencyKey,
    };

    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({ code: "BOOKING_SERVER_ERROR" }))) as ApiResponse;

      if (response.ok && result.code === "BOOKING_REQUEST_RECEIVED") {
        setIsSuccess(true);
        setIdempotencyKey(createIdempotencyKey());
        event.currentTarget.reset();
        setReasonLength(0);
        return;
      }

      if (response.status === 422 && result.errors) {
        setFieldErrors(toFieldErrors(result.errors, locale));
        setFormError(text.summaryTitle);
        return;
      }

      setFormError(response.status === 429 ? text.rateLimited : text.genericError);
    } catch {
      setFormError(text.genericError);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <section
        className="border border-gold/60 bg-gold/10 p-6 text-black"
        aria-labelledby="booking-success-title"
        role="status"
      >
        <h2 id="booking-success-title" className="text-xl font-semibold text-navy">
          {text.successTitle}
        </h2>
        <p className="mt-4 text-sm leading-7 text-black/75">{text.successText}</p>
      </section>
    );
  }

  return (
    <form className="border border-black/10 bg-surface p-6" onSubmit={handleSubmit} noValidate>
      {formError ? (
        <div
          className="mb-6 border border-red-700/40 bg-red-50 p-4 text-sm text-red-900"
          role="alert"
          aria-labelledby="booking-error-summary"
        >
          <h2 id="booking-error-summary" className="font-semibold">
            {formError}
          </h2>
          {errorEntries.length > 0 ? (
            <ul className="mt-3 list-disc space-y-1 ps-5">
              {errorEntries.map(([field, message]) => (
                <li key={field}>
                  <a href={`#${field}`} className="underline underline-offset-4">
                    {message}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <p className="mb-6 border border-gold/50 bg-gold/10 p-4 text-sm leading-6 text-black/75">
        {text.pendingNotice}
      </p>

      <input
        type="text"
        name="companyWebsite"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Field id="fullName" label={text.fullName} error={fieldErrors.fullName} required>
          <input id="fullName" name="fullName" className="field-input" required />
        </Field>
        <Field id="email" label={text.email} error={fieldErrors.email} required>
          <input id="email" name="email" type="email" className="field-input" required />
        </Field>
        <Field id="telephone" label={text.telephone} error={fieldErrors.telephone} required>
          <input id="telephone" name="telephone" type="tel" className="field-input" required />
        </Field>
        <Field id="expertiseKey" label={text.expertise} error={fieldErrors.expertiseKey} required>
          <select id="expertiseKey" name="expertiseKey" className="field-input" required>
            <option value="">{locale === "fr" ? "Sélectionner" : "اختر"}</option>
            {expertiseOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="preferredLawyerCode" label={text.lawyer} error={fieldErrors.preferredLawyerCode}>
          <select id="preferredLawyerCode" name="preferredLawyerCode" className="field-input" defaultValue="no_preference">
            {lawyerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="consultationType" label={text.consultationType} error={fieldErrors.consultationType}>
          <select id="consultationType" name="consultationType" className="field-input" defaultValue="office">
            <option value="office">{text.office}</option>
            <option value="online">{text.online}</option>
          </select>
        </Field>
        <Field id="requestedDate" label={text.requestedDate} error={fieldErrors.requestedDate} required>
          <input id="requestedDate" name="requestedDate" type="date" className="field-input" required />
        </Field>
        <Field id="requestedTime" label={text.requestedTime} error={fieldErrors.requestedTime} required>
          <input id="requestedTime" name="requestedTime" type="time" className="field-input" required />
        </Field>
        <Field id="paymentPreference" label={text.payment} error={fieldErrors.paymentPreference}>
          <select id="paymentPreference" name="paymentPreference" className="field-input" defaultValue="undecided">
            {paymentOptions[locale].map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id="reason" label={text.reason} error={fieldErrors.reason} className="md:col-span-2">
          <textarea
            id="reason"
            name="reason"
            maxLength={500}
            rows={5}
            className="field-input resize-y"
            aria-describedby="reason-help reason-count"
            onChange={(event) => setReasonLength(event.currentTarget.value.length)}
          />
          <p id="reason-help" className="mt-2 text-xs text-black/60">
            {text.reasonHelp}
          </p>
          <p id="reason-count" className="mt-1 text-xs text-black/60">
            {reasonLength}/500
          </p>
        </Field>
      </div>

      <label className="mt-6 flex gap-3 text-sm leading-6 text-black/70">
        <input
          id="privacyConsent"
          name="privacyConsent"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 accent-[var(--gold)]"
          aria-describedby={fieldErrors.privacyConsent ? "privacyConsent-error" : undefined}
        />
        <span>{text.consent}</span>
      </label>
      {fieldErrors.privacyConsent ? (
        <p id="privacyConsent-error" className="mt-2 text-sm text-red-800">
          {fieldErrors.privacyConsent}
        </p>
      ) : null}

      <p className="mt-6 border border-black/10 bg-surface-muted p-4 text-sm leading-6 text-black/70">
        {text.weekendNotice}
      </p>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-5 border border-gold bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:bg-ivory disabled:cursor-not-allowed disabled:border-black/20 disabled:bg-black/10 disabled:text-black/50"
      >
        {isSubmitting ? text.sending : text.submit}
      </button>
    </form>
  );
}

function Field({
  id,
  label,
  error,
  required,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
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
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function toFieldErrors(errors: ApiFieldError[], locale: Locale): FieldErrors {
  const result: FieldErrors = {};

  for (const error of errors) {
    result[error.field] = fieldErrorLabels[error.code]?.[locale] ?? error.code;
  }

  return result;
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;

    return value.toString(16);
  });
}
