import { Locale, localeContent } from "@/lib/content";

type FooterProps = {
  locale: Locale;
};

export function Footer({ locale }: FooterProps) {
  const content = localeContent[locale];

  return (
    <footer className="border-t border-silver/30 bg-surface py-10">
      <div className="container grid gap-6 sm:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-navy">{content.title}</p>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted">{content.description}</p>
        </div>
        <div className="space-y-3 text-sm text-navy">
          <p>{content.footer.address}</p>
          <p>{content.footer.phone}</p>
          <p>{content.footer.email}</p>
        </div>
      </div>
    </footer>
  );
}
