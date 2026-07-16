# Public Site Phase Implementation Plan

## Status: Completed — verified locally

---

## 1. Goal

Build all required bilingual public pages for **Themis Law Firm — Saadaoui & Haddad**
under `/fr` (LTR) and `/ar` (RTL).

Every page has exactly one canonical URL per locale. The language switcher navigates
between equivalent canonical pages. No duplicate indexable aliases are created.

This phase does **not** include: booking persistence, Supabase writes, email delivery,
calendar workflows, payment processing, or scheduled jobs.

---

## 2. Architectural Constraints

- Each public page has exactly one canonical French path and one canonical Arabic path.
- French and Arabic slugs for the same page are not aliases. They are two separate
  canonical URLs in two separate language namespaces, linked by `hreflang` only.
- Requesting an unrecognized slug under a valid locale (e.g. `/fr/about`, which is the
  Arabic slug) returns `notFound()`. No silent redirect.
- The home page remains `/fr` and `/ar`. No `/fr/home` or `/ar/home` route is created.
  The home route is represented in the registry with `slug: null` and is handled by the
  existing `[locale]/page.tsx`, not by the dynamic `[locale]/[slug]/page.tsx`.
- Staff, dashboard, auth, and cancel routes are never in the public registry, navigation,
  sitemap, or `generateStaticParams`.
- Do not modify: Supabase migrations, RLS policies, auth behaviour, dashboard protection,
  staff provisioning, database persistence, email delivery, calendar workflows, or
  scheduled jobs.

---

## 3. Canonical Route Table

Slugs marked `(index)` mean no slug segment — the route is `/fr` or `/ar` only.
The `experience` slug is identical in both locales but each remains a distinct canonical
URL under its own locale prefix.

Reviews is gated: when `reviewsEnabled === false` in the content layer, the page
returns `notFound()`, the route is removed from navigation, excluded from
`generateStaticParams`, and excluded from the sitemap. No review structured data is
emitted.

`mentions-legales` / `legal` do not appear in the main header navigation but are
linked from the footer and included in the sitemap.

| Page ID          | FR label          | FR canonical path         | AR label              | AR canonical path   | Header nav | Footer nav | Sitemap | Enabled condition    |
|------------------|-------------------|---------------------------|-----------------------|---------------------|------------|------------|---------|----------------------|
| home             | Accueil           | /fr                       | الصفحة الرئيسية       | /ar                 | ✓          | —          | ✓       | always               |
| cabinet          | Cabinet           | /fr/cabinet               | عن المكتب             | /ar/about           | ✓          | —          | ✓       | always               |
| expertises       | Expertises        | /fr/expertises            | التخصصات              | /ar/expertise       | ✓          | —          | ✓       | always               |
| equipe           | Équipe            | /fr/equipe                | الفريق                | /ar/team            | ✓          | —          | ✓       | always               |
| experience       | Expériences       | /fr/experience            | المرافعات             | /ar/experience      | ✓          | —          | ✓       | always               |
| avis             | Avis              | /fr/avis                  | الآراء                | /ar/reviews         | ✓          | —          | ✓       | reviewsEnabled only  |
| rendez-vous      | Rendez-vous       | /fr/rendez-vous           | حجز موعد              | /ar/booking         | ✓          | —          | ✓       | always               |
| contact          | Contact           | /fr/contact               | اتصل                  | /ar/contact         | ✓          | —          | ✓       | always               |
| confidentialite  | Confidentialité   | /fr/confidentialite       | الخصوصية              | /ar/privacy         | —          | ✓          | ✓       | always               |
| mentions-legales | Mentions légales  | /fr/mentions-legales      | البيانات القانونية    | /ar/legal           | —          | ✓          | ✓       | always               |

### Arabic-side Latin slugs (exact, from docs/IMPLEMENTATION_PLAN.md §3)

```
/ar
/ar/about
/ar/expertise
/ar/team
/ar/experience
/ar/reviews
/ar/booking
/ar/contact
/ar/privacy
/ar/legal
```

These slugs were approved in `docs/DECISIONS.md` under the decision:
"Stable Latin Arabic route slugs for public pages are acceptable to maintain routing clarity."

---

## 4. Route Registry Design

### src/lib/public-routes.ts

Central, typed source of truth consumed by every part of the application that
deals with public routing.

