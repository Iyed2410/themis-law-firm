import { describe, expect, it } from "vitest";
import { createBookingRequestHandler } from "@/app/api/booking-requests/route";
import type { BookingPersistence, PersistBookingRequestInput } from "@/lib/booking/persistence";
import type { BookingRateLimiter } from "@/lib/booking/rate-limit";
import type { EmailProvider } from "@/lib/email/provider";

const now = new Date("2026-07-16T08:00:00.000Z");

function validPayload(overrides: Record<string, unknown> = {}) {
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

function makeRequest(payload: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/booking-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.8",
      ...headers,
    },
    body: typeof payload === "string" ? payload : JSON.stringify(payload),
  });
}

function createFakes(options: {
  persistenceStatus?: "created" | "idempotent" | "failed";
  rateAllowed?: boolean;
  emailOk?: boolean;
} = {}) {
  const createdInputs: PersistBookingRequestInput[] = [];
  const notificationUpdates: Array<{ idempotencyKey: string; status: string }> = [];
  const emails: string[] = [];
  const existingKeys = new Set<string>();
  const persistence: BookingPersistence = {
    async hasExistingBookingRequest(requestIdempotencyKey) {
      return existingKeys.has(requestIdempotencyKey);
    },
    async createBookingRequest(input) {
      createdInputs.push(input);
      if (options.persistenceStatus === "failed") {
        return { ok: false, code: "persistence_failed" };
      }
      return { ok: true, status: options.persistenceStatus ?? "created" };
    },
    async updateNotificationDelivery(input) {
      notificationUpdates.push({
        idempotencyKey: input.idempotencyKey,
        status: input.status,
      });
    },
  };
  const rateLimiter: BookingRateLimiter = {
    async check() {
      return {
        allowed: options.rateAllowed ?? true,
        count: options.rateAllowed === false ? 6 : 1,
        windowStart: now,
        windowEnd: new Date(now.getTime() + 15 * 60 * 1000),
      };
    },
  };
  const emailProvider: EmailProvider = {
    async send(message) {
      emails.push(message.kind);
      if (options.emailOk === false) {
        return { ok: false, errorCode: "test_provider_failed" };
      }
      return { ok: true, providerId: `test:${message.kind}` };
    },
  };
  const handler = createBookingRequestHandler({
    persistence,
    rateLimiter,
    emailProvider,
    now: () => now,
    adminEmail: () => "admin@example.com",
    publicReference: () => "THM-TEST",
    networkIdentifier: () => "203.0.113.8",
  });

  return { handler, createdInputs, notificationUpdates, emails };
}

describe("POST /api/booking-requests", () => {
  it("creates one pending request, one audit-backed RPC call, two notification records, and sends two emails", async () => {
    const fakes = createFakes();
    const response = await fakes.handler(makeRequest(validPayload()));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({ code: "BOOKING_REQUEST_RECEIVED" });
    expect(JSON.stringify(body)).not.toContain("11111111");
    expect(fakes.createdInputs).toHaveLength(1);
    expect(fakes.createdInputs[0].booking.timing.isWeekendRequest).toBe(false);
    expect(fakes.createdInputs[0].booking.paymentPreference).toBe("undecided");
    expect(fakes.emails).toEqual(["client_request_received", "admin_pending_request"]);
    expect(fakes.notificationUpdates.map((item) => item.status)).toEqual(["sent", "sent"]);
  });

  it("flags weekend requests while leaving status as pending-only request data", async () => {
    const fakes = createFakes();
    const response = await fakes.handler(
      makeRequest(validPayload({ requestedDate: "2026-07-18" }))
    );

    expect(response.status).toBe(201);
    expect(fakes.createdInputs[0].booking.timing.isWeekendRequest).toBe(true);
  });

  it("returns validation errors without persistence", async () => {
    const fakes = createFakes();
    const response = await fakes.handler(makeRequest(validPayload({ email: "bad" })));
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body.code).toBe("BOOKING_VALIDATION_FAILED");
    expect(body.errors).toContainEqual({ field: "email", code: "invalid_email" });
    expect(fakes.createdInputs).toHaveLength(0);
  });

  it("honeypot returns neutral success with no persistence or email", async () => {
    const fakes = createFakes();
    const response = await fakes.handler(
      makeRequest(validPayload({ honeypot: "filled" }))
    );

    expect(response.status).toBe(202);
    expect(await response.json()).toEqual({ code: "BOOKING_REQUEST_RECEIVED" });
    expect(fakes.createdInputs).toHaveLength(0);
    expect(fakes.emails).toHaveLength(0);
  });

  it("rate limiting returns 429 before persistence", async () => {
    const fakes = createFakes({ rateAllowed: false });
    const response = await fakes.handler(makeRequest(validPayload()));

    expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ code: "BOOKING_RATE_LIMITED" });
    expect(fakes.createdInputs).toHaveLength(0);
  });

  it("duplicate idempotency result returns neutral success and does not resend emails", async () => {
    const fakes = createFakes({ persistenceStatus: "idempotent" });
    const response = await fakes.handler(makeRequest(validPayload()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ code: "BOOKING_REQUEST_RECEIVED" });
    expect(fakes.createdInputs).toHaveLength(1);
    expect(fakes.emails).toHaveLength(0);
    expect(fakes.notificationUpdates).toHaveLength(0);
  });

  it("existing idempotency key returns before rate limiting", async () => {
    const createdInputs: PersistBookingRequestInput[] = [];
    const persistence: BookingPersistence = {
      async hasExistingBookingRequest() {
        return true;
      },
      async createBookingRequest(input) {
        createdInputs.push(input);
        return { ok: true, status: "created" };
      },
      async updateNotificationDelivery() {
        throw new Error("should not update");
      },
    };
    const handler = createBookingRequestHandler({
      persistence,
      rateLimiter: {
        async check() {
          throw new Error("rate limiter should not be called");
        },
      },
      emailProvider: {
        async send() {
          throw new Error("email should not be called");
        },
      },
      now: () => now,
      adminEmail: () => "admin@example.com",
    });
    const response = await handler(makeRequest(validPayload()));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ code: "BOOKING_REQUEST_RECEIVED" });
    expect(createdInputs).toHaveLength(0);
  });

  it("persistence failure returns no false success", async () => {
    const fakes = createFakes({ persistenceStatus: "failed" });
    const response = await fakes.handler(makeRequest(validPayload()));

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ code: "BOOKING_SERVER_ERROR" });
    expect(fakes.emails).toHaveLength(0);
  });

  it("provider failure preserves the booking and marks notification failures", async () => {
    const fakes = createFakes({ emailOk: false });
    const response = await fakes.handler(makeRequest(validPayload()));

    expect(response.status).toBe(201);
    expect(fakes.createdInputs).toHaveLength(1);
    expect(fakes.notificationUpdates.map((item) => item.status)).toEqual(["failed", "failed"]);
  });

  it("accepts JSON only and rejects malformed or oversized bodies", async () => {
    const fakes = createFakes();
    const nonJson = await fakes.handler(makeRequest(validPayload(), { "Content-Type": "text/plain" }));
    const malformed = await fakes.handler(makeRequest("{", { "Content-Type": "application/json" }));
    const oversized = await fakes.handler(
      new Request("http://localhost/api/booking-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": "20000",
        },
        body: "{}",
      })
    );

    expect(nonJson.status).toBe(415);
    expect(malformed.status).toBe(400);
    expect(oversized.status).toBe(413);
  });
});
