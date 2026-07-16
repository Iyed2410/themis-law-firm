import { createSupabaseServerClient } from "@/lib/supabase/server";
import { databaseFunctions, databaseSchema } from "@/lib/supabase/schema";
import type { NormalizedBookingRequest } from "@/lib/booking/validation";

export type PersistBookingRequestInput = {
  booking: NormalizedBookingRequest;
  publicReference: string;
  clientNotificationKey: string;
  adminNotificationKey: string;
  adminEmail: string;
  now: Date;
};

export type PersistBookingRequestResult =
  | { ok: true; status: "created" | "idempotent" }
  | { ok: false; code: "persistence_failed" };

export type NotificationDeliveryUpdate = {
  idempotencyKey: string;
  status: "sent" | "failed";
  providerId?: string | null;
  errorCode?: string | null;
};

export type BookingPersistence = {
  hasExistingBookingRequest(requestIdempotencyKey: string): Promise<boolean>;
  createBookingRequest(
    input: PersistBookingRequestInput
  ): Promise<PersistBookingRequestResult>;
  updateNotificationDelivery(input: NotificationDeliveryUpdate): Promise<void>;
};

export function createSupabaseBookingPersistence(): BookingPersistence {
  return {
    async hasExistingBookingRequest(requestIdempotencyKey) {
      const client = createSupabaseServerClient();

      if (!client) {
        return false;
      }

      const { data, error } = await client
        .from(databaseSchema.appointments)
        .select("request_idempotency_key")
        .eq("request_idempotency_key", requestIdempotencyKey)
        .maybeSingle();

      if (error) {
        return false;
      }

      return Boolean(data);
    },

    async createBookingRequest(input) {
      const client = createSupabaseServerClient();

      if (!client) {
        return { ok: false, code: "persistence_failed" };
      }

      const { booking } = input;
      const { data, error } = await client.rpc(databaseFunctions.createPublicBookingRequest, {
        p_public_reference: input.publicReference,
        p_request_idempotency_key: booking.requestIdempotencyKey,
        p_client_language: booking.locale,
        p_client_name: booking.fullName,
        p_client_email: booking.email,
        p_client_phone: booking.telephone,
        p_expertise_key: booking.expertiseKey,
        p_consultation_type: booking.consultationType,
        p_requested_start_at: booking.timing.requestedStartAt.toISOString(),
        p_requested_local_date: booking.timing.requestedLocalDate,
        p_requested_local_time: `${booking.timing.requestedLocalTime}:00`,
        p_payment_preference: booking.paymentPreference,
        p_client_message: booking.reason,
        p_privacy_consent_at: input.now.toISOString(),
        p_is_weekend_request: booking.timing.isWeekendRequest,
        p_client_notification_key: input.clientNotificationKey,
        p_admin_notification_key: input.adminNotificationKey,
        p_admin_email: input.adminEmail,
      });

      if (error) {
        return { ok: false, code: "persistence_failed" };
      }

      const row = Array.isArray(data) ? data[0] : data;
      const resultCode = row?.result_code;

      if (resultCode === "created" || resultCode === "idempotent") {
        return { ok: true, status: resultCode };
      }

      return { ok: false, code: "persistence_failed" };
    },

    async updateNotificationDelivery(input) {
      const client = createSupabaseServerClient();

      if (!client) {
        return;
      }

      await client
        .from(databaseSchema.notificationDeliveries)
        .update({
          delivery_status: input.status,
          sent_at: input.status === "sent" ? new Date().toISOString() : null,
          provider_id: input.providerId ?? null,
          error_code: input.errorCode ?? null,
        })
        .eq("idempotency_key", input.idempotencyKey);
    },
  };
}