```ts
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

export type PublicRoute = {
  id: PageId;
  /**
   * null = no slug segment (home page only, routed by [locale]/page.tsx)
   * string = the slug for this locale
   */
  slugs: { fr: string | null; ar: string | null };
  nav: { fr: string; ar: string };
  /** true = appears in the header nav list */
  inNav: boolean;
  /** true = appears in the footer nav list */
  inFooter: boolean;
  /** true = included in sitemap.xml */
  inSitemap: boolean;
  /** true = only included when reviewsEnabled === true */
  reviewsGated: boolean;
};

export const publicRoutes: readonly PublicRoute[];

/**
 * Look up a route by locale + slug.
 * Returns null for unrecognised slugs, wrong-locale slugs, or "en"/"xx" locales.
 * Home (slug === null) is NOT handled here — it is handled by [locale]/page.tsx.
 */
export function getRouteBySlug(
  locale: "fr" | "ar",
  slug: string
): PublicRoute | null;

/**
 * Resolve the canonical URL for a route in a given locale.
 * Home → "/fr" or "/ar"
 * Other → "/fr/<frSlug>" or "/ar/<arSlug>"
 */
export function getCanonicalPath(
  locale: "fr" | "ar",
  route: PublicRoute
): string;

/**
 * Given the current locale and current slug (or null for home),
 * return the canonical path in the target locale.
 *
 * Behaviour:
 *   null slug (home)                → "/ar" or "/fr"
 *   recognised slug in locale       → equivalent canonical path in targetLocale
 *   slug belonging to other locale  → null  (caller should notFound or ignore)
 *   unrecognised slug               → null
 *   disabled reviews slug           → null
 */
export function getEquivalentPath(
  currentLocale: "fr" | "ar",
  currentSlug: string | null,
  targetLocale: "fr" | "ar"
): string | null;

/**
 * Navigation links for the header, filtered by reviewsEnabled.
 * Does not include routes where inNav === false.
 */
export function getNavRoutes(reviewsEnabled: boolean): PublicRoute[];

/**
 * Footer links, filtered by reviewsEnabled.
 * Does not include routes where inFooter === false.
 */
export function getFooterRoutes(reviewsEnabled: boolean): PublicRoute[];

/**
 * All canonical {locale, slug} pairs for generateStaticParams.
 * Home (null slug) is excluded — it is handled by the parent [locale]/page.tsx.
 * Reviews pairs are excluded when reviewsEnabled === false.
 */
export function getStaticParams(
  reviewsEnabled: boolean
): Array<{ locale: string; slug: string }>;

/**
 * All canonical paths for sitemap.xml.
 * Includes home paths. Excludes reviews when disabled.
 * Never includes staff, auth, dashboard, or cancel paths.
 */
export function getSitemapPaths(reviewsEnabled: boolean): string[];
```

### getEquivalentPath — exact behaviour

| Input | Result |
|---|---|
| `("fr", null, "ar")` | `"/ar"` |
| `("ar", null, "fr")` | `"/fr"` |
| `("fr", "cabinet", "ar")` | `"/ar/about"` |
| `("ar", "about", "fr")` | `"/fr/cabinet"` |
| `("fr", "expertises", "ar")` | `"/ar/expertise"` |
| `("ar", "expertise", "fr")` | `"/fr/expertises"` |
| `("fr", "rendez-vous", "ar")` | `"/ar/booking"` |
| `("ar", "booking", "fr")` | `"/fr/rendez-vous"` |
| `("fr", "experience", "ar")` | `"/ar/experience"` |
| `("ar", "experience", "fr")` | `"/fr/experience"` |
| `("fr", "avis", "ar")` when enabled | `"/ar/reviews"` |
| `("ar", "reviews", "fr")` when enabled | `"/fr/avis"` |
| `("fr", "avis", "ar")` when disabled | `null` |
| `("fr", "about", "ar")` (wrong-locale slug) | `null` |
| `("ar", "cabinet", "fr")` (wrong-locale slug) | `null` |
| `("fr", "nonexistent", "ar")` | `null` |

---

## 5. Metadata and Sitemap Design

### Per-page metadata

Every page produces:

```ts
{
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
  title: localizedTitle,          // from content layer per locale + page
  description: localizedDesc,     // from content layer per locale + page
  alternates: {
    canonical: currentCanonicalUrl,
    languages: {
      "fr": frCanonicalUrl,       // always the French canonical path
      "ar": arCanonicalUrl,       // always the Arabic canonical path
    },
  },
  openGraph: {
    title: localizedTitle,
    description: localizedDesc,
    url: currentCanonicalUrl,
    locale: locale === "fr" ? "fr_FR" : "ar_TN",
    alternateLocale: locale === "fr" ? "ar_TN" : "fr_FR",
  },
}
```

### Metadata location

- **Home page** — `generateMetadata` stays in `src/app/(public)/[locale]/page.tsx`
  (or in the existing `[locale]/layout.tsx`). The home route is not handled by `[slug]/page.tsx`.
- **All other public pages** — `generateMetadata` is exported from
  `src/app/(public)/[locale]/[slug]/page.tsx`.

### Sitemap

`src/app/sitemap.xml/route.ts` is rewritten to call `getSitemapPaths(reviewsEnabled)`.
Each path becomes a `<url>` entry. No staff, auth, dashboard, or cancel paths appear.
Reviews paths appear only when `reviewsEnabled === true`.

---

## 6. Language Switcher Behaviour

The Header resolves the alternate path using `getEquivalentPath`. It does **not** do a
simple string replace of `/fr/` → `/ar/`. Examples:

| Current page | Switcher navigates to |
|---|---|
| `/fr` (home) | `/ar` |
| `/ar` (home) | `/fr` |
| `/fr/cabinet` (About FR) | `/ar/about` |
| `/ar/about` (About AR) | `/fr/cabinet` |
| `/fr/expertises` | `/ar/expertise` |
| `/ar/expertise` | `/fr/expertises` |
| `/fr/rendez-vous` | `/ar/booking` |
| `/ar/booking` | `/fr/rendez-vous` |
| `/fr/avis` (when enabled) | `/ar/reviews` |
| `/ar/reviews` (when enabled) | `/fr/avis` |

When `getEquivalentPath` returns `null` (disabled reviews, wrong-locale slug), the
switcher falls back to the target locale's home path.

---

## 7. Expertise Accordion

- All 9 legal fields rendered server-side as `<details>`/`<summary>` elements.
- Complete text present in initial HTML — no deferred fetch, no JavaScript required
  to read the content.
- Each section has a unique `id` attribute matching its anchor slug (e.g. `id="droit-penal"`).
- Direct links (`/fr/expertises#droit-penal`) work without JavaScript.
- JavaScript (progressive enhancement) may add `aria-expanded` / `aria-controls`
  on top of native `<details>` behaviour.
- Each section ends with a CTA link to `/fr/rendez-vous` or `/ar/booking`.

---

## 8. Booking Page

- Accessible form layout with all required fields from PRODUCT_SPEC §4.
- `<form>` has no `action` attribute, no `onSubmit` handler, no server action.
- Submit button is `disabled` with a visible helper note:
  "La soumission sera activée dans la phase de réservation." /
  "سيتم تفعيل الإرسال في مرحلة الحجز."
- No Supabase writes. No email sending. No toast of success. No simulated submission.
- All field validation markup present (required, maxlength, aria-describedby).

---

## 9. Contact Map

- Google Maps `<iframe>` uses `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` from environment.
- `title` attribute set to a localised description.
- `loading="lazy"` attribute set.
- When `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` is absent or empty, only a plain external
  link to an appropriate map search is rendered as a fallback.
- No API keys hard-coded. No secret keys of any kind.

---

## 10. Exact File List

### Created

| File | Purpose |
|---|---|
| `src/lib/public-routes.ts` | Typed route registry |
| `src/app/(public)/[locale]/[slug]/page.tsx` | Dynamic subpage handler |
| `src/components/marketing/AboutPage.tsx` | Cabinet / about view |
| `src/components/marketing/ExpertisePage.tsx` | Expertise accordion |
| `src/components/marketing/TeamPage.tsx` | Team profiles |
| `src/components/marketing/MattersPage.tsx` | Representative matters |
| `src/components/marketing/ReviewsPage.tsx` | Reviews (gated) |
| `src/components/marketing/BookingPage.tsx` | Booking form (no backend) |
| `src/components/marketing/ContactPage.tsx` | Contact + map |
| `src/components/marketing/PrivacyPage.tsx` | Privacy policy |
| `src/components/marketing/LegalPage.tsx` | Legal notices |
| `tests/public-site.test.ts` | Route registry + metadata tests |
| `docs/PUBLIC_SITE_PLAN.md` | This file |

