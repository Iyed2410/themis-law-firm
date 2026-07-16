export type SupportedLocale = "fr" | "ar";

export const supportedLocales: SupportedLocale[] = ["fr", "ar"];

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return value === "fr" || value === "ar";
}

export function getLocaleDirection(locale: SupportedLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export function getAlternateLocale(locale: SupportedLocale): SupportedLocale {
  return locale === "fr" ? "ar" : "fr";
}
