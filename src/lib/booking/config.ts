export type BookingConfigurationCheck = {
  requireSupabase?: boolean;
  requireRateLimitSecret?: boolean;
  requireAdminEmail?: boolean;
  requireEmailProvider?: boolean;
};

export type BookingConfigurationIssue = {
  missing: string[];
  invalid: string[];
};

export class BookingConfigurationError extends Error {
  issue: BookingConfigurationIssue;

  constructor(issue: BookingConfigurationIssue) {
    super("Booking runtime configuration is incomplete.");
    this.name = "BookingConfigurationError";
    this.issue = issue;
  }
}

export function assertBookingRuntimeConfiguration(
  check: BookingConfigurationCheck = {}
) {
  const missing: string[] = [];
  const invalid: string[] = [];

  if (check.requireSupabase) {
    requirePresent("NEXT_PUBLIC_SUPABASE_URL", missing);
    requirePresent("SUPABASE_SERVICE_ROLE_KEY", missing);
    validateSupabaseUrl(invalid);
  }

  if (check.requireRateLimitSecret) {
    requirePresent("BOOKING_RATE_LIMIT_SECRET", missing);
  }

  if (check.requireAdminEmail) {
    requirePresent("ADMIN_NOTIFICATION_EMAIL", missing);
  }

  if (check.requireEmailProvider) {
    validateEmailProvider(missing, invalid);
  }

  if (missing.length > 0 || invalid.length > 0) {
    throw new BookingConfigurationError({ missing, invalid });
  }
}

function requirePresent(key: string, missing: string[]) {
  if (!process.env[key]?.trim()) {
    missing.push(key);
  }
}

function validateSupabaseUrl(invalid: string[]) {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

  if (!value) {
    return;
  }

  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
      invalid.push("NEXT_PUBLIC_SUPABASE_URL");
      return;
    }

    if (parsed.hostname === "example.supabase.co") {
      invalid.push("NEXT_PUBLIC_SUPABASE_URL");
    }
  } catch {
    invalid.push("NEXT_PUBLIC_SUPABASE_URL");
  }
}

function validateEmailProvider(missing: string[], invalid: string[]) {
  const mode = process.env.EMAIL_MODE?.trim().toLowerCase() || "console";

  if (mode === "console") {
    return;
  }

  if (mode !== "resend") {
    invalid.push("EMAIL_MODE");
    return;
  }

  requirePresent("EMAIL_FROM", missing);
  requirePresent("RESEND_API_KEY", missing);
}
