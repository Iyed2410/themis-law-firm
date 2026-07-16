import { createConsoleEmailProvider } from "@/lib/email/console-provider";
import type { EmailProvider } from "@/lib/email/provider";
import { createResendEmailProvider } from "@/lib/email/resend-provider";

export function createEmailProvider(): EmailProvider {
  const mode = process.env.EMAIL_MODE?.trim().toLowerCase() ?? "console";

  if (mode === "resend") {
    return createResendEmailProvider();
  }

  return createConsoleEmailProvider();
}
