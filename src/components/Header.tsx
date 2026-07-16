"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Locale, localeContent } from "@/lib/content";
import { Logo } from "@/components/Logo";

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
  const content = localeContent[locale];
  const alternateLocale = getAlternateLocale(pathname);
  const alternatePath = pathname.replace(/^\/fr|^\/ar/, `/${alternateLocale}`);

  return (
    <header className="border-b border-silver/30 bg-surface py-4">
      <div className="container flex flex-wrap items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Logo />
        </Link>
        <nav className="flex flex-wrap gap-4 text-sm font-medium text-navy">
          {content.navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-gold">
              {item.label}
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
