import { describe, expect, it } from "vitest";
import {
  BOOKING_RATE_LIMIT_MAX_REQUESTS,
  BOOKING_RATE_LIMIT_WINDOW_MS,
  createBookingRateLimitSubjectHash,
  getRateLimitWindow,
} from "@/lib/booking/rate-limit";

describe("booking rate-limit design", () => {
  it("uses a 15 minute window with five requests per subject", () => {
    expect(BOOKING_RATE_LIMIT_WINDOW_MS).toBe(15 * 60 * 1000);
    expect(BOOKING_RATE_LIMIT_MAX_REQUESTS).toBe(5);
  });

  it("builds privacy-preserving HMAC subject hashes", () => {
    const windowStart = new Date("2026-07-16T08:00:00.000Z");
    const hash = createBookingRateLimitSubjectHash({
      networkIdentifier: "203.0.113.5",
      normalizedEmail: "client@example.com",
      windowStart,
      secret: "test-secret",
    });

    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain("203.0.113.5");
    expect(hash).not.toContain("client@example.com");
  });

  it("calculates stable durable rate-limit windows", () => {
    const window = getRateLimitWindow(new Date("2026-07-16T08:07:30.000Z"));

    expect(window.windowStart.toISOString()).toBe("2026-07-16T08:00:00.000Z");
    expect(window.windowEnd.toISOString()).toBe("2026-07-16T08:15:00.000Z");
  });
});
