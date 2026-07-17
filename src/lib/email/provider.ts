import type { NormalizedBookingRequest } from "@/lib/booking/validation";

export type BookingEmailKind = "client_request_received" | "admin_pending_request";

export type BookingEmailMessage = {
  kind: BookingEmailKind;
  to: string;
  subject: string;
  text: string;
  html: string;
  locale: "fr" | "ar";
};

export type EmailSendResult =
  | { ok: true; providerId?: string }
  | { ok: false; errorCode: string };

export type EmailProvider = {
  send(message: BookingEmailMessage): Promise<EmailSendResult>;
};

export function createClientRequestReceivedEmail(
  booking: NormalizedBookingRequest
): BookingEmailMessage {
  const isFrench = booking.locale === "fr";
  const subject = isFrench
    ? "Themis Law Firm — demande de rendez-vous reçue"
    : "مكتب ثيميس للمحاماة — تم استلام طلب الموعد";
  const text = isFrench
    ? [
        "Nous avons reçu votre demande de rendez-vous.",
        "Elle sera examinée par l'équipe du cabinet avant toute validation.",
        "La date et l'heure demandées ne sont pas réservées à ce stade.",
      ].join("\n")
    : [
        "لقد استلمنا طلب الموعد الخاص بكم.",
        "سيتم مراجعته من قبل فريق المكتب قبل أي اعتماد.",
        "التاريخ والوقت المطلوبان غير محجوزين في هذه المرحلة.",
      ].join("\n");

  return {
    kind: "client_request_received",
    to: booking.email,
    subject,
    text,
    html: `<p>${text.replace(/\n/g, "</p><p>")}</p>`,
    locale: booking.locale,
  };
}

export function createAdminPendingRequestEmail(input: {
  booking: NormalizedBookingRequest;
  adminEmail: string;
}): BookingEmailMessage {
  const text = [
    "Nouvelle demande de rendez-vous en attente.",
    `Langue: ${input.booking.locale}`,
    `Expertise: ${input.booking.expertiseKey}`,
    `Week-end: ${input.booking.timing.isWeekendRequest ? "oui" : "non"}`,
    "Consultez le tableau de bord pour traiter la demande.",
  ].join("\n");

  return {
    kind: "admin_pending_request",
    to: input.adminEmail,
    subject: "Themis Law Firm — nouvelle demande en attente",
    text,
    html: `<p>${text.replace(/\n/g, "</p><p>")}</p>`,
    locale: "fr",
  };
}
