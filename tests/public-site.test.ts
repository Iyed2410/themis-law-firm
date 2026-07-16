import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { generateMetadata as generateHomeMetadata } from "@/app/(public)/[locale]/page";
import {
  generateMetadata as generateSlugMetadata,
  generateStaticParams as generateSlugStaticParams,
} from "@/app/(public)/[locale]/[slug]/page";
import { GET as sitemapGet } from "@/app/sitemap.xml/route";
import { siteContent } from "@/lib/content";
import {
  getCanonicalPath,
  getEquivalentPath,
  getFooterRoutes,
  getNavRoutes,
  getRouteBySlug,
  getSitemapPaths,
  getStaticParams,
  publicRoutes,
} from "@/lib/public-routes";

const previousSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

beforeAll(() => {
  process.env.NEXT_PUBLIC_SITE_URL = "https://themis.example";
});

afterAll(() => {
  if (previousSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL;
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = previousSiteUrl;
  }
});

describe("public route registry", () => {
  const enabledFrenchPaths = [
    "/fr",
    "/fr/cabinet",
    "/fr/expertises",
    "/fr/equipe",
    "/fr/experience",
    "/fr/rendez-vous",
    "/fr/contact",
    "/fr/confidentialite",
    "/fr/mentions-legales",
  ];

  const enabledArabicPaths = [
    "/ar",
    "/ar/about",
    "/ar/expertise",
    "/ar/team",
    "/ar/experience",
    "/ar/booking",
    "/ar/contact",
    "/ar/privacy",
    "/ar/legal",
  ];

  it("produces every enabled French and Arabic canonical path", () => {
    const paths = getSitemapPaths(false);

    for (const path of [...enabledFrenchPaths, ...enabledArabicPaths]) {
      expect(paths).toContain(path);
    }
  });

  it("maps home and language-equivalent canonical pages", () => {
    expect(getEquivalentPath("fr", null, "ar", false)).toBe("/ar");
    expect(getEquivalentPath("ar", null, "fr", false)).toBe("/fr");
    expect(getEquivalentPath("fr", "cabinet", "ar", false)).toBe("/ar/about");
    expect(getEquivalentPath("ar", "about", "fr", false)).toBe("/fr/cabinet");
    expect(getEquivalentPath("fr", "rendez-vous", "ar", false)).toBe("/ar/booking");
    expect(getEquivalentPath("ar", "booking", "fr", false)).toBe("/fr/rendez-vous");
  });

  it("rejects wrong-locale, unsupported slug, and unsupported locale lookups", () => {
    expect(getRouteBySlug("fr", "about")).toBeNull();
    expect(getRouteBySlug("ar", "cabinet")).toBeNull();
    expect(getRouteBySlug("fr", "expertise")).toBeNull();
    expect(getRouteBySlug("ar", "expertises")).toBeNull();
    expect(getRouteBySlug("fr", "nonexistent")).toBeNull();
    expect(getRouteBySlug("en", "cabinet")).toBeNull();
  });

  it("keeps disabled reviews out of routes, navigation, static params, and sitemap", () => {
    expect(siteContent.reviewsEnabled).toBe(false);
    expect(getEquivalentPath("fr", "avis", "ar", false)).toBeNull();
    expect(getEquivalentPath("ar", "reviews", "fr", false)).toBeNull();
    expect(getNavRoutes(false).some((route) => route.id === "avis")).toBe(false);
    expect(getFooterRoutes(false).some((route) => route.id === "avis")).toBe(false);
    expect(getStaticParams(false)).not.toContainEqual({ locale: "fr", slug: "avis" });
    expect(getStaticParams(false)).not.toContainEqual({ locale: "ar", slug: "reviews" });
    expect(getSitemapPaths(false)).not.toContain("/fr/avis");
    expect(getSitemapPaths(false)).not.toContain("/ar/reviews");
  });

  it("keeps reviews ready when the feature flag is enabled", () => {
    expect(getEquivalentPath("fr", "avis", "ar", true)).toBe("/ar/reviews");
    expect(getEquivalentPath("ar", "reviews", "fr", true)).toBe("/fr/avis");
    expect(getStaticParams(true)).toContainEqual({ locale: "fr", slug: "avis" });
    expect(getStaticParams(true)).toContainEqual({ locale: "ar", slug: "reviews" });
    expect(getSitemapPaths(true)).toContain("/fr/avis");
    expect(getSitemapPaths(true)).toContain("/ar/reviews");
  });

  it("has no duplicate canonical paths and no staff paths", () => {
    const paths = publicRoutes.flatMap((route) => [
      getCanonicalPath("fr", route),
      getCanonicalPath("ar", route),
    ]);
    const uniquePaths = new Set(paths);

    expect(uniquePaths.size).toBe(paths.length);
    expect(paths.some((path) => path.includes("dashboard"))).toBe(false);
    expect(paths.some((path) => path.includes("auth"))).toBe(false);
    expect(paths.some((path) => path.includes("cancel"))).toBe(false);
    expect(paths).not.toContain("/fr/home");
    expect(paths).not.toContain("/ar/home");
  });
});

describe("public static params and sitemap", () => {
  it("generates canonical slug static params only", () => {
    const params = generateSlugStaticParams();

    expect(params).toEqual(getStaticParams(siteContent.reviewsEnabled));
    expect(params).toContainEqual({ locale: "fr", slug: "cabinet" });
    expect(params).toContainEqual({ locale: "ar", slug: "about" });
    expect(params).not.toContainEqual({ locale: "fr", slug: "about" });
    expect(params).not.toContainEqual({ locale: "ar", slug: "cabinet" });
    expect(params.some((item) => item.slug === "avis")).toBe(false);
    expect(params.some((item) => item.slug === "reviews")).toBe(false);
  });

  it("emits enabled canonical public URLs only", async () => {
    const response = sitemapGet();
    const sitemap = await response.text();

    expect(sitemap).toContain("https://themis.example/fr/cabinet");
    expect(sitemap).toContain("https://themis.example/ar/about");
    expect(sitemap).not.toContain("/dashboard");
    expect(sitemap).not.toContain("/auth/login");
    expect(sitemap).not.toContain("/cancel");
    expect(sitemap).not.toContain("/fr/avis");
    expect(sitemap).not.toContain("/ar/reviews");
  });
});

describe("public metadata", () => {
  it("generates canonical metadata and alternates for home", async () => {
    const metadata = await generateHomeMetadata({
      params: Promise.resolve({ locale: "fr" }),
    });

    expect(metadata.title).toBe(siteContent.meta.home.titleFr);
    expect(metadata.alternates?.canonical).toBe("https://themis.example/fr");
    expect(metadata.alternates?.languages).toEqual({
      fr: "https://themis.example/fr",
      ar: "https://themis.example/ar",
    });
    expect(metadata.openGraph?.url).toBe("https://themis.example/fr");
  });

  it("generates localized metadata and alternates for public subpages", async () => {
    const metadata = await generateSlugMetadata({
      params: Promise.resolve({ locale: "ar", slug: "about" }),
    });

    expect(metadata.title).toBe(siteContent.meta.cabinet.titleAr);
    expect(metadata.alternates?.canonical).toBe("https://themis.example/ar/about");
    expect(metadata.alternates?.languages).toEqual({
      fr: "https://themis.example/fr/cabinet",
      ar: "https://themis.example/ar/about",
    });
    expect(metadata.openGraph?.locale).toBe("ar_TN");
  });
});
