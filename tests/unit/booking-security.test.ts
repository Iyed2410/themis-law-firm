import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("booking security boundaries", () => {
  it("keeps privileged booking modules out of the client booking component", () => {
    const source = readFileSync("src/components/booking/BookingRequestForm.tsx", "utf8");

    expect(source).not.toContain("@/lib/supabase");
    expect(source).not.toContain("@/lib/booking/persistence");
    expect(source).not.toContain("@/lib/booking/rate-limit");
    expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("does not use process-local rate-limit counters", () => {
    const source = readFileSync("src/lib/booking/rate-limit.ts", "utf8");

    expect(source).not.toContain("new Map");
    expect(source).not.toContain("Map<");
    expect(source).toContain("incrementBookingRateLimit");
  });

  it("does not expose anonymous direct appointment insert code in the public route", () => {
    const source = readFileSync("src/app/api/booking-requests/route.ts", "utf8");

    expect(source).not.toContain(".from(\"appointments\").insert");
    expect(source).not.toContain(".from('appointments').insert");
    expect(source).not.toContain("auth.signIn");
  });
});
