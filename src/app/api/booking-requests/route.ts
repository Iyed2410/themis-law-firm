import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import {
  assertBookingRuntimeConfiguration,
  BookingConfigurationError,
} from "@/lib/booking/config";
import {
  getBookingNotificationKeys,
  generatePublicBookingReference,
} from "@/lib/booking/references";
import {
  createSupabaseBookingPersistence,
  type BookingPersistence,
} from "@/lib/booking/persistence";
import {
  createSupabaseBookingRateLimiter,
  getNetworkIdentifier,
  type BookingRateLimiter,
} from "@/lib/booking/rate-limit";
import {
  isHoneypotFilled,
  validateBookingRequest,
  type BookingFieldError,
  type NormalizedBookingRequest,
} from "@/lib/booking/validation";
import { createEmailProvider } from "@/lib/email";
import {
  createAdminPendingRequestEmail,
  createClientRequestReceivedEmail,
  type EmailProvider,
} from "@/lib/email/provider";

const MAX_BOOKING_BODY_BYTES = 16 * 1024;

export type BookingPublicCode =
  | "BOOKING_REQUEST_RECEIVED"
  | "BOOKING_INVALID_JSON"
  | "BOOKING_INVALID_CONTENT_TYPE"
  | "BOOKING_REQUEST_TOO_LARGE"
  | "BOOKING_VALIDATION_FAILED"
  | "BOOKING_RATE_LIMITED"
  | "BOOKING_CONFIGURATION_ERROR"
  | "BOOKING_RATE_LIMIT_ERROR"
  | "BOOKING_PERSISTENCE_ERROR"
  | "BOOKING_SERVER_ERROR";

export type BookingHandlerDependencies = {
  persistence?: BookingPersistence;
  rateLimiter?: BookingRateLimiter;
  emailProvider?: EmailProvider;
  now?: () => Date;
  adminEmail?: () => string | null;
  networkIdentifier?: (headers: Headers) => string;
  publicReference?: (now: Date) => string;
};

export function createBookingRequestHandler(deps: BookingHandlerDependencies = {}) {
  return async function POST(request: Request) {
    const correlationId = createCorrelationId();
    const now = deps.now?.() ?? new Date();
    const contentType = request.headers.get("content-type") ?? "";

    if (!contentType.toLowerCase().includes("application/json")) {
      return jsonResponse(415, "BOOKING_INVALID_CONTENT_TYPE");
    }

    const contentLength = Number(request.headers.get("content-length") ?? "0");

    if (contentLength > MAX_BOOKING_BODY_BYTES) {
      return jsonResponse(413, "BOOKING_REQUEST_TOO_LARGE");
    }

    const rawBody = await request.text();

    if (new TextEncoder().encode(rawBody).byteLength > MAX_BOOKING_BODY_BYTES) {
      return jsonResponse(413, "BOOKING_REQUEST_TOO_LARGE");
    }

    const parsedBody = parseJsonBody(rawBody);

    if (!parsedBody.ok) {
      return jsonResponse(400, "BOOKING_INVALID_JSON");
    }

    if (isHoneypotFilled(parsedBody.value)) {
      return jsonResponse(202, "BOOKING_REQUEST_RECEIVED");
    }

    const validation = validateBookingRequest(parsedBody.value, now);

    if (!validation.ok) {
      return validationResponse(validation.errors);
    }

    try {
      assertBookingRuntimeConfiguration({
        requireSupabase: !deps.persistence || !deps.rateLimiter,
        requireRateLimitSecret: !deps.rateLimiter,
        requireAdminEmail: !deps.adminEmail,
        requireEmailProvider: !deps.emailProvider,
      });
    } catch (error) {
      logBookingDiagnostic({
        correlationId,
        stage: "configuration",
        category: error instanceof BookingConfigurationError ? "configuration_error" : "unexpected_error",
        error,
      });

      return jsonResponse(500, "BOOKING_CONFIGURATION_ERROR");
    }

    const persistence = deps.persistence ?? createSupabaseBookingPersistence();

    try {
      if (await persistence.hasExistingBookingRequest(validation.data.requestIdempotencyKey)) {
        return jsonResponse(200, "BOOKING_REQUEST_RECEIVED");
      }
    } catch (error) {
      logBookingDiagnostic({
        correlationId,
        stage: "idempotency_lookup",
        category: "supabase_error",
        error,
      });

      return jsonResponse(500, "BOOKING_PERSISTENCE_ERROR");
    }

    const adminEmail = deps.adminEmail?.() ?? process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? null;

    if (!adminEmail) {
      logBookingDiagnostic({
        correlationId,
        stage: "configuration",
        category: "configuration_error",
      });

      return jsonResponse(500, "BOOKING_CONFIGURATION_ERROR");
    }

    const rateLimiter = deps.rateLimiter ?? createSupabaseBookingRateLimiter();
    const networkIdentifier =
      deps.networkIdentifier?.(request.headers) ?? getNetworkIdentifier(request.headers);

    try {
      const decision = await rateLimiter.check({
        networkIdentifier,
        normalizedEmail: validation.data.email,
        now,
      });

      if (!decision.allowed) {
        return jsonResponse(429, "BOOKING_RATE_LIMITED");
      }
    } catch (error) {
      logBookingDiagnostic({
        correlationId,
        stage: "rate_limit",
        category: "supabase_error",
        error,
      });

      return jsonResponse(500, "BOOKING_RATE_LIMIT_ERROR");
    }

    const notificationKeys = getBookingNotificationKeys(validation.data.requestIdempotencyKey);
    const persistenceResult = await persistence.createBookingRequest({
      booking: validation.data,
      publicReference: deps.publicReference?.(now) ?? generatePublicBookingReference(now),
      clientNotificationKey: notificationKeys.client,
      adminNotificationKey: notificationKeys.admin,
      adminEmail,
      now,
    });

    if (!persistenceResult.ok) {
      logBookingDiagnostic({
        correlationId,
        stage: "booking_persistence",
        category: "supabase_error",
        supabaseCode: persistenceResult.supabaseCode,
      });

      return jsonResponse(500, "BOOKING_PERSISTENCE_ERROR");
    }

    if (persistenceResult.status === "idempotent") {
      return jsonResponse(200, "BOOKING_REQUEST_RECEIVED");
    }

    await sendBookingEmails({
      correlationId,
      booking: validation.data,
      adminEmail,
      notificationKeys,
      persistence,
      emailProvider: deps.emailProvider ?? createEmailProvider(),
    });

    return jsonResponse(201, "BOOKING_REQUEST_RECEIVED");
  };
}

