import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AboutPage } from "@/components/marketing/AboutPage";
import { BookingPage } from "@/components/marketing/BookingPage";
import { ContactPage } from "@/components/marketing/ContactPage";
import { ExpertisePage } from "@/components/marketing/ExpertisePage";
import { LegalPage } from "@/components/marketing/LegalPage";
import { MattersPage } from "@/components/marketing/MattersPage";
import { PrivacyPage } from "@/components/marketing/PrivacyPage";
import { ReviewsPage } from "@/components/marketing/ReviewsPage";
import { TeamPage } from "@/components/marketing/TeamPage";
import { siteContent } from "@/lib/content";
import { isSupportedLocale } from "@/lib/locale";
import {
  getAbsoluteUrl,
  getCanonicalPath,
  getRouteBySlug,
  getStaticParams,
  isRouteEnabled,
  type PublicRoute,
  type SupportedLocale,
} from "@/lib/public-routes";

type PublicSlugPageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getStaticParams(siteContent.reviewsEnabled);
}

export async function generateMetadata({ params }: PublicSlugPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const { route, supportedLocale } = resolveRoute(locale, slug);
  const metadata = siteContent.meta[route.id];

  return {
    metadataBase: new URL(getAbsoluteUrl("/")),
    title: supportedLocale === "fr" ? metadata.titleFr : metadata.titleAr,
    description: supportedLocale === "fr" ? metadata.descFr : metadata.descAr,
    alternates: {
      canonical: getAbsoluteUrl(getCanonicalPath(supportedLocale, route)),
      languages: {
        fr: getAbsoluteUrl(getCanonicalPath("fr", route)),
        ar: getAbsoluteUrl(getCanonicalPath("ar", route)),
      },
    },
    openGraph: {
      title: supportedLocale === "fr" ? metadata.titleFr : metadata.titleAr,
      description: supportedLocale === "fr" ? metadata.descFr : metadata.descAr,
      url: getAbsoluteUrl(getCanonicalPath(supportedLocale, route)),
      locale: supportedLocale === "fr" ? "fr_FR" : "ar_TN",
      alternateLocale: supportedLocale === "fr" ? "ar_TN" : "fr_FR",
      siteName: "Themis Law Firm",
      type: "website",
    },
  };
}

export default async function PublicSlugPage({ params }: PublicSlugPageProps) {
  const { locale, slug } = await params;
  const { route, supportedLocale } = resolveRoute(locale, slug);

  switch (route.id) {
    case "cabinet":
      return <AboutPage locale={supportedLocale} />;
    case "expertises":
      return <ExpertisePage locale={supportedLocale} />;
    case "equipe":
      return <TeamPage locale={supportedLocale} />;
    case "experience":
      return <MattersPage locale={supportedLocale} />;
    case "avis":
      return <ReviewsPage locale={supportedLocale} />;
    case "rendez-vous":
      return <BookingPage locale={supportedLocale} />;
    case "contact":
      return <ContactPage locale={supportedLocale} />;
    case "confidentialite":
      return <PrivacyPage locale={supportedLocale} />;
    case "mentions-legales":
      return <LegalPage locale={supportedLocale} />;
    case "home":
    default:
      notFound();
  }
}

function resolveRoute(
  locale: string,
  slug: string
): { route: PublicRoute; supportedLocale: SupportedLocale } {
  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const route = getRouteBySlug(locale, slug);

  if (!route || !isRouteEnabled(route, siteContent.reviewsEnabled)) {
    notFound();
  }

  return {
    route,
    supportedLocale: locale,
  };
}
