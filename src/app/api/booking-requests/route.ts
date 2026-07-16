import { NextResponse } from "next/server";
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

    const persistence = deps.persistence ?? createSupabaseBookingPersistence();

    if (await persistence.hasExistingBookingRequest(validation.data.requestIdempotencyKey)) {
      return jsonResponse(200, "BOOKING_REQUEST_RECEIVED");
    }

    const adminEmail = deps.adminEmail?.() ?? process.env.ADMIN_NOTIFICATION_EMAIL?.trim() ?? null;

    if (!adminEmail) {
      return jsonResponse(500, "BOOKING_SERVER_ERROR");
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
    } catch {
      return jsonResponse(500, "BOOKING_SERVER_ERROR");
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
      return jsonResponse(500, "BOOKING_SERVER_ERROR");
    }

    if (persistenceResult.status === "idempotent") {
      return jsonResponse(200, "BOOKING_REQUEST_RECEIVED");
    }

    await sendBookingEmails({
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

    await input.persistence.updateNotificationDelivery({
      idempotencyKey: item.key,
      status: result.ok ? "sent" : "failed",
      providerId: result.ok ? result.providerId ?? null : null,
      errorCode: result.ok ? null : result.errorCode,
    });
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
