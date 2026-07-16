import type { Metadata } from "next";
import { Cinzel, Inter, Noto_Kufi_Arabic } from "next/font/google";
import { notFound } from "next/navigation";
import { LocaleLayout } from "@/components/LocaleLayout";
import { isSupportedLocale, SupportedLocale } from "@/lib/locale";
import "@/app/globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoKufi = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
  display: "swap",
});

export function generateStaticParams() {
  return [
    { locale: "fr" },
    { locale: "ar" },
  ];
}

type PublicLocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export const metadata: Metadata = {
  title: "Themis Law Firm — Saadaoui & Haddad",
  description:
    "Cabinet d’avocats bilingue en français et en arabe, avec un tableau de bord sécurisé interne.",
};

function getDirection(locale: SupportedLocale) {
  return locale === "ar" ? "rtl" : "ltr";
}

export default async function PublicLocaleLayout({
  children,
  params,
}: Readonly<PublicLocaleLayoutProps>) {
  const { locale } = await params;

  if (!isSupportedLocale(locale)) {
    notFound();
  }

  const supportedLocale = locale as SupportedLocale;

  return (
    <html lang={supportedLocale} dir={getDirection(supportedLocale)} className={`${cinzel.variable} ${inter.variable} ${notoKufi.variable} min-h-full bg-ivory text-black`}>
      <body className="min-h-full flex flex-col antialiased">
        <LocaleLayout locale={supportedLocale}>{children}</LocaleLayout>
      </body>
    </html>
  );
}
