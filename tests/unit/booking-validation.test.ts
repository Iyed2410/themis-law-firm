import { describe, expect, it } from "vitest";
import { validateBookingRequest } from "@/lib/booking/validation";
import { parseRequestedDateTime } from "@/lib/booking/time";

const now = new Date("2026-07-16T08:00:00.000Z");

function validRequest(overrides: Record<string, unknown> = {}) {
  return {
    locale: "fr",
    fullName: "Client Example",
    email: "client@example.com",
    telephone: "+216 22 333 444",
    expertiseKey: "droit-civil",
    preferredLawyerCode: "no_preference",
    consultationType: "office",
    requestedDate: "2026-07-17",
    requestedTime: "10:30",
    paymentPreference: "undecided",
    reason: "Question courte.",
    privacyConsent: true,
    honeypot: "",
    requestIdempotencyKey: "11111111-1111-4111-8111-111111111111",
    ...overrides,
  };
}

function expectInvalid(overrides: Record<string, unknown>, code: string) {
  const result = validateBookingRequest(validRequest(overrides), now);

  expect(result.ok).toBe(false);
  if (!result.ok) {
    expect(result.errors.map((error) => error.code)).toContain(code);
  }
}

describe("booking validation", () => {
  it("accepts a valid French request", () => {
    const result = validateBookingRequest(validRequest(), now);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.locale).toBe("fr");
      expect(result.data.timing.isWeekendRequest).toBe(false);
    }
  });

  it("accepts a valid Arabic request", () => {
    const result = validateBookingRequest(validRequest({ locale: "ar" }), now);

    expect(result.ok).toBe(true);
  });

  it("rejects invalid locale, email, telephone, expertise, payment, lawyer, consent, and long reason", () => {
    expectInvalid({ locale: "en" }, "invalid_locale");
    expectInvalid({ email: "bad" }, "invalid_email");
    expectInvalid({ telephone: "abc" }, "invalid_telephone");
    expectInvalid({ expertiseKey: "unknown" }, "unknown_expertise");
    expectInvalid({ paymentPreference: "crypto" }, "unknown_payment_preference");
    expectInvalid({ preferredLawyerCode: "b6e7d8d4-2db5-4eca-a8d0-f1d5f4fd2581" }, "unknown_lawyer");
    expectInvalid({ privacyConsent: false }, "missing_consent");
    expectInvalid({ reason: "x".repeat(501) }, "too_long");
  });

  it("rejects malformed and past date/time values", () => {
    expectInvalid({ requestedDate: "2026-99-99" }, "invalid_or_past_datetime");
    expectInvalid({ requestedTime: "25:00" }, "invalid_or_past_datetime");
    expectInvalid({ requestedDate: "2026-07-15" }, "invalid_or_past_datetime");
  });
});

describe("booking timezone and weekend rules", () => {
  it("treats weekday requests as non-weekend and pending-only data", () => {
    const parsed = parseRequestedDateTime("2026-07-17", "09:00", now);

    expect(parsed?.isWeekendRequest).toBe(false);
  });

  it("flags Saturday and Sunday for manual approval", () => {
    expect(parseRequestedDateTime("2026-07-18", "09:00", now)?.isWeekendRequest).toBe(true);
    expect(parseRequestedDateTime("2026-07-19", "09:00", now)?.isWeekendRequest).toBe(true);
  });
});
