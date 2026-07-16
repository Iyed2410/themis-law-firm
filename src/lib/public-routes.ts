/**
 * Public route registry — single source of truth for all public page routing.
 *
 * Consumed by:
 *   - dynamic [locale]/[slug]/page.tsx routing
 *   - Header navigation and language switcher
 *   - Footer navigation
 *   - generateStaticParams
 *   - generateMetadata (canonical + hreflang)
 *   - sitemap.xml generation
 *   - tests/public-site.test.ts
 *
 * This registry must never contain staff, auth, dashboard, or cancel routes.
 */

export type PageId =
  | "home"
  | "cabinet"
  | "expertises"
  | "equipe"
  | "experience"
  | "avis"
  | "rendez-vous"
  | "contact"
  | "confidentialite"
  | "mentions-legales";

export type SupportedLocale = "fr" | "ar";

export type PublicRoute = {
  id: PageId;
  /**
   * null = no slug segment (home only, served by [locale]/page.tsx).
   * string = the canonical slug for that locale.
   */
  slugs: { fr: string | null; ar: string | null };
  /** Display label used in navigation */
  nav: { fr: string; ar: string };
  /** Appear in the header navigation list */
  inNav: boolean;
  /** Appear in the footer navigation list */
  inFooter: boolean;
  /** Include in sitemap.xml */
  inSitemap: boolean;
  /** Exclude entirely when reviewsEnabled === false */
  reviewsGated: boolean;
};

export type PublicRouteMeta = {
  title: string;
  description: string;
  canonicalPath: string;
  alternates: Record<SupportedLocale, string>;
};