export const POST = createBookingRequestHandler();

async function sendBookingEmails(input: {
  correlationId: string;
  booking: NormalizedBookingRequest;
  adminEmail: string;
  notificationKeys: { client: string; admin: string };
  persistence: BookingPersistence;
  emailProvider: EmailProvider;
}) {
  const messages = [
    {
      key: input.notificationKeys.client,
      message: createClientRequestReceivedEmail(input.booking),
    },
    {
      key: input.notificationKeys.admin,
      message: createAdminPendingRequestEmail({
        booking: input.booking,
        adminEmail: input.adminEmail,
      }),
    },
  ];

  for (const item of messages) {
    const result = await input.emailProvider
      .send(item.message)
      .catch(() => ({ ok: false as const, errorCode: "email_provider_failed" }));

    if (!result.ok) {
      logBookingDiagnostic({
        correlationId: input.correlationId,
        stage: item.message.kind === "client_request_received" ? "email_client" : "email_admin",
        category: "email_provider_error",
      });
    }

    try {
      await input.persistence.updateNotificationDelivery({
        idempotencyKey: item.key,
        status: result.ok ? "sent" : "failed",
        providerId: result.ok ? result.providerId ?? null : null,
        errorCode: result.ok ? null : result.errorCode,
      });
    } catch (error) {
      logBookingDiagnostic({
        correlationId: input.correlationId,
        stage: "notification_update",
        category: "supabase_error",
        error,
      });
    }
  }
}

function parseJsonBody(rawBody: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(rawBody) };
  } catch {
    return { ok: false };
  }
}

function validationResponse(errors: BookingFieldError[]) {
  return NextResponse.json(
    {
      code: "BOOKING_VALIDATION_FAILED" satisfies BookingPublicCode,
      errors,
    },
    { status: 422 }
  );
}

function jsonResponse(status: number, code: BookingPublicCode) {
  return NextResponse.json({ code }, { status });
}

function createCorrelationId() {
  return `booking_${randomBytes(8).toString("hex")}`;
}

function logBookingDiagnostic(input: {
  correlationId: string;
  stage:
    | "configuration"
    | "rate_limit"
    | "idempotency_lookup"
    | "booking_persistence"
    | "email_client"
    | "email_admin"
    | "notification_update";
  category:
    | "configuration_error"
    | "supabase_error"
    | "email_provider_error"
    | "unexpected_error";
  error?: unknown;
  supabaseCode?: string;
}) {
  console.error(
    JSON.stringify({
      event: "booking_request_error",
      correlationId: input.correlationId,
      stage: input.stage,
      category: input.category,
      supabaseCode: input.supabaseCode ?? getSupabaseErrorCode(input.error) ?? null,
    })
  );
}

function getSupabaseErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  const directCode = (error as { supabaseCode?: unknown; code?: unknown }).supabaseCode;

  if (typeof directCode === "string") {
    return directCode;
  }

  const code = (error as { code?: unknown }).code;

  return typeof code === "string" ? code : undefined;
}
