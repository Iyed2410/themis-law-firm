import { z } from "zod";
import { siteContent } from "@/lib/content";
import { parseRequestedDateTime, type ParsedLocalDateTime } from "@/lib/booking/time";

export const bookingPaymentPreferences = [
  "flouci",
  "e_dinar",
  "bank_transfer",
  "cash",
  "undecided",
] as const;

export const bookingConsultationTypes = ["office", "online"] as const;
export const bookingPreferredLawyerCodes = ["no_preference"] as const;

export type BookingPaymentPreference = (typeof bookingPaymentPreferences)[number];
export type BookingConsultationType = (typeof bookingConsultationTypes)[number];
export type BookingPreferredLawyerCode = (typeof bookingPreferredLawyerCodes)[number];

export type BookingFieldError = {
  field: string;
  code: string;
};

export type NormalizedBookingRequest = {
  locale: "fr" | "ar";
  fullName: string;
  email: string;
  telephone: string;
  expertiseKey: string;
  preferredLawyerCode: BookingPreferredLawyerCode;
  consultationType: BookingConsultationType;
  requestedDate: string;
  requestedTime: string;
  paymentPreference: BookingPaymentPreference;
  reason: string;
  privacyConsent: true;
  requestIdempotencyKey: string;
  timing: ParsedLocalDateTime;
};

export type BookingValidationResult =
  | { ok: true; data: NormalizedBookingRequest }
  | { ok: false; errors: BookingFieldError[] };

const expertiseKeys = siteContent.expertises.map((item) => item.anchor);

const bookingRequestSchema = z.object({
  locale: z.enum(["fr", "ar"], { error: "invalid_locale" }),
  fullName: z
    .string({ error: "required" })
    .trim()
    .min(2, "too_short")
    .max(120, "too_long"),
  email: z.string({ error: "required" }).trim().toLowerCase().email("invalid_email"),
  telephone: z
    .string({ error: "required" })
    .trim()
    .min(6, "invalid_telephone")
    .max(30, "invalid_telephone")
    .regex(/^[+\d\s().-]+$/, "invalid_telephone"),
  expertiseKey: z.string({ error: "required" }).refine((value) => expertiseKeys.includes(value), {
    message: "unknown_expertise",
  }),
  preferredLawyerCode: z.enum(bookingPreferredLawyerCodes, {
    error: "unknown_lawyer",
  }),
  consultationType: z.enum(bookingConsultationTypes, {
    error: "invalid_consultation_type",
  }),
  requestedDate: z.string({ error: "required" }),
  requestedTime: z.string({ error: "required" }),
  paymentPreference: z.enum(bookingPaymentPreferences, {
    error: "unknown_payment_preference",
  }),
  reason: z.string().trim().max(500, "too_long").default(""),
  privacyConsent: z.literal(true, { error: "missing_consent" }),
  honeypot: z.string().optional().default(""),
  requestIdempotencyKey: z.string({ error: "required" }).uuid("invalid_idempotency_key"),
});

export function isHoneypotFilled(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const honeypot = (value as { honeypot?: unknown }).honeypot;

  return typeof honeypot === "string" && honeypot.trim().length > 0;
}

export function validateBookingRequest(
  input: unknown,
  now = new Date()
): BookingValidationResult {
  const parsed = bookingRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join(".") || "form",
        code: issue.message,
      })),
    };
  }

  const timing = parseRequestedDateTime(
    parsed.data.requestedDate,
    parsed.data.requestedTime,
    now
  );

  if (!timing) {
    return {
      ok: false,
      errors: [{ field: "requestedDate", code: "invalid_or_past_datetime" }],
    };
  }

  return {
    ok: true,
    data: {
      ...parsed.data,
      telephone: normalizeTelephone(parsed.data.telephone),
      timing,
    },
  };
}

export function normalizeTelephone(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