### Modified

| File | Change |
|---|---|
| `src/lib/content.ts` | Expand bilingual content for all pages |
| `src/app/(public)/[locale]/page.tsx` | Add `generateMetadata` with canonical + hreflang |
| `src/app/sitemap.xml/route.ts` | Rebuild from `getSitemapPaths()` |
| `src/components/Header.tsx` | Use registry for nav + `getEquivalentPath` for switcher |
| `src/components/Footer.tsx` | Add footer nav links (confidentialite, mentions-legales) |
| `docs/PROGRESS.md` | Mark public-site complete, list provisional content |

### Deleted

None.

### Conditionally modified

| File | Condition |
|---|---|
| `docs/DECISIONS.md` | Only if a new architectural decision is introduced during implementation |

---

## 11. Route Registry Exclusions

The registry `publicRoutes` array and all derived functions (`getNavRoutes`,
`getFooterRoutes`, `getStaticParams`, `getSitemapPaths`) will never contain or produce:

- `/auth/login`
- `/dashboard`
- `/cancel/[token]`
- `/robots.txt`
- `/sitemap.xml`

This is enforced by construction: only the explicit `PageId` union and its associated
slug pairs are present in the data structure.

---

## 12. Test Coverage

`tests/public-site.test.ts` asserts:

**Route registry integrity**
- Every `publicRoute` entry has non-null slugs for both `fr` and `ar`, or `null` (home only).
- No registry entry has a slug that starts with `auth`, `dashboard`, or `cancel`.
- `getRouteBySlug("fr", "cabinet")` → `cabinet` route.
- `getRouteBySlug("ar", "cabinet")` → `null` (wrong locale).
- `getRouteBySlug("ar", "about")` → `cabinet` route.
- `getRouteBySlug("fr", "about")` → `null` (wrong locale).
- `getRouteBySlug("en", "cabinet")` → `null` (unsupported locale).
- `getRouteBySlug("fr", "nonexistent")` → `null`.

**Equivalent path mapping**
- Every row in the getEquivalentPath table in §4 above.

**Static params**
- `reviewsEnabled = true` → includes `{ locale: "fr", slug: "avis" }` and `{ locale: "ar", slug: "reviews" }`.
- `reviewsEnabled = false` → excludes both.
- No entry has `{ locale: "fr", slug: "about" }` (Arabic slug in French locale).
- No entry has `{ locale: "ar", slug: "cabinet" }` (French slug in Arabic locale).
- No entry has `{ slug: null }` (home is not in `getStaticParams`).

**Sitemap**
- `getSitemapPaths(true)` includes `/fr/avis` and `/ar/reviews`.
- `getSitemapPaths(false)` excludes both.
- `getSitemapPaths(true)` includes `/fr`, `/ar`.
- `getSitemapPaths(true)` includes `/fr/mentions-legales` and `/ar/legal`.
- `getSitemapPaths(true)` does not include `/dashboard`, `/auth/login`, `/cancel`.

**Reviews gating**
- `getNavRoutes(false)` does not include a route with id `avis`.
- `getNavRoutes(true)` includes a route with id `avis`.

---

## 13. Verification Plan

```bash
pnpm lint
pnpm typecheck
pnpm test        # 17 existing + new tests must all pass
pnpm build       # all canonical static pages pre-rendered without error
```

Build output must show static entries for each canonical slug. Staff routes must not
appear in the public route registry or sitemap.

Placeholder content must not claim unverified specialized credentials, certifications,
bar memberships, awards, success rates, or guaranteed results.

Manual checks:
- `/fr/about` → 404.
- `/ar/cabinet` → 404.
- `/fr/expertises` page source contains all 9 expertise texts without JavaScript.
- Language switcher on `/fr/cabinet` → `/ar/about`.
- Language switcher on `/ar/about` → `/fr/cabinet`.
- Language switcher on `/fr` → `/ar`.
- Language switcher on `/ar` → `/fr`.
- `/sitemap.xml` — contains all canonical paths, no staff paths.
- Booking submit button is disabled with visible explanatory note.
- Contact map: `<iframe>` has `title` and `loading="lazy"` when env URL is set; fallback link when absent.
