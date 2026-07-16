import { describe, expect, it, vi } from "vitest";
import {
  createAdminPendingRequestEmail,
  createClientRequestReceivedEmail,
} from "@/lib/email/provider";
import { createConsoleEmailProvider } from "@/lib/email/console-provider";
import { validateBookingRequest } from "@/lib/booking/validation";

const now = new Date("2026-07-16T08:00:00.000Z");
const baseRequest = {
  locale: "fr",
  fullName: "Sensitive Name",
  email: "client@example.com",
  telephone: "+216 22 333 444",
  expertiseKey: "droit-civil",
  preferredLawyerCode: "no_preference",
  consultationType: "office",
  requestedDate: "2026-07-17",
  requestedTime: "10:30",
  paymentPreference: "undecided",
  reason: "Sensitive legal reason",
  privacyConsent: true,
  honeypot: "",
  requestIdempotencyKey: "11111111-1111-4111-8111-111111111111",
} as const;

function booking(locale: "fr" | "ar" = "fr") {
  const result = validateBookingRequest({ ...baseRequest, locale }, now);

  if (!result.ok) throw new Error("invalid test booking");

  return result.data;
}

describe("booking emails", () => {
  it("creates French and Arabic request-received emails without confirmation language", () => {
    const french = createClientRequestReceivedEmail(booking("fr"));
    const arabic = createClientRequestReceivedEmail(booking("ar"));

    expect(french.subject).toContain("demande de rendez-vous reçue");
    expect(arabic.subject).toContain("تم استلام طلب الموعد");
    expect(french.text.toLowerCase()).not.toContain("confirmé");
    expect(french.text.toLowerCase()).not.toContain("confirmation");
    expect(arabic.text).not.toContain("تأكيد");
  });

  it("creates an admin pending-request email without sensitive reason details", () => {
    const message = createAdminPendingRequestEmail({
      booking: booking("fr"),
      adminEmail: "admin@example.com",
    });

    expect(message.subject).toContain("nouvelle demande en attente");
    expect(message.text).toContain("Nouvelle demande");
    expect(message.text).not.toContain("Sensitive legal reason");
    expect(message.subject).not.toContain("Sensitive");
  });

  it("console provider masks recipients and does not print full PII or reason text", async () => {
    const spy = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const provider = createConsoleEmailProvider();

    await provider.send(createClientRequestReceivedEmail(booking("fr")));

    const output = spy.mock.calls.map((call) => call.join(" ")).join("\n");
    expect(output).toContain("c***@example.com");
    expect(output).not.toContain("Sensitive Name");
    expect(output).not.toContain("Sensitive legal reason");
    expect(output).not.toContain("+216");
    spy.mockRestore();
  });
});
