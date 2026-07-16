"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteContent, type Locale } from "@/lib/content";
import { Logo } from "@/components/Logo";
import {
  getCanonicalPath,
  getEquivalentPath,
  getHomePath,
  getNavRoutes,
  type SupportedLocale,
} from "@/lib/public-routes";

const localeMap: Record<Locale, { label: string; path: string }> = {
  fr: { label: "Français", path: "/fr" },
  ar: { label: "العربية", path: "/ar" },
};

function getAlternateLocale(pathname: string): Locale {
  if (pathname.startsWith("/ar")) {
    return "fr";
  }

  return "ar";
}

export function Header() {
  const pathname = usePathname() || "/fr";
  const locale = pathname.startsWith("/ar") ? "ar" : "fr";
  const alternateLocale = getAlternateLocale(pathname);
  const currentSlug = getCurrentSlug(pathname, locale);
  const alternatePath =
    getEquivalentPath(locale, currentSlug, alternateLocale, siteContent.reviewsEnabled) ??
    getHomePath(alternateLocale);
  const navRoutes = getNavRoutes(siteContent.reviewsEnabled);

  return (
    <header className="border-b border-silver/30 bg-surface py-4">
      <div className="container flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Logo />
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-navy">
          {navRoutes.map((route) => (
            <Link
              key={route.id}
              href={getCanonicalPath(locale, route)}
              className="transition hover:text-gold"
            >
              {route.nav[locale]}
            </Link>
          ))}
        </nav>
        <Link
          href={alternatePath}
          className="rounded-full border border-black/10 bg-navy px-4 py-2 text-xs font-semibold text-ivory transition hover:bg-black"
        >
          {localeMap[alternateLocale].label}
        </Link>
      </div>
    </header>
  );
}

function getCurrentSlug(pathname: string, locale: SupportedLocale): string | null {
  const localePrefix = `/${locale}`;

  if (pathname === localePrefix || pathname === `${localePrefix}/`) {
    return null;
  }

  const rest = pathname.startsWith(`${localePrefix}/`)
    ? pathname.slice(localePrefix.length + 1)
    : "";
  const [slug] = rest.split("/");

  return slug || null;
}
