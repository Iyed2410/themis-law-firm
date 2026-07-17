import type { BookingEmailMessage, EmailProvider, EmailSendResult } from "@/lib/email/provider";

export function createResendEmailProvider(): EmailProvider {
  return {
    async send(message: BookingEmailMessage): Promise<EmailSendResult> {
      const apiKey = process.env.RESEND_API_KEY?.trim();
      const from = process.env.EMAIL_FROM?.trim();

      if (!apiKey || !from) {
        return { ok: false, errorCode: "email_provider_not_configured" };
      }

      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [message.to],
            subject: message.subject,
            text: message.text,
            html: message.html,
          }),
        });

        if (!response.ok) {
          return { ok: false, errorCode: "email_provider_rejected" };
        }

        const data = (await response.json().catch(() => null)) as { id?: string } | null;

        return {
          ok: true,
          providerId: data?.id,
        };
      } catch {
        return { ok: false, errorCode: "email_provider_failed" };
      }
    },
  };
}
