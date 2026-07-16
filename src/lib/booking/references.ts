import { randomBytes } from "node:crypto";

export function generatePublicBookingReference(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, "");
  const random = randomBytes(4).toString("hex").toUpperCase();

  return `THM-${date}-${random}`;
}

export function getBookingNotificationKeys(requestIdempotencyKey: string) {
  return {
    client: `booking:${requestIdempotencyKey}:client-request-received`,
    admin: `booking:${requestIdempotencyKey}:admin-new-request`,
  };
}