export const publicRoutes: readonly PublicRoute[] = [
  {
    id: "home",
    slugs: { fr: null, ar: null },
    nav: { fr: "Accueil", ar: "الصفحة الرئيسية" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "cabinet",
    slugs: { fr: "cabinet", ar: "about" },
    nav: { fr: "Cabinet", ar: "عن المكتب" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "expertises",
    slugs: { fr: "expertises", ar: "expertise" },
    nav: { fr: "Expertises", ar: "التخصصات" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "equipe",
    slugs: { fr: "equipe", ar: "team" },
    nav: { fr: "Équipe", ar: "الفريق" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "experience",
    slugs: { fr: "experience", ar: "experience" },
    nav: { fr: "Expériences", ar: "المرافعات" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "avis",
    slugs: { fr: "avis", ar: "reviews" },
    nav: { fr: "Avis", ar: "الآراء" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: true,
  },
  {
    id: "rendez-vous",
    slugs: { fr: "rendez-vous", ar: "booking" },
    nav: { fr: "Rendez-vous", ar: "حجز موعد" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "contact",
    slugs: { fr: "contact", ar: "contact" },
    nav: { fr: "Contact", ar: "اتصل" },
    inNav: true,
    inFooter: false,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "confidentialite",
    slugs: { fr: "confidentialite", ar: "privacy" },
    nav: { fr: "Confidentialité", ar: "الخصوصية" },
    inNav: false,
    inFooter: true,
    inSitemap: true,
    reviewsGated: false,
  },
  {
    id: "mentions-legales",
    slugs: { fr: "mentions-legales", ar: "legal" },
    nav: { fr: "Mentions légales", ar: "البيانات القانونية" },
    inNav: false,
    inFooter: true,
    inSitemap: true,
    reviewsGated: false,
  },
] as const;

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

export function isRouteEnabled(route: PublicRoute, reviewsEnabled: boolean): boolean {
  return !route.reviewsGated || reviewsEnabled;
}

/**
 * Look up a route by locale + slug.
 *
 * Returns null when:
 *   - the locale is not "fr" or "ar"
 *   - the slug is not a canonical slug for that locale
 *   - the slug belongs to the other locale (wrong-locale slug)
 *   - the slug is null/empty (home is handled by [locale]/page.tsx directly)
 */
export function getRouteBySlug(
  locale: string,
  slug: string
): PublicRoute | null {
  if (locale !== "fr" && locale !== "ar") {
    return null;
  }

  if (!slug) {
    return null;
  }

  return (
    publicRoutes.find((route) => route.slugs[locale as SupportedLocale] === slug) ?? null
  );
}

export function getRouteById(id: PageId): PublicRoute {
  const route = publicRoutes.find((item) => item.id === id);

  if (!route) {
    throw new Error(`Unknown public route id: ${id}`);
  }

  return route;
}

/**
 * Resolve the canonical URL path for a route in a given locale.
 *   home  → "/fr" or "/ar"
 *   other → "/fr/<frSlug>" or "/ar/<arSlug>"
 */
export function getCanonicalPath(
  locale: SupportedLocale,
  route: PublicRoute
): string {
  const slug = route.slugs[locale];

  if (slug === null) {
    return `/${locale}`;
  }

  return `/${locale}/${slug}`;
}

/**
 * Given the current locale + slug (null = home), return the canonical path
 * in the target locale.
 *
 * Returns null when:
 *   - currentSlug is not a canonical slug for currentLocale
 *   - currentSlug belongs to the wrong locale
 *   - the found route is reviews-gated (caller is responsible for the enabled flag)
 */
export function getEquivalentPath(
  currentLocale: SupportedLocale,
  currentSlug: string | null,
  targetLocale: SupportedLocale,
  reviewsEnabled: boolean
): string | null {
  // Home
  if (currentSlug === null) {
    return `/${targetLocale}`;
  }

  const route = getRouteBySlug(currentLocale, currentSlug);

  if (!route) {
    return null;
  }

  if (!isRouteEnabled(route, reviewsEnabled)) {
    return null;
  }

  return getCanonicalPath(targetLocale, route);
}

export function getHomePath(locale: SupportedLocale): string {
  return getCanonicalPath(locale, getRouteById("home"));
}

export function getSiteUrl(): string {
  const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!rawSiteUrl) {
    return "http://localhost:3000";
  }

  return rawSiteUrl.replace(/\/+$/, "");
}

export function getAbsoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${getSiteUrl()}${normalizedPath}`;
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/**
 * Header navigation routes, filtered by reviewsEnabled.
 */
export function getNavRoutes(reviewsEnabled: boolean): PublicRoute[] {
  return publicRoutes.filter(
    (r) => r.inNav && isRouteEnabled(r, reviewsEnabled)
  );
}

/**
 * Footer navigation routes, filtered by reviewsEnabled.
 */
export function getFooterRoutes(reviewsEnabled: boolean): PublicRoute[] {
  return publicRoutes.filter(
    (r) => r.inFooter && isRouteEnabled(r, reviewsEnabled)
  );
}

// ---------------------------------------------------------------------------
// Static generation helpers
// ---------------------------------------------------------------------------

/**
 * Canonical {locale, slug} pairs for generateStaticParams.
 *
 * Home (slug === null) is excluded — it is served by [locale]/page.tsx.
 * Reviews pairs are excluded when reviewsEnabled === false.
 */
export function getStaticParams(
  reviewsEnabled: boolean
): Array<{ locale: string; slug: string }> {
  const params: Array<{ locale: string; slug: string }> = [];

  for (const route of publicRoutes) {
    if (!isRouteEnabled(route, reviewsEnabled)) continue;

    if (route.slugs.fr !== null) {
      params.push({ locale: "fr", slug: route.slugs.fr });
    }

    if (route.slugs.ar !== null) {
      params.push({ locale: "ar", slug: route.slugs.ar });
    }
  }

  return params;
}

/**
 * All canonical URL paths for sitemap.xml.
 *
 * Includes home (/fr, /ar). Excludes reviews when disabled.
 * Never includes staff, auth, dashboard, cancel, robots, or sitemap paths.
 */
export function getSitemapPaths(reviewsEnabled: boolean): string[] {
  const paths: string[] = [];

  for (const route of publicRoutes) {
    if (!route.inSitemap) continue;
    if (!isRouteEnabled(route, reviewsEnabled)) continue;

    paths.push(getCanonicalPath("fr", route));
    paths.push(getCanonicalPath("ar", route));
  }

  return paths;
}
