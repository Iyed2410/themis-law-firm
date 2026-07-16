import Link from "next/link";
import { siteContent, type Locale } from "@/lib/content";
import { getCanonicalPath, getFooterRoutes } from "@/lib/public-routes";

type FooterProps = {
  locale: Locale;
};

export function Footer({ locale }: FooterProps) {
  const footerRoutes = getFooterRoutes(siteContent.reviewsEnabled);

  return (
    <footer className="border-t border-silver/30 bg-surface py-10">
      <div className="container grid gap-8 sm:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-navy">
            Themis Law Firm — Saadaoui & Haddad
          </p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-black/65">
            {locale === "fr" ? siteContent.meta.home.descFr : siteContent.meta.home.descAr}
          </p>
        </div>
        <nav className="space-y-3 text-sm text-navy" aria-label={locale === "fr" ? "Liens légaux" : "روابط قانونية"}>
          {footerRoutes.map((route) => (
            <Link
              key={route.id}
              href={getCanonicalPath(locale, route)}
              className="block transition hover:text-gold"
            >
              {route.nav[locale]}
            </Link>
          ))}
        </nav>
        <div className="space-y-3 text-sm text-navy">
          <p>{locale === "fr" ? siteContent.contact.addressFr : siteContent.contact.addressAr}</p>
          <p>{siteContent.contact.phone}</p>
          <p>{siteContent.contact.email}</p>
        </div>
      </div>
    </footer>
  );
}
