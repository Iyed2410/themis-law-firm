import type { Locale } from "@/lib/content";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

type LocaleLayoutProps = {
  locale: Locale;
  children: React.ReactNode;
};

export function LocaleLayout({ locale, children }: LocaleLayoutProps) {
  return (
    <div className={locale === "ar" ? "direction-rtl" : "direction-ltr"}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer locale={locale} />
    </div>
  );
}
