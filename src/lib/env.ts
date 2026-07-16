export function validateFoundationEnv() {
  const required = [
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_DEFAULT_LOCALE",
    "NEXT_PUBLIC_SUPPORTED_LOCALES",
    "APP_TIMEZONE",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}

export function validateSupabaseEnv() {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required Supabase environment variables: ${missing.join(", ")}`);
  }
}

export function validateEmailEnv() {
  const required = ["RESEND_API_KEY", "EMAIL_FROM", "ADMIN_NOTIFICATION_EMAIL"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required email environment variables: ${missing.join(", ")}`);
  }
}
