import type { Metadata } from "next";
import Link from "next/link";
import { siteContent } from "@/lib/content";
import { isSupportedLocale } from "@/lib/locale";
import {
  getAbsoluteUrl,
  getCanonicalPath,
  getRouteById,
  type SupportedLocale,
} from "@/lib/public-routes";
import { notFound } from "next/navigation";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return [
    { locale: "fr" },
    { locale: "ar" },
  ];
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const route = getRouteById("home");
  const metadata = siteContent.meta.home;
  const supportedLocale = locale as SupportedLocale;

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

export default async function PublicHomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    return notFound();
  }

  const content = siteContent.home;
  const aboutPath = getCanonicalPath(locale, getRouteById("cabinet"));
  const bookingPath = getCanonicalPath(locale, getRouteById("rendez-vous"));
  const expertisePath = getCanonicalPath(locale, getRouteById("expertises"));

  return (
    <>
      <section className="bg-navy text-ivory">
        <div className="container grid min-h-[70vh] gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">
              Themis Law Firm — Saadaoui & Haddad
            </p>
            <h1 className="page-heading mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              {locale === "fr" ? content.heroFr : content.heroAr}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-ivory/80">
              {locale === "fr" ? content.subFr : content.subAr}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={bookingPath}
                className="border border-gold bg-gold px-5 py-3 text-sm font-semibold text-black transition hover:bg-ivory"
              >
                {locale === "fr" ? content.ctaBookFr : content.ctaBookAr}
              </Link>
              <Link
                href={aboutPath}
                className="border border-ivory/30 px-5 py-3 text-sm font-semibold text-ivory transition hover:border-gold hover:text-gold"
              >
                {locale === "fr" ? content.ctaAboutFr : content.ctaAboutAr}
              </Link>
            </div>
          </div>

          <div className="border border-ivory/15 p-6">
            <div className="border-s border-gold ps-5">
              <p className="text-sm leading-7 text-ivory/75">
                {locale === "fr" ? content.intro1Fr : content.intro1Ar}
              </p>
              <p className="mt-5 text-sm leading-7 text-ivory/75">
                {locale === "fr" ? content.intro2Fr : content.intro2Ar}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-14" aria-labelledby="home-overview-title">
        <h2 id="home-overview-title" className="page-heading text-3xl font-semibold text-navy">
          {locale === "fr" ? "Un accompagnement structuré" : "مرافقة منظمة"}
        </h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <HomePanel
            title={locale === "fr" ? "Cabinet bilingue" : "مكتب ثنائي اللغة"}
            text={
              locale === "fr"
                ? "Une présentation publique équivalente en français et en arabe."
                : "عرض عام متكافئ باللغتين الفرنسية والعربية."
            }
          />
          <HomePanel
            title={locale === "fr" ? "Expertises indexables" : "تخصصات قابلة للفهرسة"}
            text={
              locale === "fr"
                ? "Les domaines juridiques sont accessibles depuis une page unique."
                : "المجالات القانونية متاحة من صفحة واحدة."
            }
          />
          <HomePanel
            title={locale === "fr" ? "Rendez-vous encadré" : "مواعيد مضبوطة"}
            text={
              locale === "fr"
                ? "La réservation sera activée lors de la phase dédiée, sans confirmation instantanée."
                : "سيتم تفعيل الحجز في المرحلة المخصصة، دون تأكيد فوري."
            }
          />
        </div>
        <Link
          href={expertisePath}
          className="mt-8 inline-flex border border-gold px-5 py-3 text-sm font-semibold text-navy transition hover:bg-gold hover:text-black"
        >
          {locale === "fr" ? "Voir les expertises" : "عرض التخصصات"}
        </Link>
      </section>
    </>
  );
}

function HomePanel({ title, text }: { title: string; text: string }) {
  return (
    <article className="border border-black/10 bg-surface p-6">
      <h3 className="text-lg font-semibold text-navy">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-black/70">{text}</p>
    </article>
  );
}
