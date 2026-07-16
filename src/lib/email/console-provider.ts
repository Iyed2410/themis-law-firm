import type { BookingEmailMessage, EmailProvider, EmailSendResult } from "@/lib/email/provider";

export function createConsoleEmailProvider(): EmailProvider {
  return {
    async send(message: BookingEmailMessage): Promise<EmailSendResult> {
      console.info(
        JSON.stringify({
          event: "email_queued_console",
          kind: message.kind,
          subject: message.subject,
          recipient: maskEmail(message.to),
          locale: message.locale,
        })
      );

      return {
        ok: true,
        providerId: `console:${message.kind}`,
      };
    },
  };
}

export function maskEmail(email: string): string {
  const [local = "", domain = ""] = email.split("@");
  const first = local.slice(0, 1);

  return `${first || "*"}***@${domain || "unknown"}`;
}
