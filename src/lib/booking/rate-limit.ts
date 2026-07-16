import { createHmac } from "node:crypto";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseFunctions } from "@/lib/supabase/schema";

export const BOOKING_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
export const BOOKING_RATE_LIMIT_MAX_REQUESTS = 5;

export type BookingRateLimitDecision = {
  allowed: boolean;
  count: number;
  windowStart: Date;
  windowEnd: Date;
};

export type BookingRateLimitCheck = {
  networkIdentifier: string;
  normalizedEmail: string;
  now?: Date;
};

export type BookingRateLimiter = {
  check(input: BookingRateLimitCheck): Promise<BookingRateLimitDecision>;
};

export class BookingRateLimitConfigurationError extends Error {
  constructor() {
    super("BOOKING_RATE_LIMIT_SECRET is not configured.");
    this.name = "BookingRateLimitConfigurationError";
  }
}

export class BookingRateLimitStoreError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BookingRateLimitStoreError";
  }
}

export function createBookingRateLimitSubjectHash(input: {
  networkIdentifier: string;
  normalizedEmail: string;
  windowStart: Date;
  secret: string;
}) {
  const hmac = createHmac("sha256", input.secret);
  hmac.update("booking-rate-limit");
  hmac.update("\0");
  hmac.update(input.networkIdentifier);
  hmac.update("\0");
  hmac.update(input.normalizedEmail);
  hmac.update("\0");
  hmac.update(input.windowStart.toISOString());

  return hmac.digest("hex");
}

export function getRateLimitWindow(now = new Date()) {
  const windowStartMs =
    Math.floor(now.getTime() / BOOKING_RATE_LIMIT_WINDOW_MS) *
    BOOKING_RATE_LIMIT_WINDOW_MS;
  const windowStart = new Date(windowStartMs);
  const windowEnd = new Date(windowStartMs + BOOKING_RATE_LIMIT_WINDOW_MS);

  return { windowStart, windowEnd };
}

export function createSupabaseBookingRateLimiter(): BookingRateLimiter {
  return {
    async check(input) {
      const secret = process.env.BOOKING_RATE_LIMIT_SECRET?.trim();

      if (!secret) {
        throw new BookingRateLimitConfigurationError();
      }

      const client = createSupabaseServerClient();

      if (!client) {
        throw new BookingRateLimitStoreError("Supabase service-role client is not configured.");
      }

      const { windowStart, windowEnd } = getRateLimitWindow(input.now);
      const subjectHash = createBookingRateLimitSubjectHash({
        networkIdentifier: input.networkIdentifier,
        normalizedEmail: input.normalizedEmail,
        windowStart,
        secret,
      });

      const { data, error } = await client.rpc(databaseFunctions.incrementBookingRateLimit, {
        p_subject_hash: subjectHash,
        p_window_start: windowStart.toISOString(),
        p_window_end: windowEnd.toISOString(),
        p_limit: BOOKING_RATE_LIMIT_MAX_REQUESTS,
      });

      if (error) {
        throw new BookingRateLimitStoreError("Unable to apply booking rate limit.", {
          cause: error,
        });
      }

      const row = Array.isArray(data) ? data[0] : data;

      return {
        allowed: Boolean(row?.allowed),
        count: Number(row?.request_count ?? BOOKING_RATE_LIMIT_MAX_REQUESTS),
        windowStart,
        windowEnd,
      };
    },
  };
}

export function getNetworkIdentifier(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();

  return forwarded || realIp || "unknown";
}
